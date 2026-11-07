
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import client, { setAuthToken } from "../api/client";

const ADMIN_TOKEN_KEY = "by_wijo_admin_token";
const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem(ADMIN_TOKEN_KEY)
  );
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const logout = useCallback(() => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setAuthToken(null);
    setToken(null);
    setAdmin(null);
    setError(null);
  }, []);

  const verifyAuth = useCallback(async () => {
    const savedToken = localStorage.getItem(ADMIN_TOKEN_KEY);

    if (!savedToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setAuthToken(savedToken);

    try {
      const response = await client.get("/api/auth/me");
      setAdmin(response.data.admin ?? response.data);
      setToken(savedToken);
      setError(null);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]);

  const login = async (email, password) => {
    setError(null);

    try {
      const response = await client.post("/api/auth/login", {
        email,
        password,
      });

      const { token: newToken, admin: loggedAdmin } = response.data;

      if (!newToken) {
        throw new Error("Token absent de la réponse.");
      }

      localStorage.setItem(ADMIN_TOKEN_KEY, newToken);
      setAuthToken(newToken);
      setToken(newToken);
      setAdmin(loggedAdmin || null);

      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        token,
        admin,
        loading,
        error,
        isAuthenticated: Boolean(token) && Boolean(admin),
        login,
        logout,
        retryAuth: verifyAuth,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error(
      "useAdminAuth doit être utilisé dans AdminAuthProvider"
    );
  }

  return context;
}
