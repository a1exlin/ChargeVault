const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema(
  {
    username: String,
    time: String,
    ip: String,
  },
  { collection: "loginHistory" }
);

module.exports = mongoose.model("loginHistory", loginHistorySchema);