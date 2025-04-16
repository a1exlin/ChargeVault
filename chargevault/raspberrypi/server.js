const express = require('express');
const cors = require('cors');
const { SerialPort } = require('serialport');

const app = express();
const port = 3002;

// Enable CORS for all origins
app.use(cors());

// Arduino serial setup
const ARDUINO_PORT = '/dev/ttyACM0'; // or COM3 on Windows

const serial = new SerialPort({
  path: ARDUINO_PORT,
  baudRate: 9600,
});

// Simple status route
app.get('/', (req, res) => {
  res.send('Arduino Controller is up');
});

// Endpoint to trigger Arduino action
app.get('/trigger', (req, res) => {
  serial.write('TRIGGER\n', (err) => {
    if (err) {
      return res.status(500).send('Error writing to Arduino');
    }
    res.send('Command sent to Arduino');
  });
});

app.listen(port, () => {
  console.log(`Web server running at http://localhost:${port}`);
});
