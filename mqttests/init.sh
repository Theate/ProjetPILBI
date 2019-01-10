
BROKER="lora.campusiot.imag.fr"
ORGID=9
MQTTUSER=org-$ORGID
MQTTPASSWORD=BkGsmPqPrR1PqhAsqMhlnWa9

TLS="--cafile ca.crt -p 8883"

mosquitto_sub -h $BROKER -t "gateway/#" -u $MQTTUSER -P $MQTTPASSWORD -v  $TLS

# Receive Gateways stats
