// backend/routes/orderRoutes.js

const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderController");
const verifyFirebaseToken = require("../middleware/verifyFirebaseToken"); // optional auth

// ✅ Place a new order — usually from frontend (customer)
router.post("/", orderController.placeOrder);

// ✅ Get all orders — admin only (can secure with verifyFirebaseToken if needed)
router.get("/", /* verifyFirebaseToken, */ orderController.getAllOrders);

// ✅ Get user-specific orders — customer
router.get("/user/:userId", orderController.getOrdersByUserId);

// ✅ Update order status (approve, dispatch, delivered, reject) — admin
router.put("/:id/status", /* verifyFirebaseToken, */ orderController.updateOrderStatus);

module.exports = router;
