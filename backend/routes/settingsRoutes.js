const express = require("express");
const router = express.Router();
const Settings = require("../models/Settings");
const verifyToken = require("../middleware/verifyToken");

// GET /api/settings/delivery-charge
router.get("/delivery-charge", async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      // Create default settings if none exist
      settings = await Settings.create({ deliveryCharge: 0 });
    }
    return res.json({ deliveryCharge: settings.deliveryCharge });
  } catch (err) {
    console.error("❌ Error fetching delivery charge:", err);
    return res.status(500).json({ message: "Failed to fetch delivery charge" });
  }
});

// PUT /api/settings/delivery-charge
router.put("/delivery-charge", verifyToken, async (req, res) => {
  try {
    const { deliveryCharge } = req.body;

    // Validate deliveryCharge input
    if (deliveryCharge === undefined || isNaN(deliveryCharge)) {
      return res.status(400).json({ message: "Invalid deliveryCharge value" });
    }

    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings({ deliveryCharge });
    } else {
      settings.deliveryCharge = deliveryCharge;
    }

    await settings.save();

    return res.json({ message: "Delivery charge updated", deliveryCharge: settings.deliveryCharge });
  } catch (err) {
    console.error("❌ Error updating delivery charge:", err);
    return res.status(500).json({ message: "Failed to update delivery charge" });
  }
});

module.exports = router;
