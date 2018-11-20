#!/usr/bin/env python3

import paho.mqtt.client as mqtt
import sys
import logging
import time


def main(nomClient):
    #Crée le client + lien avec le broker en localhost
    HOSTS = "localhost"
    SUBJECT = "house"
    PAYLOAD = True
    client = mqtt.Client(nomClient)
    client.connect(HOSTS)
    logging.debug(f"Le client {nomClient} a rejoint l'hôte {HOSTS}")
    # on attribue le comportement du client
    client.on_message = None
    client.on_log = on_log
    #Abonnement du client au flux de controle
    client.subscribe("controls")
    client.loop_start()
    while True:
        logging.debug(f"Message sur {SUBJECT} contenant {PAYLOAD}")
        client.publish(SUBJECT, PAYLOAD)
        time.sleep(3)
        PAYLOAD = not PAYLOAD


def on_connect(client, userdata, flags, rc):
    print(f"Connecté avec le code : {str(rc)}")

def on_log(client, userdata, level, buf):
    print("log: ", buf)

def on_message(client, userdata, msg):
    print(f"Message reçu : {str(msg.payload)}")

def help():
    print("Un nom est nécessaire pour le client")

if __name__ == '__main__':
    if len(sys.argv) == 1:
        help()
        exit(0)
    main(sys.argv[1])