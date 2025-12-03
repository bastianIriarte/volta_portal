import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/auth";
import Error404 from "../pages/Error404";
import { usePermission } from "../utils/permissions";

export default function ProtectedRoute({ children, permission, mode = "AND" }) {
  const { session, loading } = useAuth();
  const hasAccess = usePermission(permission, mode);

  // 🔄 Estado de carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          {/* Spinner */}
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-gray-600 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  // ⛔ No hay sesión → redirigir a login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // 🚨 Si se exige permiso y no lo tiene → mostrar 404
  if (permission && !hasAccess) {
    return <Error404 />;
  }
  return children;

}
