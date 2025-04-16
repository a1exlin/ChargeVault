const express = require("express");
const router = express.Router();
const cors = require("cors");

const Slot = require("../../models/slot");
const AccessLog = require("../../models/accessLogs");
const User = require("../../models/user");

// CORS config (open for Arduino POSTs)
const openCors = cors({
  origin: "*",
  methods: ["POST"],
  allowedHeaders: ["Content-Type"],
});

// POST /arduino/rfid
router.post("/arduino/rfid", openCors, async (req, res) => {
  const { rfid, location } = req.body;

  if (!rfid) {
    return res.status(400).json({ error: "Missing RFID" });
  }

  try {
    const user = await User.findOne({ rfid });

    if (!user) {
      return res.status(400).json({ message: "Badge Invalid" });
    }

    // Success response
    res.status(200).json({
      username: user.username,
      message: "Badge OK"
    });

    // Log access event
    await AccessLog.create({
      time: Math.floor(Date.now() / 1000),
      username: user.username,
      rfid,
      location: location || null,
    });
  } catch (err) {
    console.error("RFID Auth Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
