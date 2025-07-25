const ReviewToken = require("../models/ReviewToken");
const Review = require("../models/Review");

// ✅ POST /api/review-tokens/submit
const submitReviewViaToken = async (req, res) => {
  try {
    const { token, rating, comment, productId, reviewerName } = req.body;

    if (!token || !productId || !comment || !rating) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Find the matching unused review token
    const tokenDoc = await ReviewToken.findOne({ token, used: false });
    if (!tokenDoc) {
      return res.status(400).json({ message: "Invalid or already used token" });
    }

    // ✅ Check if this exact combination has already been reviewed
    const existingReview = await Review.findOne({
      userId: tokenDoc.userId,
      productId: tokenDoc.productId,
      orderId: tokenDoc.orderId,
    });

    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this product for this order." });
    }

    // ✅ Cloudinary images
    const imageUrls = req.files?.map((file) => file.path) || [];

    // ✅ Create review
    await Review.create({
      userId: tokenDoc.userId,
      productId: tokenDoc.productId,
      orderId: tokenDoc.orderId,
      rating: Number(rating),
      comment,
      reviewerName: reviewerName || tokenDoc.reviewerName || "",
      images: imageUrls,
    });

    // ✅ Mark this token as used (ONLY this one!)
    tokenDoc.used = true;
    await tokenDoc.save();

    res.json({ success: true, message: "Review submitted successfully." });
  } catch (err) {
    console.error("❌ Review submission error:", err);
    res.status(500).json({ message: "Server error while submitting review." });
  }
};

// ✅ GET /api/review-tokens/verify?token=...
const verifyToken = async (req, res) => {
  try {
    const { token } = req.query;

    const tokenDoc = await ReviewToken.findOne({ token, used: false }).populate("productId");
    if (!tokenDoc) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // ✅ Check if a review was already submitted for this specific token
    const alreadyReviewed = await Review.findOne({
      userId: tokenDoc.userId,
      productId: tokenDoc.productId,
      orderId: tokenDoc.orderId,
    });

    if (alreadyReviewed) {
      return res.status(400).json({ message: "This product has already been reviewed for this order." });
    }

    res.json({
      productName: tokenDoc.productId.name,
      productId: tokenDoc.productId._id,
      userId: tokenDoc.userId,
      reviewerName: tokenDoc.reviewerName,
    });
  } catch (err) {
    console.error("❌ Token verification error:", err);
    res.status(500).json({ message: "Server error during token verification." });
  }
};

const checkReviewStatus = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ success: false, message: "Missing userId" });
    }

    const reviewedTokens = await ReviewToken.find({ userId, used: true });

    const reviewed = reviewedTokens.map((doc) => ({
      productId: doc.productId.toString(),
      orderId: doc.orderId.toString(),
    }));

    return res.json({ success: true, reviewed });
  } catch (err) {
    console.error("❌ Error checking reviewed products:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


module.exports = {
  verifyToken,
  submitReviewViaToken,
  checkReviewStatus,
};
