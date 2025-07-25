import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2, FiCheck, FiX } from "react-icons/fi";
import { MdStar, MdStarBorder } from "react-icons/md";

export default function AdminManageProducts() {
  const [categories, setCategories] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(false);
  const [editingCatId, setEditingCatId] = useState(null);
  const [editCatText, setEditCatText] = useState("");
  const nav = useNavigate();

  const B_URL = import.meta.env.VITE_B_URL;

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${B_URL}/api/categories`, {
        credentials: "include",
      });
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories", err);
    }
    setLoading(false);
  };

  const toggle = async (id) => {
    if (expanded === id) {
      setExpanded(null);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${B_URL}/api/products/by-category/${id}`, {
        credentials: "include",
      });
      const data = await res.json();
      setProducts((prev) => ({ ...prev, [id]: data }));
      setExpanded(id);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
    setLoading(false);
  };

  const deleteCategory = (id) => {
    if (!confirm("Delete this category, its subcategories and all products?")) return;
    fetch(`${B_URL}/api/categories/${id}`, {
      method: "DELETE",
      credentials: "include",
    }).then((res) => {
      if (res.ok) {
        loadCategories();
        setExpanded(null);
      }
    });
  };

  const startEditCategory = (cat) => {
    setEditingCatId(cat._id);
    setEditCatText(cat.name);
  };

  const saveCategoryEdit = (id) => {
    fetch(`${B_URL}/api/categories/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editCatText }),
    }).then((res) => {
      if (res.ok) {
        loadCategories();
        setEditingCatId(null);
      }
    });
  };

  const toggleFeatured = (id, catId) => {
    fetch(`${B_URL}/api/products/toggle-featured/${id}`, {
      method: "PATCH",
      credentials: "include",
    })
      .then((r) => r.json())
      .then((res) => {
        setProducts((p) => ({
          ...p,
          [catId]: p[catId].map((x) =>
            x._id === id ? { ...x, featured: res.featured } : x
          ),
        }));
      });
  };

  const doDelete = (id, catId) => {
    if (!confirm("Delete this product?")) return;
    fetch(`${B_URL}/api/products/${id}`, {
      method: "DELETE",
      credentials: "include",
    }).then((r) => {
      if (r.ok) {
        setProducts((p) => ({
          ...p,
          [catId]: p[catId].filter((x) => x._id !== id),
        }));
      }
    });
  };

  const getFinalPrice = (product) => {
    if (product.salePrice) return product.salePrice;
    if (product.discountPercent)
      return product.price - (product.price * product.discountPercent) / 100;
    return product.price;
  };

  const getDiscountPercent = (product) => {
    if (product.discountPercent) return product.discountPercent;
    if (product.salePrice)
      return Math.round(((product.price - product.salePrice) / product.price) * 100);
    return 0;
  };

  return (
    <div className="px-4 sm:px-6 py-8 mx-auto max-w-6xl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
        🛠️ Manage Products & Categories
      </h1>

      {loading && (
        <div className="text-center text-gray-500 py-4">Loading...</div>
      )}

      {!loading &&
        categories.map((cat) => (
          <div key={cat._id} className="mb-6 border rounded shadow-sm bg-white">
            {/* CATEGORY HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-100 p-4 rounded-t gap-3">
              <div className="flex items-center flex-wrap gap-2">
                {editingCatId === cat._id ? (
                  <>
                    <input
                      value={editCatText}
                      onChange={(e) => setEditCatText(e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                    />
                    <button
                      onClick={() => saveCategoryEdit(cat._id)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <FiCheck />
                    </button>
                    <button
                      onClick={() => setEditingCatId(null)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiX />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-lg text-gray-700">{cat.name}</span>
                    <button
                      onClick={() => startEditCategory(cat)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => deleteCategory(cat._id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() => toggle(cat._id)}
                className="text-blue-600 px-3 py-1 rounded hover:bg-blue-100 transition text-sm font-medium"
              >
                {expanded === cat._id ? "Hide" : "Show"} Products
              </button>
            </div>

            {/* PRODUCTS */}
            {expanded === cat._id && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                {products[cat._id]?.length ? (
                  products[cat._id].map((p) => (
                    <div
                      key={p._id}
                      className="bg-gray-50 p-4 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start border hover:shadow-md transition"
                    >
                      <div className="space-y-1">
                        <h2 className="text-lg font-semibold text-gray-800">{p.name}</h2>
                        <div className="text-sm">
                          <span className="text-red-600 font-semibold text-base">
                            Rs {getFinalPrice(p).toFixed(0)}
                          </span>{" "}
                          {getDiscountPercent(p) > 0 && (
                            <>
                              <span className="text-gray-400 line-through">
                                Rs {p.price.toFixed(0)}
                              </span>{" "}
                              <span className="text-green-600 font-medium">
                                ({getDiscountPercent(p)}% OFF)
                              </span>
                            </>
                          )}
                        </div>

                        <div className="mt-1 text-xs">
                          {p.quantity <= 0 ? (
                            <span className="bg-red-100 text-red-600 px-2 py-1 rounded font-medium">
                              Out of Stock
                            </span>
                          ) : (
                            <span className="text-gray-500">Stock: {p.quantity}</span>
                          )}
                        </div>

                        {p.featured && (
                          <div className="text-yellow-600 text-xs font-semibold flex items-center gap-1">
                            <MdStar className="inline" />
                            Featured Product
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-3 sm:mt-0 sm:flex-col sm:items-end ml-auto">
                        <button
                          onClick={() => toggleFeatured(p._id, cat._id)}
                          className={`p-2 rounded hover:bg-gray-200 transition ${
                            p.featured ? "text-yellow-500" : "text-gray-400"
                          }`}
                          title={p.featured ? "Unmark Featured" : "Mark as Featured"}
                        >
                          {p.featured ? <MdStar size={22} /> : <MdStarBorder size={22} />}
                        </button>

                        <button
                          onClick={() => nav(`/admin/edit-product/${p._id}`)}
                          className="text-blue-600 p-2 rounded hover:bg-blue-100 transition"
                          title="Edit Product"
                        >
                          <FiEdit size={18} />
                        </button>

                        <button
                          onClick={() => doDelete(p._id, cat._id)}
                          className="text-red-600 p-2 rounded hover:bg-red-100 transition"
                          title="Delete Product"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 col-span-full text-center mt-4 italic">
                    No products found in this category.
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
    </div>
  );
}
