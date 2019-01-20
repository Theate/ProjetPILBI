#!/usr/bin/env python3

import paho.mqtt.client as mqtt
import time

# The callback for when the client receives a CONNACK response from the server.
def on_connect(client, userdata, flags, rc):
        print("Connected with result code "+str(rc))

            # Subscribing in on_connect() means that if we lose the connection and
                # reconnect then subscriptions will be renewed.
        client.subscribe("application/#")

# The callback for when a PUBLISH message is received from the server.
def on_message(client, userdata, msg):
        print(msg.topic+" "+str(msg.payload))

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message
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

while True:
    client.publish("application/64", "PAYLOAD")
    time.sleep(2)
    
# Blocking call that processes network traffic, dispatches callbacks and
# handles reconnecting.
# Other loop*() functions are available that give a threaded interface and a
# manual interface.
client.loop_forever()