import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx"; // ✅ Must match export
import { BrowserRouter } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
