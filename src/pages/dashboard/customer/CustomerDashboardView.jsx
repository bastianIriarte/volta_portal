import { useState, useEffect } from "react";
import {
  Phone,
  Mail,
  Users,
  Recycle,
  Leaf,
  Ban,
  Shield,
  Loader2,
  BarChart3,
  Award,
  FileText,
  X,
  Info,
} from "lucide-react";
import { useAuth } from "../../../context/auth";
import { getDataDashboard } from "../../../services/dashboardService";
import { Card } from "../../../components/ui/Card";

// Mapeo de iconos para conceptos
const iconMap = {
  recycle: Recycle,
  leaf: Leaf,
  ban: Ban,
  shield: Shield,
};

// Mapeo de colores para conceptos
const colorMap = {
  green: { icon: "text-green-600", bg: "bg-green-50", border: "border-green-200", hover: "hover:border-green-400" },
  red: { icon: "text-red-600", bg: "bg-red-50", border: "border-red-200", hover: "hover:border-red-400" },
  orange: { icon: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", hover: "hover:border-orange-400" },
  blue: { icon: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", hover: "hover:border-blue-400" },
};

export default function CustomerDashboardView() {
  const { session } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [concepts, setConcepts] = useState([]);
  const [stats, setStats] = useState({ reports: 0, certificates: 0, documents: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedConcept, setSelectedConcept] = useState(null);

  const userName = session?.user?.name || "Usuario";

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getDataDashboard();
      if (res.success && res.data) {
        setContacts(res.data.contacts || []);
        setConcepts(res.data.concepts || []);
        setStats(res.data.stats || { reports: 0, certificates: 0, documents: 0 });
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // KPIs para el cliente
  const kpis = [
    {
      label: "Reportes",
      value: stats.reports,
      icon: BarChart3,
      description: "Reportes disponibles",
      variant: "default",
    },
    {
      label: "Certificados",
      value: stats.certificates,
      icon: Award,
      description: "Certificados activos",
      variant: "success",
    },
    {
      label: "Documentos",
      value: stats.documents,
      icon: FileText,
      description: "Documentos disponibles",
      variant: "default",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up lg:px-10">
      {/* Welcome Banner */}
      <div className="glass-effect rounded-2xl p-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <div>
                <h2 className="text-3xl font-bold text-black">Dashboard</h2>
                <p className="text-gray-600 mt-1">
                  Bienvenido <b>{userName}</b>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpis.map((k) => (
          <StatCard
            key={k.label}
            label={k.label}
            value={k.value}
            icon={k.icon}
            description={k.description}
            variant={k.variant}
          />
        ))}
      </div>

      {/* Conceptos de Gestion como Cards */}
      {concepts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conceptos de Gestion</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {concepts.map((concept) => (
              <ConceptCard
                key={concept.id}
                concept={concept}
                onClick={() => setSelectedConcept(concept)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Contactos VOLTA */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 md:px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Contactos VOLTA</h3>
          </div>
          <span className="text-xs text-gray-400">{contacts.length} contactos</span>
        </div>

        {/* Vista Mobile - Cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {contacts.length > 0 ? (
            contacts.map((contact) => (
              <div key={contact.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                    <p className="text-xs text-gray-500">{contact.services}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      {contact.area}
                    </span>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      contact.type === "titular"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {contact.type === "titular" ? "Titular" : "Respaldo"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-xs mt-2">
                  {contact.phone && (
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-1 text-cyan-600 hover:text-cyan-800"
                    >
                      <Phone className="w-3 h-3" />
                      {contact.phone}
                    </a>
                  )}
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-1 text-cyan-600 hover:text-cyan-800"
                    >
                      <Mail className="w-3 h-3" />
                      {contact.email}
                    </a>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p>No hay contactos disponibles</p>
            </div>
          )}
        </div>

        {/* Vista Desktop - Tabla */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Area</th>
                <th className="px-4 py-3">Servicios</th>
                <th className="px-4 py-3">Telefono</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Tipo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contacts.length > 0 ? (
                contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{contact.name}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {contact.area}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{contact.services}</td>
                    <td className="px-4 py-3 text-sm">
                      {contact.phone && (
                        <a
                          href={`tel:${contact.phone}`}
                          className="flex items-center gap-1 text-cyan-600 hover:text-cyan-800 transition-colors"
                        >
                          <Phone className="w-3 h-3" />
                          {contact.phone}
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          className="flex items-center gap-1 text-cyan-600 hover:text-cyan-800 transition-colors"
                        >
                          <Mail className="w-3 h-3" />
                          {contact.email}
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        contact.type === "titular"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {contact.type === "titular" ? "Titular" : "Respaldo"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p>No hay contactos disponibles</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Concepto */}
      {selectedConcept && (
        <ConceptModal
          concept={selectedConcept}
          onClose={() => setSelectedConcept(null)}
        />
      )}
    </div>
  );
}

// Componente StatCard para KPIs
function StatCard({ label, value, icon: Icon, description, variant }) {
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return {
          valueColor: "text-cyan-600",
          iconBg: "bg-gradient-to-br from-cyan-500 to-cyan-600",
        };
      default:
        return {
          valueColor: "text-gray-900",
          iconBg: "bg-gradient-to-br from-gray-800 to-black",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Card className="hover-lift transition-all duration-300" variant="premium">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
            <p className={`text-3xl font-bold ${styles.valueColor}`}>{value}</p>
            {description && (
              <p className="text-xs text-gray-400 mt-1">{description}</p>
            )}
          </div>
          {Icon && (
            <div className={`w-12 h-12 ${styles.iconBg} rounded-xl flex items-center justify-center shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// Componente de tarjeta de concepto (clickeable)
function ConceptCard({ concept, onClick }) {
  const IconComponent = iconMap[concept.icon] || Recycle;
  const colors = colorMap[concept.color] || colorMap.green;

  return (
    <div
      className={`p-4 rounded-xl border-2 ${colors.border} ${colors.hover} bg-white cursor-pointer transition-all duration-200 hover:shadow-md`}
      onClick={onClick}
    >
      <div className="flex flex-col items-center text-center gap-2">
        <div className={`p-3 rounded-xl ${colors.bg}`}>
          <IconComponent className={`w-6 h-6 ${colors.icon}`} />
        </div>
        <p className="text-sm font-medium text-gray-900">{concept.name}</p>
        <span className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
          <Info className="w-3 h-3" />
          Ver info
        </span>
      </div>
    </div>
  );
}

// Modal para mostrar detalle del concepto
function ConceptModal({ concept, onClose }) {
  const IconComponent = iconMap[concept.icon] || Recycle;
  const colors = colorMap[concept.color] || colorMap.green;

  // Cerrar con Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 top-[-30px]">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 animate-scale-in">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <div className={`p-3 rounded-xl ${colors.bg}`}>
            <IconComponent className={`w-6 h-6 ${colors.icon}`} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 flex-1">{concept.name}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 leading-relaxed">{concept.description}</p>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
