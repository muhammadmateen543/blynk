import AdminNavbar from "../components/AdminNavbar";
import { Outlet } from "react-router-dom";

function AdminLayout() {
  return (
    <div>
      <AdminNavbar />
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
