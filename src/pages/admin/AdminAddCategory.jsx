import React, { useEffect, useState } from "react";
import { FiFolderPlus } from "react-icons/fi";

export default function AdminAddCategory() {
  const [name, setName] = useState("");
  const [parent, setParent] = useState("");
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(false); // 🔄 Add loading state

  // Fetch categories from the backend
  useEffect(() => {
    fetch(`${import.meta.env.VITE_B_URL}/api/categories`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then(setCats)
      .catch((err) => {
        console.error("Error fetching categories:", err);
      });
  }, []);

  // Submit form to add a new category
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); // 🚫 Disable button

    const res = await fetch(`${import.meta.env.VITE_B_URL}/api/categories`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, parent: parent || null }),
    });

    const data = await res.json();
    setLoading(false); // ✅ Re-enable button

    if (res.ok) {
      alert("✅ Category added");
      setName("");
      setParent("");
    } else {
      alert("❌ " + (data.message || "Something went wrong"));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12">
      <form
        onSubmit={submit}
        className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-md space-y-6 border border-gray-200"
      >
        <div className="flex items-center gap-2 text-purple-700 mb-2">
          <FiFolderPlus size={24} />
          <h1 className="text-2xl font-bold">Add New Category</h1>
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Category Name</label>
          <input
            type="text"
            value={name}
            required
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter category name"
            className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Parent Category</label>
          <select
            value={parent}
            onChange={(e) => setParent(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          >
            <option value="">No parent</option>
            {cats.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-lg transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700 text-white"
          }`}
        >
          {loading ? "Adding..." : "Add Category"}
        </button>
      </form>
    </div>
  );
}
