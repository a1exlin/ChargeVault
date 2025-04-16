const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { SerialPort } = require("serialport");

const app = express();
const port = 3002;

let serial = null;
let isPortOpen = false;

// Enable CORS for all origins
app.use(cors());

// Serial connection options
const portOptions = {
  baudRate: 115200,
  autoOpen: false,
};

app.listen(port, () => {
  console.log(`Web server running at http://localhost:${port}`);
  findArduinoAndConnect();
});

// Routes
app.get("/", (req, res) => {
  res.send("Arduino Controller is up");
});

app.get("/unlock", (req, res) => {
  if (!serial || !isPortOpen)
    return res.status(503).send("Arduino not connected");
  console.log("Sending: UNLOCK");
  serial.write("UNLOCK\n", (err) => {
    if (err) {
      console.error("Write error:", err.message);
      return res.status(500).send("Error writing UNLOCK to Arduino");
    }
    res.send("UNLOCK command sent");
  });
});

app.get("/lock", (req, res) => {
  if (!serial || !isPortOpen)
    return res.status(503).send("Arduino not connected");
  console.log("Sending: LOCK");
  serial.write("LOCK\n", (err) => {
    if (err) {
      console.error("Write error:", err.message);
      return res.status(500).send("Error writing LOCK to Arduino");
    }
    res.send("LOCK command sent");
  });
});

app.get("/reserve1", (req, res) => {
  if (!serial || !isPortOpen)
    return res.status(503).send("Arduino not connected");
  console.log("Sending: RESERVE 1");
  serial.write("RESERVE 1\n", (err) => {
    if (err) {
      console.error("Write error:", err.message);
      return res.status(500).send("Error writing RESERVE 1 to Arduino");
    }
    res.send("RESERVE 1 command sent");
  });
});

app.get("/reserve2", (req, res) => {
  if (!serial || !isPortOpen)
    return res.status(503).send("Arduino not connected");
  console.log("Sending: RESERVE 2");
  serial.write("RESERVE 2\n", (err) => {
    if (err) {
      console.error("Write error:", err.message);
      return res.status(500).send("Error writing RESERVE 2 to Arduino");
    }
    res.send("RESERVE 2 command sent");
  });
});
app.get("/reserve3", (req, res) => {
  if (!serial || !isPortOpen)
    return res.status(503).send("Arduino not connected");
  console.log("Sending: RESERVE 3");
  serial.write("RESERVE 3\n", (err) => {
    if (err) {
      console.error("Write error:", err.message);
      return res.status(500).send("Error writing RESERVE 3 to Arduino");
    }
    res.send("RESERVE 3 command sent");
  });
});

app.get("/unreserve1", (req, res) => {
  if (!serial || !isPortOpen)
    return res.status(503).send("Arduino not connected");
  console.log("Sending: UNRESERVE 1");
  serial.write("UNRESERVE 1\n", (err) => {
    if (err) {
      console.error("Write error:", err.message);
      return res.status(500).send("Error writing UNRESERVE 1 to Arduino");
    }
    res.send("UNRESERVE 1 command sent");
  });
});

app.get("/unreserve2", (req, res) => {
  if (!serial || !isPortOpen)
    return res.status(503).send("Arduino not connected");
  console.log("Sending: UNRESERVE 2");
  serial.write("UNRESERVE 2\n", (err) => {
    if (err) {
      console.error("Write error:", err.message);
      return res.status(500).send("Error writing UNRESERVE 2 to Arduino");
    }
    res.send("UNRESERVE 2 command sent");
  });
});

app.get("/unreserve3", (req, res) => {
  if (!serial || !isPortOpen)
    return res.status(503).send("Arduino not connected");
  console.log("Sending: UNRESERVE #");
  serial.write("UNRESERVE 3\n", (err) => {
    if (err) {
      console.error("Write error:", err.message);
      return res.status(500).send("Error writing UNRESERVE 3 to Arduino");
    }
    res.send("UNRESERVE 3 command sent");
  });
});

// Finds ACM ports and tries each
function findArduinoAndConnect() {
  const acmPaths = fs.readdirSync("/dev").filter((f) => f.startsWith("ttyACM"));

  if (acmPaths.length === 0) {
    console.log("No ttyACM devices found. Retrying in 8s...");
    return setTimeout(findArduinoAndConnect, 8000);
  }

  console.log("Found ACM devices:", acmPaths);
  tryNextPort(acmPaths, 0);
}

function tryNextPort(paths, index) {
  if (index >= paths.length) {
    console.log("All ttyACM ports failed. Retrying in 8s...");
    return setTimeout(findArduinoAndConnect, 8000);
  }

  const path = `/dev/${paths[index]}`;
  console.log(`Trying to open ${path}...`);

  if (serial) {
    try {
      serial.close();
    } catch (e) {
      console.warn("Serial close failed (maybe already closed):", e.message);
    }
    serial = null;
    isPortOpen = false;
  }

  // Small delay to let Linux release the port
  setTimeout(() => {
    const port = new SerialPort({ ...portOptions, path });

    port.open((err) => {
      if (err) {
        console.warn(`Failed to open ${path}: ${err.message}`);
        return tryNextPort(paths, index + 1);
      }

      serial = port;
      isPortOpen = true;
      console.log(`Connected to Arduino on ${path}`);

      // Send HELLO to enable command mode
      serial.write("HELLO\n", (err) => {
        if (err) {
          console.warn("Failed to send handshake HELLO");
        } else {
          console.log("Handshake HELLO sent");
        }
      });

      port.on("error", (err) => {
        console.error("Serial port error:", err.message);
        isPortOpen = false;
        findArduinoAndConnect();
      });

      port.on("close", () => {
        console.warn("Serial port closed!");
        isPortOpen = false;
        findArduinoAndConnect();
      });
    });
  }, 2000); // Delay before attempting to open port
}
