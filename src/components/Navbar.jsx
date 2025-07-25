import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ShoppingCart,
  Home,
  LogIn,
  ShieldCheck,
  LogOut,
  Smartphone,
  Search,
  List,
} from "lucide-react";
import CategoryMenu from "./CategoryMenu";
import { useCart } from "../context/CartContext";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Navbar() {
  const [categories, setCategories] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const { cart } = useCart();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const hasItemsInCart = cart.length > 0;
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_B_URL}/api/categories`)
      .then((res) => res.json())
      .then(setCategories)
      .catch((err) => console.error("Failed to fetch categories:", err));
  }, []);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setMenuOpen(false);
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMenuOpen(false);
    }
  };

  return (
    <nav className="bg-white text-gray-900 border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* 🔰 Brand */}
        <Link
          to="/"
          className="text-2xl font-extrabold text-blue-600 flex items-center gap-2"
        >
          <Smartphone size={26} strokeWidth={2.2} /> Blynk
        </Link>

        {/* 🛒 Cart Icon - visible on mobile here */}
        <div className="flex items-center gap-4 md:hidden">
          <Link
            to="/cart"
            className={`relative group ${
              hasItemsInCart ? "text-green-600" : "text-gray-700"
            } hover:text-blue-600`}
          >
            <ShoppingCart size={22} />
            {hasItemsInCart && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[11px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                {totalQuantity}
              </span>
            )}
          </Link>

          {/* 📱 Mobile Menu Toggle */}
          <button
            onClick={toggleMenu}
            className="text-gray-700 focus:outline-none"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* 🔍 Search Bar (Desktop only) */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 mx-6 max-w-md"
        >
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search accessories ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
            >
              <Search size={18} />
            </button>
          </div>
        </form>

        {/* 🌐 Desktop Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <CategoryMenu categories={categories} />

          <Link
            to="/cart"
            className={`relative flex items-center gap-1 ${
              hasItemsInCart ? "text-green-600" : "text-gray-700"
            } hover:text-blue-600 transition`}
          >
            <ShoppingCart size={18} />
            Cart
            {hasItemsInCart && (
              <span className="ml-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                {totalQuantity}
              </span>
            )}
          </Link>

          {!user ? (
            <>
              <Link
                to="/login"
                className="hover:text-blue-600 flex items-center gap-1"
              >
                <LogIn size={18} /> Login
              </Link>
              <Link
                to="/admin/login"
                className="hover:text-yellow-500 flex items-center gap-1"
              >
                <ShieldCheck size={18} /> Admin
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/orders"
                className="hover:text-blue-600 flex items-center gap-1"
              >
                <List size={18} /> My Orders
              </Link>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <LogOut size={18} /> Logout
              </button>
            </>
          )}
        </div>
      </div>

      {/* 📱 Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t px-4 py-4 space-y-3 text-sm font-medium text-gray-700">
          {/* 🔍 Search Bar (Mobile) */}
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              placeholder="Search accessories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-l-full text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 bg-blue-600 text-white rounded-r-full"
            >
              <Search size={16} />
            </button>
          </form>

          <CategoryMenu categories={categories} />

          <Link
            to="/"
            className="block hover:text-blue-600 flex items-center gap-1"
            onClick={toggleMenu}
          >
            <Home size={16} /> Home
          </Link>

          {!user ? (
            <>
              <Link
                to="/login"
                className="block hover:text-blue-600 flex items-center gap-1"
                onClick={toggleMenu}
              >
                <LogIn size={16} /> Login
              </Link>
              <Link
                to="/admin/login"
                className="block text-yellow-600 hover:text-yellow-700 flex items-center gap-1"
                onClick={toggleMenu}
              >
                <ShieldCheck size={16} /> Admin
              </Link>
            </>
          ) : (
            <>
              <div className="text-xs text-gray-400 mt-4">My Account</div>

              <Link
                to="/orders"
                className="block hover:text-blue-600 flex items-center gap-1"
                onClick={toggleMenu}
              >
                <List size={16} /> My Orders
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-red-600 hover:text-red-700"
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
