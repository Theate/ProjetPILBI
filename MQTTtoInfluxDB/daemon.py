#!/usr/bin/env python3
import paho.mqtt.client as mqtt
import datetime
import time
import logging
import json
from influxdb import InfluxDBClient


logging.basicConfig(level=logging.DEBUG)

def on_connect(client, userdata, flags, rc):
    print("Connected with result code "+str(rc))
    client.subscribe("application/64/#")
    
def on_message(client, userdata, msg):
    logging.debug("Received a message on topic: " + msg.topic)
    # Use utc as timestamp
    receiveTime=datetime.datetime.utcnow()
    message=msg.payload.decode("utf-8")
    print(message)
    try:
        # Convert the string to a float so that it is stored as a number and not a string in the database
        dict = json.loads(message)
    except:
        logging.debug("Could not convert " + message + " to a dictionnary")
        return
    logging.debug(dict["data"])
    logging.debug("Contenu en data: " + dict["data"])
    logging.debug("Finished writing to InfluxDB")
        
# Set up a client for InfluxDB
logging.debug("Création du client InfluxDB")
DATABASE = "TEST"
dbclient = InfluxDBClient('127.0.0.1', '8086', 'root', 'root', 'SENSOR_DATA')
dbclient.switch_database(DATABASE)
# Initialize the MQTT client that should connect to the Mosquitto broker
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message
connOK=False
while(connOK == False):
    try:
        ##### Global var
        BROKER = "lora.campusiot.imag.fr"
        ORGID = '9'
        MQTTUSER = "org-{}".format(ORGID)
        MQTTPASSWORD = "BkGsmPqPrR1PqhAsqMhlnWa9"
        PORT = 8883
        ##### connection settings
        client.tls_set(ca_certs="ca.crt")
        client.username_pw_set(MQTTUSER, MQTTPASSWORD)
        client.connect(BROKER, port=PORT, keepalive=60, )
        connOK = True
        logging.debug("Création client MQTT réussie")
    except:
        connOK = False
        logging.debug("Création client MQTT a échoué")
    time.sleep(2)

# Blocking loop to the Mosquitto broker
client.loop_forever()

