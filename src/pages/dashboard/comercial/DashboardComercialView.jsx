import {
  Building2,
  ClipboardList,
  Users,
  ArrowRight,
  CheckCircle,
  Phone,
  Mail,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatCard } from "../admin/components/StatCard";
import { WelcomeBanner } from "../WelcomeBanner";

export default function DashboardComercialView({ dataDashboard }) {
  const navigate = useNavigate();

  const stats = dataDashboard || {
    companies: 0,
    pendingRequests: 0,
    totalClients: 0,
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
      label: "Clientes",
      description: "Usuarios clientes activos",
      value: stats.totalClients || 0,
      icon: Users,
      url: "/dashboard/usuarios",
      trend: "up",
      trendValue: "Clientes con acceso activo",
      trendLabel: ""
    },
  ];

  const recentRequests = dataDashboard?.recentRequests || [];
  const recentCompanies = dataDashboard?.recentCompanies || [];

  const statusConfig = {
    pending: { color: "text-amber-600", bg: "bg-amber-50", label: "Pendiente" },
    approved: { color: "text-emerald-600", bg: "bg-emerald-50", label: "Aprobado" },
    rejected: { color: "text-red-600", bg: "bg-red-50", label: "Rechazado" },
  };

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header con saludo */}
      <WelcomeBanner />

      {/* KPIs Grid - 3 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

        {/* Empresas Recientes */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(244, 176, 0, 0.15)' }}
              >
                <Building2 className="w-4 h-4" style={{ color: '#f4b000' }} />
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-900">Empresas Recientes</span>
                <p className="text-xs text-gray-400">Ultimas empresas registradas</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/dashboard/empresas")}
              className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
              style={{ color: '#00669e' }}
            >
              Ver todas <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {recentCompanies.length > 0 ? (
              recentCompanies.map((company) => (
                <div
                  key={company.id}
                  className="px-5 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/dashboard/empresas/${company.id}/gestionar`)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0"
                      style={{ backgroundColor: '#f4b000' }}
                    >
                      {company.name?.charAt(0) || "E"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{company.name}</p>
                      <p className="text-xs text-gray-500 truncate">{company.rut || 'Sin RUT'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[11px] text-gray-400">{company.date}</p>
                      {company.contactEmail && (
                        <a
                          href={`mailto:${company.contactEmail}`}
                          className="flex items-center gap-1 text-xs text-cyan-600 hover:text-cyan-800 mt-0.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Mail className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-12 text-center">
                <Building2 className="w-12 h-12 mx-auto text-gray-200 mb-3" />
                <p className="text-sm font-medium text-gray-500">No hay empresas recientes</p>
                <p className="text-xs text-gray-400 mt-1">Las nuevas empresas apareceran aqui</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
