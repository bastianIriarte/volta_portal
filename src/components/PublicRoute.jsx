import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/auth";

export default function PublicRoute({ children, redirectTo = "/" }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-gray-600 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si ya hay sesion, redirigir al dashboard
  if (session) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
