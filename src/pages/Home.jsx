import React, { useEffect, useRef, useState } from "react";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import Navbar from "../components/Navbar";
import { Sparkles, ShoppingBag } from "lucide-react";
import LoadingBar from "react-top-loading-bar";
import Footer from "../components/Footer";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(null);

  const { cart, addToCart, incrementQuantity, decrementQuantity } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        loadingRef.current.continuousStart();

        const [prodRes, featRes, catRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/products/featured"),
          fetch("/api/categories"),
        ]);

        const [prodData, featData, catData] = await Promise.all([
          prodRes.json(),
          featRes.json(),
          catRes.json(),
        ]);

        setProducts(Array.isArray(prodData) ? prodData : []);
        setFeatured(Array.isArray(featData) ? featData : []);
        setCategories(Array.isArray(catData) ? catData : []);
      } catch (err) {
        console.error("Error fetching:", err);
      } finally {
        loadingRef.current.complete();
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const SectionHeader = ({ title, Icon }) => (
    <div className="mb-6 mt-14 text-center">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center justify-center gap-2 mb-2">
        <Icon className="text-blue-500" size={26} />
        {title}
      </h2>
      <div className="w-20 h-1 mx-auto bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" />
    </div>
  );

  const ProductGrid = ({ items }) => {
    if (loading) {
      return (
        <p className="text-center text-blue-600 col-span-full py-10 animate-pulse">
          Loading products...
        </p>
      );
    }

    if (!items || items.length === 0) {
      return (
        <p className="text-center text-gray-400 col-span-full py-10">
          No products available at the moment.
        </p>
      );
    }

    return items.map((p) => (
      <ProductCard
        key={p._id}
        product={p}
        cart={cart}
        addToCart={addToCart}
        incrementQuantity={incrementQuantity}
        decrementQuantity={decrementQuantity}
      />
    ));
  };

  return (
    <>
      <LoadingBar color="#2563eb" height={4} ref={loadingRef} />
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white py-16 sm:py-20 px-3 sm:px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 leading-snug">
            Gear Up with <span className="text-yellow-300">Blynk</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg mb-6 max-w-2xl mx-auto text-white/90">
            Stay charged, protected, and connected. Explore premium mobile
            accessories that match your style and power your day.
          </p>
          <a
            href="#featured"
            className="inline-block bg-white text-blue-600 px-5 py-2 rounded-full font-semibold shadow hover:bg-gray-100 transition text-sm sm:text-base"
          >
            Shop Now
          </a>
        </div>
      </section>

      {/* Main Content */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Featured Section */}
          <div id="featured">
            <SectionHeader title="Featured Accessories" Icon={Sparkles} />
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              <ProductGrid items={featured} />
            </div>
          </div>

          {/* All Products Section */}
          <div id="all">
            <SectionHeader title="All Mobile Accessories" Icon={ShoppingBag} />
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              <ProductGrid items={products} />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
