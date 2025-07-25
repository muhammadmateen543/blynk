import React, { useState } from "react";
import { X } from "lucide-react";
import ClipLoader from "react-spinners/ClipLoader"; // ✅ Import spinner

export default function OrderDetailsModal({ order, onClose, onStatusChange }) {
  const {
    userDetails,
    items: orderItems,
    cart: orderCart,
    subtotal,
    deliveryCharge,
    total,
    status,
  } = order;

  const [loading, setLoading] = useState(false);
  const [currentAction, setCurrentAction] = useState("");
  const items = orderItems?.length > 0 ? orderItems : orderCart || [];

  const handleUpdate = async (newStatus) => {
    if (
      newStatus === "rejected" &&
      !window.confirm("Are you sure you want to reject this order?")
    )
      return;

    setLoading(true);
    setCurrentAction(newStatus);

    try {
      await onStatusChange(order._id, newStatus);
    } finally {
      setLoading(false);
      setCurrentAction("");
    }
  };

  const renderButtonContent = (text, actionKey) =>
    loading && currentAction === actionKey ? (
      <ClipLoader size={16} color="#fff" />
    ) : (
      text
    );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-2">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          <X />
        </button>

        <h2 className="text-xl font-bold mb-4 text-blue-700">Order Details</h2>

        {/* 🧑 Customer Info */}
        <div className="text-sm space-y-2 mb-4">
          <div>
            <span className="font-semibold">Customer:</span>{" "}
            {userDetails?.name} ({userDetails?.phone1})
          </div>
          <div>
            <span className="font-semibold">Email:</span> {userDetails?.email}
          </div>
          <div>
            <span className="font-semibold">Address:</span>{" "}
            {userDetails?.address}, {userDetails?.city},{" "}
            {userDetails?.province}
          </div>
          <div>
            <span className="font-semibold">Payment:</span>{" "}
            {userDetails?.paymentMethod}
          </div>
          <div className="text-gray-700">
            <span className="font-semibold">Status:</span>{" "}
            <span className="capitalize">{status}</span>
          </div>
        </div>

        {/* 📦 Items */}
        <div className="border-t pt-3 mb-4">
          <h3 className="font-semibold mb-2">Items:</h3>
          <ul className="text-sm list-disc ml-5 space-y-2">
            {items.length > 0 ? (
              items.map((item, idx) => (
                <li key={idx} className="text-gray-700">
                  <div className="font-medium">
                    {item?.name || item?.product?.name || "Unnamed Product"} ×{" "}
                    {item?.quantity || 1} – Rs{" "}
                    {item?.price ||
                      item?.product?.salePrice ||
                      item?.product?.price ||
                      0}
                  </div>
                  <div className="text-xs text-gray-500">
                    Product ID:{" "}
                    <code className="bg-gray-100 px-1 py-0.5 rounded">
                      {item?.productId || item?.product?._id || "N/A"}
                    </code>
                  </div>
                </li>
              ))
            ) : (
              <li>No items found.</li>
            )}
          </ul>
        </div>

        {/* 💰 Totals */}
        <div className="text-sm text-gray-800 space-y-1 mb-4 border-t pt-3">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>Rs {subtotal?.toFixed(0) || 0}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>Rs {deliveryCharge || 0}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>Rs {total?.toFixed(0) || 0}</span>
          </div>
        </div>

        {/* 🚦 Status Actions */}
        <div className="flex flex-wrap gap-2 justify-end mt-4">
          {status === "pending" && (
            <>
              <button
                onClick={() => handleUpdate("approved")}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50 flex items-center gap-2"
              >
                {renderButtonContent("Approve", "approved")}
              </button>
              <button
                onClick={() => handleUpdate("rejected")}
                disabled={loading}
                className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50 flex items-center gap-2"
              >
                {renderButtonContent("Reject", "rejected")}
              </button>
            </>
          )}
          {status === "approved" && (
            <>
              <button
                onClick={() => handleUpdate("dispatched")}
                disabled={loading}
                className="bg-yellow-600 text-white px-4 py-2 rounded disabled:opacity-50 flex items-center gap-2"
              >
                {renderButtonContent("Dispatch", "dispatched")}
              </button>
              <button
                onClick={() => handleUpdate("rejected")}
                disabled={loading}
                className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50 flex items-center gap-2"
              >
                {renderButtonContent("Reject", "rejected")}
              </button>
            </>
          )}
          {status === "dispatched" && (
            <>
              <button
                onClick={() => handleUpdate("delivered")}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 flex items-center gap-2"
              >
                {renderButtonContent("Mark as Delivered", "delivered")}
              </button>
              <button
                onClick={() => handleUpdate("returned")}
                disabled={loading}
                className="bg-orange-500 text-white px-4 py-2 rounded disabled:opacity-50 flex items-center gap-2"
              >
                {renderButtonContent("Return & Restock", "returned")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
