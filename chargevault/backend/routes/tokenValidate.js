const express = require("express");
const router = express.Router();
const User = require("../models/User");

// User Login token validation
router.post("/tokenValidate", async (req, res) => {
  const { token, username } = req.body;

  try {
    const user = await User.findOne({ username }); // Attempts to locate user by username

    // returns 403 if username was not found
    if (!user) {
      return res.sendStatus(403);
    }

    const realToken = JSON.parse(
      Buffer.from(user.token, "base64").toString("utf-8")
    );
    const triedToken = JSON.parse(
      Buffer.from(token, "base64").toString("utf-8")
    );

    const now = Math.floor(Date.now() / 1000);

    if (realToken.exp < now) {
      await User.updateOne({ username }, { $set: { token: null } });
      return res.sendStatus(498);
    }

    if (realToken.token == triedToken.token) {
      res.status(200).json({ message: "Success" });
    } else {
      return res.status(400).json({ message: "Token Mismatch" });
    }
  } catch (err) {
    // Catch all other errors and return generic failed message
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error with token validation" });
  }
});

module.exports = router;
