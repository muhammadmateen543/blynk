const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    cart: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        quantity: Number,
        price: Number,
      },
    ],
    subtotal: Number,
    deliveryCharge: Number,
    total: Number,
    status: {
      type: String,
      enum: ["pending", "approved", "dispatched", "delivered", "returned", "rejected"],
      default: "pending",
    },
    adminComment: String,
    userDetails: {
      name: String,
      email: String,
      phone1: String,
      address: String,
      city: String,
      province: String,
      paymentMethod: String,
    },

    // ✅ Add this field to store linked review tokens
    reviewTokens: [{ type: mongoose.Schema.Types.ObjectId, ref: "ReviewToken" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
