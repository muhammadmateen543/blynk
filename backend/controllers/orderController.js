const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const Admin = require("../models/Admin");
const sendOrderStatusEmail = require("../utils/sendOrderStatusEmail");
const generateReviewTokensForOrder = require("../utils/generateReviewTokens");

const formatOrderId = (orderId) => "BLYNK-" + orderId.toString();

// ✅ Place a new order
const placeOrder = async (req, res) => {
  const updatedProducts = [];

  try {
    const { userId, userDetails, cart, subtotal, deliveryCharge, total } = req.body;

    if (!userId || !cart?.length) {
      return res.status(400).json({ success: false, message: "Missing userId or cart is empty" });
    }

    const orderItems = [];

    for (const item of cart) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for: ${product.name}` });
      }

      product.quantity -= item.quantity;
      await product.save();
      updatedProducts.push({ product, quantity: item.quantity });

      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.salePrice || product.price,
        quantity: item.quantity,
      });
    }

    const order = await Order.create({
      userId,
      userDetails,
      cart: orderItems,
      subtotal,
      deliveryCharge,
      total,
      status: "pending",
      reviewTokens: [], // ✅ Initialize empty
    });

    // Save guest user if not already saved
    if (userDetails?.email) {
      const existingUser = await User.findOne({ email: userDetails.email });
      if (!existingUser) {
        await User.create({
          name: userDetails.name || "Unknown",
          email: userDetails.email,
          password: "",
        });
      }
    }

    const fullOrderId = formatOrderId(order._id);

    const admins = await Admin.find();
    for (const admin of admins) {
      await sendOrderStatusEmail({
        type: "new_order_admin",
        to: admin.email,
        name: userDetails.name,
        email: userDetails.email,
        phone: userDetails.phone1,
        city: userDetails.city,
        address: `${userDetails.address}, ${userDetails.city}, ${userDetails.province}`,
        payment: userDetails.paymentMethod,
        orderId: fullOrderId,
        date: new Date(order.createdAt).toLocaleDateString("en-GB"),
        items: orderItems,
        subtotal,
        deliveryCharge,
        total,
      });
    }

    res.status(201).json({ success: true, order });
  } catch (err) {
    console.error("❌ Order placement error:", err.message);

    for (const { product, quantity } of updatedProducts) {
      try {
        product.quantity += quantity;
        await product.save();
      } catch (rollbackErr) {
        console.error("❌ Rollback error:", rollbackErr.message);
      }
    }

    res.status(500).json({ success: false, message: "Failed to place order" });
  }
};

// ✅ Admin: Get all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    console.error("❌ Failed to fetch orders:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

// ✅ Customer: Get orders by userId
const getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ success: false, message: "Missing userId" });

    const orders = await Order.find({ userId })
      .populate("reviewTokens") // ✅ This line ensures tokens are available to frontend
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (err) {
    console.error("❌ Failed to fetch user orders:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch user orders" });
  }
};

// ✅ Admin: Update status & send email
const updateOrderStatus = async (req, res) => {
  try {
    const { status, comment } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (["rejected", "returned"].includes(status)) {
      for (const item of order.cart) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.quantity += item.quantity;
          await product.save();
        }
      }
    }

    order.status = status;
    if (status === "rejected") order.adminComment = comment;

    // ✅ If delivered, generate review tokens
    let reviewLinks = "";
    if (status === "delivered") {
      const tokens = await generateReviewTokensForOrder(order);
      reviewLinks = tokens
        .map(
          (t) =>
            `<a href="${t.url}" target="_blank" style="color:#1976d2;">Leave review for ${t.productName}</a>`
        )
        .join("<br/>");
    }

    await order.save();

    // ✅ Notify customer with review links if delivered
    if (order.userDetails?.email && order.userDetails?.name) {
      await sendOrderStatusEmail({
        type: status,
        to: order.userDetails.email,
        name: order.userDetails.name,
        city: order.userDetails.city,
        payment: order.userDetails.paymentMethod,
        orderId: formatOrderId(order._id),
        reason: order.adminComment,
        items: order.cart,
        reviewLinks,
        subtotal: order.subtotal,
        deliveryCharge: order.deliveryCharge,
        total: order.total,
      });
    }

    res.json({ success: true, order });
  } catch (err) {
    console.error("❌ Order update error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  placeOrder,
  getAllOrders,
  getOrdersByUserId,
  updateOrderStatus,
};
