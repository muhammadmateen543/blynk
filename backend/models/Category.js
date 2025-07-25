// models/Category.js
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
  views: {
  type: Number,
  default: 0,
},
});


module.exports = mongoose.model("Category", categorySchema);
