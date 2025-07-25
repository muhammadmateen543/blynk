import { useEffect, useState } from "react";
import {
  TrashIcon,
  PlusIcon,
  PauseCircleIcon,
  PlayCircleIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

export default function AdminManageCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    code: "",
    discountPercent: "",
    amount: "",
    startDate: "",
    endDate: "",
    minPrice: "",
    isActive: true,
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    NProgress.start();
    try {
      const res = await fetch(`${import.meta.env.VITE_B_URL}/api/coupons`, {
        credentials: "include",
      });
      const data = await res.json();
      setCoupons(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
      NProgress.done();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "discountPercent") {
      setForm((prev) => ({ ...prev, [name]: value, amount: "" }));
    } else if (name === "amount") {
      setForm((prev) => ({ ...prev, [name]: value, discountPercent: "" }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code || (!form.discountPercent && !form.amount)) {
      return alert("⚠️ Please enter a code and a valid discount.");
    }

    setSubmitting(true);
    NProgress.start();
    try {
      const res = await fetch(`${import.meta.env.VITE_B_URL}/api/coupons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          discountPercent: form.discountPercent || undefined,
          amount: form.amount || undefined,
          minPrice: Number(form.minPrice) || 0,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Coupon added successfully");
        setForm({
          code: "",
          discountPercent: "",
          amount: "",
          startDate: "",
          endDate: "",
          minPrice: "",
          isActive: true,
        });
        fetchCoupons();
      } else {
        alert("❌ " + data.message);
      }
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setSubmitting(false);
      NProgress.done();
    }
  };

  const toggleCoupon = async (id) => {
    NProgress.start();
    try {
      await fetch(`${import.meta.env.VITE_B_URL}/api/coupons/toggle/${id}`, {
        method: "PATCH",
        credentials: "include",
      });
      fetchCoupons();
    } catch (err) {
      console.error("Toggle error:", err);
    } finally {
      NProgress.done();
    }
  };

  const deleteCoupon = async (id) => {
    if (window.confirm("❗ Delete this coupon?")) {
      NProgress.start();
      try {
        await fetch(`${import.meta.env.VITE_B_URL}/api/coupons/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        fetchCoupons();
      } catch (err) {
        console.error("Delete error:", err);
      } finally {
        NProgress.done();
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <TagIcon className="w-6 h-6 text-indigo-500" />
          Manage Coupons
        </h1>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow border p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10"
      >
        {[
          { name: "code", placeholder: "Coupon Code" },
          { name: "discountPercent", placeholder: "% Discount" },
          { name: "amount", placeholder: "PKR Amount" },
          { name: "startDate", type: "date" },
          { name: "endDate", type: "date" },
          { name: "minPrice", placeholder: "Min Order PKR" },
        ].map((field, idx) => (
          <input
            key={idx}
            type={field.type || "text"}
            name={field.name}
            value={form[field.name]}
            onChange={handleChange}
            placeholder={field.placeholder}
            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        ))}
        <div className="col-span-1 sm:col-span-2 lg:col-span-3">
          <button
            type="submit"
            disabled={submitting}
            className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-md flex items-center justify-center ${
              submitting ? "opacity-70" : ""
            }`}
          >
            {submitting ? (
              <>
                <AiOutlineLoading3Quarters className="animate-spin w-4 h-4 mr-2" />
                Adding...
              </>
            ) : (
              <>
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Coupon
              </>
            )}
          </button>
        </div>
      </form>

      {/* Coupon List */}
      {loading ? (
        <div className="text-gray-500 text-sm flex items-center gap-2">
          <AiOutlineLoading3Quarters className="animate-spin w-4 h-4" />
          Loading coupons...
        </div>
      ) : coupons.length === 0 ? (
        <p className="text-gray-400 text-sm">No coupons found.</p>
      ) : (
        <div className="space-y-4">
          {coupons.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-xl border shadow-sm p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{c.code}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {c.discountPercent
                    ? `${c.discountPercent}% OFF`
                    : c.amount
                    ? `PKR ${c.amount} OFF`
                    : "No discount"}
                </p>
                {c.minPrice > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Min Order: PKR {c.minPrice}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {c.startDate && `Start: ${new Date(c.startDate).toLocaleDateString()}`}
                  {c.endDate &&
                    `  •  End: ${new Date(c.endDate).toLocaleDateString()}`}
                </p>
                <span
                  className={`mt-2 inline-block px-2 py-1 text-xs rounded-full font-medium ${
                    c.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {c.isActive ? "Active" : "Paused"}
                </span>
              </div>
              <div className="flex gap-2 mt-4 sm:mt-0">
                <button
                  onClick={() => toggleCoupon(c._id)}
                  title={c.isActive ? "Pause Coupon" : "Resume Coupon"}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600"
                >
                  {c.isActive ? (
                    <PauseCircleIcon className="w-5 h-5" />
                  ) : (
                    <PlayCircleIcon className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => deleteCoupon(c._id)}
                  title="Delete Coupon"
                  className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
