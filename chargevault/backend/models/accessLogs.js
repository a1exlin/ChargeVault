const mongoose = require("mongoose");

const accessLogsSchema = new mongoose.Schema(
  {
    username: String,
    loginTime: String,
    ip: String,
    userAgent: String,
  },
  { collection: "accessLogs" }
);

module.exports = mongoose.model("1", accessLogsSchema);
