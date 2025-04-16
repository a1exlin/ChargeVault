const express = require("express");
const router = express.Router();
const loginHistory = require("../models/loginHistory");

router.post("/getLoginLogs", async (req, res) => {
  try {
    const logs = await loginHistory.find()
      .sort({ time: -1 }) // newest first
      .limit(100)         // limit if needed
      .lean();            // return plain objects

    res.status(200).json(logs);
  } catch (err) {
    console.error("Failed to fetch login logs:", err);
    res.status(500).json({ message: "Failed to fetch login logs" });
  }
});

module.exports = router;