import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  LockKeyhole,
  Mail,
  LogIn,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldAlert,
} from "lucide-react";

import { useAdminAuth } from "../../context/AdminAuthContext";
import { LOGO_SRC } from "../../config/site";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Si venu depuis une route admin protégée, y retourner — sinon aller au dashboard
  const fromPath = location.state?.from?.pathname;
  const destination =
    fromPath && fromPath.startsWith("/admin") ? fromPath : "/admin";


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <Loader label="Vérification de la session administrateur..." />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={destination} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email.trim(), password);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(
        err.message ||
          "Identifiants incorrects. Veuillez vérifier votre adresse e-mail et votre mot de passe."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-cream py-12 px-4 sm:px-6 lg:px-8">
      {/* Lien retour boutique */}
      <div className="mx-auto w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-forest hover:underline mb-6"
        >
          <ArrowLeft size={15} />
          Retour au site BY WIJO
        </Link>
      </div>

      <div className="mx-auto w-full max-w-md">
        <div className="rounded-3xl border border-gold/40 bg-ivory p-8 sm:p-10 shadow-lg relative overflow-hidden">
          {/* Logo & Titre */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4">
              <img
                src={LOGO_SRC}
                alt="BY WIJO"
                className="mx-auto h-20 w-auto object-contain"
              />
            </div>

            <h1 className="font-heading text-3xl font-bold text-forest">
              BY WIJO
            </h1>
            <p className="text-xs uppercase tracking-widest text-muted font-semibold mt-0.5">
              Espace Administration
            </p>
            <p className="mt-3 text-xs text-charcoal/70">
              Veuillez vous authentifier pour accéder à la gestion de la boutique.
            </p>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 animate-fadeIn"
            >
              <ShieldAlert size={18} className="shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="mb-1.5 block text-xs font-semibold text-forest uppercase tracking-wider"
              >
                Adresse e-mail
              </label>

              <div className="relative">
                <Mail
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full rounded-2xl border border-gold/50 bg-cream py-3 pl-10 pr-4 text-xs md:text-sm outline-none focus:border-forest transition"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="mb-1.5 block text-xs font-semibold text-forest uppercase tracking-wider"
              >
                Mot de passe
              </label>

              <div className="relative">
                <LockKeyhole
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-2xl border border-gold/50 bg-cream py-3 pl-10 pr-11 text-xs md:text-sm outline-none focus:border-forest transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal p-1"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full justify-center py-3 text-sm font-semibold rounded-2xl shadow-xs"
              >
                <LogIn size={17} />
                {submitting ? "Vérification en cours..." : "Se connecter"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div className="text-center text-xs text-muted mt-8">
        © {new Date().getFullYear()} BY WIJO — Cosmétiques Naturels & Soins. Tous droits réservés.
      </div>
    </div>
  );
}
