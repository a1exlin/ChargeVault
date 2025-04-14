const mongoose = require("mongoose");

const SlotSchema = new mongoose.Schema(
  {
    id: Number,
    status: String,
    ufid: String,
    time: String,
  },
  { collection: "slots" }
);

module.exports = mongoose.models.Slot || mongoose.model("Slot", SlotSchema);
