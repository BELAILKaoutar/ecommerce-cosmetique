
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { LockKeyhole, Mail, LogIn } from "lucide-react";

import { useAdminAuth } from "../../context/AdminAuthContext";
import Button from "../../components/ui/Button";
import PageContainer from "../../components/ui/PageContainer";
import Loader from "../../components/ui/Loader";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (loading) {
    return <Loader label="Vérification de la connexion..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/admin/produits" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email.trim(), password);
      navigate("/admin/produits", { replace: true });
    } catch (err) {
      setError(err.message || "Identifiants incorrects.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-16">
      <PageContainer>
        <div className="mx-auto max-w-md rounded-3xl border border-gold/40 bg-ivory p-8 shadow-sm">
          <div className="mb-7 text-center">
            <LockKeyhole size={38} className="mx-auto text-forest" />

            <h1 className="mt-4 font-heading text-3xl text-forest">
              Connexion administrateur
            </h1>

            <p className="mt-2 text-sm text-muted">
              Accédez à la gestion de votre boutique BY WIJO.
            </p>
          </div>

          {error && (
            <p role="alert" className="mb-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm text-forest">
                Adresse e-mail
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />

                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@exemple.com"
                  className="w-full rounded-xl border border-gold/50 bg-cream py-3 pl-10 pr-4 outline-none focus:border-forest"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm text-forest">
                Mot de passe
              </label>

              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                className="w-full rounded-xl border border-gold/50 bg-cream px-4 py-3 outline-none focus:border-forest"
              />
            </div>

            <Button type="submit" disabled={submitting} className="w-full justify-center">
              <LogIn size={17} />
              {submitting ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
        </div>
      </PageContainer>
    </section>
  );
}
