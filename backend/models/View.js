// models/View.js
const mongoose = require("mongoose");

const viewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["product", "category"], required: true },
  refId: { type: mongoose.Schema.Types.ObjectId, required: true },
}, { timestamps: true });

viewSchema.index({ user: 1, type: 1, refId: 1 }, { unique: true }); // prevent duplicates

module.exports = mongoose.model("View", viewSchema);
