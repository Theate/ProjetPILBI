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
    soilHumidity, airHumidity, airTemp, brightness = message.split("/")
    logging.debug(airTemp)
    try:
        json_body = [
                {
                    "measurement": "soil_moisture",
                    "tags": {
                        "id_station": "1",
                        },
                    "fields": {
                        "value": float(soilHumidity)
                        }
                    },
                {
                    "measurement": "air_humidity",
                    "tags": {
                        "id_station": "1",
                        },
                    "fields": {
                        "value": float(airHumidity)
                        }
                    },
                {
                    "measurement": "temperature",
                    "tags": {
                        "id_station": "1",
                        },
                    "fields": {
                        "value": float(airTemp)
                        }
                    },
                {
                    "measurement": "luminosity",
                    "tags": {
                        "id_station": "1",
                        },
                    "fields": {
                        "value": float(brightness)
                        }
                    }
                ]
        logging.debug(json_body)
        dbclient.write_points(json_body)
        logging.debug("Finished writing to InfluxDB")
    except:
        logging.error("Database writing failed for message: {}".format(message))

# Set up a client for InfluxDB
try:
    dbclient = InfluxDBClient('127.0.0.1', '8086', 'root', 'root', 'SENSOR_DATA')
    logging.debug("Connection to InfluxDB is a success")
except:
    logging.error("Connection to InfluxDB failed")
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

