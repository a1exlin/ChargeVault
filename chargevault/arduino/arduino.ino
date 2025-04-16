#include <SPI.h>
#include <MFRC522.h>
#include <RTClib.h>
#include <avr/pgmspace.h>

#define RST_PIN 9
#define SS_PIN 53       // Mega SPI pin
#define LOCK_PIN 8
#define DOOR_SWITCH 7
#define RELAY_COUNT 4
#define BATTERY_PINS_COUNT 4

// Relay control pins
const int relayPins[RELAY_COUNT] = {2, 3, 4, 5};
// Battery voltage sensing pins
const int batteryPins[BATTERY_PINS_COUNT] = {A0, A1, A2, A3};

MFRC522 rfid(SS_PIN, RST_PIN);
RTC_DS3231 rtc; // Change class name

struct AuthorizedUser {
  const char* uid;
  const char* name;
};

const AuthorizedUser authorizedUsers[] PROGMEM = {
  {"a1b2c3d4", "Stephanie Ngo"},
  {"5e6f7g8h", "Craig"}
};
const int AUTHORIZED_USER_COUNT = sizeof(authorizedUsers)/sizeof(AuthorizedUser);

String getUserName(String uid) {
  for(int i=0; i<AUTHORIZED_USER_COUNT; i++) {
    char storedUid[9];
    strncpy_P(storedUid, (char*)pgm_read_ptr(&(authorizedUsers[i].uid)), 8);
    storedUid[8] = '\0';
    
    if(uid.equalsIgnoreCase(storedUid)) {
      char nameBuffer[20];
      strncpy_P(nameBuffer, (char*)pgm_read_ptr(&(authorizedUsers[i].name)), 19);
      nameBuffer[19] = '\0';
      return String(nameBuffer);
    }
  }
  return "Unauthorized";
}

struct Reservation {
  String uid;
  String userName; // Add this line
  DateTime reserveTime;
  int outlet;
  bool batteryPresent;
  bool confirmed;

  // Add constructor
  Reservation(String u = "", String un = "", DateTime rt = DateTime(), 
              int o = -1, bool bp = false, bool c = false)
    : uid(u), userName(un), reserveTime(rt), 
      outlet(o), batteryPresent(bp), confirmed(c) {}
};

Reservation currentReservations[RELAY_COUNT];

// Voltage divider configuration
const float VOLTAGE_DIVIDER_RATIO = 4.0;  // Adjust based on your resistors
const float BATTERY_MIN_VOLTAGE = 3.0;    // Minimum detection voltage
const float BATTERY_MAX_VOLTAGE = 20.0;   // Max expected battery voltage
const unsigned long RESERVATION_TIMEOUT = 300000; // 5 minutes

void setup() {
  Serial1.begin(115200);  // For Raspberry Pi communication
  SPI.begin();
  
  // Initialize RFID
  rfid.PCD_Init();
  
  // Initialize RTC
  if (!rtc.begin()) {
    Serial1.println("RTC initialization failed!");
  }
  if (rtc.lostPower()) {
    rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
  }

  // Initialize relays (HIGH = locked/OFF)
  for(int i=0; i<RELAY_COUNT; i++) {
    pinMode(relayPins[i], OUTPUT);
    digitalWrite(relayPins[i], HIGH);
  }

  // Initialize lock and door switch
  pinMode(LOCK_PIN, OUTPUT);
  digitalWrite(LOCK_PIN, HIGH);
  pinMode(DOOR_SWITCH, INPUT_PULLUP);
}

void loop() {
  handlePiCommands();
  checkRFID();
  checkBatteryStatus();
  checkReservationTimeouts();
  manageDoorLock();
  delay(100);
}

void handlePiCommands() {
  if(Serial1.available()) {
    String cmd = Serial1.readStringUntil('\n');
    cmd.trim();
    
    if(cmd.startsWith("RESERVE:")) {
      int outlet = cmd.substring(8).toInt();
      if(outlet >=0 && outlet < RELAY_COUNT) {
        digitalWrite(relayPins[outlet], LOW);
        sendToPi("OUTLET:" + String(outlet) + ":RESERVED");
      }
    }
    else if(cmd.startsWith("CANCEL:")) {
      int outlet = cmd.substring(7).toInt();
      if(outlet >=0 && outlet < RELAY_COUNT) {
        digitalWrite(relayPins[outlet], HIGH);
        currentReservations[outlet] = Reservation("", "", DateTime(), -1, false, false);
        sendToPi("OUTLET:" + String(outlet) + ":AVAILABLE");
      }
    }
  }
}

