import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import client, { setAuthToken } from "../api/client";

const ADMIN_TOKEN_KEY = "by_wijo_admin_token";
const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(ADMIN_TOKEN_KEY));
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pendingAuthPromise = useRef(null);

  // Authentification automatique en mode démo (uniquement en environnement de développement)
  const authenticateDemo = useCallback(async () => {
    if (!import.meta.env.DEV) {
      setError("Le mode démo automatique est désactivé en environnement de production.");
      setLoading(false);
      return null;
    }

    if (pendingAuthPromise.current) {
      return pendingAuthPromise.current;
    }

    pendingAuthPromise.current = (async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/__demo_admin_login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(
            errData.message ||
              "Impossible d'effectuer l'authentification administrateur automatique."
          );
        }

        const data = await response.json();
        if (data.token) {
          localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
          setAuthToken(data.token);
          setToken(data.token);
          setAdmin(data.admin || null);
          return data.token;
        }

        throw new Error("Token d'authentification absent de la réponse.");
      } catch (err) {
        setError(
          err.message ||
            "Erreur lors de la connexion automatique. Assurez-vous que le backend est démarré sur http://localhost:5000."
        );
        return null;
      } finally {
        setLoading(false);
        pendingAuthPromise.current = null;
      }
    })();

    return pendingAuthPromise.current;
  }, []);

  // Vérifier la validité du token existant ou déclencher la connexion démo
  const verifyOrLogin = useCallback(async () => {
    const existingToken = localStorage.getItem(ADMIN_TOKEN_KEY);

    if (existingToken) {
      setAuthToken(existingToken);
      try {
        const response = await client.get("/api/auth/me");
        setAdmin(response.data);
        setToken(existingToken);
        setLoading(false);
        return existingToken;
      } catch {
        // Token expiré ou invalide : purge et reconnexion automatique en dev
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        setAuthToken(null);
        setToken(null);
        return authenticateDemo();
      }
    } else {
      return authenticateDemo();
    }
  }, [authenticateDemo]);

  useEffect(() => {
    verifyOrLogin();
  }, [verifyOrLogin]);

  const logout = useCallback(() => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setAuthToken(null);
    setToken(null);
    setAdmin(null);
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{
        token,
        admin,
        loading,
        error,
        isAuthenticated: Boolean(token),
        retryAuth: authenticateDemo,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth doit être utilisé au sein de AdminAuthProvider");
  }
  return context;
}
