// src/pages/OrderConfirmation.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MdAccessTime } from "react-icons/md";
import { ImSpinner9 } from "react-icons/im";

export default function OrderConfirmation() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500); // simulate delay
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <ImSpinner9 className="animate-spin text-5xl text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full"
      >
        <MdAccessTime className="text-yellow-500 text-6xl mx-auto mb-4 drop-shadow" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Order Placed — Awaiting Approval
        </h1>
        <p className="text-gray-600 text-sm mb-6">
          ✅ We've received your order and it's currently pending approval by our admin team.
          <br />
          You'll be notified once it’s approved and ready for dispatch.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-sm px-6 py-2.5 rounded-md transition"
          >
            🛍️ Continue Shopping
          </Link>

          <Link
            to="/orders"
            className="text-sm text-blue-500 hover:text-blue-600 transition"
          >
            View My Orders →
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
