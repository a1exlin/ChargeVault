const express = require("express");
const router = express.Router();

const User = require("../models/User");

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
