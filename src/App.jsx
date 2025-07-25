import React from "react";
import { Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";

// 📦 Public Pages
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import CartPage from "./pages/CartPage";
import AllProducts from "./pages/AllProducts";
import CategoryPage from "./pages/CategoryPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmation from "./pages/OrderConfirmation";
import SearchResults from "./pages/SearchResults";
import InlineReviewForm from "./pages/InlineReviewForm";

// 👤 Customer Auth Pages
import CustomerLogin from "./pages/auth/CustomerLogin";
import CustomerSignup from "./pages/auth/CustomerSignup";
import CustomerForgotPassword from "./pages/auth/CustomerForgotPassword";
import CustomerPrivateRoute from "./routes/CustomerPrivateRoute";

// 🛍️ Customer Order Pages
import OrdersPage from "./pages/MyOrders";

// 🗫️ Admin Auth & Layout
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./layout/AdminLayout";
import PrivateRoute from "./components/PrivateRoute";

// 📋 Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUpload from "./pages/admin/AdminAddProduct";
import AdminAddCategory from "./pages/admin/AdminAddCategory";
import AdminEditProduct from "./pages/admin/AdminEditProduct";
import ManageReviews from "./pages/admin/ManageReviews";
import AdminManageProducts from "./pages/admin/AdminManageProducts";
import AdminProductList from "./pages/admin/AdminProductList";
import DeliveryChargeSetup from "./pages/admin/DeliveryChargeSetup";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminManageCoupons from "./pages/admin/AdminManageCoupons";
import AdminCategoryViews from "./pages/admin/AdminCategoryViews"; // ✅ Added
import AdminEmailSender from "./pages/admin/AdminEmailSender";

// ✅ Secure Review Page
import ReviewForm from "./pages/ReviewForm";

function App() {
  return (
    <CartProvider>
      <Routes>
        {/* 🌍 PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/products" element={<AllProducts />} />
        <Route path="/category/:id" element={<CategoryPage />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/add-review" element={<ReviewForm />} />
        <Route path="/review" element={<ReviewForm />} />
        <Route path="/internal-review" element={<InlineReviewForm />} />

        {/* 🔐 CUSTOMER PROTECTED ROUTES */}
        <Route
          path="/checkout"
          element={
            <CustomerPrivateRoute>
              <CheckoutPage />
            </CustomerPrivateRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <CustomerPrivateRoute>
              <OrdersPage />
            </CustomerPrivateRoute>
          }
        />

        {/* 👥 CUSTOMER AUTH ROUTES */}
        <Route path="/login" element={<CustomerLogin />} />
        <Route path="/signup" element={<CustomerSignup />} />
        <Route path="/forgot-password" element={<CustomerForgotPassword />} />

        {/* 🗫️ ADMIN AUTH ROUTE */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* 🔐 ADMIN PROTECTED ROUTES */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="add-category" element={<AdminAddCategory />} />
          <Route path="upload-product" element={<AdminUpload />} />
          <Route path="edit-product/:id" element={<AdminEditProduct />} />
          <Route path="reviews" element={<ManageReviews />} />
          <Route path="manage" element={<AdminManageProducts />} />
          <Route path="products-by-category" element={<AdminProductList />} />
          <Route path="delivery-charge" element={<DeliveryChargeSetup />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="coupons" element={<AdminManageCoupons />} />
          <Route path="category-views" element={<AdminCategoryViews />} />
          <Route path="send-email" element={<AdminEmailSender />} />

        </Route>
      </Routes>
    </CartProvider>
  );
}

export default App;