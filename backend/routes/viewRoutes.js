const express = require("express");
const router = express.Router();
const CategoryView = require("../models/View");

// ✅ POST /api/views/category
router.post("/category", async (req, res) => {
  const { categoryId } = req.body;
  if (!categoryId) {
    return res.status(400).json({ message: "categoryId is required" });
  }

  const userId = req.user?._id || null;
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  try {
    // Use userId if available, otherwise fallback to IP
    const query = userId
      ? { categoryId, userId }
      : { categoryId, ip };

    const alreadyViewed = await CategoryView.findOne(query);

    if (!alreadyViewed) {
      await CategoryView.create({ categoryId, userId, ip });
    }

    res.status(200).json({ message: "Unique category view recorded" });
  } catch (err) {
    res.status(500).json({
      message: "Error recording category view",
      error: err.message,
    });
  }
});

module.exports = router;
