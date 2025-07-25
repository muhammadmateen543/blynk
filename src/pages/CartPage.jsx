import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { PlusIcon, MinusIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  AiOutlineTag,
  AiOutlineCheckCircle,
  AiOutlineArrowRight,
} from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import CartNavbar from "../components/CartNavbar";

export default function CartPage() {
  const navigate = useNavigate();
  const {
    cart,
    incrementQuantity,
    decrementQuantity,
    removeFromCart,
    coupon,
    setCoupon,
    clearCoupon,
    deliveryCharge,
  } = useCart();

  const [code, setCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");

  const getFinalPricing = (item) => {
    let discount = 0;
    let finalPrice = item.price;

    const hasValidSalePrice = item.salePrice > 0 && item.salePrice < item.price;
    const hasValidDiscountPercent = item.discountPercent > 0 && item.discountPercent <= 90;

    if (hasValidSalePrice) {
      finalPrice = item.salePrice;
      discount = Math.round(((item.price - item.salePrice) / item.price) * 100);
    } else if (hasValidDiscountPercent) {
      finalPrice = item.price - (item.price * item.discountPercent) / 100;
      discount = item.discountPercent;
    }

    return { finalPrice, discount };
  };

  const subtotal = cart.reduce((sum, item) => {
    const { finalPrice } = getFinalPricing(item);
    return sum + finalPrice * item.quantity;
  }, 0);

  const originalTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const productDiscount = originalTotal - subtotal;

  const allFreeDelivery = cart.every((item) => item.freeDelivery);
  const effectiveDeliveryCharge =
    cart.length === 0 ? 0 : allFreeDelivery ? 0 : deliveryCharge;

  const preTotal = subtotal + effectiveDeliveryCharge;
  const couponDiscount = coupon?.amount || 0;
  const total = preTotal - couponDiscount;

  const handleApply = async () => {
    setCouponMessage("");

    if (!code.trim()) {
      setCouponMessage("Please enter a valid coupon code.");
      return;
    }

    if (isNaN(preTotal) || preTotal <= 0) {
      setCouponMessage("Invalid cart total. Cannot apply coupon.");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_B_URL}/api/coupons/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          code,
          cartTotal: preTotal, // ✅ this includes delivery charges
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.coupon) {
        setCoupon(null);
        setCouponMessage(data?.message || "Invalid or expired coupon.");
        return;
      }

      if (data.discount >= preTotal) {
        setCouponMessage("Cart total is too low for this coupon.");
        return;
      }

      // ✅ Apply coupon
      setCoupon({
        code: data.coupon.code,
        amount: Math.round(data.discount),
        minPrice: data.coupon.minPrice,
      });

      setCouponMessage(`Coupon "${data.coupon.code}" applied!`);
    } catch (err) {
      console.error("❌ Coupon apply error:", err);
      setCouponMessage("Server error. Please try again later.");
    } finally {
      setCode("");
    }
  };

  // Remove coupon if cart total drops below min price
  useEffect(() => {
    const totalBeforeDiscount = subtotal + effectiveDeliveryCharge;

    if (coupon?.minPrice && totalBeforeDiscount < coupon.minPrice) {
      setCoupon(null);
      setCouponMessage(""); 
    }
  }, [subtotal, effectiveDeliveryCharge, coupon]);

  const removeItem = (id) => removeFromCart(id);

  return (
    <>
      <CartNavbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-gray-600 py-20">
            <img
              src="https://cdn-icons-png.flaticon.com/512/11329/11329110.png"
              alt="Empty Cart"
              className="w-28 h-28 mb-4 opacity-70"
            />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-sm text-gray-500 mb-4">Looks like you haven’t added anything yet.</p>
            <a
              href="/"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l1.5 6h7l1.5-6M9 21h6" />
              </svg>
              Continue Shopping
            </a>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="md:col-span-2 space-y-4">
              {cart.map((item) => {
                const { finalPrice, discount } = getFinalPricing(item);
                return (
                  <div key={item._id} className="flex items-center bg-white p-3 rounded-lg shadow border">
                    <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded-md overflow-hidden">
  <img
    src={item.media?.[0]?.url}
    alt={item.name}
    className="w-full h-full object-contain"
  />
</div>

                    <div className="ml-4 flex-1">
                      <div className="text-sm font-semibold text-gray-800 truncate">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.color}</div>
                      <div className="flex gap-2 items-center mt-1 text-xs">
                        <span className="text-blue-600 font-bold text-sm">
                          Rs {finalPrice.toFixed(0)}
                        </span>
                        {discount > 0 && (
                          <>
                            <span className="line-through text-gray-400">Rs {item.price}</span>
                            <span className="text-green-600 font-semibold">({discount}% OFF)</span>
                          </>
                        )}
                      </div>
                      {item.freeDelivery && (
                        <div className="text-green-600 text-xs mt-1 flex items-center gap-1">
                          <AiOutlineCheckCircle className="w-4 h-4" />
                          Free Delivery
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => decrementQuantity(item._id)}
                          className="bg-gray-100 p-1 rounded hover:bg-gray-200"
                        >
                          <MinusIcon className="w-4 h-4 text-red-500" />
                        </button>
                        <span className="text-sm">{item.quantity}</span>
                        <button
                          onClick={() => incrementQuantity(item._id)}
                          disabled={item.quantity >= item.stock}
                          className="bg-gray-100 p-1 rounded hover:bg-gray-200 disabled:opacity-50"
                        >
                          <PlusIcon className="w-4 h-4 text-green-600" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item._id)}
                      className="text-red-500 hover:text-red-700 ml-3"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="bg-white p-4 rounded-lg shadow border w-full max-w-sm text-sm space-y-3">
              <h2 className="text-base font-bold text-gray-800 border-b pb-2">Summary</h2>

              <div className="flex justify-between">
                <span>Original Price</span>
                <span>Rs {originalTotal.toFixed(0)}</span>
              </div>

              {productDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>- Rs {productDiscount.toFixed(0)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rs {subtotal.toFixed(0)}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery</span>
                <span>{effectiveDeliveryCharge === 0 ? "Free" : `Rs ${effectiveDeliveryCharge}`}</span>
              </div>

              {coupon && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon ({coupon.code})</span>
                  <span>- Rs {coupon.amount}</span>
                </div>
              )}

              <div className="border-t pt-2 flex justify-between font-semibold text-gray-800 text-base">
                <span>Total</span>
                <span>Rs {total.toFixed(0)}</span>
              </div>

              {/* Coupon Input */}
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  placeholder="Coupon code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="border rounded px-2 py-1 w-full text-sm"
                />
                <button
                  onClick={handleApply}
                  className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                >
                  <AiOutlineTag className="w-4 h-4" />
                  Apply
                </button>
              </div>

              {couponMessage && (
                <p className={`text-xs mt-1 ${couponMessage.includes("applied") ? "text-green-600" : "text-red-500"}`}>
                  {couponMessage}
                </p>
              )}

              {coupon && (
                <button
  onClick={() => {
    clearCoupon();
    setCouponMessage(""); // Clear message when manually removed
  }}
  className="text-xs text-red-500 underline mt-1"
>
  Remove Coupon
</button>

              )}

              <button
                onClick={() => navigate("/checkout")}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-md flex items-center justify-center gap-2 mt-3 font-medium text-sm"
              >
                <AiOutlineArrowRight className="w-4 h-4" />
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
