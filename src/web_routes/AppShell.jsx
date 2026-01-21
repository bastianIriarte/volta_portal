import { useState, useEffect, useMemo } from "react";
import { APP_ROUTES } from "./WebRoute";
import NavBar from "../components/NavBar";
import { useAuth } from "../context/auth";
import { Route, Routes, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import { getReportTemplates, getCompanyReports } from "../services/companyService";
import { BarChart3 } from "lucide-react";
import UnifiedReportView from "../pages/reports/UnifiedReportView";

export default function AppShell() {
  const { session, logout } = useAuth();
  const [reports, setReports] = useState([]);

  // Obtener permisos del usuario desde la sesion (backend devuelve permissions_users)
  const userPermissions = session?.user?.permissions_users || [];
  // El AuthService devuelve 'role' directamente (no profile.code)
  const userRole = session?.user?.role;
  const isAdmin = userRole === 'root' || userRole === 'admin';
  const companyId = session?.user?.company_id;

  // Cargar reportes al montar
  useEffect(() => {
    if (session?.user) {
      loadReports();
    }
  }, [session?.user, companyId, isAdmin]);

  const loadReports = async () => {
    console.log('[AppShell] loadReports - isAdmin:', isAdmin, 'companyId:', companyId, 'userRole:', userRole);
    try {
      let response;

      // Para clientes con empresa: cargar solo reportes asignados a su empresa
      // Para admins: cargar todos los reportes
      if (!isAdmin && companyId) {
        console.log('[AppShell] Calling getCompanyReports:', companyId);
        response = await getCompanyReports(companyId);
      } else {
        console.log('[AppShell] Calling getReportTemplates (admin or no company)');
        response = await getReportTemplates();
      }

      console.log('[AppShell] Response:', response);
      if (response.success && response.data) {
        console.log('[AppShell] Raw reports data:', response.data);
        // Log para debug - verificar campos disponibles
        console.log('[AppShell] Report fields:', response.data.map(r => ({
          code: r.code,
          report_code: r.report_code,
          name: r.name,
          report_name: r.report_name
        })));
        // Por ahora usar todos los reportes sin filtrar por status
        setReports(response.data);
      } else {
        console.warn('[AppShell] Response failed or no data:', response);
      }
    } catch (error) {
      console.error("Error loading reports:", error);
    }
  };

  // Filtrar reportes segun permisos
  const allowedReports = useMemo(() => {
    // Admin ve todos (ya vienen todos de la API)
    if (isAdmin) {
      return reports;
    }

    // Para clientes: filtrar por permisos específicos del usuario
    // El backend ya filtra por empresa, aquí filtramos por permisos asignados
    return reports.filter(report => {
      // ID-based permission: reports.report_{id} (nuevo patrón)
      const reportId = report.report_id || report.id;
      const permCodeById = `reports.report_${reportId}`;

      // También verificar permisos legacy basados en código (compatibilidad)
      const code = report.report_code || report.code;
      const permCodeByCode = code ? `reports.${code.toLowerCase()}` : null;

      return userPermissions.includes(permCodeById) ||
             (permCodeByCode && userPermissions.includes(permCodeByCode)) ||
             userPermissions.includes('reports.*');
    });
  }, [reports, userPermissions, isAdmin]);

  // Crear item de menu para reportes como dropdown con children
  const reportsDropdownItem = useMemo(() => {
    if (allowedReports.length === 0) return null;

    // Para clientes: verificar que tenga el permiso base 'my.reports'
    if (!isAdmin && !userPermissions.includes('my.reports')) {
      return null;
    }

    // Para clientes: campos son report_code, report_name
    // Para admins: campos son code, name
    const children = allowedReports
      .map(report => {
        const code = report.report_code || report.code;
        const name = report.report_name || report.name;
        return {
          to: `/dashboard/view?report=${code}`,
          label: name,
          id: `report_${code}`
        };
      })
      .filter(child => child.label && child.id && !child.id.includes('undefined'));

    console.log('[AppShell] reportsDropdownItem children:', children);

    if (children.length === 0) return null;

    return {
      to: "#",
      label: "Mis Reportes",
      id: "reportes-dropdown",
      section: "reportes",
      icon: BarChart3,
      children
    };
  }, [allowedReports]);

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
  const staticMenuItems = useMemo(() => {
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

  // Combinar items estaticos con reportes dinamicos (como dropdown)
  const visibleItems = useMemo(() => {
    const result = [...staticMenuItems];
    console.log('[AppShell] staticMenuItems:', staticMenuItems);

    // Agregar el dropdown de reportes al FINAL de la seccion "inicio"
    if (reportsDropdownItem) {
      // Encontrar el último índice de items con section "inicio"
      let lastInicioIndex = -1;
      result.forEach((item, index) => {
        if (item.section === "inicio") {
          lastInicioIndex = index;
        }
      });
      const insertIndex = lastInicioIndex >= 0 ? lastInicioIndex + 1 : result.length;
      console.log('[AppShell] Inserting reports dropdown at end of inicio, index:', insertIndex);
      result.splice(insertIndex, 0, reportsDropdownItem);
    }

    console.log('[AppShell] Final visibleItems:', result);
    return result;
  }, [staticMenuItems, reportsDropdownItem]);

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
