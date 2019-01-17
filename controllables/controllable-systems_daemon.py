from time import sleep
import database_access
from abc import ABC, abstractmethod
from threading import Thread

db_connexion = DBConnexion('localhost', 8086)

class MyDaemon(Thread):

    def __init__(self, rules):
        super().__init__()
        self.rules = rules
        self.is_running = False

    def run(self):
        self.is_running = True
        while self.is_running:
            for rule in self.rules:
                rule.run()
            sleep(5)

class Rule(ABC):
    """ Une classe abstraite pour les règles à appliquer """
    def __init__(self):
        super().__init__()

    @abstractmethod
    def condition(self):
        pass

    @abstractmethod
    def apply(self):
        pass

    def run(self):
        if self.condition():
            self.apply()

class Freeze(Rule):
    """ Quand le système est gelé ('freeze'), tous les systèmes controllables doivent être désactivés """
    def __init__(self):
        super().__init__(self)

    def condition(self):
        state = db_connexion.is_freeze()
        if state == 0:
            return False
        elif state == 1:
            return True
        raise ValueError("Expected 0 or 1, get " + str(state))

    def apply(self):
        list_controllable_systems = db_connexion.get_list_systems()
        for controllable_system in list_controllable_systems:
            result_set = db_connexion.get_state(controllable_system)
            for point in result_set:
                for dict in point:
                    value = dict['last']
                    id_station = dict['id_station']
                    if value != 0:
                        db_connexion.change_controllable_state(controllable_system, id_station, 0)

class ActivationRule(Rule):
    """ Une classe abstraite pour gérer l'activation automatique des systèmes controllables """
    def __init__(self, controllable_system, id_station):
        super().__init__(self)
        self.controllable_system = controllable_system
        self.id_station = id_station

    def apply(self):
        if db_connexion.is_freeze() != 0:
            return
        db_connexion.change_controllable_state(self.controllable_system, self.id_station, 1)
        # TODO: activate system


class DesactivationRule(Rule):
    """ Une classe abstraite pour gérer la désactivation automatique des systèmes controllables """

    def __init__(self, controllable_system, id_station):
        super().__init__(self)
        self.controllable_system = controllable_system
        self.id_station = id_station

    def apply(self):
        db_connexion.change_controllable_state(self.controllable_system, self.id_station, 0)
        # TODO: desactivate system

class ActivateWatering(ActivationRule):
    """ Régle d'activation de l'arrosage """
    def __init__(self, controllable_system, id_station):
        super().__init__(controllable_system, id_station)

    def condition(self):
        # TODO
        pass


class DesactivateWatering(DesactivationRule):
    """ Régle de désactivation de l'arrosage """
    def __init__(self, controllable_system, id_station):
        super().__init__(controllable_system, id_station)

    def condition(self):
        # TODO
        pass