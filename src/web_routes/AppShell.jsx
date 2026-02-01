import { useMemo } from "react";
import { APP_ROUTES } from "./WebRoute";
import NavBar from "../components/NavBar";
import { useAuth } from "../context/auth";
import { Route, Routes, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import UnifiedReportView from "../pages/reports/UnifiedReportView";

export default function AppShell() {
  const { session, logout } = useAuth();

  // Obtener permisos del usuario desde la sesion (backend devuelve permissions_users)
  const userPermissions = session?.user?.permissions_users || [];
  // El AuthService devuelve 'role' directamente (no profile.code)
  const userRole = session?.user?.role;

  // Funcion para verificar permisos (sin usar hook)
  const checkPermission = (permission, mode = "OR") => {
    if (!permission) return true;
    const perms = Array.isArray(permission) ? permission : [permission];
    if (mode === "AND") {
      return perms.every(p => userPermissions.includes(p));
    }
    return perms.some(p => userPermissions.includes(p));
  };

  // Filtrar rutas estaticas que son de menu
  const visibleItems = useMemo(() => {
    return APP_ROUTES
      .filter(r => r.isMenu)
      .map(r => {
        // Verificar permisos
        const permissionAllowed = !r.permission || checkPermission(r.permission, r.mode || "OR");

        // Verificar roles: null = todos, array = solo esos roles
        const roleAllowed = !r.roles || r.roles.includes(userRole);

        const allowed = permissionAllowed && roleAllowed;
        return allowed ? { to: r.path, label: r.label, id: r.id, section: r.section, icon: r.icon } : null;
      })
      .filter(Boolean);
  }, [userPermissions, userRole]);

  return (
    <div>
      <NavBar
        items={visibleItems}
        showReload
        onReload={() => window.location.reload()}
        extraRight={
          <div className="text-sm text-black/70 flex items-center gap-2">
            {session?.user?.name}
            <button
              className="underline decoration-black/30 hover:opacity-70"
              onClick={logout}
            >
              Salir
            </button>
          </div>
        }
      />

      <main className="max-w-8xl mx-auto px-4 md:px-8 py-6 space-y-6">
        <Routes>
          <Route
            path="/"
            element={
              session ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
            }
          />
          {APP_ROUTES.map((r, i) => (
            <Route
              key={i}
              path={r.path}
              element={
                <ProtectedRoute permission={r.permission} mode={r.mode || "OR"}>
                  {r.element}
                </ProtectedRoute>
              }
            />
          ))}
          {/* Ruta unificada para ver certificados y reportes con query params */}
          <Route
            path="/dashboard/view"
            element={
              <ProtectedRoute>
                <UnifiedReportView />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
