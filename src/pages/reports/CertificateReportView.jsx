// File: src/pages/reports/CertificateReportView.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, FileText, Table, ExternalLink, Calendar,
  Download, RefreshCcw, Loader2, Filter, ChevronDown, X,
  Building2, Search
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/auth";
import { getCertificateTemplateById } from "../../services/companyService";
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

export default function CertificateReportView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();

  // Estados generales
  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState(null);
  const [activeTab, setActiveTab] = useState("sharepoint");

  // Estados para SharePoint
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

  // Informacion del usuario
  const companyName = session?.user?.company?.business_name || "";
  // El AuthService devuelve 'role' directamente (no profile.code)
  const isClientUser = session?.user?.role === "cliente";
  const companyId = session?.user?.company_id;

  // Lista SharePoint configurada
  const SHAREPOINT_LIST_ID = "09_TBL_OnSite";

  const tableContainerRef = useRef(null);

  useEffect(() => {
    loadCertificate();
  }, [id]);

  useEffect(() => {
    if (certificate) {
      loadSharePointData();
    }
  }, [certificate, dateFrom, dateTo, dateFilterField]);

  const loadCertificate = async () => {
    setLoading(true);
    try {
      const response = await getCertificateTemplateById(id);
      if (response.success) {
        setCertificate(response.data);
      } else {
        handleSnackbar("Certificado no encontrado", "error");
        navigate("/dashboard/reportes");
      }
    } catch (error) {
      console.error("Error loading certificate:", error);
      handleSnackbar("Error al cargar certificado", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadSharePointData = async (cursor = null) => {
    if (!cursor) {
      setLoadingItems(true);
      setItems([]);
    }

    try {
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

      let url = `/api/microsoft-graph/lists/${SHAREPOINT_LIST_ID}/items`;
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
      handleSnackbar("Error al cargar datos de SharePoint", "error");
    } finally {
      setLoadingItems(false);
    }
  };

  const loadMore = () => {
    if (nextLink && !loadingItems) {
      loadSharePointData(nextLink);
    }
  };

  const handleRefresh = () => {
    loadSharePointData();
  };

  const handleClearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setSearchTerm("");
  };

  const handleExportCSV = () => {
    if (items.length === 0) {
      handleSnackbar("No hay datos para exportar", "error");
      return;
    }

    const headers = DEFAULT_COLUMNS.map(col => col.label);
    const rows = filteredItems.map(item =>
      DEFAULT_COLUMNS.map(col => {
        const value = item.fields?.[col.key] || "";
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
    link.download = `${certificate?.name || "reporte"}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  // Filtrar items localmente por busqueda
  const filteredItems = items.filter(item => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return DEFAULT_COLUMNS.some(col => {
      const value = item.fields?.[col.key]?.toString().toLowerCase() || "";
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
          <Button variant="ghost" onClick={() => navigate("/dashboard/reportes")} icon={ArrowLeft}>
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-7 h-7 text-blue-600" />
              {certificate?.name}
            </h1>
            <p className="text-gray-500 text-sm">{certificate?.code}</p>
          </div>
        </div>

        {companyName && (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">{companyName}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab("sharepoint")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "sharepoint"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Table className="w-4 h-4" />
            Datos SharePoint
          </button>
          {certificate?.filepath && (
            <button
              onClick={() => setActiveTab("onsite")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "onsite"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <ExternalLink className="w-4 h-4" />
              Reporte OnSite
            </button>
          )}
        </nav>
      </div>

      {/* Contenido de tabs */}
      {activeTab === "sharepoint" && (
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
                            {formatValue(item.fields?.[col.key], col.type)}
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

      {activeTab === "onsite" && certificate?.filepath && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <h3 className="font-medium text-gray-900">Reporte OnSite</h3>
            <a
              href={certificate.filepath}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
            >
              Abrir en nueva ventana <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <iframe
            src={certificate.filepath}
            className="w-full h-[700px] border-0"
            title="Reporte OnSite"
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        </div>
      )}
    </div>
  );
}
