const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { upload } = require("../utils/cloudinary");

// ✅ External review (via token)
router.post("/submit", upload.array("images", 5), reviewController.submitReview);
router.get("/verify", reviewController.verifyReviewToken);

// ✅ Internal review (for logged-in users)
router.post("/internal-submit", upload.array("images", 5), reviewController.submitInternalReview);

// ✅ Check reviewed products (per user and order)
router.get("/check-reviewed-products", reviewController.checkReviewedProducts);

// ✅ Admin-only routes
router.get("/approved/:productId", reviewController.getApprovedReviews);
router.get("/all", reviewController.getAllReviews);
router.patch("/moderate/:reviewId", reviewController.moderateReview);
router.patch("/comment/:reviewId", reviewController.commentReview);

module.exports = router;
