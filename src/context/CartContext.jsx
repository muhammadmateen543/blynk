// src/context/CartContext.js

import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [deliveryCharge, setDeliveryCharge] = useState(0);

  // Fetch delivery charge once on mount
  useEffect(() => {
    fetch(`${import.meta.env.VITE_B_URL}/api/settings/delivery-charge`)
      .then((res) => res.json())
      .then((data) => {
        if (typeof data?.deliveryCharge === "number") {
          setDeliveryCharge(Number(data.deliveryCharge));
        }
      })
      .catch((err) => console.error("❌ Failed to fetch delivery charge", err));
  }, []);

  // Final price logic per item
  const getFinalItemPrice = (item) => {
    const hasSale = item.salePrice > 0 && item.salePrice < item.price;
    const hasDiscount = item.discountPercent > 0 && item.discountPercent <= 90;

    if (hasSale) return item.salePrice;
    if (hasDiscount)
      return item.price - (item.price * item.discountPercent) / 100;

    return item.price;
  };

  // Subtotal (final prices × quantity)
  const subtotal = cart.reduce((sum, item) => {
    const price = getFinalItemPrice(item);
    return sum + price * item.quantity;
  }, 0);

  // Determine delivery charge
  const allFreeDelivery = cart.every((item) => item.freeDelivery);
  const effectiveDeliveryCharge =
    cart.length === 0 ? 0 : allFreeDelivery ? 0 : deliveryCharge;

  // Auto-remove coupon if subtotal + deliveryCharge drops below coupon.minPrice
  useEffect(() => {
    const totalBeforeCoupon = subtotal + effectiveDeliveryCharge;
    if (coupon?.minPrice && totalBeforeCoupon < coupon.minPrice) {
      setCoupon(null);
    }
  }, [subtotal, effectiveDeliveryCharge, coupon]);

  const originalTotal = cart.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  const productDiscount = originalTotal - subtotal;

  const couponDiscount = coupon?.amount || 0;

  const total = subtotal + effectiveDeliveryCharge - couponDiscount;

  const addToCart = (product) => {
    const finalPrice = getFinalItemPrice(product);
    const discount = product.discountPercent
      ? product.discountPercent
      : product.salePrice
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0;

    setCart((prev) => {
      const exists = prev.find((item) => item._id === product._id);
      if (exists) return prev;

      return [
        ...prev,
        {
          ...product,
          quantity: 1,
          stock: product.quantity,
          finalPrice,
          discount,
          freeDelivery: !!product.freeDelivery,
        },
      ];
    });
  };

  const incrementQuantity = (id) => {
    setCart((prev) =>
      prev.map((item) =>
        item._id === id && item.quantity < item.stock
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decrementQuantity = (id) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item._id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item._id !== id));
  };

  const clearCart = () => setCart([]);

  const applyCoupon = (data) => setCoupon(data);
  const clearCoupon = () => setCoupon(null);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        incrementQuantity,
        decrementQuantity,
        removeFromCart,
        clearCart,
        coupon,
        applyCoupon,
        clearCoupon,
        setCoupon,
        deliveryCharge,
        subtotal,
        originalTotal,
        productDiscount,
        effectiveDeliveryCharge,
        couponDiscount: Math.round(couponDiscount),
        total: Math.round(Math.max(total, 0)),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
