#!/usr/bin/env python3

from time import sleep
from database_access import DBConnexion
from abc import ABC, abstractmethod
from threading import Thread


class MyDaemon(Thread):

    def __init__(self, rules):
        super().__init__()
        self.rules = rules
        self.is_running = False
        self.db_connexion = DBConnexion('localhost', 8086)

    def stop(self):
        self.is_running = False

    def run(self):
        self.is_running = True
        print("daemon started")
        while self.is_running:
            for rule in self.rules:
                rule.run(self.db_connexion)
            sleep(5)
        print("daemon stopped")


class AbstractRule(ABC):
    """ Une classe abstraite pour les règles à appliquer """
    def __init__(self):
        super().__init__()

    @abstractmethod
    def condition(self, db_connexion):
        pass

    @abstractmethod
    def apply(self, db_connexion):
        pass

    def run(self, db_connexion):
        if self.condition(db_connexion):
            self.apply(db_connexion)


class Freeze(AbstractRule):
    """ Quand le système est gelé ('freeze'), tous les systèmes controllables doivent être désactivés """
    def __init__(self):
        super().__init__()

    def condition(self, db_connexion):
        state = db_connexion.is_freeze()
        if state == 0:
            return False
        elif state == 1:
            return True
        raise ValueError("Expected 0 or 1, get " + str(state))

    def apply(self, db_connexion):
        list_controllable_systems = db_connexion.get_list_systems()
        for controllable_system in list_controllable_systems:
            result_set = db_connexion.get_controllable_systems(controllable_system)
            for point in result_set:
                for dict in point:
                    value = dict['last']
                    id_station = dict['id_station']
                    if value != 0:
                        db_connexion.change_controllable_state(controllable_system, id_station, 0)


class AbstractActivationRule(AbstractRule):
    """ Une classe abstraite pour gérer l'activation automatique des systèmes controllables """
    def __init__(self, controllable_system, id_station):
        super().__init__()
        self.controllable_system = controllable_system
        self.id_station = id_station

    def apply(self, db_connexion):
        if db_connexion.is_freeze() != 0:
            return
        if db_connexion.get_state(self.controllable_system, self.id_station) != 1:
            db_connexion.change_controllable_state(self.controllable_system, self.id_station, 1)


class AbstractDesactivationRule(AbstractRule):
    """ Une classe abstraite pour gérer la désactivation automatique des systèmes controllables """

    def __init__(self, controllable_system, id_station):
        super().__init__()
        self.controllable_system = controllable_system
        self.id_station = id_station

    def apply(self, db_connexion):
        if db_connexion.get_state(self.controllable_system, self.id_station) != 0:
            db_connexion.change_controllable_state(self.controllable_system, self.id_station, 0)


class ActivateWatering(AbstractActivationRule):
    """ Régle d'activation de l'arrosage """
    def __init__(self, id_station):
        super().__init__("watering", id_station)

    def condition(self, db_connexion):
        last_temperature = db_connexion.get_last_measurement_value("temperature", self.id_station)
        last_soil_moisture = db_connexion.get_last_measurement_value("soil_moisture", self.id_station)
        if last_soil_moisture is None:
            # Les capteurs n'ont pas envoyés de données récement
            return False
        if last_soil_moisture < 50: # Random
            # Le sol est desséché
            return True
        if last_temperature is None:
            return False
        if last_soil_moisture < 100 and last_temperature < 25:
            # Le sol est un peu sec et il fait frais
            return True
        return False


class DesactivateWatering(AbstractDesactivationRule):
    """ Régle de désactivation de l'arrosage """
    def __init__(self, id_station):
        super().__init__("watering", id_station)

    def condition(self, db_connexion):
        last_soil_moisture = db_connexion.get_last_measurement_value("soil_moisture", self.id_station)
        if last_soil_moisture is None:
            return True
        if last_soil_moisture > 150:
            return True
        return False


def main():
    rules = []
    rules.append(Freeze())
    for i in range(1, 3):
        rules.append(ActivateWatering(str(i)))
        rules.append(DesactivateWatering(str(i)))
    my_daemon = MyDaemon(rules)
    my_daemon.start()

    while True:
        cmd = input('$ ')
        if cmd == 'stop':
            my_daemon.stop()
            my_daemon.join()
            break


if __name__ == '__main__':
    main()
