import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { CartProvider } from "./context/CartContext";
import { AdminAuthProvider } from "./context/AdminAuthContext";

import Layout from "./components/layout/Layout";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Services from "./pages/Services";
import HijamaBooking from "./pages/HijamaBooking";
import About from "./pages/About";
import Contact from "./pages/Contact";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminStock from "./pages/admin/AdminStock";
import AdminAppointments from "./pages/admin/AdminAppointments";

import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <AdminAuthProvider>
          <Routes>
            {/* =========================
                ESPACE PUBLIC
            ========================= */}
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/boutique" element={<Shop />} />
              <Route path="/produit/:id" element={<ProductDetails />} />
              <Route path="/panier" element={<Cart />} />
              <Route path="/commande" element={<Checkout />} />
              <Route path="/soins" element={<Services />} />
              <Route
                path="/reservation-hijama"
                element={<HijamaBooking />}
              />
              <Route path="/a-propos" element={<About />} />
              <Route path="/contact" element={<Contact />} />
            </Route>

            {/* =========================
                CONNEXION ADMIN
            ========================= */}
            {/* /login est l'alias public affiché dans la Navbar */}
            <Route
              path="/login"
              element={<AdminLogin />}
            />
            {/* /admin/login reste accessible pour compatibilité */}
            <Route
              path="/admin/login"
              element={<AdminLogin />}
            />

            {/* =========================
                ESPACE ADMIN PROTÉGÉ
            ========================= */}
            <Route element={<ProtectedAdminRoute />}>
              <Route
                path="/admin"
                element={<AdminDashboard />}
              />

              <Route
                path="/admin/commandes"
                element={<AdminOrders />}
              />

              <Route
                path="/admin/produits"
                element={<AdminProducts />}
              />

              <Route
                path="/admin/categories"
                element={<AdminCategories />}
              />

              <Route
                path="/admin/stock"
                element={<AdminStock />}
              />

              <Route
                path="/admin/reservations"
                element={<AdminAppointments />}
              />
            </Route>

            {/* Redirections pratiques */}
            <Route
              path="/admin/dashboard"
              element={<Navigate to="/admin" replace />}
            />

            <Route
              path="/admin/orders"
              element={<Navigate to="/admin/commandes" replace />}
            />

            <Route
              path="/admin/products"
              element={<Navigate to="/admin/produits" replace />}
            />

            <Route
              path="/admin/reservations-hijama"
              element={<Navigate to="/admin/reservations" replace />}
            />

            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />
          </Routes>
        </AdminAuthProvider>
      </CartProvider>
    </BrowserRouter>
  );
}
