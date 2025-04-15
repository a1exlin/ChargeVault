const express = require("express");
const router = express.Router();

const Slot = require("../../models/Slot");
const cors = require("cors");

const openCors = cors({
  origin: "*",
  methods: ["POST"],
  allowedHeaders: ["Content-Type"],
});

router.post("/arduino/slots", openCors, async (req, res) => {
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

module.exports = router;
