import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiEdit, FiUploadCloud } from "react-icons/fi";

export default function AdminEditProduct() {
  const { id } = useParams();
  const nav = useNavigate();

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
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, categoriesRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_B_URL}/api/products/${id}`, { credentials: "include" }),
          fetch(`${import.meta.env.VITE_B_URL}/api/categories`, { credentials: "include" }),
        ]);

        const productData = await productRes.json();
        const categoriesData = await categoriesRes.json();

        setForm({
          name: productData.name,
          category: productData.category?._id || "",
          price: productData.price,
          salePrice: productData.salePrice || "",
          discountPercent: productData.discountPercent || "",
          color: productData.color || "",
          quantity: productData.quantity,
          description: productData.description,
          featured: productData.featured,
          freeDelivery: productData.freeDelivery || false,
        });

        setCategories(categoriesData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handle = (e) => {
    const { name, value, type, checked, files } = e.target;
    let updatedForm = {
      ...form,
      [name]: type === "checkbox" ? checked : value,
    };

    if (name === "salePrice") {
      const price = Number(updatedForm.price);
      const sale = Number(value);
      updatedForm.discountPercent = price ? (((price - sale) / price) * 100).toFixed(0) : "";
    }

    if (name === "discountPercent") {
      const price = Number(updatedForm.price);
      const discount = Number(value);
      updatedForm.salePrice = price ? (price - (price * discount) / 100).toFixed(0) : "";
    }

    if (name === "media") {
      setMedia(files);
    } else {
      setForm(updatedForm);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    Array.from(media).forEach((file) => data.append("media", file));

    const res = await fetch(`${import.meta.env.VITE_B_URL}/api/products/${id}`, {
      method: "PUT",
      credentials: "include",
      body: data,
    });

    const json = await res.json();
    if (res.ok) {
      alert("✅ Product updated");
      nav("/admin/manage");
    } else {
      alert("❌ " + json.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold text-blue-600">Loading product...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <form
        onSubmit={submit}
        className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow space-y-8 border border-gray-200"
      >
        <div className="flex items-center gap-2 text-blue-600">
          <FiEdit className="text-xl" />
          <h1 className="text-2xl font-bold">Edit Product</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* All inputs same as before */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Product Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handle}
              required
              className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Product Name"
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
            <label className="block mb-1 font-medium text-gray-700">Price (Original)</label>
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handle}
              className="w-full border border-gray-300 p-2 rounded-lg"
              placeholder="Price"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Sale Price</label>
            <input
              name="salePrice"
              type="number"
              value={form.salePrice}
              onChange={handle}
              className="w-full border border-gray-300 p-2 rounded-lg"
              placeholder="Sale Price"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Discount (%)</label>
            <input
              name="discountPercent"
              type="number"
              value={form.discountPercent}
              onChange={handle}
              className="w-full border border-gray-300 p-2 rounded-lg"
              placeholder="Discount"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Color</label>
            <input
              name="color"
              value={form.color}
              onChange={handle}
              className="w-full border border-gray-300 p-2 rounded-lg"
              placeholder="Color"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Stock Quantity</label>
            <input
              name="quantity"
              type="number"
              value={form.quantity}
              onChange={handle}
              className="w-full border border-gray-300 p-2 rounded-lg"
              placeholder="Stock"
              required
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handle}
            rows="4"
            className="w-full border border-gray-300 p-2 rounded-lg"
            placeholder="Enter product description"
            required
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="featured" checked={form.featured} onChange={handle} />
            <span className="text-gray-700">Featured Product</span>
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" name="freeDelivery" checked={form.freeDelivery} onChange={handle} />
            <span className="text-gray-700">Free Delivery</span>
          </label>
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">
            <FiUploadCloud className="inline-block mr-1" />
            Upload Images/Videos
          </label>
          <input
            type="file"
            name="media"
            multiple
            accept="image/*,video/*"
            onChange={handle}
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold text-lg"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
