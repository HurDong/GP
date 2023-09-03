const express = require("express");
const { loginUser } = require("./database");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const success = await loginUser(username, password);
    res.json({ success });
  } catch (err) {
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
