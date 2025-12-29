
import DashboardView from "../pages/dashboard/DashboardView";
import UsersView from "../pages/users/UsersView";
import {
  Home,
  User,
  Settings,
  Webhook,
  Building2,
  ClipboardList,
  Award,
  Database,
} from "lucide-react";


import LogsView from "../pages/logs/LogsView";
import Error404 from "../pages/Error404";
import SettingsPanel from "../pages/settings/SettingsPanel";

import ConnectionServiceLayer from "../pages/settings/ConnectionServiceLayer";
import ConnectionAgent from "../pages/settings/ConnectionAgent";
import ConnectionMicrosoftGraph from "../pages/settings/ConnectionMicrosoftGraph";
import SharePointListView from "../pages/sharepoint/SharePointListView";

// Módulos de Gestión (Portal Proveedores)
import CompaniesView from "../pages/companies/CompaniesView";
import CompanyDetailView from "../pages/companies/CompanyDetailView";
import RegistrationRequestsView from "../pages/registration_requests/RegistrationRequestsView";
import RegistrationRequestDetailView from "../pages/registration_requests/RegistrationRequestDetailView";
import CertificateBuilderView from "../pages/certificate_builder/CertificateBuilderView";


export const APP_ROUTES = [
  // Dashboard principal
  { path: "/dashboard", element: <DashboardView />, permission: null, label: "Inicio", id: "inicio", isMenu: true, section: "inicio", icon: Home },

  // ========================================
  // MÓDULO DE GESTIÓN (Portal Proveedores)
  // ========================================
  { path: "/dashboard/empresas", element: <CompaniesView />, permission: null, label: "Empresas", id: "empresas", isMenu: true, section: "administracion", icon: Building2 },
  { path: "/dashboard/empresas/:id/editar", element: <CompanyDetailView />, permission: null },
  { path: "/dashboard/solicitudes", element: <RegistrationRequestsView />, permission: null, label: "Solicitudes", id: "solicitudes", isMenu: true, section: "administracion", icon: ClipboardList },
  { path: "/dashboard/solicitudes/:id/gestionar", element: <RegistrationRequestDetailView />, permission: null },
  { path: "/dashboard/usuarios", element: <UsersView />, permission: null, label: "Usuarios", id: "usuarios", isMenu: true, section: "administracion", icon: User },
  { path: "/dashboard/certificate-builder", element: <CertificateBuilderView />, permission: null, label: "Certificados", id: "certificados", isMenu: true, section: "administracion", icon: Award },
  { path: "/dashboard/certificate-builder/:templateId", element: <CertificateBuilderView />, permission: null },

  // ========================================
  // MÓDULO DE SISTEMA
  // ========================================
  { path: "/dashboard/integraciones", element: <LogsView />, permission: null, label: "Integraciones", id: "integraciones", isMenu: true, section: "sistema", icon: Webhook },
  { path: "/dashboard/sharepoint", element: <SharePointListView />, permission: null, label: "SharePoint", id: "sharepoint", isMenu: true, section: "sistema", icon: Database },
  { path: "/dashboard/settings", element: <SettingsPanel />, permission: null, label: "Configuracion", id: "config", isMenu: true, section: "sistema", icon: Settings },
  { path: "/dashboard/settings/connection-service-layer", element: <ConnectionServiceLayer />, permission: null },
  { path: "/dashboard/settings/connection-agent", element: <ConnectionAgent />, permission: null },
  { path: "/dashboard/settings/connection-microsoft-graph", element: <ConnectionMicrosoftGraph />, permission: null },

  { path: "*", element: <Error404 /> },
];
