import React from "react";
import { FiPlus, FiMinus } from "react-icons/fi";
import { useCart } from "../context/CartContext";

// Optional loading skeleton component
const LoadingCard = () => (
  <div className="relative border rounded-2xl p-4 shadow-sm bg-white animate-pulse">
    <div className="h-40 w-full bg-gray-300 rounded-lg mb-3"></div>
    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
    <div className="h-9 bg-gray-300 rounded-full mt-auto"></div>
  </div>
);

export default function ProductCard({ product, loading = false }) {
  const { cart, addToCart, incrementQuantity, decrementQuantity } = useCart();

  if (loading) return <LoadingCard />;

  const cartItem = cart.find((item) => item._id === product._id);
  const currentQty = cartItem?.quantity || 0;
  const inStock = product.quantity > currentQty;

  const discountedPrice = product.discountPercent
    ? product.price - (product.price * product.discountPercent) / 100
    : product.price;

  return (
    <div className="relative border rounded-2xl p-4 shadow-sm bg-white transition hover:shadow-md">
      {/* Discount Badge */}
      {product.discountPercent > 0 && (
        <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-medium">
          {product.discountPercent}% OFF
        </div>
      )}

      {/* Product Image */}
      <img
        src={`${import.meta.env.VITE_B_URL}${product.media?.[0]?.url}`}
        alt={product.name}
        className="h-40 w-full object-cover rounded-lg mb-3"
      />

      {/* Product Name */}
      <h3 className="text-md font-semibold text-gray-800 line-clamp-2">{product.name}</h3>

      {/* Price Section */}
      <div className="mt-1 text-sm">
        {product.discountPercent > 0 ? (
          <p className="text-red-600 font-bold">
            Rs {discountedPrice.toFixed(0)}{" "}
            <span className="text-gray-400 line-through ml-1">Rs {product.price}</span>
          </p>
        ) : (
          <p className="text-gray-700 font-medium">Rs {product.price}</p>
        )}
      </div>

      {/* Stock Info */}
      <p
        className={`text-sm mt-1 font-medium ${
          product.quantity > 0 ? "text-green-600" : "text-red-500"
        }`}
      >
        {product.quantity > 0 ? `${product.quantity} in stock` : "Out of Stock"}
      </p>

      {/* Cart Actions */}
      {currentQty === 0 ? (
        <button
          onClick={() => addToCart(product)}
          disabled={!inStock}
          className={`mt-3 w-full py-2 rounded-full text-sm font-semibold transition shadow ${
            inStock
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-300 text-white cursor-not-allowed"
          }`}
        >
          Add to Cart
        </button>
      ) : (
        <div className="mt-3 flex items-center justify-between bg-gray-100 rounded-full px-3 py-1">
          <button
            onClick={() => decrementQuantity(product._id)}
            className="text-lg text-gray-700 hover:text-red-600"
          >
            <FiMinus />
          </button>
          <span className="font-semibold text-sm">{currentQty}</span>
          <button
            onClick={() => incrementQuantity(product._id)}
            disabled={!inStock}
            className={`text-lg text-gray-700 hover:text-green-600 ${
              !inStock ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <FiPlus />
          </button>
        </div>
      )}
    </div>
  );
}