void checkRFID() {
  if (!rfid.PICC_IsNewCardPresent()) return;
  if (!rfid.PICC_ReadCardSerial()) return;

  String uid = getUID();
  DateTime now = rtc.now();
  String userName = getUserName(uid);
  
  // Log access
  sendToPi("LOGIN:" + uid + ":" + userName + ":" + now.timestamp());

// Only allow authorized users
  if(userName == "Unauthorized") {
    sendToPi("ACCESS_DENIED:" + uid);
    rfid.PICC_HaltA();
    return;
  }

  // Check existing reservations
  for(int i=0; i<RELAY_COUNT; i++) {
    if(currentReservations[i].uid == uid) {
      currentReservations[i] = {uid, userName, now, i, false, false};
      digitalWrite(relayPins[i], LOW);
      currentReservations[i].confirmed = true;
      sendToPi("CONFIRMED:" + String(i));
      unlockDoor();
      rfid.PICC_HaltA();
      return;
    }
  }

  // Find available outlet
  for(int i=0; i<RELAY_COUNT; i++) {
    if(currentReservations[i].uid == "") {
      currentReservations[i] = Reservation(uid, userName, now, i, false, false);
      digitalWrite(relayPins[i], LOW);
      sendToPi("RESERVED:" + String(i) + ":" + uid);
      unlockDoor();
      break;
    }
  }
  
  rfid.PICC_HaltA();
}

void checkBatteryStatus() {
  for(int i=0; i<RELAY_COUNT; i++) {
    float voltage = readBatteryVoltage(i);
    bool present = voltage > BATTERY_MIN_VOLTAGE;
    
    // Update status
    if(currentReservations[i].uid != "") {
      currentReservations[i].batteryPresent = present;
      
      // Cancel if battery removed after 1 minute
      if(!present && (rtc.now().unixtime() - currentReservations[i].reserveTime.unixtime()) > 60) {
        cancelReservation(i);
      }
    }
    
    // Send status update
    sendToPi(String("STATUS:") + i + ":" + 
            (present ? "OCCUPIED" : "AVAILABLE") + ":" + 
            String(getBatteryPercentage(voltage)) + "%");
  }
}

void checkReservationTimeouts() {
  DateTime now = rtc.now();
  for(int i=0; i<RELAY_COUNT; i++) {
    if(currentReservations[i].uid != "" && 
      (now.unixtime() - currentReservations[i].reserveTime.unixtime()) > RESERVATION_TIMEOUT) {
      cancelReservation(i);
    }
  }
}

void manageDoorLock() {
  static unsigned long lockTimer = 0;
  static bool doorClosed = false;

  if(digitalRead(DOOR_SWITCH) == LOW) { // Door closed
    if(!doorClosed) {
      lockTimer = millis();
      doorClosed = true;
    }
    else if(millis() - lockTimer > 10000) {
      digitalWrite(LOCK_PIN, HIGH);
    }
  }
  else {
    doorClosed = false;
  }
}

// Helper functions
String getUID() {
  String uid;
  for (byte i = 0; i < rfid.uid.size; i++) {
    uid += String(rfid.uid.uidByte[i] < 0x10 ? "0" : "");
    uid += String(rfid.uid.uidByte[i], HEX);
  }
  return uid;
}

float readBatteryVoltage(int outlet) {
  int raw = analogRead(batteryPins[outlet]);
  return (raw * (5.0 / 1023.0)) * VOLTAGE_DIVIDER_RATIO;
}

float getBatteryPercentage(float voltage) {
  voltage = constrain(voltage, BATTERY_MIN_VOLTAGE, BATTERY_MAX_VOLTAGE);
  return (voltage - BATTERY_MIN_VOLTAGE) / (BATTERY_MAX_VOLTAGE - BATTERY_MIN_VOLTAGE) * 100;
}

void unlockDoor() {
  digitalWrite(LOCK_PIN, LOW);
}

void cancelReservation(int outlet) {
  digitalWrite(relayPins[outlet], HIGH);
  sendToPi("CANCELLED:" + String(outlet) + ":" + currentReservations[outlet].uid);
  currentReservations[outlet] = Reservation("", "", DateTime(), -1, false, false);
}

void sendToPi(String message) {
  Serial1.println(message);
}
