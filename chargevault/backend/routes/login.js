const express = require("express");
const router = express.Router();

const User = require("../models/user");
const loginHistory = require("../models/loginHistory");

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username }); // Attempts to locate user by username

    // Returns basic error if username wasnt found or password was incorrect
    if (!user || user.password !== password) {
      return res.status(400).json({
        message: "Username or password is incorrect",
      });
    }

    const newToken = generateToken();

    await User.updateOne({ username }, { $set: { token: newToken } });

    const time = Math.floor(Date.now() / 1000);
    const rawIp =
      req.headers["x-forwarded-for"]?.split(",").shift() ||
      req.socket?.remoteAddress;

    const cleanIp = (ip) => {
      if (ip.startsWith("::ffff:")) return ip.replace("::ffff:", "");
      if (ip === "::1") return "127.0.0.1";
      return ip;
    };

    const ip = cleanIp(rawIp); // ← Call the function with the raw IP

    // Log access event
    await loginHistory.create({
      username: user.username,
      time: time,
      ip: ip,
    });

    res
      .status(200)
      .json({ message: "Success", token: newToken, username: username });
  } catch (err) {
    // Catch all other errors and return generic failed message
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

function generateToken() {
  const payload = {
    token: Math.random().toString(36).slice(2),
    exp: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60,
  };

  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

module.exports = router;
