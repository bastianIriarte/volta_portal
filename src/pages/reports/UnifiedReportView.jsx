// File: src/pages/reports/UnifiedReportView.jsx
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, FileText, Table, ExternalLink, Calendar,
  Download, RefreshCcw, Loader2, Filter, X,
  Building2, Search, Award,
  BarChart2
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/auth";
import api from "../../services/api";
import { handleSnackbar } from "../../utils/messageHelpers";

// Configuracion de columnas para la tabla SharePoint
const DEFAULT_COLUMNS = [
  { key: "FechaProgramada", label: "Fecha Programada", type: "date" },
  { key: "FechaEjecucion", label: "Fecha Ejecucion", type: "date" },
  { key: "DisposicionFinal", label: "Disposicion Final", type: "text" },
  { key: "NombreCliente", label: "Cliente", type: "text" },
  { key: "Sucursal", label: "Sucursal", type: "text" },
  { key: "Bodega", label: "Bodega", type: "text" },
  { key: "Formato", label: "Formato", type: "text" },
  { key: "Material", label: "Material", type: "text" },
  { key: "PesoTotal", label: "Peso Total", type: "number" },
  { key: "Cantidad", label: "Cantidad", type: "number" },
];

export default function UnifiedReportView() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { session } = useAuth();

  // Obtener parametros de la URL
  const certCode = searchParams.get("cert");
  const reportCode = searchParams.get("report");

  // Estados generales
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState(null);
  const [templateType, setTemplateType] = useState(null); // "certificate" | "report"
  const [activeTab, setActiveTab] = useState("data");
  const [companyReport, setCompanyReport] = useState(null); // Datos de la asignación de reporte a empresa

  // Estados para datos
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [nextLink, setNextLink] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  // Estados para filtros
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dateFilterField, setDateFilterField] = useState("FechaProgramada");
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para loading del iframe
  const [iframeLoading, setIframeLoading] = useState(true);

  // Informacion del usuario
  const companyName = session?.user?.company?.business_name || "";
  const isClientUser = session?.user?.role === "cliente";
  const companyId = session?.user?.company_id;

  const tableContainerRef = useRef(null);

  useEffect(() => {
    loadTemplate();
  }, [certCode, reportCode]);

  useEffect(() => {
    if (template) {
      loadData();
    }
  }, [template, dateFrom, dateTo, dateFilterField]);

  const loadTemplate = async () => {
    setLoading(true);
    try {
      let response;
      let type;

      if (certCode) {
        // Cargar certificado por codigo
        response = await api.get(`/api/certificate-templates/code/${certCode}`);
        type = "certificate";
      } else if (reportCode) {
        // Cargar reporte por codigo
        response = await api.get(`/api/report-templates/code/${reportCode}`);
        type = "report";
      } else {
        handleSnackbar("No se especificó un certificado o reporte", "error");
        navigate("/dashboard");
        return;
      }

      // La API devuelve { data, message, code } - verificar si hay data
      if (response.status === 200 && response.data?.data) {
        const templateData = response.data.data;
        setTemplate(templateData);
        setTemplateType(type);

        // Para reportes, cargar también la asignación específica de la empresa del usuario
        if (type === "report" && companyId) {
          await loadCompanyReport(templateData.id);
        }
      } else {
        handleSnackbar(response.data?.error || "Plantilla no encontrada", "error");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error loading template:", error);
      handleSnackbar("Error al cargar plantilla", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyReport = async (reportId) => {
    try {
      // Cargar los reportes asignados a la empresa del usuario
      const response = await api.get(`/api/company-reports/company/${companyId}`);
      if (response.status === 200 && response.data?.data) {
        // Buscar la asignación específica para este reporte
        const assignment = response.data.data.find(r => r.report_id === reportId);
        if (assignment) {
          console.log('[UnifiedReportView] Company report assignment found:', assignment);
          setCompanyReport(assignment);
          // Si tiene report_url configurado, activar el tab de iframe primero
          if (assignment.report_url) {
            setActiveTab("iframe");
          }
        }
      }
    } catch (error) {
      console.error("Error loading company report:", error);
    }
  };

  const loadData = async (cursor = null) => {
    if (!template) return;

    if (!cursor) {
      setLoadingItems(true);
      setItems([]);
    }

    try {
      // Determinar origen de datos segun el tipo de plantilla
      const originType = template.origin_type || "sharepoint";

      if (originType === "iframe") {
        // No hay datos tabulares para iframe
        setLoadingItems(false);
        return;
      }

      if (originType === "sql" || template.query_id) {
        // Cargar datos desde SQL
        await loadSQLData();
      } else if (originType === "sharepoint" || template.sharepoint_list_id) {
        // Cargar datos desde SharePoint
        await loadSharePointData(cursor);
      } else if (originType === "mixed") {
        // Cargar ambos tipos de datos
        await loadSharePointData(cursor);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      handleSnackbar("Error al cargar datos", "error");
    } finally {
      setLoadingItems(false);
    }
  };

  const loadSQLData = async () => {
    try {
      const params = new URLSearchParams();
      if (companyId) params.append("company_id", companyId);
      if (dateFrom) params.append("date_from", dateFrom);
      if (dateTo) params.append("date_to", dateTo);

      const url = `/api/reports/data/${template.code}?${params.toString()}`;
      const response = await api.get(url);

      if (response.data?.success) {
        setItems(response.data.data || []);
      }
    } catch (error) {
      console.error("Error loading SQL data:", error);
    }
  };

  const loadSharePointData = async (cursor = null) => {
    try {
      const listId = template.sharepoint_list_id || "09_TBL_OnSite";

      // Construir filtro OData
      let filters = [];

      // Filtro por nombre de cliente (razon social) para usuarios cliente
      if (isClientUser && companyName) {
        filters.push(`startswith(NombreCliente,'${companyName}')`);
      }

      // Filtro por fechas
      if (dateFrom) {
        filters.push(`${dateFilterField} ge '${dateFrom}'`);
      }
      if (dateTo) {
        filters.push(`${dateFilterField} le '${dateTo}'`);
      }

      const filterQuery = filters.length > 0 ? filters.join(" and ") : "";

      const params = new URLSearchParams();
      if (filterQuery) params.append("$filter", filterQuery);
      params.append("$top", "100");
      params.append("$orderby", `${dateFilterField} desc`);

      let url = `/api/microsoft-graph/lists/${listId}/items`;
      if (cursor) {
        url = cursor;
      } else if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await api.get(url);

      if (response.data?.success) {
        const newItems = response.data.data || [];
        const newNextLink = response.data.nextLink || null;

        setItems(prev => cursor ? [...prev, ...newItems] : newItems);
        setNextLink(newNextLink);
        setHasMore(!!newNextLink);
      }
    } catch (error) {
      console.error("Error loading SharePoint data:", error);
    }
  };

  const loadMore = () => {
    if (nextLink && !loadingItems) {
      loadData(nextLink);
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleClearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setSearchTerm("");
  };

  // Handler para cuando el iframe termina de cargar
  const handleIframeLoad = () => {
    // Delay más largo para asegurar que Power BI termine de renderizar
    setTimeout(() => {
      setIframeLoading(false);
    }, 2500);
  };

  const handleExportCSV = () => {
    if (items.length === 0) {
      handleSnackbar("No hay datos para exportar", "error");
      return;
    }

    const headers = DEFAULT_COLUMNS.map(col => col.label);
    const rows = filteredItems.map(item =>
      DEFAULT_COLUMNS.map(col => {
        const value = item.fields?.[col.key] || item[col.key] || "";
        if (col.type === "date" && value) {
          return new Date(value).toLocaleDateString("es-CL");
        }
        return value;
      })
    );

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${template?.name || "reporte"}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  // Filtrar items localmente por busqueda
  const filteredItems = items.filter(item => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return DEFAULT_COLUMNS.some(col => {
      const value = (item.fields?.[col.key] || item[col.key])?.toString().toLowerCase() || "";
      return value.includes(search);
    });
  });

  const formatValue = (value, type) => {
    if (!value) return "-";
    if (type === "date") {
      return new Date(value).toLocaleDateString("es-CL");
    }
    if (type === "number") {
      return Number(value).toLocaleString("es-CL");
    }
    return value;
  };

  // Determinar si mostrar iframe
  // Prioridad: companyReport.report_url > template.report_url > template.filepath
  const effectiveReportUrl = companyReport?.report_url || template?.report_url || template?.filepath;
  // Mostrar iframe si hay URL o si el tipo de origen es iframe/mixed
  const showIframe = !!effectiveReportUrl || template?.origin_type === "iframe" || template?.origin_type === "mixed";
  const iframeUrl = effectiveReportUrl;

  // Resetear loading cuando cambia el tab a iframe
  useEffect(() => {
    if (activeTab === "iframe") {
      setIframeLoading(true);
      // Timeout de seguridad más largo para reportes pesados
      const timeout = setTimeout(() => {
        setIframeLoading(false);
      }, 8000);
      return () => clearTimeout(timeout);
    }
  }, [activeTab, iframeUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
      
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {templateType === "certificate" ? (
                <Award className="w-7 h-7 text-amber-600" />
              ) : (
                <FileText className="w-7 h-7 text-blue-600" />
              )}
              {template?.name}
            </h1>
            <p className="text-gray-500 text-sm">Visualización de Reporte</p>
          </div>
        </div>

        {companyName && (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">{companyName}</span>
          </div>
        )}
      </div>

      {/* Tabs - Orden dinámico: si hay report_url configurado, iframe va primero */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {/* Si hay URL de reporte configurada, mostrar iframe primero */}
          {showIframe && iframeUrl && companyReport?.report_url && (
            <button
              onClick={() => setActiveTab("iframe")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "iframe"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              Dashboard
            </button>
          )}
          <button
            onClick={() => setActiveTab("data")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "data"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Table className="w-4 h-4" />
            Detalle
          </button>
          {/* Si NO hay report_url de empresa pero sí hay URL de template, mostrar iframe después */}
          {showIframe && iframeUrl && !companyReport?.report_url && (
            <button
              onClick={() => setActiveTab("iframe")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "iframe"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <ExternalLink className="w-4 h-4" />
              Reporte Visual
            </button>
          )}
        </nav>
      </div>

      {/* Contenido de tabs */}
      {activeTab === "data" && (
        <div className="space-y-4">
          {/* Barra de herramientas */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                icon={Filter}
              >
                Filtros
              </Button>
              <Button variant="outline" size="sm" onClick={handleRefresh} icon={RefreshCcw}>
                Actualizar
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportCSV} icon={Download}>
                Exportar CSV
              </Button>
            </div>

            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar en resultados..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Panel de filtros */}
          {showFilters && (
            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">Filtros de fecha</h3>
                <button onClick={handleClearFilters} className="text-sm text-blue-600 hover:underline">
                  Limpiar filtros
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campo de fecha
                  </label>
                  <select
                    value={dateFilterField}
                    onChange={(e) => setDateFilterField(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="FechaProgramada">Fecha Programada</option>
                    <option value="FechaEjecucion">Fecha Ejecucion</option>
                    <option value="Created">Fecha Creacion</option>
                    <option value="Modified">Fecha Modificacion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Desde
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hasta
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tabla de datos */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {loadingItems ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <Table className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No hay datos</h3>
                <p className="text-gray-500 mt-1">
                  No se encontraron registros con los filtros aplicados
                </p>
              </div>
            ) : (
              <div ref={tableContainerRef} className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      {DEFAULT_COLUMNS.map((col) => (
                        <th
                          key={col.key}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredItems.map((item, index) => (
                      <tr key={item.id || index} className="hover:bg-gray-50">
                        {DEFAULT_COLUMNS.map((col) => (
                          <td
                            key={col.key}
                            className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap"
                          >
                            {formatValue(item.fields?.[col.key] || item[col.key], col.type)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Cargar mas */}
            {hasMore && (
              <div className="p-4 border-t border-gray-200 text-center">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={loadingItems}
                >
                  {loadingItems ? "Cargando..." : "Cargar mas registros"}
                </Button>
              </div>
            )}

            {/* Contador de registros */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
              Mostrando {filteredItems.length} de {items.length} registros
              {hasMore && " (hay mas disponibles)"}
            </div>
          </div>
        </div>
      )}

      {activeTab === "iframe" && iframeUrl && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <h3 className="font-medium text-gray-900">Reporte Visual</h3>
            <a
              href={`/report-fullscreen?url=${btoa(iframeUrl)}&title=${encodeURIComponent(template?.name || 'Reporte')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
            >
              Ver en pantalla completa <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          {/* Container con overflow-hidden para ocultar controles del iframe */}
          <div className="relative overflow-hidden" style={{ height: '700px' }}>
            {/* Loader overlay */}
            <div
              className={`absolute inset-0 bg-white flex flex-col items-center justify-center z-10 transition-opacity duration-300 ${
                iframeLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-sm text-gray-600">Cargando reporte...</p>
            </div>
            <iframe
              src={iframeUrl}
              className="w-full border-0"
              style={{ height: 'calc(100% + 56px)' }}
              title="Reporte Visual"
              sandbox="allow-scripts allow-same-origin allow-popups"
              onLoad={handleIframeLoad}
            />
          </div>
        </div>
      )}
    </div>
  );
}
