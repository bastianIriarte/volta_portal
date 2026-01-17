// File: src/pages/dashboard/admin/DashboardAdminView.jsx
import React from "react";
import {
  Building2,
  Users,
  ClipboardList,
  Award,
  ArrowRight,
  Clock,
  CheckCircle,
  Database,
  Settings,
  Table2,
  Webhook,
  BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatCard } from "./components/StatCard";
import { WelcomeBanner } from "../WelcomeBanner";

export default function DashboardAdminView({ dataDashboard }) {
  const navigate = useNavigate();

  // Datos del dashboard (usar dataDashboard cuando venga del backend)
  const stats = dataDashboard || {
    companies: 0,
    users: 0,
    pendingRequests: 0,
    certificates: 0,
    reports: 0
  };

  // KPIs principales - coherentes con el menu de administracion
  const kpis = [
    {
      label: "Empresas",
      value: stats.companies || 0,
      icon: Building2,
      actionLabel: "Gestionar",
      url: "/dashboard/empresas",
      description: "Empresas registradas"
    },
    {
      label: "Usuarios",
      value: stats.users || 0,
      icon: Users,
      actionLabel: "Gestionar",
      url: "/dashboard/usuarios",
      description: "Usuarios del sistema"
    },
    {
      label: "Solicitudes",
      value: stats.pendingRequests || 0,
      icon: ClipboardList,
      actionLabel: "Revisar",
      url: "/dashboard/solicitudes",
      description: "Pendientes de revision",
      variant: stats.pendingRequests > 0 ? "warning" : "default"
    },
    {
      label: "Certificados",
      value: stats.certificates || 0,
      icon: Award,
      actionLabel: "Gestionar",
      url: "/dashboard/certificate-builder",
      description: "Plantillas activas",
      variant: "success"
    },
    {
      label: "Reportes",
      value: stats.reports || 0,
      icon: BarChart3,
      actionLabel: "Gestionar",
      url: "/dashboard/reports",
      description: "Reportes configurados"
    },
  ];

  // Solicitudes recientes
  const recentRequests = dataDashboard?.recentRequests || [];

  // Certificados recientes
  const recentCertificates = dataDashboard?.recentCertificates || [];

  const statusColors = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    expiring: "bg-orange-100 text-orange-800"
  };

  const statusLabels = {
    pending: "Pendiente",
    approved: "Aprobado",
    rejected: "Rechazado",
    expiring: "Por vencer"
  };

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

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Solicitudes Recientes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Solicitudes Recientes</h3>
            </div>
            <button
              onClick={() => navigate("/dashboard/solicitudes")}
              className="text-sm text-cyan-600 hover:text-cyan-800 flex items-center gap-1 transition-colors"
            >
              Ver todas <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {recentRequests.length > 0 ? (
              recentRequests.map((request) => (
                <div key={request.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{request.company}</p>
                      <p className="text-sm text-gray-500">{request.requester}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[request.status]}`}>
                        {statusLabels[request.status]}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">{request.date}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-2" />
                <p>No hay solicitudes pendientes</p>
              </div>
            )}
          </div>
        </div>

        {/* Certificados Recientes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Actividad de Certificados</h3>
            </div>
            <button
              onClick={() => navigate("/dashboard/certificate-builder")}
              className="text-sm text-cyan-600 hover:text-cyan-800 flex items-center gap-1 transition-colors"
            >
              Ver todos <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {recentCertificates.length > 0 ? (
              recentCertificates.map((cert) => (
                <div key={cert.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{cert.company}</p>
                      <p className="text-sm text-gray-500">{cert.certificate}</p>
                    </div>
                    <div className="text-right">
                      {cert.status === 'expiring' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          <Clock className="w-3 h-3" />
                          {cert.expires}
                        </span>
                      ) : (
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[cert.status]}`}>
                          {statusLabels[cert.status]}
                        </span>
                      )}
                      {cert.date && <p className="text-xs text-gray-400 mt-1">{cert.date}</p>}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-2" />
                <p>No hay actividad reciente</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
