
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
  Upload,
  Download,
  BarChart3,
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
import ClientReportsView from "../pages/reports/ClientReportsView";

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
  // ========================================
  // DASHBOARD Y PERFIL (visible para todos los autenticados)
  // ========================================
  { path: "/dashboard", element: <DashboardView />, permission: "dashboard.view", label: "Inicio", id: "inicio", isMenu: true, section: "inicio", icon: Home },
  { path: "/dashboard/mi-perfil", element: <ProfileView />, permission: null, label: "Mi Perfil", id: "mi-perfil", isMenu: false },

  // ========================================
  // MÓDULO DE SOLICITUDES
  // ========================================
  { path: "/dashboard/solicitudes", element: <RegistrationRequestsView />, permission: "requests.list", label: "Solicitudes", id: "solicitudes", isMenu: true, section: "inicio", icon: ClipboardList },
  { path: "/dashboard/solicitudes/:id/gestionar", element: <RegistrationRequestDetailView />, permission: "requests.approve" },

  // ========================================
  // MÓDULO DE CLIENTE (Basado en permisos específicos del usuario)
  // ========================================
  { path: "/dashboard/mis-reportes", element: <ClientReportsView />, permission: "my.reports", label: "Listado de Reportes", id: "mis-reportes", isMenu: true, section: "reportes", icon: BarChart3 },
  { path: "/dashboard/report-exports", element: <ReportExportsView />, permission: "exports.reports", label: "Reportes Descargados", id: "report-exports", isMenu: true, section: "reportes", icon: Download },
  { path: "/dashboard/mis-certificados", element: <ClientCertificatesView />, permission: "my.certificates", label: "Listado de Certificados", id: "mis-certificados", isMenu: true, section: "certificados", icon: Award },
  { path: "/dashboard/certificate-exports", element: <CertificateExportsView />, permission: "exports.certificates", label: "Certificados Descargados", id: "certificate-exports", isMenu: true, section: "certificados", icon: Download },
  { path: "/dashboard/mis-documentos", element: <ClientDocumentsView />, permission: "my.documents", label: "Listado de Documentos", id: "mis-documentos", isMenu: true, section: "documentos", icon: FolderOpen },

  // ========================================
  // MÓDULO DE GESTIÓN EMPRESAS Y CLIENTES
  // ========================================
  { path: "/dashboard/empresas", element: <CompaniesView />, permission: "companies.list", label: "Empresas", id: "empresas", isMenu: true, section: "administracion", icon: Building2 },
  { path: "/dashboard/empresas/:id/gestionar", element: <CompanyDetailView />, permission: "companies.edit" },
  { path: "/dashboard/clientes", element: <CustomersView />, permission: "customers.list", label: "Clientes", id: "clientes", isMenu: true, section: "administracion", icon: Users },

  // ========================================
  // MÓDULO DE PERFILES Y USUARIOS
  // ========================================
  { path: "/dashboard/profiles-managment", element: <ProfilesManagement />, permission: "profiles.list", label: "Perfiles", id: "profiles", icon: Shield, isMenu: true, section: "administracion" },
  { path: "/dashboard/profiles-managment/permissions-matrix", element: <ProfilePermissionsMatrix />, permission: "profiles.assign" },
  { path: "/dashboard/usuarios", element: <UsersView />, permission: "users.list", label: "Usuarios", id: "usuarios", isMenu: true, section: "administracion", icon: User },

  // ========================================
  // MÓDULO DE CERTIFICADOS Y REPORTES (Gestión)
  // ========================================
  { path: "/dashboard/certificate-builder", element: <CertificateBuilderView />, permission: "certificates.list", label: "Gestión de Certificados", id: "certificados", isMenu: true, section: "administracion", icon: Award },
  { path: "/dashboard/certificate-builder/:templateId", element: <CertificateBuilderView />, permission: "certificates.edit" },
  { path: "/dashboard/reports", element: <ReportTemplatesView />, permission: "reports.list", label: "Gestión de Reportes", id: "reports", isMenu: true, section: "administracion", icon: FileText },

  // ========================================
  // MÓDULO DE TICKETS/IMÁGENES (Logística)
  // ========================================
  { path: "/dashboard/ticket-images", element: <TicketImagesView />, permission: "tickets.list", label: "Carga de Tickets", id: "ticket-images", isMenu: true, section: "administracion", icon: Upload },

  // ========================================
  // MÓDULO DE SISTEMA (Solo Admin/Root)
  // ========================================
  { path: "/dashboard/fuentes-datos", element: <DataSourcesView />, permission: "datasources.list", label: "Fuentes de Datos", id: "fuentes-datos", isMenu: true, section: "sistema", icon: Database },
  { path: "/dashboard/procesadores", element: <TableProcessorsView />, permission: "processors.list", label: "Procesadores", id: "procesadores", isMenu: true, section: "sistema", icon: Table2 },
  { path: "/dashboard/settings", element: <SettingsPanel />, permission: "settings.view", label: "Configuracion", id: "config", isMenu: true, section: "sistema", icon: Settings },
  { path: "/dashboard/settings/connection-service-layer", element: <ConnectionServiceLayer />, permission: "settings.view" },
  { path: "/dashboard/settings/connection-agent", element: <ConnectionAgent />, permission: "settings.view" },
  { path: "/dashboard/settings/connection-microsoft-graph", element: <ConnectionMicrosoftGraph />, permission: "settings.view" },

  // ========================================
  // ERROR 404
  // ========================================
  { path: "*", element: <Error404 /> },
];
