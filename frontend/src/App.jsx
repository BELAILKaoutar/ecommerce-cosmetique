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
import AdminOrders from "./pages/admin/AdminOrders";

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/boutique" element={<Shop />} />
            <Route path="/produit/:id" element={<ProductDetails />} />
            <Route path="/panier" element={<Cart />} />
            <Route path="/commande" element={<Checkout />} />
            <Route path="/soins" element={<Services />} />
            <Route path="/reservation-hijama" element={<HijamaBooking />} />
            <Route path="/a-propos" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            {/* Espace d'administration des commandes (Mode Démo Transparent) */}
            <Route
              path="/admin/commandes"
              element={
                <AdminAuthProvider>
                  <AdminOrders />
                </AdminAuthProvider>
              }
            />
            <Route
              path="/admin"
              element={<Navigate to="/admin/commandes" replace />}
            />
            <Route
              path="/admin/orders"
              element={<Navigate to="/admin/commandes" replace />}
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}
