const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");

const {
  getNestedCategories,
  getCategoryProductsAndChildren,
  updateCategory,
  deleteCategoryAndProducts,
  incrementCategoryView,
  getCategoryViews,
} = require("../controllers/categoryController");

const Category = require("../models/Category");

// ✅ Create Category
router.post("/", verifyToken, async (req, res) => {
  const { name, parent } = req.body;
  try {
    const category = new Category({ name, parent: parent || null });
    await category.save();
    res.status(201).json({ message: "Category added", category });
  } catch (err) {
    res.status(500).json({ message: "Failed to add category", error: err.message });
  }
});

// ✅ Get all flat categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().populate("parent");
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Failed to get categories", error: err.message });
  }
});

// ✅ Get nested categories (tree)
router.get("/nested", getNestedCategories);

// ✅ Get a category with its subcategories and products
router.get("/with-products/:id", getCategoryProductsAndChildren);

// ✅ Increment views of category and its parents (only once per unique IP)
router.put("/increment-view/:categoryId", incrementCategoryView);

// ✅ Get categories sorted by view count
router.get("/category-views", getCategoryViews);

// ✅ Get a single category by ID
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: "Error fetching category", error: err.message });
  }
});

// ✅ Update category (name or parent)
router.put("/:id", verifyToken, updateCategory);

// ✅ Delete category + subcategories + products
router.delete("/:id", verifyToken, deleteCategoryAndProducts);

module.exports = router;
