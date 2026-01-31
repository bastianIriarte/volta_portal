import { useState, useEffect, useMemo } from "react";
import { Modal } from "../../components/ui/Modal";
import GenericTable from "../../components/common/GenericTable";
import TableActions from "../../components/common/TableActions";
import { useTableLogic } from "../../hooks/useTableLogic";
import { useModals } from "../../hooks/useModals";
import {
  getReportExports,
  deleteReportExport,
} from "../../services/reportExportService";
import { handleSnackbar } from "../../utils/messageHelpers";
import {
  FileSpreadsheet,
  Download,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ExternalLink,
  Calendar,
  User,
  Building2,
} from "lucide-react";
import { useAuth } from "../../context/auth";

export default function ReportExportsView() {
  const { session } = useAuth();
  const userRole = session?.user?.role;
  const isAdmin = userRole === "root" || userRole === "admin";
  const companyId = session?.user?.company_id;

  const [exports, setExports] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [trigger, setTrigger] = useState(0);

  const { modals, openConfirm, closeModal } = useModals();

  const companies = session?.user?.companies || [];

  // Auto-seleccionar empresa: si hay 1 sola, seleccionarla; si hay varias, seleccionar la principal
  useEffect(() => {
    if (companies.length === 1 && !selectedCompanyId) {
      setSelectedCompanyId(String(companies[0].id));
    } else if (companies.length > 1 && !selectedCompanyId && companyId) {
      setSelectedCompanyId(String(companyId));
    }
  }, [companies]);

  // Efecto para mostrar loader cuando cambia la empresa
  useEffect(() => {
    if (selectedCompanyId) {
      setGlobalLoading(true);
      // Simular un pequeño delay para el efecto visual
      const timer = setTimeout(() => {
        setGlobalLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedCompanyId]);

  // Filtrar datos por empresa y fechas
  const filteredByCompany = useMemo(() => {
    let filtered = exports;

    // Filtrar por empresa
    if (selectedCompanyId) {
      filtered = filtered.filter(exp => exp.company_id === parseInt(selectedCompanyId));
    }

    // Filtrar por fecha desde
    if (dateFrom) {
      filtered = filtered.filter(exp => {
        const expDate = exp.created_at?.split(" ")[0]; // "2026-01-20 21:17:42" -> "2026-01-20"
        return expDate >= dateFrom;
      });
    }

    // Filtrar por fecha hasta
    if (dateTo) {
      filtered = filtered.filter(exp => {
        const expDate = exp.created_at?.split(" ")[0];
        return expDate <= dateTo;
      });
    }

    return filtered;
  }, [exports, selectedCompanyId, dateFrom, dateTo]);

  // Configuración de la tabla
  const tableConfig = {
    defaultSort: "created_at",
    defaultSortDir: "desc",
    pageSize: 10,
    searchFields: [
      "report_name",
      "report_code",
      "company_name",
      "company_rut",
      "user_name",
      "status",
      "created_at",
    ],
  };

  const {
    q,
    setQ,
    sortBy,
    sortDir,
    page,
    setPage,
    filteredData,
    pageData,
    totalPages,
    handleSort,
  } = useTableLogic(filteredByCompany, tableConfig);

  // Cargar datos
  const fetchList = async () => {
    try {
      setLoading(true);
      const response = await getReportExports({ per_page: 1000 });
      if (response.success && response.data) {
        const exportData = Array.isArray(response.data)
          ? response.data
          : (response.data.data || []);
        setExports(exportData);
      }
    } catch (error) {
      console.error("Error al obtener exportaciones:", error);
      handleSnackbar("Error al cargar las exportaciones", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    setPage(1);
  }, [trigger]);

  // Configuración de columnas
  const columns = [
    { key: "report_name", label: "Reporte" },
    ...(isAdmin ? [{ key: "company_name", label: "Empresa" }] : []),
    { key: "filters", label: "Período", sortable: false },
    { key: "status", label: "Estado" },
    { key: "rows_exported", label: "Registros" },
    ...(isAdmin ? [{ key: "user_name", label: "Usuario" }] : []),
    { key: "created_at", label: "Fecha" },
    { key: "actions", label: "Acciones", sortable: false, headerClassName: "text-center" },
  ];

  // Renderizar badge de estado
  const renderStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        icon: Clock,
        label: "Pendiente",
        className: "bg-yellow-100 text-yellow-800",
      },
      processing: {
        icon: Loader2,
        label: "Procesando",
        className: "bg-blue-100 text-blue-800",
      },
      completed: {
        icon: CheckCircle,
        label: "Completado",
        className: "bg-green-100 text-green-800",
      },
      failed: {
        icon: XCircle,
        label: "Fallido",
        className: "bg-red-100 text-red-800",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.className}`}
      >
        <Icon className={`w-3 h-3 ${status === "processing" ? "animate-spin" : ""}`} />
        {config.label}
      </span>
    );
  };

  // Funciones de acciones
  const handleDelete = (record) => {
    openConfirm({
      title: "Eliminar Exportación",
      msg: (
        <div>
          <p>
            ¿Está seguro que desea eliminar la exportación{" "}
            <strong>{record.file_name}</strong>?
          </p>
          <p className="text-sm text-red-600 mt-2">
            Esta acción eliminará el archivo y no se puede deshacer.
          </p>
        </div>
      ),
      actionLabel: "Eliminar",
      variant: "danger",
      onConfirm: async () => {
        const response = await deleteReportExport(record.id);
        handleSnackbar(
          response.success ? "Exportación eliminada correctamente" : response.message,
          response.success ? "success" : "error"
        );
        closeModal("confirm");
        if (response.success) {
          setTrigger((prev) => prev + 1);
        }
      },
    });
  };

  const handleDownload = (record) => {
    if (record.file_url) {
      window.open(record.file_url, "_blank");
    }
  };

  // Configuración de acciones por fila
  const getRowActions = (record) => {
    const actions = [];

    if (record.status === "completed" && record.file_url) {
      actions.push({
        icon: Download,
        onClick: () => handleDownload(record),
        title: "Descargar",
        className: "text-green-600 hover:text-green-900 hover:bg-green-50",
      });
    }

    actions.push({
      icon: Trash2,
      variant: "danger",
      onClick: () => handleDelete(record),
      title: "Eliminar",
    });

    return actions;
  };

  // Renderizado de filas
  const renderRow = (record) => {
    const filters = record.filters || {};
    const dateFrom = filters.date_from || "-";
    const dateTo = filters.date_to || "-";

    return (
      <tr key={record.id} className="border-t hover:bg-gray-50">
        <td className="px-3 py-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded flex items-center justify-center bg-green-50">
              <FileSpreadsheet className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">{record.report_name}</div>
              <div className="text-xs text-gray-500">{record.report_code}</div>
            </div>
          </div>
        </td>
        {isAdmin && (
          <td className="px-3 py-2">
            <div className="font-medium text-gray-900">{record.company_name}</div>
            <div className="text-xs text-gray-500">{record.company_rut}</div>
          </td>
        )}
        <td className="px-3 py-2">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Calendar className="w-3.5 h-3.5" />
            <span>{dateFrom}</span>
            <span>→</span>
            <span>{dateTo}</span>
          </div>
        </td>
        <td className="px-3 py-2">{renderStatusBadge(record.status)}</td>
        <td className="px-3 py-2">
          <span className="font-medium text-gray-900">
            {record.rows_exported?.toLocaleString() || 0}
          </span>
        </td>
        {isAdmin && (
          <td className="px-3 py-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-sm text-gray-900">{record.user_name}</div>
                <div className="text-xs text-gray-500">{record.user_email}</div>
              </div>
            </div>
          </td>
        )}
        <td className="px-3 py-2">
          <span className="text-sm text-gray-500">{record.created_at || "-"}</span>
        </td>
        <td className="px-3 py-2">
          <TableActions actions={getRowActions(record)} className="justify-center" />
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      {/* Loader global overlay */}
      {globalLoading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-gray-600 font-medium">Cargando datos...</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-bradford-navy mb-2">
            Reportes Descargados
          </h2>
          <p className="text-bradford-navy/70">
            Consulta y descarga los reportes exportados a Excel
          </p>
        </div>

        {/* Selector de empresa (multi-empresa) */}
        {companies.length > 1 && (
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <select
              value={selectedCompanyId}
              onChange={(e) => {
                setSelectedCompanyId(e.target.value);
                setPage(1);
              }}
              className="min-w-[250px] px-3 py-2 text-sm border border-blue-200 rounded-lg bg-blue-50 text-blue-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas las empresas</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.business_name} {company.rut ? `(${company.rut})` : ""}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">Filtros y búsqueda</h3>
          {(dateFrom || dateTo || q) && (
            <button
              onClick={() => {
                setDateFrom("");
                setDateTo("");
                setQ("");
                setPage(1);
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-end gap-4">
          {/* Búsqueda */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              placeholder="Buscar por reporte, empresa o usuario..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Fecha desde */}
          <div className="min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Desde
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Fecha hasta */}
          <div className="min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hasta
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="mt-3 text-sm text-gray-500">
          {filteredData.length} resultado{filteredData.length !== 1 ? "s" : ""} encontrado{filteredData.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Tabla */}
      <GenericTable
        title="Historial de descargadas"
        loading={loading}
        columns={columns}
        data={filteredData}
        pageData={pageData}
        emptyMessage="No hay descargas registradas"
        emptyIcon={FileSpreadsheet}
        searchQuery={q}
        onClearSearch={() => setQ("")}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={handleSort}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalResults={filteredData.length}
        renderRow={renderRow}
      />

      {/* Modal de confirmación */}
      <Modal
        open={!!modals.confirm}
        onClose={() => closeModal("confirm")}
        title={modals.confirm?.title}
        variant="warn"
        actions={[
          {
            label: "Cancelar",
            variant: "outline",
            onClick: () => closeModal("confirm"),
          },
          {
            label: modals.confirm?.actionLabel || "Confirmar",
            variant: modals.confirm?.variant || "primary",
            onClick: modals.confirm?.onConfirm,
          },
        ]}
      >
        {modals.confirm?.msg}
      </Modal>
    </div>
  );
}
