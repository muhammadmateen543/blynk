import React, { useEffect, useState } from "react";
import { FiDollarSign, FiSave, FiCheckCircle } from "react-icons/fi";
import { ImSpinner2 } from "react-icons/im";

export default function AdminSettings() {
  const [fee, setFee] = useState(0);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_B_URL}/api/settings/delivery-fee`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => setFee(d.deliveryFee ?? 0))
      .catch(() => setFee(0))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setLoading(true);
    const res = await fetch(`${import.meta.env.VITE_B_URL}/api/settings/delivery-fee`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deliveryFee: fee }),
    });

    if (res.ok) {
      setStatus("✅ Delivery fee updated successfully!");
    } else {
      setStatus("❌ Failed to update delivery fee.");
    }
    setTimeout(() => setStatus(""), 3000);
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-6 rounded-lg shadow">
      <div className="flex items-center gap-2 text-blue-700 mb-5">
        <FiDollarSign size={22} />
        <h2 className="text-xl font-bold">Global Delivery Fee Settings</h2>
      </div>

      <label className="block text-gray-700 mb-2 font-medium">
        Set Delivery Fee (in PKR):
      </label>

      <input
        type="number"
        value={fee}
        onChange={(e) => setFee(e.target.value)}
        className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter delivery fee"
        disabled={loading}
      />

      <button
        onClick={save}
        disabled={loading}
        className={`mt-4 w-full py-2 rounded-lg flex items-center justify-center gap-2 transition ${
          loading
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {loading ? <ImSpinner2 className="animate-spin" /> : <FiSave />}
        {loading ? "Saving..." : "Save Fee"}
      </button>

      {status && (
        <p className="mt-4 text-sm text-green-600 flex items-center gap-2">
          <FiCheckCircle className="text-green-500" />
          {status}
        </p>
      )}
    </div>
  );
}
