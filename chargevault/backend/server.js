const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config();
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { stat } = require("fs");

// Express app and middleware
const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

const openCors = cors({
  origin: "*",
  methods: ["POST"],
  allowedHeaders: ["Content-Type"],
});

// MongoDB connection
mongoose
  .connect(
    "mongodb+srv://alexjphillipson:gPCfzXrVyniq3NcN@cluster0.hbjkwse.mongodb.net/ChargeVault?retryWrites=true&w=majority&appName=Cluster0s",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("MongoDB connected");
    initSlots();
  })
  .catch((err) => console.error("MongoDB error:", err));

  

// User Login token validation
app.post("/api/tokenValidate", async (req, res) => {
  const { token, username } = req.body;

  try {
    const user = await User.findOne({ username }); // Attempts to locate user by username

    // returns 403 if username was not found
    if (!user) {
      return res.sendStatus(403);
    }

    const realToken = JSON.parse(Buffer.from(user.token, 'base64').toString('utf-8'));
    const triedToken = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));

    const now = Math.floor(Date.now() / 1000);

    if (realToken.exp < now) {
      await User.updateOne({ username }, { $set: { token: null } });
      return res.sendStatus(498);
    }


    if (realToken.token == triedToken.token) {
      res.status(200).json({ message: "Success" });
    } else {
      return res.status(400).json({ message: "Token Mismatch" });
    }
  } catch (err) {
    // Catch all other errors and return generic failed message
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error with token validation" });
  }
});

// Login

// prints on page from backend and frontend if login was successful, and also post if login hasn't been registered
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username }); // Attempts to locate user by username

    // Returns basic error if username wasnt found or password was incorrect
    if (!user || user.password !== password) {
      return res.status(400).json({
        message: "Username or password is incorrect",
      });
    }

    const newToken = generateToken();

    await User.updateOne({ username }, { $set: { token: newToken } });

    res.status(200).json({ message: "Success", token: newToken, username: username }); // Instead of returning success, return a login token that is randomly generated and stored in the database
  } catch (err) {
    // Catch all other errors and return generic failed message
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

function generateToken() {
  const payload = {
    token: Math.random().toString(36).slice(2),
    exp: Math.floor(Date.now() / 1000) + (14 * 24 * 60 * 60)
  };

  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

// Sign Up

// prints on page from backend and frontend if signup was sucessful
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  console.log("Recieved signup request");
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log("User already exists");
      return res.status(400).json({ message: "Username already taken" });
    }

    // Create a new user
    const newUser = await User.create({ username, password });
    res.status(201).json({ message: "User created", user: newUser });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});










// Mongoose model for slots
const SlotSchema = new mongoose.Schema({
  id: Number,
  status: String,
  ufid: String,
});
const Slot = mongoose.model("Slot", SlotSchema);

const initSlots = async () => {
  const existing = await Slot.find({}).lean();
  if (existing.length !== 16) {
    await Slot.deleteMany(); // Clear out any incomplete or corrupt set
    const newSlots = Array.from({ length: 16 }, (_, i) => ({
      id: i + 1,
      status: "empty",
      ufid: null,
    }));
    await Slot.insertMany(newSlots);
    console.log("Reinitialized charger slots to 16 in MongoDB");
  }
};

// Returns all slots and status'
app.post("/api/getSlots", async (req, res) => {
  try {
    const slots = await Slot.find({}).lean();
    res.json(slots);
  } catch (err) {
    console.error("Error fetching slots:", err);
    res.status(500).json({ error: "Failed to fetch slots" });
  }
});

// Reserve/free a slot
app.post("/api/reserve", async (req, res) => {
  const { ufid, slotID, status } = req.body;
  const numericSlotID = parseInt(slotID);

  try {
    await Slot.findOneAndUpdate(
      { id: numericSlotID },
      { status, ufid },
      { new: true }
    );

    io.emit("slotUpdate", { id: numericSlotID, status: status });
    res.json({ success: "true" });
  } catch (err) {
    console.error("Reservation error:", err);
    res.status(500).json({ success: false });
  }
});




const changeStream = Slot.watch();

changeStream.on("change", (change) => {
  console.log("Change detected:", change);

  if (change.operationType === "update" && change.updateDescription.updatedFields.status === "full") {
    console.log("Status changed to full!");
    



  }
});




// Adds code so the arduino can post data to the server and tell the backend to display a slot as full or empty
//    /api/arduino/slots?slotID=2&action=free&ufid=UFID
app.post("/api/arduino/slots", openCors, async (req, res) => {
  const { slotID, action, ufid } = req.body;
  //const { slotID, action, ufid } = req.query;

  if (!slotID || !action || !ufid) {
    return res.status(400).json({ error: "Missing slotID, action, or ufid." });
  }

  const numericSlotID = parseInt(slotID);
  let statusUpdate;
  let finalUFID = ufid;

  console.log("Incoming Arduino Slot Action:");
  console.log("slotID:", slotID);
  console.log("action:", action);
  console.log("ufid:", ufid);

  if (action === "hold") {
    statusUpdate = "full";
  } else if (action === "free") {
    statusUpdate = "empty";
    finalUFID = "None";
  } else {
    return res.status(400).json({ error: "Inappropriate Action Specified" });
  }

  try {
    await Slot.findOneAndUpdate(
      { id: numericSlotID },
      { status: statusUpdate, ufid: finalUFID },
      { new: true }
    );

    io.emit("slotUpdate", {
      id: numericSlotID,
      status: statusUpdate,
      ufid: finalUFID,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ success: false });
  }
});














// Setup HTTP + WebSocket server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Send initial slot data on client connect
io.on("connection", async (socket) => {
  console.log("Client connected:", socket.id);
  const allSlots = await Slot.find().sort({ id: 1 });
  socket.emit("init", allSlots);
});

// Start server
server.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});

app.get("/", (req, res) => {
  res.send("API is running");
});
