import { Link } from "react-router-dom";
import { FiArrowLeft, FiPackage } from "react-icons/fi";

export default function OrderNavbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-gray-600 hover:text-blue-600 text-sm font-medium transition"
        >
          <FiArrowLeft size={18} />
          <span className="hidden sm:inline">Back to Home</span>
        </Link>

        {/* Title */}
        <div className="text-center flex-1 absolute left-1/2 -translate-x-1/2">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
            <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              My Orders
            </span>
          </h1>
        </div>

        {/* Orders Icon */}
        <Link to="/orders" className="relative group">
          <FiPackage
            className="text-gray-700 group-hover:text-blue-600 transition"
            size={22}
          />
        </Link>
      </div>
    </nav>
  );
}
