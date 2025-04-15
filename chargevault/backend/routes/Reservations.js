const express = require("express");
const router = express.Router();

const Slot = require("../models/slot");
const { getIO } = require("../socket");

// Get all charger slots and their current status
router.post("/getSlots", async (req, res) => {
  try {
    const slots = await Slot.find().lean();
    res.status(200).json(slots);
  } catch (error) {
    console.error("Error fetching slots:", error);
    res.status(500).json({ error: "Failed to fetch slots" });
  }
});

// Reserve or free up a slot
router.post("/reserve", async (req, res) => {
  const { ufid, slotID, status } = req.body;

  if (
    !ufid ||
    typeof slotID === "undefined" ||
    !["empty", "full", "reserved"].includes(status)
  ) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid request data" });
  }

  const id = parseInt(slotID, 10);
  const time = status === "empty" ? null : Math.floor(Date.now() / 1000);

  try {
    const updatedSlot = await Slot.findOneAndUpdate(
      { id },
      { status, ufid, time },
      { new: true }
    );

    if (!updatedSlot) {
      return res.status(404).json({ success: false, error: "Slot not found" });
    }

    const io = getIO();
    io.emit("slotUpdate", { id, status });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error reserving slot:", error);
    res.status(500).json({ success: false, error: "Reservation failed" });
  }
});

// Monitor slot changes in real-time
const changeStream = Slot.watch();

changeStream.on("change", (change) => {
  console.log("Change detected:", change);

  if (
    change.operationType === "update" &&
    change.updateDescription.updatedFields?.status === "full"
  ) {
    console.log("Slot status changed to full");
  }
});

module.exports = router;
