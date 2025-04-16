const mongoose = require('mongoose');


const loginHistorySchema = new mongoose.Schema(
  {
    username: String,
    time: String,
    rfid: String,
    location: String,
  },
  { collection: "accessLogs" }
);

module.exports = mongoose.model("accessLogs", loginHistorySchema);