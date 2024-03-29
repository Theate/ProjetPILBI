// code tested on SODAQ ExpLoRer
// required libraries : DHT sensor library, Adafruit Unified Sensor
#include <DHT.h>

#define debugSerial SerialUSB

// YL-69 connected on A1
int humidity_YL69_sensor = A1;
// KY-018 connected on A3
int light_KY018_sensor = A3;

// DHT11 connected on D6
#define DHTPIN 6 
#define DHTTYPE DHT11 

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  debugSerial.begin(9600);
  dht.begin();
  debugSerial.println("Starting");
}

int read_soil_humidity() {
  // [0-1023] 10 bits
  // 1023 is no humidity at all, so we reverse the value
  int value = analogRead(humidity_YL69_sensor);
  return 1023 - value;
}

int read_brightness() {
  // [0-1023] 10 bits
  // 1023 is no light at all so we reverse the value
  int value = analogRead(light_KY018_sensor);
  return 1023 - value;
}

float read_air_humidity() {
  float h = dht.readHumidity();//on lit l'hygrometrie
  if (isnan(h)) {
    debugSerial.println("Failed to read humidity from DHT sensor!");
  }
  return h;
}

float read_air_temperature() {
  float t = dht.readTemperature();//on lit la temperature en celsius (par defaut)
  if (isnan(t)) {
    debugSerial.println("Failed to read temperature from DHT sensor!");
  }
  return t;
}

String get_payload() {
    return String(read_soil_humidity()) + "/" +
           String(read_air_humidity()) + "/" +
           String(read_air_temperature()) + "/" +
           String(read_brightness());
}

void loop() {
  delay(60000);
  debugSerial.print(get_payload());
}
