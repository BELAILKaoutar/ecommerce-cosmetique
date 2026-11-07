
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAdminAuth } from "../../context/AdminAuthContext";
import AdminNavigation from "./AdminNavigation";

export default function ProtectedAdminRoute() {
  const { isAuthenticated, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        Vérification de la connexion...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/admin/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return (
    <div className="min-h-screen bg-cream text-charcoal">
      <AdminNavigation />

      <main id="contenu">
        <Outlet />
      </main>
    </div>
  );
}
