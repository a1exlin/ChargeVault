#include <SPI.h>
#include <MFRC522.h>
#include <SoftwareSerial.h>
#include <WiFi.h>
#include <HTTPClient.h>

// BLE Configuration
SoftwareSerial BTSerial(2, 3); // RX | TX

// RFID Configuration
#define RST_PIN 9
#define SS_PIN 10
#define LOCK_PIN 6
MFRC522 rfid(SS_PIN, RST_PIN);

// Authorized UIDs (add more as needed)
byte storedUIDs[][4] = {
  {0x5D, 0x22, 0x32, 0x02},  // Original tag
  {0x53, 0xF4, 0x47, 0xDA}   // New tag
};
const int NUM_AUTH_TAGS = 2;  // Update when adding more tags

// Button/PCB Configuration
const int buttonPins[] = {2, 5};
const int pcbPins[] = {3, 4};
bool pcbStates[] = {false, false};
bool lastButtonStates[] = {HIGH, HIGH};
unsigned long debounceDelay = 50;
unsigned long lastDebounceTimes[] = {0, 0};

// Lock timing control
bool isUnlocked = false;
unsigned long unlockStartTime = 0;
const unsigned long unlockDuration = 1000;

// Wi-Fi Configuration
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverURL = "http://192.168.1.100:3001/api/arduino/slots";

void setup() {
  Serial.begin(9600);       // Monitor baud rate
  BTSerial.begin(9600);     // BLE module baud rate
  Serial.println("Arduino BLE RFID Lock System Ready");

  // RFID Initialization
  SPI.begin();
  rfid.PCD_Init();
  pinMode(LOCK_PIN, OUTPUT);
  digitalWrite(LOCK_PIN, HIGH);

  // Button/PCB Initialization
  for (int i = 0; i < 2; i++) {
    pinMode(buttonPins[i], INPUT_PULLUP);
    pinMode(pcbPins[i], OUTPUT);
    digitalWrite(pcbPins[i], LOW);
  }

  // Wi-Fi Initialization
  WiFi.begin(ssid, password);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWi-Fi connected!");

  Serial.println("System Ready");
}

void loop() {
  handleRFID();
  handleButtons();
  handleBLE();
}

// Handle BLE commands
void handleBLE() {
  if (BTSerial.available()) {
    char data = BTSerial.read();
    Serial.print("Received from BLE: ");
    Serial.println(data);

    if (data == 'U') {
      unlockDoor();
    } else if (data == 'L') {
      lockDoor();
    }
  }
}

// Unlock the door
void unlockDoor() {
  Serial.println("Unlock command received");
  digitalWrite(LOCK_PIN, LOW);
  isUnlocked = true;
  unlockStartTime = millis();
}

// Lock the door
void lockDoor() {
  Serial.println("Lock command received");
  digitalWrite(LOCK_PIN, HIGH);
  isUnlocked = false;
}

// Handle RFID detection and unlocking
void handleRFID() {
  // Auto-lock after a set duration
  if (isUnlocked && (millis() - unlockStartTime >= unlockDuration)) {
    lockDoor();
    Serial.println("Lock Re-engaged");
  }

  // Check for new RFID card
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
    return;
  }

  Serial.print("Scanned UID: ");
  for (byte i = 0; i < rfid.uid.size; i++) {
    Serial.print(rfid.uid.uidByte[i] < 0x10 ? " 0" : " ");
    Serial.print(rfid.uid.uidByte[i], HEX);
  }
  Serial.println();

  // Check against authorized UIDs
  bool accessGranted = false;
  for (int t = 0; t < NUM_AUTH_TAGS; t++) {
    bool match = true;
    for (byte i = 0; i < 4; i++) {
      if (rfid.uid.uidByte[i] != storedUIDs[t][i]) {
        match = false;
        break;
      }
    }
    if (match) {
      accessGranted = true;
      break;
    }
  }

  if (accessGranted) {
    Serial.println("Access Granted - Unlocking");
    unlockDoor();
    BTSerial.println("Access Granted");
    sendSlotPost(1, "hold", "Arduino001");
  } else {
    Serial.println("Access Denied");
    BTSerial.println("Access Denied");
  }

  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
}

// Existing handleButtons() function remains unchanged
void handleButtons() {
  for (int i = 0; i < 2; i++) {
    int reading = digitalRead(buttonPins[i]);

    if (reading != lastButtonStates[i]) {
      lastDebounceTimes[i] = millis();
    }

    if ((millis() - lastDebounceTimes[i]) > debounceDelay) {
      if (reading == LOW) {
        pcbStates[i] = !pcbStates[i];
        digitalWrite(pcbPins[i], pcbStates[i] ? HIGH : LOW);
        Serial.print("PCB ");
        Serial.print(i);
        Serial.println(pcbStates[i] ? " Activated" : " Deactivated");
      }
    }
    lastButtonStates[i] = reading;
  }
}

// Send slot POST to server
void sendSlotPost(int slotID, const String& action, const String& ufid) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");

    String payload = "{\"slotID\":\"" + String(slotID) + "\",\"action\":\"" + action + "\",\"ufid\":\"" + ufid + "\"}";
    int responseCode = http.POST(payload);

    Serial.print("POST /api/arduino/slots -> ");
    Serial.println(responseCode);

    if (responseCode > 0) {
      String response = http.getString();
      Serial.println("Response: " + response);
    } else {
      Serial.println("Failed to send POST");
    }

    http.end();
  } else {
    Serial.println("Wi-Fi not connected.");
  }
}
