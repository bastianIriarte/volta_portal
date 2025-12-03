
import DashboardView from "../pages/dashboard/DashboardView";
import UsersView from "../pages/users/UsersView";
import { Home, Users, GraduationCap, User, Package, Store, UsersIcon, Handshake, ShoppingCart, FileText, Receipt, DollarSign, BarChart3, Settings, Webhook, ClipboardCheck, Users2 } from "lucide-react";


import LogsView from "../pages/logs/LogsView";
// import ReportsView from "../views/ReportsView";
import Error404 from "../pages/Error404";
import CustomersView from "../pages/customers/CustomersView";
import SettingsPanel from "../pages/settings/SettingsPanel";

import ConnectionServiceLayer from "../pages/settings/ConnectionServiceLayer";
import ConnectionAgent from "../pages/settings/ConnectionAgent";

// Módulos de Listados
import ProductsView from "../pages/products/ProductsView";
import ProvidersView from "../pages/providers/ProvidersView";
import ClientsView from "../pages/clients/ClientsView";
import BusinessPartnersView from "../pages/business_partners/BusinessPartnersView";

// Módulo de Compras
import PurchaseOrdersView from "../pages/purchase_orders/PurchaseOrdersView";
import MyPurchaseOrdersView from "../pages/purchase_orders/MyPurchaseOrdersView";
import PurchaseOrderForm from "../pages/purchase_orders/PurchaseOrderForm";
import PurchaseInvoicesView from "../pages/purchase_invoices/PurchaseInvoicesView";

// Módulo de Ventas
import ReceiptsView from "../pages/receipts/ReceiptsView";
import SalesInvoicesView from "../pages/sales_invoices/SalesInvoicesView";
import QuotationsView from "../pages/quotations/QuotationsView";
import QuotationForm from "../pages/quotations/QuotationForm";
import MyQuotationView from "../pages/quotations/MyQuotationView";



export const APP_ROUTES = [
  { path: "/dashboard", element: <DashboardView />, permission: null, label: "Inicio", id: "inicio", isMenu: true, section: "inicio", icon: Home },


  // Módulo de Compras
  { path: "/dashboard/my-purchase-orders", element: <MyPurchaseOrdersView />, permission: "users.list", label: "Mis Órdenes de Compra", id: "my_purchase_orders", isMenu: true, section: "compras", icon: ClipboardCheck },
  { path: "/dashboard/my-purchase-orders/create", element: <PurchaseOrderForm />, permission: "users.list" },
  { path: "/dashboard/my-purchase-orders/:id/detail", element: <PurchaseOrderForm />, permission: "users.list" },
  { path: "/dashboard/purchase-orders", element: <PurchaseOrdersView />, permission: "users.list", label: "Órdenes de Compra", id: "purchase_orders", isMenu: true, section: "compras", icon: ShoppingCart },
  { path: "/dashboard/purchase-invoices", element: <PurchaseInvoicesView />, permission: "users.list", label: "Facturas de Compra", id: "purchase_invoices", isMenu: true, section: "compras", icon: FileText },

  // Módulo de Ventas
  { path: "/dashboard/my-quotations", element: <MyQuotationView />, permission: "users.list", label: "Mis Cotizaciones", id: "my_quotations", isMenu: true, section: "ventas", icon: ClipboardCheck },
  { path: "/dashboard/my-quotations/create", element: <QuotationForm />, permission: "users.list" },
  { path: "/dashboard/quotations", element: <QuotationsView />, permission: "users.list", label: "Cotizaciones", id: "quotations", isMenu: true, section: "ventas", icon: DollarSign },
  { path: "/dashboard/receipts", element: <ReceiptsView />, permission: "users.list", label: "Boletas", id: "receipts", isMenu: true, section: "ventas", icon: Receipt },
  { path: "/dashboard/sales-invoices", element: <SalesInvoicesView />, permission: "users.list", label: "Facturas de Venta", id: "sales_invoices", isMenu: true, section: "ventas", icon: FileText },

  // Módulo de Listados
  { path: "/dashboard/products", element: <ProductsView />, permission: "users.list", label: "Productos", id: "products", isMenu: true, section: "listados", icon: Package },
  { path: "/dashboard/clients", element: <ClientsView />, permission: "users.list", label: "Clientes", id: "clients", isMenu: true, section: "listados", icon: UsersIcon },
  { path: "/dashboard/business-partners", element: <BusinessPartnersView />, permission: "users.list", label: "Socios de Negocios", id: "business_partners", isMenu: true, section: "listados", icon: Handshake },

  { path: "/dashboard/customers", element: <CustomersView />, permission: "users.list", label: "Clientes", id: "customers", isMenu: true, section: "administracion", icon: Users },
  { path: "/dashboard/suppliers", element: <ProvidersView />, permission: "users.list", label: "Proveedores", id: "suppliers", isMenu: true, section: "administracion", icon: Store },
  { path: "/dashboard/usuarios", element: <UsersView />, permission: "users.list", label: "Usuarios", id: "usuarios", isMenu: true, section: "administracion", icon: User },


  // { path: "/dashboard/reportes", element: <ReportsView />, permission: "reports.view", label: "Reportes", id: "reportes", isMenu: true, section: "sistema", icon: BarChart3 },
  { path: "/dashboard/integraciones", element: <LogsView />, permission: "integrations.view", label: "Integraciones", id: "integraciones", isMenu: true, section: "sistema", icon: Webhook },

  { path: "/dashboard/settings", element: <SettingsPanel />, permission: "settings.view", label: "Configuración", id: "config", isMenu: true, section: "sistema", icon: Settings },
  { path: "/dashboard/settings/connection-service-layer", element: <ConnectionServiceLayer />, permission: "settings.view" },
  { path: "/dashboard/settings/connection-agent", element: <ConnectionAgent />, permission: "settings.view" },

  { path: "*", element: <Error404 /> },
];