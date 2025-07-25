import React, { useEffect, useState } from "react";
import {
  FiDollarSign,
  FiSave,
  FiAlertCircle,
  FiCheckCircle,
  FiLoader,
} from "react-icons/fi";

function DeliveryChargeSetup() {
  const [deliveryCharge, setDeliveryCharge] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const fetchDeliveryCharge = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_B_URL}/api/settings/delivery-charge`,
          { credentials: "include" }
        );

        if (!res.ok) throw new Error("Failed to fetch delivery charge");
        const data = await res.json();
        setDeliveryCharge(data.deliveryCharge ?? 0);
      } catch (err) {
        console.error(err);
        setError("❌ Could not load delivery charge.");
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryCharge();
  }, []);

  const handleDeliveryChange = async () => {
    const value = Number(deliveryCharge);

    if (isNaN(value) || value < 0) {
      setStatusMsg("❌ Please enter a valid non-negative number.");
      setIsSuccess(false);
      return;
    }

    setSaving(true);
    setStatusMsg("");
    setError(null);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_B_URL}/api/settings/delivery-charge`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deliveryCharge: value }),
        }
      );

      const json = await res.json();

      if (res.ok) {
        setStatusMsg("✅ Delivery charge updated successfully.");
        setIsSuccess(true);
      } else {
        setStatusMsg("❌ " + (json.message || "Failed to update delivery charge."));
        setIsSuccess(false);
      }
    } catch (err) {
      setStatusMsg("❌ Network error. Please try again.");
      setIsSuccess(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-3 text-blue-600">
          <FiLoader className="animate-spin text-4xl" />
          <p className="text-lg font-medium">Loading delivery charge...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-blue-100">
        <div className="flex items-center gap-3 mb-6 text-blue-700">
          <FiDollarSign size={26} />
          <h2 className="text-2xl font-bold">Set Delivery Charges</h2>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="number"
            value={deliveryCharge}
            onChange={(e) => {
              setDeliveryCharge(e.target.value);
              setStatusMsg("");
              setError(null);
            }}
            placeholder="Enter delivery charge"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            min={0}
          />

          <button
            onClick={handleDeliveryChange}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {saving ? <FiLoader className="animate-spin" /> : <FiSave />}
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        {statusMsg && (
          <p
            className={`mt-4 text-sm flex items-center gap-2 font-medium ${
              isSuccess ? "text-green-700" : "text-red-600"
            }`}
          >
            {isSuccess ? <FiCheckCircle /> : <FiAlertCircle />}
            {statusMsg}
          </p>
        )}

        {error && !statusMsg && (
          <p className="mt-4 text-red-600 text-sm flex items-center gap-2">
            <FiAlertCircle />
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default DeliveryChargeSetup;
