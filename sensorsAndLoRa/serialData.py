

import serial
import time
ser = serial.Serial('COM10', 9600, timeout=0)
 
while 1:
    try:
        line = ser.readline().decode().replace("\r\n", "")
        if line != "":
            print(line)
        time.sleep(0.1)
    except ser.SerialTimeoutException:
        print('Data could not be read')
        time.sleep(0.1)