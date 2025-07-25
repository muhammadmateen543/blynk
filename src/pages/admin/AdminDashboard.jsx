import React from "react";
import { useNavigate } from "react-router-dom";
import {
  PlusIcon,
  CubeIcon,
  Squares2X2Icon,
  ChatBubbleOvalLeftEllipsisIcon,
  WrenchScrewdriverIcon,
  CurrencyDollarIcon,
  ClipboardIcon,
  TagIcon,
  ChartBarIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

function AdminDashboard() {
  const navigate = useNavigate();

  const dashboardItems = [
    {
      title: "Add Category",
      icon: PlusIcon,
      color: "from-blue-500 to-blue-700",
      path: "/admin/add-category",
    },
    {
      title: "Add Product",
      icon: CubeIcon,
      color: "from-green-500 to-green-700",
      path: "/admin/upload-product",
    },
    {
      title: "Products by Category",
      icon: Squares2X2Icon,
      color: "from-emerald-500 to-emerald-700",
      path: "/admin/products-by-category",
    },
    {
      title: "Review Requests",
      icon: ChatBubbleOvalLeftEllipsisIcon,
      color: "from-yellow-500 to-yellow-700",
      path: "/admin/reviews",
    },
    {
      title: "Manage Products",
      icon: WrenchScrewdriverIcon,
      color: "from-purple-500 to-purple-700",
      path: "/admin/manage",
    },
    {
      title: "Delivery Charges",
      icon: CurrencyDollarIcon,
      color: "from-teal-500 to-teal-700",
      path: "/admin/delivery-charge",
    },
    {
      title: "Customer Orders",
      icon: ClipboardIcon,
      color: "from-rose-500 to-rose-700",
      path: "/admin/orders",
    },
    {
      title: "Manage Coupons",
      icon: TagIcon,
      color: "from-pink-500 to-pink-700",
      path: "/admin/coupons",
    },
    {
      title: "Category Views (Analytics)",
      icon: ChartBarIcon,
      color: "from-indigo-500 to-indigo-700",
      path: "/admin/category-views",
    },
    {
      title: "Send Email to Customer",
      icon: EnvelopeIcon,
      color: "from-red-500 to-red-700",
      path: "/admin/send-email", // Make sure this route exists in your router
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-tr from-gray-100 via-white to-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-2xl border border-gray-200">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center text-gray-800 mb-6 sm:mb-8">
          🛠️ Admin Dashboard
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
          {dashboardItems.map(({ title, icon: Icon, color, path }) => (
            <button
              key={title}
              onClick={() => navigate(path)}
              className={`flex items-center gap-4 w-full bg-gradient-to-r ${color} text-white py-4 px-5 rounded-xl shadow-lg transition-transform hover:scale-105 hover:shadow-xl active:scale-95 focus:outline-none`}
            >
              <Icon className="h-6 w-6 shrink-0" />
              <span className="text-sm sm:text-base font-medium sm:font-semibold text-left">
                {title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
