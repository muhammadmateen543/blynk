const Category = require("../models/Category");
const Product = require("../models/Product");
const CategoryView = require("../models/CategoryView"); // ✅ Don't forget to create this model

// 🟦 Get nested category tree (for menus, etc.)
exports.getNestedCategories = async (req, res) => {
  try {
    const categories = await Category.find().lean();

    const map = {};
    categories.forEach((cat) => {
      cat.children = [];
      map[cat._id] = cat;
    });

    const nested = [];
    categories.forEach((cat) => {
      if (cat.parent) {
        map[cat.parent]?.children.push(cat);
      } else {
        nested.push(cat);
      }
    });

    res.status(200).json(nested);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories", error });
  }
};

// 🟧 Get a category with its subcategories and products
exports.getCategoryProductsAndChildren = async (req, res) => {
  try {
    const categoryId = req.params.id;

    const category = await Category.findById(categoryId).lean();
    if (!category) return res.status(404).json({ message: "Category not found" });

    const childCategories = await Category.find({ parent: categoryId }).lean();

    const childWithProducts = await Promise.all(
      childCategories.map(async (child) => {
        const childProducts = await Product.find({ category: child._id }).lean();
        return {
          ...child,
          products: childProducts,
        };
      })
    );

    const parentProducts = await Product.find({ category: categoryId }).lean();

    res.json({
      category,
      parentProducts,
      children: childWithProducts,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch category details", details: err.message });
  }
};

// ✅ Update category (name or parent)
exports.updateCategory = async (req, res) => {
  try {
    const { name, parent } = req.body;
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    category.name = name ?? category.name;
    category.parent = parent ?? category.parent;

    await category.save();

    res.json({ message: "Category updated", category });
  } catch (err) {
    console.error("Category update error:", err);
    res.status(500).json({ message: "Failed to update category", error: err.message });
  }
};

// 🟥 Delete category + its subcategories + their products
exports.deleteCategoryAndProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    const subcategories = await Category.find({ parent: id }).lean();
    const allCatIds = [category._id, ...subcategories.map((c) => c._id)];

    await Product.deleteMany({ category: { $in: allCatIds } });
    await Category.deleteMany({ _id: { $in: allCatIds } });

    res.json({ message: "Category, subcategories, and related products deleted successfully" });
  } catch (err) {
    console.error("Delete category error:", err);
    res.status(500).json({ message: "Failed to delete category", error: err.message });
  }
};

// 🔁 Recursive view increment for category and its parents
const incrementCategoryAndParents = async (categoryId) => {
  const category = await Category.findById(categoryId);
  if (!category) return;

  category.views = (category.views || 0) + 1;
  await category.save();

  if (category.parent) {
    await incrementCategoryAndParents(category.parent);
  }
};

// 🟨 PUT /api/categories/increment-view/:categoryId
exports.incrementCategoryView = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

    const exists = await CategoryView.findOne({ categoryId, ip });
    if (!exists) {
      await CategoryView.create({ categoryId, ip });
      await incrementCategoryAndParents(categoryId);
    }

    res.status(200).json({ message: "View recorded (if unique)" });
  } catch (err) {
    console.error("View recording error:", err);
    res.status(500).json({ message: "View recording failed", error: err.message });
  }
};

// 🟩 GET /api/categories/views (sorted by most popular)
exports.getCategoryViews = async (req, res) => {
  try {
    const categories = await Category.find().sort({ views: -1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch categories", error });
  }
};
