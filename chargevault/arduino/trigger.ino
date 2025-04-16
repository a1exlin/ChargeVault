void setup() {
    Serial.begin(9600);
  
    // You can change or remove this if you're not using the built-in LED on pin 13
    pinMode(13, OUTPUT);
  }
  
  void loop() {
    
    // Wait for serial input
    if (Serial.available()) {
      String command = Serial.readStringUntil('\n');  // Reads until newline
  
      // === START of actions ===
      if (command == "TRIGGER") {



    // ARDUINO DOES CODE HERE WHEN TRIGGER IS HIT  
    
    
    
    }
    }
  }
  