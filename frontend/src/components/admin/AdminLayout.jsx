import { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  FolderTree,
  Boxes,
  CalendarCheck,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { LOGO_SRC } from "../../config/site";
import ConfirmationModal from "./ConfirmationModal";

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navItems = [
    {
      to: "/admin",
      label: "Tableau de bord",
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: "/admin/commandes",
      label: "Commandes",
      icon: ClipboardList,
    },
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
      to: "/admin/stock",
      label: "Gestion du stock",
      icon: Boxes,
    },
    {
      to: "/admin/reservations",
      label: "Réservations",
      icon: CalendarCheck,
    },
  ];

  const handleLogoutConfirm = () => {
    logout();
    navigate("/", { replace: true });
  };

  // Trouver le titre de la page courante
  const getPageInfo = () => {
    const path = location.pathname;
    if (path === "/admin") return { title: "Tableau de bord", subtitle: "Vue d'ensemble et statistiques de votre boutique" };
    if (path.startsWith("/admin/commandes")) return { title: "Gestion des commandes", subtitle: "Suivi, validation et expédition des commandes" };
    if (path.startsWith("/admin/produits")) return { title: "Catalogue produits", subtitle: "Ajout, modification et gestion des cosmétiques" };
    if (path.startsWith("/admin/categories")) return { title: "Catégories de cosmétiques", subtitle: "Organisation et classification du catalogue" };
    if (path.startsWith("/admin/stock")) return { title: "Gestion des stocks", subtitle: "Suivi des inventaires, réapprovisionnements et alertes" };
    if (path.startsWith("/admin/reservations")) return { title: "Réservations & Soins", subtitle: "Planning des soins esthétiques et séances de Hijama" };
    return { title: "Administration", subtitle: "Espace d'administration BY WIJO" };
  };

  const { title, subtitle } = getPageInfo();

  const adminInitials = (admin?.name || "Admin")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-cream text-charcoal flex flex-col md:flex-row">
      {/* Overlay Mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-charcoal/60 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* =========================================
          SIDEBAR (Desktop & Mobile Drawer)
      ========================================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 flex-col justify-between border-r border-gold/40 bg-ivory transition-transform duration-300 md:static md:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0 flex" : "-translate-x-full md:flex"
        }`}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Logo / Header Sidebar */}
            <div className="flex items-center justify-between border-b border-gold/30 px-6 py-5">
              <Link
                to="/admin"
                className="flex items-center gap-3 text-forest group"
                onClick={() => setMobileMenuOpen(false)}
              >
                <img
                  src={LOGO_SRC}
                  alt="BY WIJO"
                  className="h-10 w-auto object-contain shrink-0"
                />
                <div>
                  <span className="font-heading text-xl font-bold tracking-tight block text-forest">
                    BY WIJO
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-muted block -mt-1 font-semibold">
                    Admin Dashboard
                  </span>
                </div>
              </Link>

              <button
                type="button"
                className="text-muted hover:text-charcoal md:hidden p-1.5 rounded-lg hover:bg-cream"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Fermer le menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Menu Links */}
            <div className="p-4">
              <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                Navigation
              </p>

              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                          isActive
                            ? "bg-forest text-white shadow-sm font-semibold"
                            : "text-charcoal hover:bg-cream hover:text-forest"
                        }`
                      }
                    >
                      <Icon size={19} className="shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Footer Sidebar */}
          <div className="border-t border-gold/30 p-4 space-y-3 bg-cream/30">
            {/* Lien boutique */}
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-2xl border border-gold/50 bg-ivory px-3.5 py-2.5 text-xs font-medium text-forest hover:bg-cream transition group"
            >
              <span className="flex items-center gap-2">
                <ExternalLink size={15} />
                Voir la boutique en ligne
              </span>
              <span className="text-muted group-hover:translate-x-0.5 transition">→</span>
            </Link>

            {/* Profil Administrateur */}
            <div className="flex items-center justify-between rounded-2xl border border-gold/40 bg-ivory p-3 shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-forest/15 font-semibold text-forest text-xs">
                  {adminInitials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-forest">
                    {admin?.name || "Administrateur"}
                  </p>
                  <p className="truncate text-[11px] text-muted">
                    {admin?.email || "admin@example.com"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowLogoutModal(true)}
                className="text-red-600 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition"
                title="Se déconnecter"
                aria-label="Se déconnecter"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* =========================================
          ZONE PRINCIPALE & HEADER
      ========================================= */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 border-b border-gold/40 bg-ivory/90 backdrop-blur-md px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                className="p-2 rounded-xl text-forest hover:bg-cream md:hidden"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Ouvrir le menu"
              >
                <Menu size={22} />
              </button>

              <div className="min-w-0">
                <h1 className="font-heading text-2xl md:text-3xl font-bold text-forest truncate">
                  {title}
                </h1>
                <p className="text-xs text-muted hidden sm:block truncate">
                  {subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-forest/30 bg-forest/10 px-3 py-1 text-xs font-medium text-forest">
                <ShieldCheck size={14} />
                <span>Connecté en tant qu'admin</span>
              </div>

              <button
                type="button"
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 transition"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </header>

        {/* Contenu principal */}
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* Modale de déconnexion */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        title="Déconnexion"
        message="Êtes-vous sûr de vouloir vous déconnecter de votre espace d'administration ?"
        confirmText="Se déconnecter"
        cancelText="Rester connecté"
        variant="danger"
      />
    </div>
  );
}
