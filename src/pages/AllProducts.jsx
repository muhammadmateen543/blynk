import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function AllProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_B_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {loading && (
        <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-700 animate-pulse" />
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          🛍 All Products
        </h2>

        {loading ? (
          <p className="text-center text-blue-500 mt-10 text-lg font-medium">
            Loading products...
          </p>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">No products available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="border border-gray-200 bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition-all"
              >
                <img
                  src={`${import.meta.env.VITE_B_URL}${product.media?.[0]?.url}`}
                  alt={product.name}
                  className="h-48 w-full object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 truncate">
                    {product.name}
                  </h3>
                  <p className="text-blue-600 font-bold">Rs. {product.price}</p>
                  <p
                    className={`mt-1 text-sm ${
                      product.quantity > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {product.quantity > 0
                      ? `${product.quantity} in stock`
                      : "Out of stock"}
                  </p>

                  <Link
                    to={`/product/${product._id}`}
                    className="block mt-3 bg-blue-600 text-white text-center py-2 rounded-md hover:bg-blue-700 transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AllProducts;
