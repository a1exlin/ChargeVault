const express = require("express");
const router = express.Router();
const AccessLog = require("../models/accessLogs");

// POST /api/getLogs
router.post("/getLogs", async (req, res) => {
  try {
    const logs = await AccessLog.find()
      .sort({ time: -1 }) // newest first
      .limit(100)         // limit if needed
      .lean();            // return plain objects

    res.status(200).json(logs);
  } catch (err) {
    console.error("Failed to fetch access logs:", err);
    res.status(500).json({ message: "Failed to fetch access logs" });
  }
});

module.exports = router;
