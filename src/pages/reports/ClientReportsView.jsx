// File: src/pages/reports/ClientReportsView.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3, Calendar, Building2, Loader2,
  Download, Search
} from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { useAuth } from "../../context/auth";
import { getReportTemplates, getCompanyReports } from "../../services/companyService";
import { handleSnackbar } from "../../utils/messageHelpers";

export default function ClientReportsView() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal de generación
  const [selectedReport, setSelectedReport] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [generating, setGenerating] = useState(false);

  const [selectedCompanyId, setSelectedCompanyId] = useState("");

  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const userRole = session?.user?.role;
  const isAdmin = userRole === "root" || userRole === "admin";
  const companyId = session?.user?.company_id;
  const companies = session?.user?.companies || [];

  // Auto-seleccionar empresa: si hay 1 sola, seleccionarla; si hay varias, seleccionar la principal
  useEffect(() => {
    if (companies.length === 1 && !selectedCompanyId) {
      setSelectedCompanyId(String(companies[0].id));
    } else if (companies.length > 1 && !selectedCompanyId && companyId) {
      setSelectedCompanyId(String(companyId));
    }
  }, [companies]);

  useEffect(() => {
    loadReports();
  }, [selectedCompanyId, isAdmin]);

  const loadReports = async () => {
    setLoading(true);
    try {
      let response;
      if (selectedCompanyId) {
        // Obtener reportes asignados a la empresa seleccionada
        response = await getCompanyReports(selectedCompanyId);
      } else if (isAdmin) {
        // Para admins sin empresa seleccionada: obtener todas las plantillas
        response = await getReportTemplates();
      } else {
        setLoading(false);
        return;
      }

      if (response.success && response.data) {
        // Filtrar solo reportes activos
        setReports(response.data.filter(r => r.status === 1 || r.status === undefined));
      }
    } catch (error) {
      console.error("Error loading reports:", error);
      handleSnackbar("Error al cargar reportes", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report =>
    report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (report.code && report.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenModal = (report) => {
    setSelectedReport(report);
    // Valores por defecto: mes actual
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setDateFrom(firstDay.toISOString().split("T")[0]);
    setDateTo(lastDay.toISOString().split("T")[0]);
  };

  const handleCloseModal = () => {
    setSelectedReport(null);
    setDateFrom("");
    setDateTo("");
  };

  const handleGenerateReport = () => {
    if (!selectedReport) return;
    if (!dateFrom || !dateTo) {
      handleSnackbar("Selecciona el rango de fechas", "error");
      return;
    }

    setGenerating(true);

    // Construir URL del reporte con parámetros
    const params = new URLSearchParams();
    params.append("date_from", dateFrom);
    params.append("date_to", dateTo);
    if (selectedCompanyId) {
      params.append("company_id", selectedCompanyId);
    }

    // Determinar la URL según el tipo de origen
    let reportUrl;
    if (selectedReport.origin_type === "iframe" && selectedReport.report_url) {
      reportUrl = selectedReport.report_url;
    } else {
      reportUrl = `${baseURL}/api/reports/generate/${selectedReport.id}?${params.toString()}`;
    }

    window.open(reportUrl, "_blank");
    setGenerating(false);
    handleSnackbar("Generando reporte...", "success");
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
          <BarChart3 size={32} className="text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Reportes</h2>
            <p className="text-gray-600">
              {isAdmin
                ? "Todos los reportes disponibles en el sistema"
                : "Reportes disponibles para tu empresa"
              }
            </p>
          </div>
        </div>

        {companies.length > 1 && (
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="min-w-[250px] px-3 py-2 text-sm border border-blue-200 rounded-lg bg-blue-50 text-blue-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seleccione una empresa</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.business_name} {company.rut ? `(${company.rut})` : ""}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Barra de busqueda */}
      {reports.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar reportes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Grid de reportes */}
      {filteredReports.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No hay reportes disponibles</h3>
          <p className="text-gray-500 mt-2">
            {searchTerm
              ? "No se encontraron reportes con ese criterio"
              : isAdmin
                ? "No se han creado reportes en el sistema"
                : "Tu empresa no tiene reportes asignados"
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              onClick={() => handleOpenModal(report)}
              className="relative p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 bg-blue-50 border-blue-200 hover:bg-blue-100 transform hover:scale-105 hover:shadow-lg"
            >
              {/* Icono */}
              <div className="mb-4 text-blue-600">
                <BarChart3 size={40} />
              </div>

              {/* Contenido */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {report.name}
                </h3>

                {report.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {report.description}
                  </p>
                )}

                {report.code && (
                  <div className="text-xs text-gray-500">
                    Código: <span className="font-mono">{report.code}</span>
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
        open={!!selectedReport}
        onClose={handleCloseModal}
        title={`Generar: ${selectedReport?.name}`}
        size="sm"
        actions={[
          {
            label: "Cancelar",
            variant: "outline",
            onClick: handleCloseModal,
          },
          {
            label: generating ? "Generando..." : "Generar Reporte",
            variant: "primary",
            onClick: handleGenerateReport,
            disabled: generating || !dateFrom || !dateTo,
            icon: Download,
          },
        ]}
      >
        <div className="space-y-4">
          {/* Info del reporte */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">{selectedReport?.name}</p>
                {selectedReport?.code && (
                  <p className="text-xs text-blue-600">Código: {selectedReport?.code}</p>
                )}
              </div>
            </div>
          </div>

          {/* Rango de fechas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Periodo del reporte
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
              El reporte se generará con los datos correspondientes al periodo seleccionado.
              Se abrirá en una nueva ventana para su visualización o descarga.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
