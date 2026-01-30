import {
  Camera,
  Upload,
  Image,
  CheckCircle,
  Clock,
  ArrowRight,
  FolderOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatCard } from "../admin/components/StatCard";
import { WelcomeBanner } from "../WelcomeBanner";

export default function DashboardLogisticaView({ dataDashboard }) {
  const navigate = useNavigate();

  const stats = dataDashboard || {
    photosUploaded: 0,
    photosPending: 0,
    photosToday: 0,
  };

  const kpis = [
    {
      label: "Fotos Subidas",
      description: "Total de fotos cargadas",
      value: stats.photosUploaded || 0,
      icon: Image,
      url: "/dashboard/fotos",
      trend: "up",
      trendValue: "Fotos en el sistema",
      trendLabel: ""
    },
    {
      label: "Pendientes",
      description: "Fotos por procesar",
      value: stats.photosPending || 0,
      icon: Clock,
      url: "/dashboard/fotos?status=pending",
      trend: stats.photosPending > 0 ? "down" : "up",
      trendValue: stats.photosPending > 0 ? "Requieren atencion" : "Todo al dia",
      trendLabel: ""
    },
    {
      label: "Hoy",
      description: "Fotos subidas hoy",
      value: stats.photosToday || 0,
      icon: Camera,
      url: "/dashboard/fotos?date=today",
      trend: "up",
      trendValue: "Actividad del dia",
      trendLabel: ""
    },
  ];

  const recentUploads = dataDashboard?.recentUploads || [];

  const statusConfig = {
    pending: { color: "text-amber-600", bg: "bg-amber-50", label: "Pendiente" },
    processed: { color: "text-emerald-600", bg: "bg-emerald-50", label: "Procesado" },
    error: { color: "text-red-600", bg: "bg-red-50", label: "Error" },
  };

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header con saludo */}
      <WelcomeBanner />

      {/* Acceso Rapido - Card principal de carga de fotos */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <Upload className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Carga de Fotos</h3>
                <p className="text-blue-100 text-sm mt-1">Sube fotos de operaciones y evidencias</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/dashboard/fotos/cargar")}
              className="flex items-center gap-2 px-5 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg"
            >
              <Camera className="w-5 h-5" />
              Cargar Fotos
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

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

      {/* Lista de Cargas Recientes */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(0, 102, 158, 0.1)' }}
            >
              <Image className="w-4 h-4" style={{ color: '#00669e' }} />
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-900">Cargas Recientes</span>
              <p className="text-xs text-gray-400">Ultimas fotos subidas al sistema</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/dashboard/fotos")}
            className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
            style={{ color: '#00669e' }}
          >
            Ver todas <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {recentUploads.length > 0 ? (
            recentUploads.map((upload) => {
              const status = statusConfig[upload.status] || statusConfig.pending;
              return (
                <div
                  key={upload.id}
                  className="px-5 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/dashboard/fotos/${upload.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                      {upload.thumbnail ? (
                        <img
                          src={upload.thumbnail}
                          alt={upload.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Image className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{upload.name}</p>
                      <p className="text-xs text-gray-500 truncate">{upload.company || 'Sin empresa'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                        <CheckCircle className="w-3 h-3" />
                        {status.label}
                      </span>
                      <p className="text-[11px] text-gray-400 mt-1">{upload.date}</p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-5 py-12 text-center">
              <FolderOpen className="w-12 h-12 mx-auto text-gray-200 mb-3" />
              <p className="text-sm font-medium text-gray-500">No hay cargas recientes</p>
              <p className="text-xs text-gray-400 mt-1">Las fotos que subas apareceran aqui</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
