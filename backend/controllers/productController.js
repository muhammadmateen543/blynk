const Product = require("../models/Product");
const Category = require("../models/Category");
const { cloudinary } = require("../utils/cloudinary");

// 🟢 Upload a new product
const uploadProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      category,
      quantity,
      salePrice,
      discountPercent,
      color,
      featured,
      freeDelivery,
    } = req.body;

    const mediaFiles = req.files?.map((file) => ({
      url: file.path, // Cloudinary auto-injects .path with hosted URL
      type: file.mimetype.startsWith("video") ? "video" : "image",
    })) || [];

    const newProduct = new Product({
      name,
      price,
      description,
      category,
      quantity,
      salePrice: salePrice || undefined,
      discountPercent: discountPercent || undefined,
      color,
      featured: String(featured).toLowerCase() === "true",
      freeDelivery: String(freeDelivery).toLowerCase() === "true",
      media: mediaFiles,
    });

    await newProduct.save();
    res.status(201).json({ message: "Product uploaded successfully", product: newProduct });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

// 🟡 Update product by ID
const updateProduct = async (req, res) => {
  try {
    const updateFields = {};
    const fields = [
      "name",
      "price",
      "description",
      "category",
      "quantity",
      "salePrice",
      "discountPercent",
      "color",
      "featured",
      "freeDelivery"
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined && req.body[field] !== "") {
        if (field === "featured" || field === "freeDelivery") {
          updateFields[field] = String(req.body[field]).toLowerCase() === "true";
        } else {
          updateFields[field] = req.body[field];
        }
      }
    });

    if (req.files?.length > 0) {
      updateFields.media = req.files.map((file) => ({
        url: file.path, // ✅ Cloudinary hosted file
        type: file.mimetype.startsWith("video") ? "video" : "image",
      }));
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
    }).populate("category");

    if (!updatedProduct) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product updated", product: updatedProduct });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

// Other functions remain unchanged:
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("category").lean();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

const searchProducts = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ message: "Search query is required" });

    const matchingCategories = await Category.find({
      name: { $regex: query, $options: "i" }
    }).select("_id");

    const categoryIds = matchingCategories.map((cat) => cat._id);

    const results = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { category: { $in: categoryIds } }
      ]
    }).populate("category");

    res.json(results);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Search failed", error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch product" });
  }
};

const getProductsByCategoryId = async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.categoryId }).populate("category");
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch by category" });
  }
};

const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ featured: true }).populate("category");
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch featured products" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product" });
  }
};

const toggleFeatured = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.featured = !product.featured;
    await product.save();

    res.json({
      message: `Product is now ${product.featured ? "featured" : "not featured"}`,
      featured: product.featured,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to toggle featured" });
  }
};

module.exports = {
  uploadProduct,
  updateProduct,
  getAllProducts,
  getProductById,
  getProductsByCategoryId,
  getFeaturedProducts,
  deleteProduct,
  toggleFeatured,
  searchProducts,
};
