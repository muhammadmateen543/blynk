// 📁 frontend/src/pages/admin/AdminCancelOrder.jsx

import React, { useState } from "react";
import { cancelOrder } from "../../api/tcsService";

export default function AdminCancelOrder() {
  const [cn, setCn] = useState("");
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!cn.trim()) {
      setMsg("❗ Please enter a consignment number.");
      return;
    }

    setLoading(true);
    try {
      const res = await cancelOrder(cn);
      setMsg(JSON.stringify(res, null, 2));
    } catch (error) {
      setMsg("❌ Failed to cancel order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 sm:p-6 bg-white shadow rounded-lg mt-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 text-center">
        🛠️ Admin Cancel Order
      </h2>

      <input
        type="text"
        placeholder="Enter Consignment No"
        value={cn}
        onChange={(e) => setCn(e.target.value)}
        className="border border-gray-300 p-3 rounded w-full mb-3 focus:outline-none focus:ring-2 focus:ring-red-400"
      />

      <button
        onClick={handleCancel}
        disabled={loading}
        className={`w-full py-2 rounded font-semibold text-white transition ${
          loading
            ? "bg-red-400 cursor-not-allowed"
            : "bg-red-600 hover:bg-red-700"
        }`}
      >
        {loading ? "Cancelling..." : "Cancel Order"}
      </button>

      {msg && (
        <pre className="bg-gray-100 mt-4 p-3 rounded text-sm overflow-x-auto whitespace-pre-wrap break-words">
          {msg}
        </pre>
      )}
    </div>
  );
}
