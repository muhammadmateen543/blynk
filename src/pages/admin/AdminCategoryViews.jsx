import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart2 } from "lucide-react";

const AdminCategoryViews = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchViews = async () => {
      try {
        const res = await axios.get("/api/categories/category-views");
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to load category views:", err);
      }
    };
    fetchViews();
  }, []);

  const buildCategoryPath = (category) => {
    return category.fullPath || category.name;
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex items-center gap-2 mb-6">
        <BarChart2 className="text-blue-600 w-5 h-5" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
          Category Views Overview
        </h2>
      </div>

      {/* Table Section */}
      {categories.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-md">
          <table className="min-w-full divide-y divide-gray-200 text-sm sm:text-base">
            <thead className="bg-blue-50 text-gray-700 uppercase tracking-wide text-xs sm:text-sm">
              <tr>
                <th className="py-3 px-4 text-left">Category</th>
                <th className="py-3 px-4 text-left">Views</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat, i) => (
                <tr
                  key={cat._id}
                  className="hover:bg-blue-50 transition-colors duration-200"
                >
                  <td className="py-3 px-4 whitespace-nowrap text-gray-800 font-medium">
                    {buildCategoryPath(cat)}
                  </td>
                  <td className="py-3 px-4 text-gray-600 font-semibold">
                    {cat.views || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-10">
          <p>No category view data available.</p>
        </div>
      )}
    </div>
  );
};

export default AdminCategoryViews;
