const Slot = require("../models/slot"); // Adjust path if needed

const activeTimers = new Map(); // Holds timers keyed by slot ID

const changeStream = Slot.watch();

changeStream.on("change", async (change) => {
  if (change.operationType !== "update") return;

  const updatedFields = change.updateDescription?.updatedFields || {};
  const slotId = change.documentKey._id;

  const newStatus = updatedFields.status;
  const newTime = updatedFields.time;

  // Cancel any existing timer for this slot
  if (activeTimers.has(slotId)) {
    clearTimeout(activeTimers.get(slotId));
    activeTimers.delete(slotId);
    console.log(`Cancelled existing timeout for slot ${slotId}`);
  }

  // Only start countdown if status is "reserved" and has a time
  if (newStatus === "reserved" && newTime) {
    console.log(`Starting cancel timeout for slot ${slotId}`);

    const now = Math.floor(Date.now() / 1000);
    const secondsToWait = Math.max(0, 900 - (now - newTime)); // 15 minutes = 900 seconds

    const timer = setTimeout(async () => {
      try {
        // Check again before resetting to ensure status hasn't changed
        const current = await Slot.findById(slotId);
        if (current.status === "reserved" && current.time === newTime) {
          await Slot.findByIdAndUpdate(slotId, {
            status: "empty",
            ufid: "None",
            time: null,
          });
          console.log(`Slot ${slotId} auto-reset to empty`);
        } else {
          console.log(`Slot ${slotId} status changed — skipping auto-reset`);
        }
      } catch (err) {
        console.error(`Error during slot ${slotId} auto-reset:`, err);
      } finally {
        activeTimers.delete(slotId); // Clean up timer ref
      }
    }, secondsToWait * 1000);

    activeTimers.set(slotId, timer);
  }
});
