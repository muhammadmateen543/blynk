const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  deliveryCharge: { type: Number, default: 0 },
});

module.exports = mongoose.model("Settings", settingsSchema);
