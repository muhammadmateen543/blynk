const mongoose = require("mongoose");

const reviewTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true, // 🔍 Speeds up lookup
    },
    userId: {
      type: String, // ✅ Changed from ObjectId to String
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
    reviewerName: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReviewToken", reviewTokenSchema);
