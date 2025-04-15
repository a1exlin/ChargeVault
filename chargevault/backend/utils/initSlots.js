const Slot = require("../models/slot");

const initSlots = async () => {
  const existing = await Slot.find({}).lean();
  if (existing.length !== 9) {
    await Slot.deleteMany(); // Clear out any incomplete or corrupt set
    const newSlots = Array.from({ length: 9 }, (_, i) => ({
      id: i + 1,
      status: "empty",
      ufid: null,
      time: null,
    }));
    await Slot.insertMany(newSlots);
    console.log("Reinitialized charger slots to 9 in MongoDB");
  }
};

module.exports = initSlots;
