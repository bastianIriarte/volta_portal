
import DashboardView from "../pages/dashboard/DashboardView";
import UsersView from "../pages/users/UsersView";
import CustomersView from "../pages/customers/CustomersView";
import {
  Home,
  User,
  Users,
  Settings,
  Webhook,
  Building2,
  ClipboardList,
  Award,
  Database,
  Table2,
  FileText,
  FolderOpen,
  FileSpreadsheet,
  Shield,
  Image,
  History,
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

// Fuentes de Datos y Procesadores
import DataSourcesView from "../pages/data_sources/DataSourcesView";
import TableProcessorsView from "../pages/table_processors/TableProcessorsView";

// Plantillas de Reportes
import ReportTemplatesView from "../pages/report_templates/ReportTemplatesView";
import ReportExportsView from "../pages/reports/ReportExportsView";

// Gestión de Imágenes de Tickets
import TicketImagesView from "../pages/ticket_images/TicketImagesView";

// Vistas de Cliente
import ClientDocumentsView from "../pages/client/ClientDocumentsView";
import ClientCertificatesView from "../pages/client/ClientCertificatesView";
import CertificateExportsView from "../pages/client/CertificateExportsView";
import ProfilesManagement from "../pages/profiles/ProfilesManagement";
import ProfilePermissionsMatrix from "../pages/profiles/ProfilePermissionsMatrix";
import ProfileView from "../pages/profile/ProfileView";


export const APP_ROUTES = [
  // Dashboard principal - visible para todos
  { path: "/dashboard", element: <DashboardView />, permission: null, label: "Inicio", id: "inicio", isMenu: true, section: "inicio", icon: Home, roles: null },
  { path: "/dashboard/mi-perfil", element: <ProfileView />, permission: null, label: "Mi Perfil", id: "mi-perfil", isMenu: false, roles: null },
  { path: "/dashboard/solicitudes", element: <RegistrationRequestsView />, permission: null, label: "Solicitudes", id: "solicitudes", isMenu: true, section: "inicio", icon: ClipboardList, roles: ["admin", "root"] },

  // ========================================
  // MÓDULO DE GESTIÓN (Solo Admin/Root)
  // ========================================
  { path: "/dashboard/empresas", element: <CompaniesView />, permission: null, label: "Empresas", id: "empresas", isMenu: true, section: "administracion", icon: Building2, roles: ["admin", "root"] },
  { path: "/dashboard/empresas/:id/editar", element: <CompanyDetailView />, permission: null, roles: ["admin", "root"] },

  { path: "/dashboard/solicitudes/:id/gestionar", element: <RegistrationRequestDetailView />, permission: null, roles: ["admin", "root"] },
  { path: "/dashboard/usuarios", element: <UsersView />, permission: null, label: "Usuarios", id: "usuarios", isMenu: true, section: "administracion", icon: User, roles: ["admin", "root"] },
  { path: "/dashboard/clientes", element: <CustomersView />, permission: null, label: "Clientes", id: "clientes", isMenu: true, section: "administracion", icon: Users, roles: ["admin", "root"] },

  {
    path: "/dashboard/profiles-managment",
    element: <ProfilesManagement />,
    permission: "profiles.list",
    label: "Perfiles",
    id: "profiles",
    icon: Shield,
    isMenu: true,
    section: "administracion",
    roles: ["admin", "root"],
  },
  {
    path: "/dashboard/profiles-managment/permissions-matrix",
    element: <ProfilePermissionsMatrix />,
    permission: "profiles.edit",
    roles: ["admin", "root"],
  },
  { path: "/dashboard/fuentes-datos", element: <DataSourcesView />, permission: null, label: "Fuentes de Datos", id: "fuentes-datos", isMenu: true, section: "administracion", icon: Database, roles: ["admin", "root"] },
  { path: "/dashboard/certificate-builder", element: <CertificateBuilderView />, permission: null, label: "Gestión de Certificados", id: "certificados", isMenu: true, section: "administracion", icon: Award, roles: ["admin", "root"] },
  { path: "/dashboard/certificate-builder/:templateId", element: <CertificateBuilderView />, permission: null, roles: ["admin", "root"] },
  { path: "/dashboard/procesadores", element: <TableProcessorsView />, permission: null, label: "Procesadores", id: "procesadores", isMenu: true, section: "administracion", icon: Table2, roles: ["admin", "root"] },
  { path: "/dashboard/reports", element: <ReportTemplatesView />, permission: null, label: "Gestión de Reportes", id: "reports", isMenu: true, section: "administracion", icon: FileText, roles: ["admin", "root"] },
  { path: "/dashboard/report-exports", element: <ReportExportsView />, permission: null, label: "Exportaciones Reportes", id: "report-exports", isMenu: true, section: "administracion", icon: FileSpreadsheet },
  { path: "/dashboard/certificate-exports", element: <CertificateExportsView />, permission: null, label: "Historial Certificados", id: "certificate-exports", isMenu: true, section: "administracion", icon: History },
  { path: "/dashboard/ticket-images", element: <TicketImagesView />, permission: null, label: "Imágenes de Tickets", id: "ticket-images", isMenu: true, section: "administracion", icon: Image, roles: ["admin", "root"] },

  // ========================================
  // MÓDULO DE CLIENTE (Basado en permisos específicos del usuario)
  // ========================================
  { path: "/dashboard/reporte-sharepoint", element: <SharePointListView />, permission: "my.reports", label: "Reporte SharePoint", id: "reporte-sharepoint", isMenu: true, section: "reportes", icon: FileSpreadsheet, roles: ["admin", "root"] },
  { path: "/dashboard/mis-certificados", element: <ClientCertificatesView />, label: "Mis Certificados", id: "mis-certificados", isMenu: true, section: "certificados", icon: Award, roles: ["customer", "admin", "root"] },
  { path: "/dashboard/mis-documentos", element: <ClientDocumentsView />, permission: "my.documents", label: "Mis Documentos", id: "mis-documentos", isMenu: true, section: "documentos", icon: FolderOpen, roles: ["customer"] },

  // ========================================
  // MÓDULO DE SISTEMA (Solo Admin/Root)
  // ========================================
  { path: "/dashboard/integraciones", element: <LogsView />, permission: null, label: "Integraciones", id: "integraciones", isMenu: true, section: "sistema", icon: Webhook, roles: ["admin", "root"] },
  { path: "/dashboard/sharepoint", element: <SharePointListView />, permission: null, label: "SharePoint", id: "sharepoint", isMenu: true, section: "sistema", icon: Database, roles: ["admin", "root"] },
  { path: "/dashboard/settings", element: <SettingsPanel />, permission: null, label: "Configuracion", id: "config", isMenu: true, section: "sistema", icon: Settings, roles: ["admin", "root"] },
  { path: "/dashboard/settings/connection-service-layer", element: <ConnectionServiceLayer />, permission: null, roles: ["admin", "root"] },
  { path: "/dashboard/settings/connection-agent", element: <ConnectionAgent />, permission: null, roles: ["admin", "root"] },
  { path: "/dashboard/settings/connection-microsoft-graph", element: <ConnectionMicrosoftGraph />, permission: null, roles: ["admin", "root"] },

  { path: "*", element: <Error404 /> },
];
