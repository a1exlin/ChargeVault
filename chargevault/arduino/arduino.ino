#include <Arduino.h>

// Pin definitions
#define LOCK_PIN 53       // Electromagnetic lock control
#define OUTLET1_PIN 24    // Relay control pins
#define OUTLET2_PIN 49
#define OUTLET3_PIN 42
#define OUTLET4_PIN 45
#define LED_PIN 13        // Built-in LED

#define LOCK_DURATION 900000  // 15 minutes in milliseconds

unsigned long unlockEndTime = 0;
bool isLocked = true;
bool outletReserved[4] = {false, false, false, false};
String serialBuffer = "";

// Helper: Get outlet pin by index
byte getOutletPin(int outlet) {
  switch(outlet) {
    case 0: return OUTLET1_PIN;
    case 1: return OUTLET2_PIN;
    case 2: return OUTLET3_PIN;
    case 3: return OUTLET4_PIN;
    default: return OUTLET1_PIN;
  }
}

void setup() {
  Serial.begin(115200);  // Match your server baud rate

  // Initialize built-in LED
  pinMode(LED_PIN, OUTPUT);

  // Initialize lock pin
  pinMode(LOCK_PIN, OUTPUT);
  digitalWrite(LOCK_PIN, HIGH);  // Start locked (active HIGH)

  // Initialize outlet pins
  const byte outletPins[] = {OUTLET1_PIN, OUTLET2_PIN, OUTLET3_PIN, OUTLET4_PIN};
  for (int i = 0; i < 4; i++) {
    pinMode(outletPins[i], OUTPUT);
    digitalWrite(outletPins[i], HIGH);  // Start with power ON (relay inactive)
  }
}

void loop() {
  checkSerial();
  checkAutoRelock();

  // Enforce outlet 4 is always ON
  digitalWrite(OUTLET4_PIN, HIGH);
}

void checkSerial() {
  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\n') {
      serialBuffer.trim();

      if (serialBuffer == "TRIGGER") {
        digitalWrite(LED_PIN, HIGH);
        delay(500);
        digitalWrite(LED_PIN, LOW);
      }
      else if (serialBuffer.startsWith("RESERVE")) {
        int outlet = serialBuffer.substring(8).toInt() - 1;
        if (outlet >= 0 && outlet < 3) {
          reserveOutlet(outlet);
        }
      }
      else if (serialBuffer == "UNLOCK") {
        unlockBox();
      }
      else if (serialBuffer == "LOCK") {
        lockBox();
      }

      // Clear buffer after processing
      serialBuffer = "";
    } else {
      serialBuffer += c;
    }
  }
}

void reserveOutlet(int outlet) {
  // Only outlets 0-2 (1-3) can be reserved
  digitalWrite(getOutletPin(outlet), LOW);  // Cut power (relay active)
  outletReserved[outlet] = true;
  unlockBox();
}

void unlockBox() {
  digitalWrite(LOCK_PIN, LOW);
  isLocked = false;
  unlockEndTime = millis() + LOCK_DURATION;
}

void lockBox() {
  digitalWrite(LOCK_PIN, HIGH);
  isLocked = true;
  unlockEndTime = 0;

  // Restore all reserved outlets 1-3 (0-2)
  for (int i = 0; i < 3; i++) {
    if (outletReserved[i]) {
      digitalWrite(getOutletPin(i), HIGH); // Turn ON
      outletReserved[i] = false;
    }
  }

  // Ensure outlet 4 is ON
  digitalWrite(OUTLET4_PIN, HIGH);
}

void checkAutoRelock() {
  if (!isLocked && millis() > unlockEndTime) {
    lockBox();
  }
}
