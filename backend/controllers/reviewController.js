const Review = require("../models/Review");
const ReviewToken = require("../models/ReviewToken");
const Order = require("../models/Order");

// Submit a new review with Cloudinary image uploads
exports.submitReview = async (req, res) => {
  try {
    const {
      token,
      rating = 5,
      comment,
      reviewerName,
      userId: userFromBody,
    } = req.body;

    const userId = req.user?.id || userFromBody;

    if (!token || !userId || !comment) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const reviewToken = await ReviewToken.findOne({ token });

    if (!reviewToken || reviewToken.used) {
      return res.status(403).json({ success: false, message: "Invalid or used review token" });
    }

    if (reviewToken.userId !== userId) {
      return res.status(403).json({ success: false, message: "Token does not belong to you" });
    }

    // Check if a review already exists for this user-product-order combo
    const alreadyReviewed = await Review.findOne({
      userId,
      productId: reviewToken.productId,
      orderId: reviewToken.orderId,
    });

    if (alreadyReviewed) {
      return res.status(409).json({
        success: false,
        message: "Review already submitted for this product in this order",
      });
    }

    const images = req.files?.map((file) => file.path) || [];

    const review = new Review({
      productId: reviewToken.productId,
      userId: reviewToken.userId,
      orderId: reviewToken.orderId,
      rating: Number(rating),
      comment,
      images,
      reviewerName: reviewerName || "",
    });

    await review.save();

    reviewToken.used = true;
    await reviewToken.save();

    res.status(201).json({ success: true, review });
  } catch (error) {
    console.error("❌ Error in submitReview:", error);
    res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

// Admin adds a comment to a review
exports.commentReview = async (req, res) => {
  try {
    const { adminComment } = req.body;

    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { adminReply: adminComment },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    res.json({ success: true, review });
  } catch (error) {
    console.error("❌ Error in commentReview:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify review token
exports.verifyReviewToken = async (req, res) => {
  try {
    const { token } = req.query;
    const userId = req.user?.id || req.query.userId;

    if (!token || !userId) {
      return res.status(400).json({ success: false, message: "Missing token or user" });
    }

    const reviewToken = await ReviewToken.findOne({ token }).populate("productId", "name");

    if (!reviewToken || reviewToken.used || reviewToken.userId !== userId) {
      return res.status(403).json({ success: false, message: "Invalid or used token" });
    }

    res.json({
      success: true,
      productId: reviewToken.productId._id,
      productName: reviewToken.productId.name,
      userId: reviewToken.userId,
    });
  } catch (err) {
    console.error("❌ Error in verifyReviewToken:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Check if user reviewed any products in a specific order
exports.checkReviewedProducts = async (req, res) => {
  try {
    const { userId, orderId } = req.query;

    if (!userId || !orderId) {
      return res.status(400).json({ success: false, message: "Missing parameters" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const productIds = order.items.map((item) => item.productId.toString());

    const reviews = await Review.find({
      userId,
      orderId,
      productId: { $in: productIds },
    });

    const reviewedProductIds = [...new Set(reviews.map((r) => r.productId.toString()))];

    res.status(200).json({ success: true, reviewed: reviewedProductIds });
  } catch (error) {
    console.error("Error checking reviews:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all approved reviews for a product
exports.getApprovedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      productId: req.params.productId,
      status: "approved",
    })
      .sort({ createdAt: -1 })
      .populate("userId", "name");

    res.json(reviews);
  } catch (error) {
    console.error("❌ Error in getApprovedReviews:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin moderates a review
exports.moderateReview = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { status },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    res.json({ success: true, review });
  } catch (error) {
    console.error("❌ Error in moderateReview:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin gets all reviews
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .populate("productId");

    res.json(reviews);
  } catch (error) {
    console.error("❌ Error in getAllReviews:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Submit internal review (no token)
exports.submitInternalReview = async (req, res) => {
  try {
    const {
      productId,
      userId,
      orderId,
      rating = 5,
      comment,
      reviewerName,
    } = req.body;

    if (!productId || !userId || !orderId || !comment) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields (productId, userId, orderId, comment)",
      });
    }

    // Prevent multiple reviews for same product+order+user
    const alreadyReviewed = await Review.findOne({
      productId,
      userId,
      orderId,
    });

    if (alreadyReviewed) {
      return res.status(409).json({
        success: false,
        message: "You already submitted a review for this product in this order",
      });
    }

    const images = req.files?.map((file) => file.path) || [];

    const review = new Review({
      productId,
      userId,
      orderId,
      rating: Number(rating),
      comment,
      images,
      reviewerName,
      status: "approved",
      isInternal: true,
    });

    await review.save();

    // Also mark ReviewToken as used if exists for this user+product+order
    await ReviewToken.findOneAndUpdate(
      { productId, userId, orderId, used: false },
      { used: true }
    );

    res.status(201).json({ success: true, review });
  } catch (error) {
    console.error("❌ Error in submitInternalReview:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

