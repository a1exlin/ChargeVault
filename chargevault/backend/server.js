require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");

const initSlots = require("./utils/initSlots");
const socket = require("./socket");

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:3000" }));
app.use(express.json());

// Dev request logger
app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.originalUrl);
  next();
});

// Health check
app.get("/ping", (req, res) => res.send("pong"));

// Routes
app.use("", require("./routes/login"));
app.use("", require("./routes/signin"));
app.use("/api", require("./routes/tokenValidate"));
app.use("/api", require("./routes/arduino/slots"));
app.use("/api", require("./routes/Reservations"));

// Start server only after DB connects
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    initSlots();

    // Initialize WebSocket
    socket.init(server);

    require("./utils/ReservationTimeout");

    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Optional: exit if DB fails
  });
