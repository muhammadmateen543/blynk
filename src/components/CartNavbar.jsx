// src/components/CartNavbar.jsx
import { Link } from "react-router-dom";
import { FiArrowLeft, FiShoppingCart } from "react-icons/fi";
import { useCart } from "../context/CartContext";

export default function CartNavbar() {
  const { cart } = useCart();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-gray-600 hover:text-blue-600 text-sm font-medium transition"
        >
          <FiArrowLeft size={18} />
          <span className="hidden sm:inline">Continue Shopping</span>
        </Link>

        {/* Brand / Logo */}
        <div className="text-center flex-1 absolute left-1/2 -translate-x-1/2">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
            <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Cart Overview
            </span>
          </h1>
        </div>

        {/* Cart Icon */}
        <Link to="/cart" className="relative group">
          <FiShoppingCart
            className="text-gray-700 group-hover:text-blue-600 transition"
            size={22}
          />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 text-[11px] font-bold text-white bg-gradient-to-r from-red-500 to-pink-600 w-5 h-5 flex items-center justify-center rounded-full shadow">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}
