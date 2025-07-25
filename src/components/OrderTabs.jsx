// src/components/admin/OrderTabs.jsx
import React from "react";

const statuses = [
  "pending",
  "approved",
  "dispatched",
  "delivered",
  "rejected",
  "returned",
];

export default function OrderTabs({ selected, setSelected }) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {statuses.map((status) => (
        <button
          key={status}
          onClick={() => setSelected(status)}
          className={`capitalize px-4 py-2 rounded-full text-sm font-medium border ${
            selected === status
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-300"
          }`}
        >
          {status}
        </button>
      ))}
    </div>
  );
}
