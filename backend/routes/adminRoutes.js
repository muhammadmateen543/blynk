// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const verifyToken = require("../middleware/verifyToken");

// POST /api/admin/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Set HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // Set to true if using HTTPS in production
      sameSite: "Lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return res.status(200).json({ message: "Login successful" });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Something went wrong during login" });
  }
});

// GET /api/admin/check (to verify token)
router.get("/check", verifyToken, (req, res) => {
  res.status(200).json({ message: "Authorized", admin: req.admin });
});

// POST /api/admin/logout
router.post("/logout", (req, res) => {
  res.clearCookie("token").json({ message: "Logged out successfully" });
});

module.exports = router;
