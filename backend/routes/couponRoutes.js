const express = require("express");
const router = express.Router();
const {
  createCoupon,
  getAllCoupons,
  applyCoupon,
  toggleCoupon,
  deleteCoupon,
} = require("../controllers/couponController");

const verifyToken = require("../middleware/verifyToken"); // if admin only

router.post("/", verifyToken, createCoupon);     // admin
router.get("/", verifyToken, getAllCoupons);     // admin
router.post("/apply", applyCoupon);              // public
router.patch("/toggle/:id", verifyToken, toggleCoupon);
router.delete("/:id", verifyToken, deleteCoupon);     // admin

module.exports = router;
