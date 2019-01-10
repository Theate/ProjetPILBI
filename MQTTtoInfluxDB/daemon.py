#!/usr/bin/env python3
import paho.mqtt.client as mqtt
import datetime
import time
import logging
from influxdb import InfluxDBClient

logging.basicConfig(level=logging.DEBUG)

def on_connect(client, userdata, flags, rc):
    print("Connected with result code "+str(rc))
    client.subscribe("Home/#")
    
def on_message(client, userdata, msg):
    logging.debug("Received a message on topic: " + msg.topic)
    # Use utc as timestamp
    receiveTime=datetime.datetime.utcnow()
    message=msg.payload.decode("utf-8")
    isfloatValue=False
    try:
        # Convert the string to a float so that it is stored as a number and not a string in the database
        val = float(message)
        isfloatValue=True
    except:
        logging.error("Could not convert " + message + " to a float value")
        isfloatValue=False

    if isfloatValue:
        print(str(receiveTime) + ": " + msg.topic + " " + str(val))

        json_body = [
            {
                "measurement": msg.topic,
                "time": receiveTime,
                "fields": {
                    "value": val
                }
            }
        ]

        dbclient.write_points(json_body)
        print("Finished writing to InfluxDB")
        
# Set up a client for InfluxDB
logging.debug("Création du client InfluxDB")
dbclient = InfluxDBClient('127.0.0.1', '8086', 'root', 'root', 'SENSOR_DATA')

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
        MQTTUSER = f"org-{ORGID}"
        MQTTPASSWORD = "BkGsmPqPrR1PqhAsqMhlnWa9"
        PORT = "8883"
        ##### connection settings
        logging.debug("Création du client")
        client.tls_set(ca_certs="ca.crt")
        client.tls_set_context()
        client.connect(BROKER, port=PORT, keepalive=60, )
        connOK = True
    except:
        connOK = False
    time.sleep(2)

# Blocking loop to the Mosquitto broker
client.loop_forever()

