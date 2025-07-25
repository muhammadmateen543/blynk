const express = require("express");
const router = express.Router();
const User = require("../models/User");
const sendOrderStatusEmail = require("../utils/sendOrderStatusEmail");

// Save user on login/signup
router.post("/auth/save-user", async (req, res) => {
  const { name, email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email });
    }
    res.status(200).json({ message: "User saved" });
  } catch (err) {
    console.error("Error saving user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all users for admin
router.get("/admin/users", async (req, res) => {
  try {
    const users = await User.find({}, "name email");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Send bulk email to selected or all
router.post("/admin/send-bulk-email", async (req, res) => {
  const { subject, message, sendToAll, selectedEmails } = req.body;

  try {
    let recipients = [];

    if (sendToAll) {
      const users = await User.find({}, "email");
      recipients = users.map((user) => user.email);
    } else {
      recipients = selectedEmails;
    }

    for (const email of recipients) {
      await sendOrderStatusEmail({ email, subject, message });
    }

    res.status(200).json({ message: "Emails sent successfully" });
  } catch (err) {
    console.error("Bulk email error:", err);
    res.status(500).json({ message: "Failed to send emails" });
  }
});

module.exports = router;
