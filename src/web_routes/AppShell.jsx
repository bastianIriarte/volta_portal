import { useState, useEffect, useMemo } from "react";
import { APP_ROUTES } from "./WebRoute";
import NavBar from "../components/NavBar";
import { useAuth } from "../context/auth";
import { Route, Routes, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import { getCertificateTemplates, getCertificatesByCompany } from "../services/companyService";
import { FileText } from "lucide-react";
import UnifiedReportView from "../pages/reports/UnifiedReportView";

export default function AppShell() {
  const { session, logout } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loadingCerts, setLoadingCerts] = useState(true);

  // Obtener permisos del usuario desde la sesion (backend devuelve permissions_users)
  const userPermissions = session?.user?.permissions_users || [];
  // El AuthService devuelve 'role' directamente (no profile.code)
  const userRole = session?.user?.role;
  const isAdmin = userRole === 'root' || userRole === 'admin';
  const companyId = session?.user?.company_id;

  // Cargar certificados al montar
  useEffect(() => {
    if (session?.user) {
      loadCertificates();
    }
  }, [session?.user, companyId, isAdmin]);

  const loadCertificates = async () => {
    console.log('[AppShell] loadCertificates - isAdmin:', isAdmin, 'companyId:', companyId, 'userRole:', userRole);
    try {
      let response;

      // Para clientes con empresa: cargar solo certificados asignados a su empresa
      // Para admins: cargar todos los certificados
      if (!isAdmin && companyId) {
        console.log('[AppShell] Calling getCertificatesByCompany:', companyId);
        response = await getCertificatesByCompany(companyId);
      } else {
        console.log('[AppShell] Calling getCertificateTemplates (admin or no company)');
        response = await getCertificateTemplates();
      }

      console.log('[AppShell] Response:', response);
      if (response.success && response.data) {
        console.log('[AppShell] Setting certificates:', response.data);
        setCertificates(response.data);
      } else {
        console.warn('[AppShell] Response failed or no data:', response);
      }
    } catch (error) {
      console.error("Error loading certificates:", error);
    } finally {
      setLoadingCerts(false);
    }
  };

  // Filtrar certificados segun permisos
  // Nota: Para clientes, la API ya devuelve solo los certificados de su empresa
  // Para admins, se devuelven todos los certificados del sistema
  const allowedCertificates = useMemo(() => {
    // Admin ve todos (ya vienen todos de la API)
    if (isAdmin) {
      return certificates;
    }

    // Para clientes: filtrar adicionalmente por permisos si es necesario
    // (la API ya filtró por empresa, pero podemos filtrar más por permisos específicos)
    return certificates.filter(cert => {
      const permCode = `certificates.${cert.code}`;
      return userPermissions.includes(permCode) ||
             userPermissions.includes('certificates.*') ||
             // Si no tiene permisos específicos, mostrar todos los de su empresa
             userPermissions.length === 0;
    });
  }, [certificates, userPermissions, isAdmin]);

  // Crear items de menu para certificados (usando query params)
  const certificateMenuItems = useMemo(() => {
    return allowedCertificates.map(cert => ({
      to: `/dashboard/view?cert=${cert.code}`,
      label: cert.name,
      id: `cert_${cert.code}`,
      section: "reportes",
      icon: FileText
    }));
  }, [allowedCertificates]);

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

  // Combinar items estaticos con certificados dinamicos
  const visibleItems = useMemo(() => {
    const result = [...staticMenuItems];

    // Agregar certificados en la seccion "reportes" despues de inicio
    if (certificateMenuItems.length > 0) {
      const inicioIndex = result.findIndex(item => item.section === "inicio");
      const insertIndex = inicioIndex >= 0 ? inicioIndex + 1 : 0;
      result.splice(insertIndex, 0, ...certificateMenuItems);
    }

    return result;
  }, [staticMenuItems, certificateMenuItems]);

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
