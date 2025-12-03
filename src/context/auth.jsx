// File: src/context/auth.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { login as apiLogin, logout as apiLogout, getUser } from "../services/authService";
import { handleSnackbar } from "../utils/messageHelpers";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario al montar (si la cookie existe)
  useEffect(() => {
    (async () => {
      try {
        const response = await getUser();
        if (!response.success) throw new Error(res.message)
        const user = response.data;
        setSession({ user }); // el backend devuelve usuario autenticado
      } catch {
        setSession(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await apiLogin(email, password); // pide cookie al backend
      if (res.success) {
        const response = await getUser();
        if (!response.success) throw new Error(res.message)
        const user = response.data;
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

  return (
    <AuthCtx.Provider value={{ session, login, logout, loading }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
