const Coupon = require("../models/Coupon");

// ✅ Create a new coupon
exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountPercent,
      amount,
      startDate,
      endDate,
      minPrice,
    } = req.body;

    const upperCode = code?.trim().toUpperCase();
    if (
      !upperCode ||
      (!discountPercent && !amount) ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        message:
          "Please provide code, discount (amount or %), startDate, and endDate.",
      });
    }

    const existing = await Coupon.findOne({ code: upperCode });
    if (existing) {
      return res.status(400).json({ message: "Coupon code already exists." });
    }

    const coupon = new Coupon({
      code: upperCode,
      discountPercent: discountPercent ? Number(discountPercent) : 0,
      amount: amount ? Number(amount) : 0,
      minPrice: minPrice ? Number(minPrice) : 0,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive: true,
    });

    await coupon.save();

    res.status(201).json({
      message: "✅ Coupon created successfully",
      coupon,
    });
  } catch (err) {
    console.error("❌ Error saving coupon:", err);
    res.status(500).json({ message: "Error saving coupon", error: err.message });
  }
};

// ✅ Get all coupons
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json(coupons);
  } catch (err) {
    console.error("❌ Error fetching coupons:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Apply a coupon
exports.applyCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code || cartTotal === undefined) {
      return res.status(400).json({ message: "Code and cart total are required" });
    }

    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });

    if (!coupon) {
      return res.status(400).json({ message: "Coupon not found", autoRemove: true });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ message: "Coupon is inactive", autoRemove: true });
    }

    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      return res.status(400).json({
        message: "Coupon expired or not yet valid",
        autoRemove: true,
      });
    }

    if (cartTotal < coupon.minPrice) {
      return res.status(400).json({
        message: `Minimum order value is Rs. ${coupon.minPrice}`,
        autoRemove: true,
      });
    }

    let discount = 0;
    if (coupon.discountPercent > 0) {
      discount = (cartTotal * coupon.discountPercent) / 100;
    } else if (coupon.amount > 0) {
      discount = coupon.amount;
    }

    discount = Math.min(discount, cartTotal); // Can't exceed total
    const subtotal = cartTotal - discount;

    res.status(200).json({
      message: "Coupon applied successfully",
      discount: Math.round(discount),
      subtotal: Math.round(subtotal),
      coupon,
    });
  } catch (err) {
    console.error("❌ Error applying coupon:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Toggle coupon active/inactive
exports.toggleCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.status(200).json({ message: "Coupon status updated", coupon });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Delete coupon
exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Coupon.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.json({ message: "Coupon deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting coupon:", err);
    res.status(500).json({ message: "Server error" });
  }
};
