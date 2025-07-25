const express = require("express");
const router = express.Router();
const { upload } = require("../utils/cloudinary"); // ✅ handles cloudinary upload
const {
  verifyToken,
  submitReviewViaToken,
  checkReviewStatus,
} = require("../controllers/reviewTokenController");

// ✅ Verify token validity
router.get("/verify", verifyToken);

// ✅ Submit review using token, with optional images (max 5)
router.post("/submit", upload.array("images", 5), submitReviewViaToken);
router.get("/status", checkReviewStatus);
module.exports = router;
