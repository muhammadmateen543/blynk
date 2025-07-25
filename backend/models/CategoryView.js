const mongoose = require("mongoose");

const categoryViewSchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  ip: { type: String, required: true },
});

categoryViewSchema.index({ categoryId: 1, ip: 1 }, { unique: true });

module.exports = mongoose.model("CategoryView", categoryViewSchema);
