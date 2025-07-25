const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

const app = express();

// ✅ Environment Variables
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

// ✅ Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.F_URL,
    credentials: true,
  })
);

// ✅ Serve Static Files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Request Logger
app.use((req, res, next) => {
  console.log(`➡️  [${req.method}] ${req.originalUrl}`);
  next();
});

// ✅ Firebase Admin SDK (if using Firebase for auth)
const admin = require("./firebase");
const verifyFirebaseToken = require("./middleware/verifyFirebaseToken");

// ✅ API Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/settings", require("./routes/settingsRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/coupons", require("./routes/couponRoutes")); // ✅ Only one
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/review-tokens", require("./routes/reviewTokenRoutes"));

// ✅ Protected Example (for testing auth)
app.post("/api/checkout", verifyFirebaseToken, (req, res) => {
  res.json({
    success: true,
    message: "✅ Checkout completed successfully",
    user: req.user,
  });
});

// ✅ Health Check
app.get("/", (req, res) => {
  res.send("🚀 Mobistore API is running...");
});

// ✅ 404 Fallback
app.use((req, res) => {
  res.status(404).json({ success: false, message: "❌ Route not found" });
});

// ✅ MongoDB Connection
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// ✅ Global Error Handlers
process.on("uncaughtException", (err) => {
  console.error("🔥 Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("🔥 Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running at ${process.env.B_URL}`);
});
