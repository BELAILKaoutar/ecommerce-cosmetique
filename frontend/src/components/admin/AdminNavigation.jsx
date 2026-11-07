
import { NavLink, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Package,
  FolderTree,
  ClipboardList,
  LogOut,
} from "lucide-react";

import { useAdminAuth } from "../../context/AdminAuthContext";

export default function AdminNavigation() {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  const links = [
    {
      to: "/admin/produits",
      label: "Produits",
      icon: Package,
    },
    {
      to: "/admin/categories",
      label: "Catégories",
      icon: FolderTree,
    },
    {
      to: "/admin/commandes",
      label: "Commandes",
      icon: ClipboardList,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <nav className="border-b border-gold/40 bg-ivory px-6 py-4">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">

        <div className="flex items-center gap-2 text-forest">
          <ShieldCheck size={22} />
          <span className="font-semibold">
            BY WIJO — Administration
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition ${
                  isActive
                    ? "bg-forest text-white"
                    : "text-forest hover:bg-cream"
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm text-red-700 hover:bg-red-50"
        >
          <LogOut size={17} />
          Déconnexion
        </button>
      </div>
    </nav>
  );
}
