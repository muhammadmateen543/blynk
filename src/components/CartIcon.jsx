// src/components/CartIcon.jsx
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { FaShoppingCart } from "react-icons/fa";

function CartIcon() {
  const { cart } = useCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Link
      to="/cart"
      className="relative group hover:scale-105 transition-transform duration-150"
      aria-label="Cart"
    >
      {/* Cart Icon */}
      <FaShoppingCart className="text-2xl text-white group-hover:text-blue-400 transition-colors duration-200" />

      {/* Badge */}
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-semibold rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-md">
          {totalItems}
        </span>
      )}
    </Link>
  );
}

export default CartIcon;
