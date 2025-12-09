// File: src/pages/dashboard/admin/DashboardAdminView.jsx
import React from "react";
import {
  Building2,
  Users,
  ClipboardList,
  FileText,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
  Printer
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatCard } from "./components/StatCard";
import { WelcomeBanner } from "../WelcomeBanner";

export default function DashboardAdminView({ dataDashboard }) {
  const navigate = useNavigate();

  // Datos dummy para el dashboard del portal de proveedores
  const stats = {
    companies: 45,
    users: 128,
    pendingRequests: 8,
    documents: 234,
    certificates: 156,
    expiringCertificates: 12,
    expiredCertificates: 3
  };

  const kpis = [
    {
      label: "Empresas",
      value: stats.companies,
      icon: Building2,
      actionLabel: "Ver",
      url: "/dashboard/empresas",
      description: "Empresas registradas"
    },
    {
      label: "Usuarios",
      value: stats.users,
      icon: Users,
      actionLabel: "Ver",
      url: "/dashboard/usuarios",
      description: "Usuarios activos"
    },
    {
      label: "Solicitudes Pendientes",
      value: stats.pendingRequests,
      icon: ClipboardList,
      actionLabel: "Ver",
      url: "/dashboard/solicitudes",
      description: "Requieren atencion",
      variant: "warning"
    },
    {
      label: "Documentos",
      value: stats.documents,
      icon: FileText,
      actionLabel: "Ver",
      url: "/dashboard/empresas",
      description: "Documentos registrados"
    },
    {
      label: "Certificados",
      value: stats.certificates,
      icon: Award,
      actionLabel: "Ver",
      url: "/dashboard/certificados",
      description: "Certificados activos",
      variant: "success"
    },
  ];

  // Solicitudes recientes dummy
  const recentRequests = [
    { id: 1, company: "Constructora Los Andes SpA", requester: "Juan Perez", date: "Hace 2 horas", status: "pending" },
    { id: 2, company: "Servicios del Norte Ltda", requester: "Maria Garcia", date: "Hace 5 horas", status: "pending" },
    { id: 3, company: "Transportes del Sur SA", requester: "Pedro Lopez", date: "Ayer", status: "approved" },
    { id: 4, company: "Minera Central SpA", requester: "Ana Martinez", date: "Hace 2 dias", status: "rejected" },
  ];

  // Certificados por vencer dummy
  const expiringCertificates = [
    { id: 1, company: "Constructora Los Andes SpA", certificate: "F30 - Cumplimiento Tributario", expires: "5 dias" },
    { id: 2, company: "Servicios del Norte Ltda", certificate: "CAL - Antecedentes Laborales", expires: "7 dias" },
    { id: 3, company: "Minera Central SpA", certificate: "Poliza Responsabilidad Civil", expires: "10 dias" },
  ];

  const statusColors = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-cyan-100 text-cyan-800",
    rejected: "bg-red-100 text-red-800"
  };

  const statusLabels = {
    pending: "Pendiente",
    approved: "Aprobada",
    rejected: "Rechazada"
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
        <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
            <h3 className="text-lg font-semibold text-black">Solicitudes Recientes</h3>
            <button
              onClick={() => navigate("/dashboard/solicitudes")}
              className="text-sm text-black hover:text-black flex items-center gap-1 transition-colors"
            >
              Ver todas <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {recentRequests.map((request) => (
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
            ))}
          </div>
        </div>

        {/* Certificados por Vencer */}
        <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
            <h3 className="text-lg font-semibold text-black">Certificados Recientes</h3>
            <button
              onClick={() => navigate("/dashboard/certificados")}
              className="text-sm text-black hover:text-black flex items-center gap-1 transition-colors"
            >
              Ver todos <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {expiringCertificates.map((cert) => (
              <div key={cert.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{cert.company}</p>
                    <p className="text-sm text-gray-500">{cert.certificate}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      <Clock className="w-3 h-3" />
                      {cert.expires}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {expiringCertificates.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto text-cyan-400 mb-2" />
              <p>No hay certificados por vencer</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
