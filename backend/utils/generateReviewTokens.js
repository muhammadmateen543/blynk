const { v4: uuidv4 } = require("uuid");
const ReviewToken = require("../models/ReviewToken");
const Product = require("../models/Product");
const Order = require("../models/Order");
const dotenv = require("dotenv");
dotenv.config();

const BASE_URL = `${process.env.B_URL}/review`;

const generateReviewTokensForOrder = async (order) => {
  const links = [];

  for (const item of order.cart) {
    const existing = await ReviewToken.findOne({
      userId: order.userId,
      productId: item.productId,
      orderId: order._id,
    });

    if (existing) continue;

    const token = uuidv4();

    const reviewToken = await ReviewToken.create({
      token,
      userId: order.userId,
      productId: item.productId,
      orderId: order._id,
    });

    // ✅ Push token to the order
    await Order.findByIdAndUpdate(order._id, {
      $push: { reviewTokens: reviewToken._id },
    });

    const product = await Product.findById(item.productId);

    links.push({
      productName: product?.name || "Product",
      url: `${BASE_URL}?token=${token}`,
    });
  }

  return links;
};

module.exports = generateReviewTokensForOrder;
