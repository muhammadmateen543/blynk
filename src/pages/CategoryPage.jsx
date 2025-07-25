// src/pages/CategoryPage.jsx

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import {
  TagIcon,
  Squares2X2Icon,
  FolderOpenIcon,
  CubeIcon,
  ChevronDownIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { Menu } from "@headlessui/react";
import axios from "axios";
import Footer from "../components/Footer";

// Loading bar
import NProgress from "nprogress";
import "nprogress/nprogress.css";

const sortOptions = [
  { label: "Price: Low to High", value: "low-to-high" },
  { label: "Price: High to Low", value: "high-to-low" },
];

export default function CategoryPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("low-to-high");

  const hasIncrementedRef = useRef(false);

  // 🟦 Fetch category and products
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        NProgress.start(); // Start loading bar
        setLoading(true);
        const res = await fetch(
          `${import.meta.env.VITE_B_URL}/api/categories/with-products/${id}`
        );
        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching category data:", error);
      } finally {
        setLoading(false);
        NProgress.done(); // Finish loading bar
      }
    };
    fetchCategory();
  }, [id]);

  // 🟨 Track unique category view
  useEffect(() => {
    if (!data) return;

    const viewKey = `category_viewed_${id}`;
    const alreadyViewed = localStorage.getItem(viewKey);
    if (alreadyViewed || hasIncrementedRef.current) return;

    hasIncrementedRef.current = true;

    axios
      .put(`${import.meta.env.VITE_B_URL}/api/categories/increment-view/${id}`)
      .then(() => {
        localStorage.setItem(viewKey, "true");
      })
      .catch((err) => {
        hasIncrementedRef.current = false;
        console.error("View increment failed:", err);
      });
  }, [data, id]);

  const sortProducts = (products = []) => {
    const sorted = [...products];
    return sort === "low-to-high"
      ? sorted.sort((a, b) => a.price - b.price)
      : sorted.sort((a, b) => b.price - a.price);
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-600 text-lg">
        Loading category...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-10 text-center text-red-500 text-lg">
        Failed to load category
      </div>
    );
  }

  const { category = {}, parentProducts = [], children = [] } = data;

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Category Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <TagIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-800">
              {category?.name}
            </h2>
          </div>

          {/* Sort Dropdown */}
          <Menu as="div" className="relative inline-block text-left">
            <div>
              <Menu.Button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                Sort by: {sortOptions.find((o) => o.value === sort)?.label}
                <ChevronDownIcon className="w-4 h-4 text-gray-500" />
              </Menu.Button>
            </div>
            <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg z-50">
              {sortOptions.map((option) => (
                <Menu.Item key={option.value}>
                  {({ active }) => (
                    <button
                      onClick={() => setSort(option.value)}
                      className={`${
                        active ? "bg-gray-100" : ""
                      } flex justify-between w-full px-4 py-2 text-sm text-gray-700`}
                    >
                      {option.label}
                      {sort === option.value && (
                        <CheckIcon className="w-4 h-4 text-green-500" />
                      )}
                    </button>
                  )}
                </Menu.Item>
              ))}
            </Menu.Items>
          </Menu>
        </div>

        {/* Parent Category Products */}
        {parentProducts.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-4 mt-6">
              <CubeIcon className="w-5 h-5 text-green-600" />
              <h3 className="text-xl font-semibold text-gray-700">
                Products in {category.name}
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
              {sortProducts(parentProducts).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </>
        )}

        {/* Child Categories with Products */}
        {children.map((child) => (
          <div key={child._id} className="mb-12">
            <div className="flex items-center gap-2 mb-3">
              <FolderOpenIcon className="w-5 h-5 text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-700">
                {child.name}
              </h3>
            </div>

            {child.products?.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {sortProducts(child.products).map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 ml-7">No products found.</p>
            )}
          </div>
        ))}

        {/* Empty State */}
        {parentProducts.length === 0 && children.length === 0 && (
          <div className="flex items-center gap-2 mt-10 text-gray-500">
            <Squares2X2Icon className="w-5 h-5" />
            <p>No products found in this category.</p>
          </div>
        )}
      </div>

      <Footer/>
    </>
  );
}
