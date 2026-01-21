// File: src/context/auth.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { login as apiLogin, logout as apiLogout, getUser } from "../services/authService";
import { getToken, removeToken } from "../services/api";
import { handleSnackbar } from "../utils/messageHelpers";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario al montar (si existe token en localStorage)
  useEffect(() => {
    (async () => {
      try {
        const token = getToken();
        if (!token) {
          setSession(null);
          setLoading(false);
          return;
        }

        const response = await getUser();
        if (!response.success) throw new Error(response.message);
        const user = response.data;
        setSession({ user });
      } catch {
        // Token inválido o expirado, limpiarlo
        removeToken();
        setSession(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await apiLogin(email, password);
      if (res.success) {
        // El login ahora devuelve el usuario completo
        const user = res.data?.user || res.data;
        setSession({ user });
        return true;
      } else {
        handleSnackbar(res.message, 'error');
        return false;
      }
    } catch (e) {
      handleSnackbar("Error al iniciar sesión: " + e.message, "error");
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch { }
    setSession(null);
  };

  const refreshSession = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await getUser();
      if (response.success) {
        setSession({ user: response.data });
      }
    } catch (error) {
      console.error("Error refreshing session:", error);
    }
  };

  return (
    <AuthCtx.Provider value={{ session, login, logout, loading, refreshSession }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
