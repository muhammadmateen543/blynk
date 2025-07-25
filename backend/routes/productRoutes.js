const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const { upload } = require("../utils/cloudinary");

const {
  uploadProduct,
  updateProduct,
  getAllProducts,
  getProductById,
  getProductsByCategoryId,
  getFeaturedProducts,
  deleteProduct,
  toggleFeatured,
  searchProducts,
} = require("../controllers/productController");

// ✅ Upload product (with Cloudinary media)
router.post("/upload", verifyToken, upload.array("media", 5), uploadProduct);

// ✅ Update product (Cloudinary re-upload optional)
router.put("/:id", verifyToken, upload.array("media", 5), updateProduct);

// 🔍 Search products
router.get("/search", searchProducts);

// 🔽 Get all products
router.get("/", getAllProducts);

// ⭐ Featured products
router.get("/featured", getFeaturedProducts);

// 📁 Products by category ID
router.get("/by-category/:categoryId", getProductsByCategoryId);

// 📦 Get product by ID
router.get("/:id", getProductById);

// ❌ Delete product
router.delete("/:id", verifyToken, deleteProduct);

// 🌟 Toggle featured
router.patch("/toggle-featured/:id", verifyToken, toggleFeatured);

module.exports = router;
