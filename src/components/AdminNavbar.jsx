import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiLogOut } from "react-icons/fi";

function AdminNavbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-4 shadow-md flex justify-between items-center">
      {/* Brand Logo/Name */}
      <h1
        onClick={() => navigate("/admin/dashboard")}
        className="text-2xl font-bold cursor-pointer tracking-wide hover:text-blue-400 transition"
      >
        Blynk <span className="text-blue-500">Admin</span>
      </h1>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm font-semibold shadow transition"
      >
        <FiLogOut className="text-lg" />
        Logout
      </button>
    </nav>
  );
}

export default AdminNavbar;
