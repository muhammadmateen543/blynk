// src/routes/CustomerPrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebaseConfig";

export default function CustomerPrivateRoute({ children }) {
  const [user, loading] = useAuthState(auth);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}
