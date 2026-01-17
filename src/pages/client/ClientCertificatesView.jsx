import { useState, useEffect } from "react";
import { Award, Calendar, Loader2, Download, Building2 } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { useAuth } from "../../context/auth";
import { getCertificateTemplates, getCertificatesByCompany } from "../../services/companyService";
import { generateCertificatePdfWithDates } from "../../services/certificateBuilderService";
import { handleSnackbar } from "../../utils/messageHelpers";

export default function ClientCertificatesView() {
  const { session } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal de generación
  const [selectedCert, setSelectedCert] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [generating, setGenerating] = useState(false);

  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const userRole = session?.user?.role;
  const isAdmin = userRole === "root" || userRole === "admin";
  const companyId = session?.user?.company_id;
  const companyName = session?.user?.company?.business_name || "";

  useEffect(() => {
    loadCertificates();
  }, [companyId, isAdmin]);

  const loadCertificates = async () => {
    setLoading(true);
    try {
      let response;
      if (!isAdmin && companyId) {
        response = await getCertificatesByCompany(companyId);
      } else {
        response = await getCertificateTemplates();
      }

      if (response.success && response.data) {
        // Filtrar solo certificados activos (status puede ser boolean o integer)
        setCertificates(response.data.filter(c => c.status === true || c.status === 1));
      }
    } catch (error) {
      console.error("Error loading certificates:", error);
      handleSnackbar("Error al cargar certificados", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (cert) => {
    setSelectedCert(cert);
    // Valores por defecto: mes actual
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setDateFrom(firstDay.toISOString().split("T")[0]);
    setDateTo(lastDay.toISOString().split("T")[0]);
  };

  const handleCloseModal = () => {
    setSelectedCert(null);
    setDateFrom("");
    setDateTo("");
  };

  const handleGeneratePDF = async () => {
    if (!selectedCert) return;
    if (!dateFrom || !dateTo) {
      handleSnackbar("Selecciona el rango de fechas", "error");
      return;
    }

    setGenerating(true);

    try {
      // Generar PDF con autenticación - descarga directa
      const result = await generateCertificatePdfWithDates(
        selectedCert.id,
        dateFrom,
        dateTo,
        true // true = descargar directamente
      );

      if (result.success) {
        handleSnackbar("Certificado descargado correctamente", "success");
        setSelectedCert(null);
        setDateFrom("");
        setDateTo("");
      } else {
        handleSnackbar(result.error || "Error al generar certificado", "error");
      }
    } catch (error) {
      handleSnackbar("Error al generar certificado", "error");
    } finally {
      setGenerating(false);
    }
  };

  const handlePreview = async (cert) => {
    try {
      // Generar preview sin fechas (usará datos del mes actual por defecto)
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      await generateCertificatePdfWithDates(
        cert.id,
        firstDay.toISOString().split("T")[0],
        lastDay.toISOString().split("T")[0],
        false
      );
    } catch (error) {
      handleSnackbar("Error al generar preview", "error");
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Award size={32} className="text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Certificados</h2>
            <p className="text-gray-600">
              {isAdmin
                ? "Todos los certificados disponibles en el sistema"
                : "Certificados disponibles para tu empresa"
              }
            </p>
          </div>
        </div>

        {companyName && !isAdmin && (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">{companyName}</span>
          </div>
        )}
      </div>

      {/* Grid de certificados */}
      {certificates.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No hay certificados disponibles</h3>
          <p className="text-gray-500 mt-2">
            {isAdmin
              ? "No se han creado certificados en el sistema"
              : "Tu empresa no tiene certificados asignados"
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              onClick={() => handleOpenModal(cert)}
              className="relative p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 bg-blue-50 border-blue-200 hover:bg-blue-100 transform hover:scale-105 hover:shadow-lg"
            >
              {/* Icono */}
              <div className="mb-4 text-blue-600">
                <Award size={40} />
              </div>

              {/* Contenido */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {cert.name}
                </h3>

                {cert.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {cert.description}
                  </p>
                )}

                {cert.code && (
                  <div className="text-xs text-gray-500">
                    Código: <span className="font-mono">{cert.code}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-blue-200">
                <span className="text-sm font-medium text-blue-600">
                  Generar
                </span>
                <Calendar size={16} className="text-blue-600" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de generación */}
      <Modal
        open={!!selectedCert}
        onClose={handleCloseModal}
        title={`Generar: ${selectedCert?.name}`}
        size="sm"
        actions={[
          {
            label: "Cancelar",
            variant: "outline",
            onClick: handleCloseModal,
          },
          {
            label: generating ? "Generando..." : "Generar PDF",
            variant: "primary",
            onClick: handleGeneratePDF,
            disabled: generating || !dateFrom || !dateTo,
            icon: Download,
          },
        ]}
      >
        <div className="space-y-4">
          {/* Info del certificado */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">{selectedCert?.name}</p>
                <p className="text-xs text-blue-600">Código: {selectedCert?.code}</p>
              </div>
            </div>
          </div>

          {/* Rango de fechas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Periodo del certificado
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Desde</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Hasta</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>

          {/* Accesos rápidos de periodo */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">Accesos rápidos</label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Este mes", getValue: () => {
                  const now = new Date();
                  return {
                    from: new Date(now.getFullYear(), now.getMonth(), 1),
                    to: new Date(now.getFullYear(), now.getMonth() + 1, 0)
                  };
                }},
                { label: "Mes anterior", getValue: () => {
                  const now = new Date();
                  return {
                    from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
                    to: new Date(now.getFullYear(), now.getMonth(), 0)
                  };
                }},
                { label: "Últimos 3 meses", getValue: () => {
                  const now = new Date();
                  return {
                    from: new Date(now.getFullYear(), now.getMonth() - 2, 1),
                    to: new Date(now.getFullYear(), now.getMonth() + 1, 0)
                  };
                }},
                { label: "Este año", getValue: () => {
                  const now = new Date();
                  return {
                    from: new Date(now.getFullYear(), 0, 1),
                    to: new Date(now.getFullYear(), 11, 31)
                  };
                }},
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    const { from, to } = preset.getValue();
                    setDateFrom(from.toISOString().split("T")[0]);
                    setDateTo(to.toISOString().split("T")[0]);
                  }}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Nota */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">
              El certificado se generará con los datos correspondientes al periodo seleccionado
              y se descargará automáticamente.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
