import React, { useEffect, useState } from "react";
import { FiBox, FiTag } from "react-icons/fi";
import { ImSpinner3 } from "react-icons/im";

function AdminProductList() {
  const [productsByCategory, setProductsByCategory] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_B_URL}/api/products`);
        const allProducts = await res.json();

        const grouped = {};
        allProducts.forEach((product) => {
          const categoryName = product.category?.name || "Uncategorized";
          if (!grouped[categoryName]) {
            grouped[categoryName] = [];
          }
          grouped[categoryName].push(product);
        });

        setProductsByCategory(grouped);
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-blue-600 font-semibold text-xl">
        <ImSpinner3 className="animate-spin text-4xl mr-2" />
        Loading products...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">
          🗂️ Products by Category
        </h2>

        {Object.keys(productsByCategory).length === 0 && (
          <p className="text-center text-gray-500">No products found.</p>
        )}

        {Object.entries(productsByCategory).map(([category, products]) => (
          <div key={category} className="mb-10">
            <h3 className="text-2xl font-semibold text-blue-700 mb-4">
              {category}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="border rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition duration-300"
                >
                  {/* Image */}
                  <div className="mb-3 w-full h-40 sm:h-48 bg-gray-100 overflow-hidden rounded-md flex items-center justify-center">
                    <img
                      src={product.media?.[0]?.url || "/placeholder.jpg"}
                      alt={product.name}
                      className="h-full w-full object-contain hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Product name */}
                  <h4 className="font-semibold text-lg text-gray-800 mb-1">
                    {product.name}
                  </h4>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-2">
                    {product.description?.slice(0, 80)}...
                  </p>

                  {/* Price & Discount */}
                  <p className="text-blue-700 font-semibold flex items-center gap-1 mb-1">
                    <FiTag />
                    <span className="bg-blue-50 px-2 py-0.5 rounded text-blue-800">
                      Rs.{" "}
                      {product.salePrice > 0
                        ? product.salePrice
                        : product.price}
                    </span>
                    {product.discountPercent > 0 && (
                      <span className="ml-2 text-sm text-green-600 bg-green-50 px-2 py-0.5 rounded">
                        -{product.discountPercent}% Off
                      </span>
                    )}
                  </p>

                  {/* Stock Info */}
                  <p
                    className={`text-sm flex items-center gap-1 ${
                      product.quantity > 0
                        ? "text-gray-600"
                        : "text-red-500"
                    }`}
                  >
                    <FiBox />
                    {product.quantity > 0
                      ? `In Stock: ${product.quantity}`
                      : "Out of Stock"}
                  </p>

                  {/* Free Delivery */}
                  {product.freeDelivery && (
                    <span className="text-xs inline-block mt-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                      Free Delivery
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminProductList;
