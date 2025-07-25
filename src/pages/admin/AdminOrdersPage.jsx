import React, { useEffect, useState } from "react";
import OrderTabs from "../../components/OrderTabs";
import OrderDetailsModal from "./OrderDetailsModal";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true); // 🔹 loading state

  // Fetch all orders on mount
  useEffect(() => {
    setLoading(true);
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setOrders(data.orders);
      })
      .catch((err) => console.error("Failed to fetch orders:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    let comment = "";

    if (newStatus === "rejected") {
      comment = prompt("Please enter reason for rejecting this order:");
      if (!comment) {
        alert("Rejection reason is required.");
        return false;
      }
    }

    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, comment }),
      });

      const data = await res.json();

      if (res.ok) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === id
              ? {
                  ...order,
                  status: newStatus,
                  adminComment: comment || order.adminComment,
                }
              : order
          )
        );
        setSelectedOrder(null);
        return true;
      } else {
        alert(data.message || "Failed to update order status");
        return false;
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("An error occurred.");
      return false;
    }
  };

  const matchesSearch = (order) => {
    const term = searchTerm.toLowerCase();
    return [
      order._id,
      order.userDetails?.name,
      order.userDetails?.phone1,
      order.userDetails?.phone2,
      order.userDetails?.email,
      order.userDetails?.city,
      order.status,
    ]
      .map((val) => val?.toLowerCase() || "")
      .some((field) => field.includes(term));
  };

  const filtered = searchTerm
    ? orders.filter(matchesSearch)
    : orders.filter((o) => o.status === selectedStatus);

  useEffect(() => {
    if (searchTerm) {
      const firstMatch = orders.find(matchesSearch);
      if (firstMatch) setSelectedStatus(firstMatch.status);
    }
  }, [searchTerm, orders]);

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center text-gray-800">
        📦 Admin Orders
      </h1>

      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by ID, name, phone, email, etc."
          className="w-full sm:w-2/3 md:w-1/2 px-4 py-2 border rounded shadow-sm text-sm focus:ring focus:ring-blue-300 focus:outline-none"
        />
      </div>

      <OrderTabs selected={selectedStatus} setSelected={setSelectedStatus} />

      {/* Loading state */}
      {loading ? (
        <div className="text-center text-gray-500 mt-8 text-sm">Loading orders...</div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-500 mt-4 italic text-center">
          No matching orders found.
        </p>
      ) : (
        <div className="grid gap-4 mt-4">
          {filtered.map((order) => (
            <div
              key={order._id}
              onClick={() => setSelectedOrder(order)}
              className="bg-white border rounded-lg p-4 shadow hover:shadow-md transition cursor-pointer"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                  <p className="font-semibold text-gray-800 text-sm md:text-base truncate">
                    {order.userDetails?.name || "Unnamed User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{order.userDetails?.phone1}</p>
                  <p className="text-xs text-gray-400 truncate">ID: {order._id}</p>
                </div>

                <div className="text-xs capitalize px-3 py-1 rounded bg-blue-100 text-blue-700 w-fit">
                  {order.status}
                </div>
              </div>

              <div className="mt-2 text-sm text-gray-700">
                {order.cart?.length || 0} items — Rs {order.total?.toFixed(0)}
              </div>

              {order.status === "rejected" && order.adminComment && (
                <div className="mt-2 text-xs text-red-600">
                  <strong>Reason:</strong> {order.adminComment}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
