#!/usr/bin/env python3

import paho.mqtt.client as mqtt
import sys
import logging
import time


def main():
    HOSTS = "localhost"
    client = mqtt.Client("Server")
    client.connect(HOSTS)
    client.subscribe("house")
    client.on_message = on_message

    client.loop_forever()

def on_message(client, userdata, message):
    print("Action") #Mettre à jour la BD etc
    print("topic : ", message.topic)
    print("qos : ", message.qos)
    logging.debug("topic : ", message.topic)
    logging.debug("message qos : ", message.qos)
    logging.debug("retain flag : ", message.retain)

if __name__ == '__main__':
    main()