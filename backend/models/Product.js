// backend/models/Product.js
const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema({
  url: String,
  type: String,
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    price: { type: Number, required: true },
    salePrice: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },
    quantity: { type: Number, default: 0 },
    color: { type: String, default: "" },
    description: { type: String },
    featured: { type: Boolean, default: false },
    freeDelivery: { type: Boolean, default: false },
    media: [mediaSchema],
    avgRating: { type: Number, default: 0 },
    uniqueViews: { type: Number, default: 0 }, // ✅ NEW FIELD
  },
  { timestamps: true }
);


module.exports = mongoose.model("Product", productSchema);
