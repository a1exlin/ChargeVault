const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: String,
    email: String,
    password: String,
    token: String,
  },
  { collection: "users" }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
