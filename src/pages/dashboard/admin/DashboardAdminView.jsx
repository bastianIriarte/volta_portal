import {
  Building2,
  Users,
  ClipboardList,
  Award,
  ArrowRight,
  CheckCircle,
  FileText,
  Download,
  Calendar,
  BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatCard } from "./components/StatCard";
import { WelcomeBanner } from "../WelcomeBanner";

export default function DashboardAdminView({ dataDashboard }) {
  const navigate = useNavigate();

  const stats = dataDashboard || {
    companies: 0,
    users: 0,
    pendingRequests: 0,
    certificates: 0,
    reports: 0
  };

  const kpis = [
    {
      label: "Empresas",
      description: "Empresas registradas",
      value: stats.companies || 0,
      icon: Building2,
      url: "/dashboard/empresas",
      trend: "up",
      trendValue: "Total activas en el sistema",
      trendLabel: ""
    },
    // {
    //   label: "Usuarios",
    //   description: "Usuarios del sistema",
    //   value: stats.users || 0,
    //   icon: Users,
    //   url: "/dashboard/usuarios",
    //   trend: "up",
    //   trendValue: "Usuarios con acceso activo",
    //   trendLabel: ""
    // },
    {
      label: "Solicitudes",
      description: "Pendientes de revision",
      value: stats.pendingRequests || 0,
      icon: ClipboardList,
      url: "/dashboard/solicitudes",
      trend: stats.pendingRequests > 0 ? "down" : "up",
      trendValue: stats.pendingRequests > 0 ? "Requieren atencion" : "Sin pendientes",
      trendLabel: ""
    },
    {
      label: "Certificados",
      description: "Plantillas activas",
      value: stats.certificates || 0,
      icon: Award,
      url: "/dashboard/certificate-builder",
      trend: "up",
      trendValue: "Plantillas disponibles",
      trendLabel: ""
    },
    {
      label: "Reportes",
      description: "Plantillas de reportes",
      value: stats.reports || 0,
      icon: BarChart3,
      url: "/dashboard/report-builder",
      trend: "up",
      trendValue: "Reportes configurados",
      trendLabel: ""
    }
  ];

  const recentRequests = dataDashboard?.recentRequests || [];
  const recentCertificateDownloads = dataDashboard?.recentCertificateDownloads || [];

  const statusConfig = {
    pending: { color: "text-amber-600", bg: "bg-amber-50", label: "Pendiente" },
    approved: { color: "text-emerald-600", bg: "bg-emerald-50", label: "Aprobado" },
    rejected: { color: "text-red-600", bg: "bg-red-50", label: "Rechazado" },
    expiring: { color: "text-amber-600", bg: "bg-amber-50", label: "Por vencer" },
    completed: { color: "text-emerald-600", bg: "bg-emerald-50", label: "Completado" }
  };

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header con saludo */}
      <WelcomeBanner />

      {/* KPIs Grid - 4 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <StatCard
            key={k.label}
            label={k.label}
            description={k.description}
            value={k.value}
            icon={k.icon}
            trend={k.trend}
            trendValue={k.trendValue}
            trendLabel={k.trendLabel}
            onClick={() => navigate(k.url)}
          />
        ))}
      </div>

      {/* Two Column Layout - Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Solicitudes Recientes */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(0, 102, 158, 0.1)' }}
              >
                <ClipboardList className="w-4 h-4" style={{ color: '#00669e' }} />
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-900">Solicitudes Recientes</span>
                <p className="text-xs text-gray-400">Ultimas solicitudes de registro</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/dashboard/solicitudes")}
              className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
              style={{ color: '#00669e' }}
            >
              Ver todas <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {recentRequests.length > 0 ? (
              recentRequests.map((request) => {
                const status = statusConfig[request.status] || statusConfig.pending;
                return (
                  <div
                    key={request.id}
                    className="px-5 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/dashboard/solicitudes/${request.id}/gestionar`)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0"
                        style={{ backgroundColor: '#00669e' }}
                      >
                        {request.company?.charAt(0) || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{request.company}</p>
                        <p className="text-xs text-gray-500 truncate">{request.requester}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-xs font-semibold ${status.color}`}>{status.label}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{request.date}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-5 py-12 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-gray-200 mb-3" />
                <p className="text-sm font-medium text-gray-500">No hay solicitudes pendientes</p>
                <p className="text-xs text-gray-400 mt-1">Las nuevas solicitudes apareceran aqui</p>
              </div>
            )}
          </div>
        </div>

        {/* Descargas de Certificados */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(244, 176, 0, 0.15)' }}
              >
                <Download className="w-4 h-4" style={{ color: '#f4b000' }} />
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-900">Descargas de Certificados</span>
                <p className="text-xs text-gray-400">Ultimas descargas registradas</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/dashboard/certificate-builder")}
              className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
              style={{ color: '#00669e' }}
            >
              Ver todos <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentCertificateDownloads.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Certificado</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Empresa</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Periodo</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Usuario</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentCertificateDownloads.map((download) => {
                    const status = statusConfig[download.status] || statusConfig.completed;
                    return (
                      <tr key={download.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">{download.certificateName}</p>
                              <p className="text-xs text-gray-400">{download.certificateCode}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{download.companyName}</p>
                          <p className="text-xs text-gray-400">{download.companyRut}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-xs">{download.period}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                            <CheckCircle className="w-3 h-3" />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{download.userName}</p>
                          <p className="text-xs text-gray-400">{download.userEmail}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {download.date}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-5 py-12 text-center">
              <Download className="w-12 h-12 mx-auto text-gray-200 mb-3" />
              <p className="text-sm font-medium text-gray-500">No hay descargas recientes</p>
              <p className="text-xs text-gray-400 mt-1">Las descargas de certificados apareceran aqui</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
