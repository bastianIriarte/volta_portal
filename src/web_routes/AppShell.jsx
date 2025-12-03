import { usePermission } from "../utils/permissions";
import { APP_ROUTES } from "./WebRoute";
import NavBar from "../components/NavBar";
import { useAuth } from "../context/auth";
import { Route, Routes, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AppShell() {
    const { session, logout } = useAuth();
  

  // Filtrar rutas que son de menú y que el usuario puede ver
  const visibleItems = APP_ROUTES
    .filter(r => r.isMenu)
    .map(r => {
      const allowed = !r.permission || usePermission(r.permission, r.mode || "OR");
      return allowed ? { to: r.path, label: r.label, id: r.id, section: r.section, icon: r.icon } : null;
    })
    .filter(Boolean); // saca los null

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

      <main className="max-w-8xl mx-auto px-8 py-6 space-y-6">
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
        </Routes>
      </main>
    </div>
  );
}