// From https://support.sodaq.com/sodaq-one/lorawan/
// additionnal required libraries : DHT sensor library, Adafruit Unified Sensor

#include <Sodaq_RN2483.h>

#include <DHT.h>

#define debugSerial SerialUSB
#define loraSerial Serial2

// YL-69 connected on A1
int humidity_YL69_sensor = A1;
// KY-018 connected on A3
int light_KY018_sensor = A3;

// DHT11 connected on D6
#define DHTPIN 6 
#define DHTTYPE DHT11 

DHT dht(DHTPIN, DHTTYPE);

#define NIBBLE_TO_HEX_CHAR(i) ((i <= 9) ? ('0' + i) : ('A' - 10 + i))
#define HIGH_NIBBLE(i) ((i >> 4) & 0x0F)
#define LOW_NIBBLE(i) (i & 0x0F)

// Delay between 2 transmissions
// 60000 = 1 minute
#define TX_PERIOD 60000

// #define PIR_MOTION_PIN 9

// TODO add #ifdef for OTAA/ABP in order to shrink the firmware
//Use OTAA, set to false to use ABP
bool OTAA = false;

// ABP
// 01 8d 4e d4
const uint8_t devAddr[4] =
{
    0x01, 0x8d, 0x4e, 0xd4
};

// e3 ab cc 97 c8 e0 4e 49 2a 1d 87 c4 a9 26 21 aa
const uint8_t appSKey[16] =
{
  0xE3, 0xAB, 0xCC, 0x97, 0xC8, 0xE0, 0x4E, 0x49,
  0x2A, 0x1D, 0x87, 0xC4, 0xA9, 0x26, 0x21, 0xAA
};

// ea 49 1b 14 ce 52 4c 4c c0 d9 52 94 2a 65 58 ae
const uint8_t nwkSKey[16] =
{
  0xEA, 0x49, 0x1B, 0x14, 0xCE, 0x52, 0x4C, 0x4C,
  0xC0, 0xD9, 0x52, 0x94, 0x2A, 0x65, 0x58, 0xAE
};

// OTAA
// With using the GetHWEUI() function the HWEUI will be used
uint8_t DevEUI[8] =
{
  0x0C, 0xAF, 0xCA, 0x00, 0x00, 0x04, 0x72, 0x05
};

const uint8_t AppEUI[8] =
{
  0x0C, 0xAF, 0xCA, 0x00, 0x00, 0x04, 0xFF, 0xFF
};

// 04 72 05 16 28 ae d2 a6 ab f7 15 88 09 cf 4f 3c
const uint8_t AppKey[16] =
{
0x05, 0x72, 0x05, 0x16, 0x28, 0xae, 0xd2, 0xa6,
0xab, 0xf7, 0x15, 0x88, 0x09, 0xcf, 0x4f, 0x3c
};

void setup()
{
  delay(1000);

  while ((!debugSerial) && (millis() < 10000)){
    // Wait 10 seconds for debugSerial to open
  }

  debugSerial.println("Start");

  // set up dht11 reader
  dht.begin();

  // Start streams
  debugSerial.begin(57600);
  loraSerial.begin(LoRaBee.getDefaultBaudRate());

  LoRaBee.setDiag(debugSerial); // to use debug remove //DEBUG inside library
  LoRaBee.init(loraSerial, LORA_RESET);

  //Use the Hardware EUI
  getHWEUI();

  // Print the Hardware EUI
  debugSerial.print("LoRa HWEUI: ");
  for (uint8_t i = 0; i < sizeof(DevEUI); i++) {
    debugSerial.print((char)NIBBLE_TO_HEX_CHAR(HIGH_NIBBLE(DevEUI[i])));
    debugSerial.print((char)NIBBLE_TO_HEX_CHAR(LOW_NIBBLE(DevEUI[i])));
  }
  debugSerial.println();  

  setupLoRa();
}

void setupLoRa(){
  if(!OTAA){
    // ABP
    setupLoRaABP();
  } else {
    //OTAA
    setupLoRaOTAA();
  }
  // Uncomment this line to for the RN2903 with the Actility Network
  // For OTAA update the DEFAULT_FSB in the library
  // LoRaBee.setFsbChannels(1);

  LoRaBee.setSpreadingFactor(9);
}

void setupLoRaABP(){  
  if (LoRaBee.initABP(loraSerial, devAddr, appSKey, nwkSKey, true))
  {
    debugSerial.println("Communication to LoRaBEE successful.");
  }
  else
  {
    debugSerial.println("Communication to LoRaBEE failed!");
  }
}

void setupLoRaOTAA(){

  if (LoRaBee.initOTA(loraSerial, DevEUI, AppEUI, AppKey, true))
  {
    debugSerial.println("Network connection successful.");
  }
  else
  {
    debugSerial.println("Network connection failed!");
  }
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

void loop()
{
  String reading = get_payload();
  debugSerial.println(reading);

  switch (LoRaBee.send(1, (uint8_t*)reading.c_str(), reading.length()))
    {
    case NoError:
      debugSerial.println("Successful transmission.");
      break;
    case NoResponse:
      debugSerial.println("There was no response from the device.");
      break;
    case Timeout:
      debugSerial.println("Connection timed-out. Check your serial connection to the device! Sleeping for 20sec.");
      delay(20000);
      break;
    case PayloadSizeError:
      debugSerial.println("The size of the payload is greater than allowed. Transmission failed!");
      break;
    case InternalError:
      debugSerial.println("Oh No! This shouldn't happen. Something is really wrong! The program will reset the RN module.");
      setupLoRa();
      break;
    case Busy:
      debugSerial.println("The device is busy. Sleeping for 10 extra seconds.");
      delay(10000);
      break;
    case NetworkFatalError:
      debugSerial.println("There is a non-recoverable error with the network connection. The program will reset the RN module.");
      setupLoRa();
      break;
    case NotConnected:
      debugSerial.println("The device is not connected to the network. The program will reset the RN module.");
      setupLoRa();
      break;
    case NoAcknowledgment:
      debugSerial.println("There was no acknowledgment sent back!");
      break;
    default:
      break;
    }
    // Delay between readings and transmissions
    delay(TX_PERIOD);
}

/**
* Gets and stores the LoRa module's HWEUI/
*/
static void getHWEUI()
{
  uint8_t len = LoRaBee.getHWEUI(DevEUI, sizeof(DevEUI));
}
