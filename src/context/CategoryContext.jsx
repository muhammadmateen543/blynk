const Category = require("../models/Category");
const Product = require("../models/Product");

// Recursive function to get all child category IDs
async function getAllChildCategoryIds(parentId) {
  const children = await Category.find({ parent: parentId }).lean();
  let ids = children.map(c => c._id);

  for (const child of children) {
    const subIds = await getAllChildCategoryIds(child._id);
    ids = ids.concat(subIds);
  }

  return ids;
}

// ✅ Controller: Get category, its children, and all child products
exports.getCategoryProductsAndChildren = async (req, res) => {
  try {
    const categoryId = req.params.id;

    const category = await Category.findById(categoryId).lean();
    if (!category) return res.status(404).json({ message: "Category not found" });

    // Get direct subcategories
    const childCategories = await Category.find({ parent: categoryId }).lean();

    // Get all subcategory IDs recursively
    const allSubIds = await getAllChildCategoryIds(categoryId);

    // Include this category's own ID too (optional)
    const allCategoryIds = [categoryId, ...allSubIds];

    // Get all products in these categories
    const products = await Product.find({ category: { $in: allCategoryIds } }).lean();

    res.json({
      category,
      childCategories,
      products,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch category data", details: err.message });
  }
};
