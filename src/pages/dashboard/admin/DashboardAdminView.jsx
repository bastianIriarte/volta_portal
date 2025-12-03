// File: src/pages/dashboard/admin/DashboardAdminView.jsx
import React from "react";
import {
  Users,
  FileText,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatCard } from "./components/StatCard";
import { RecentDocumentsTable } from "./components/RecentDocumentsTable";
import { IntegrationsTable } from "./components/IntegrationsTable";
import { WelcomeBanner } from "../WelcomeBanner";

export default function DashboardAdminView({ dataDashboard }) {
  const navigate = useNavigate();

  // KPIs desde SAP
  const providers = dataDashboard?.kpi?.providers ?? 0;
  const clients = dataDashboard?.kpi?.clients ?? 0;
  const openInvoices = dataDashboard?.kpi?.open_invoices ?? 0;
  const openPurchaseOrders = dataDashboard?.kpi?.open_purchase_orders ?? 0;
  const monthlyTotal = dataDashboard?.kpi?.monthly_total ?? 0;

  // Documentos recientes
  const recentDocuments = dataDashboard?.recent_documents ?? [];

  // Facturas por estado
  const invoicesByStatus = dataDashboard?.invoices_by_status ?? { open: 0, closed: 0, total: 0 };

  // Webhooks/Logs recientes
  const webhooks = dataDashboard?.webhooks ?? [];

  const kpis = [
    {
      label: "Proveedores",
      value: providers,
      icon: Users,
      actionLabel: "Ver",
      url: "/dashboard/business-partners",
      description: "Total de proveedores registrados"
    },
    {
      label: "Clientes",
      value: clients,
      icon: Users,
      actionLabel: "Ver",
      url: "/dashboard/business-partners",
      description: "Total de clientes registrados"
    },
    {
      label: "Facturas Abiertas",
      value: openInvoices,
      icon: FileText,
      actionLabel: "Ver",
      url: "/dashboard/invoices",
      description: "Facturas pendientes de pago",
      variant: "warning"
    },
    {
      label: "Órdenes de Compra",
      value: openPurchaseOrders,
      icon: ShoppingCart,
      actionLabel: "Ver",
      url: "/dashboard/purchase-orders",
      description: "Órdenes de compra abiertas"
    },
    {
      label: "Total Facturado",
      value: `$${Number(monthlyTotal).toLocaleString('es-CL', { minimumFractionDigits: 0 })}`,
      icon: DollarSign,
      actionLabel: "Ver",
      url: "/dashboard/invoices",
      description: "Total facturado este mes",
      variant: "success"
    },
  ];

  return (
    <div className="space-y-6 fade-in-up lg:px-10">
      <WelcomeBanner />

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpis.map((k) => (
          <StatCard
            key={k.label}
            label={k.label}
            value={k.value}
            icon={k.icon}
            actionLabel={k.actionLabel}
            onAction={() => navigate(k.url)}
            description={k.description}
            variant={k.variant}
          />
        ))}
      </div>

      {/* Estado de Facturas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Facturas Totales</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{invoicesByStatus.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Facturas Abiertas</p>
              <p className="text-2xl font-bold text-orange-600 mt-2">{invoicesByStatus.open}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Facturas Cerradas</p>
              <p className="text-2xl font-bold text-green-600 mt-2">{invoicesByStatus.closed}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Documentos Recientes */}
      {/* {recentDocuments.length > 0 && (
        <RecentDocumentsTable documents={recentDocuments} />
      )} */}

      {/* Monitor de Webhooks */}
      <IntegrationsTable logs={webhooks} />
    </div>
  );
}
