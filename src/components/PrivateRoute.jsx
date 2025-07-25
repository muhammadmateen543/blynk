// src/components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <p className="text-center p-4">Checking login...</p>;

  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
};

export default PrivateRoute;
