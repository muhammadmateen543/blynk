import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUpload,
  FiCheckSquare,
  FiTag,
  FiPackage,
  FiDollarSign,
} from "react-icons/fi";

export default function AdminAddProduct() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false); // 🔄 Add loading state

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    salePrice: "",
    discountPercent: "",
    color: "",
    quantity: "",
    description: "",
    featured: false,
    freeDelivery: false,
  });

  const [media, setMedia] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_B_URL}/api/categories`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then(setCategories);
  }, []);

  const handle = (e) => {
    const { name, value, type, checked, files } = e.target;
    let updatedForm = {
      ...form,
      [name]: type === "checkbox" ? checked : value,
    };

    if (name === "salePrice") {
      const price = Number(updatedForm.price);
      const sale = Number(value);
      updatedForm.discountPercent = price
        ? (((price - sale) / price) * 100).toFixed(0)
        : "";
    }

    if (name === "discountPercent") {
      const price = Number(updatedForm.price);
      const discount = Number(value);
      updatedForm.salePrice = price
        ? (price - (price * discount) / 100).toFixed(0)
        : "";
    }

    if (name === "media") {
      setMedia(files);
    } else {
      setForm(updatedForm);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); // 🚫 Disable button

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    Array.from(media).forEach((file) => data.append("media", file));

    const res = await fetch(
      `${import.meta.env.VITE_B_URL}/api/products/upload`,
      {
        method: "POST",
        credentials: "include",
        body: data,
      }
    );

    const json = await res.json();
    setLoading(false); // ✅ Enable button back

    if (res.ok) {
      alert("✅ Product created");
      nav("/admin/manage");
    } else {
      alert("❌ " + json.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <form
        onSubmit={submit}
        className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg space-y-8 border border-gray-200"
      >
        <div className="flex items-center gap-3 text-green-700">
          <FiPackage className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Add New Product</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Form Inputs */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Product Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handle}
              required
              placeholder="Product name"
              className="w-full border border-gray-300 p-2 rounded-lg"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handle}
              required
              className="w-full border border-gray-300 p-2 rounded-lg"
            >
              <option value="">Choose category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Original Price</label>
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handle}
              required
              placeholder="Price"
              className="w-full border border-gray-300 p-2 rounded-lg"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Sale Price</label>
            <input
              name="salePrice"
              type="number"
              value={form.salePrice}
              onChange={handle}
              placeholder="Sale price"
              className="w-full border border-gray-300 p-2 rounded-lg"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Discount %</label>
            <input
              name="discountPercent"
              type="number"
              value={form.discountPercent}
              onChange={handle}
              placeholder="Discount"
              className="w-full border border-gray-300 p-2 rounded-lg"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Color</label>
            <input
              name="color"
              value={form.color}
              onChange={handle}
              placeholder="e.g. Red, Blue"
              className="w-full border border-gray-300 p-2 rounded-lg"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Quantity</label>
            <input
              name="quantity"
              type="number"
              value={form.quantity}
              onChange={handle}
              required
              placeholder="Stock quantity"
              className="w-full border border-gray-300 p-2 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handle}
            placeholder="Write a detailed product description..."
            required
            rows="4"
            className="w-full border border-gray-300 p-2 rounded-lg"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="featured" onChange={handle} />
            <FiTag /> Featured Product
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" name="freeDelivery" onChange={handle} />
            <FiCheckSquare /> Free Delivery
          </label>
        </div>

        <div className="mt-4">
          <label className="block font-medium text-gray-700 mb-1">
            <FiUpload className="inline-block mr-2" />
            Upload Images
          </label>
          <input
            type="file"
            name="media"
            multiple
            accept="image/*"
            onChange={handle}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg transition text-lg font-semibold ${
            loading
              ? "bg-gray-400 cursor-not-allowed text-white"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          {loading ? "Saving..." : "Save Product"}
        </button>
      </form>
    </div>
  );
}
