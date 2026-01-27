import { useState, useEffect, useMemo } from "react";
import { Modal } from "../../components/ui/Modal";
import GenericTable from "../../components/common/GenericTable";
import TableActions from "../../components/common/TableActions";
import { useTableLogic } from "../../hooks/useTableLogic";
import { useModals } from "../../hooks/useModals";
import {
  getCertificateExports,
  deleteCertificateExport,
  verifyCertificate,
  downloadCertificateExport,
  downloadCertificateVersion,
} from "../../services/certificateExportService";
import { getCompaniesList } from "../../services/companyService";
import { handleSnackbar } from "../../utils/messageHelpers";
import {
  Award,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Calendar,
  User,
  Building2,
  Copy,
  Search,
  ShieldCheck,
  FileText,
  Hash,
  Download,
  Layers,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/auth";

export default function CertificateExportsView() {
  const { session } = useAuth();
  const userRole = session?.user?.role;
  const isAdmin = userRole === "root" || userRole === "admin";

  const [exports, setExports] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [trigger, setTrigger] = useState(0);

  // Estado para verificación de certificado
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  // Estado para modal de versiones
  const [versionsModalOpen, setVersionsModalOpen] = useState(false);
  const [selectedExport, setSelectedExport] = useState(null);
  const [downloadingVersionId, setDownloadingVersionId] = useState(null);

  const { modals, openConfirm, closeModal, openModal } = useModals();

  // Cargar empresas para admin
  useEffect(() => {
    if (isAdmin) {
      loadCompanies();
    }
  }, [isAdmin]);

  const loadCompanies = async () => {
    try {
      const response = await getCompaniesList();
      if (response.success && response.data) {
        setCompanies(response.data);
      }
    } catch (error) {
      console.error("Error loading companies:", error);
    }
  };

  // Efecto para mostrar loader cuando cambia la empresa
  useEffect(() => {
    if (selectedCompanyId) {
      setGlobalLoading(true);
      const timer = setTimeout(() => {
        setGlobalLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedCompanyId]);

  // Filtrar datos por empresa y fechas
  const filteredByCompany = useMemo(() => {
    let filtered = exports;

    if (selectedCompanyId) {
      filtered = filtered.filter((exp) => exp.company_id === parseInt(selectedCompanyId));
    }

    if (dateFrom) {
      filtered = filtered.filter((exp) => {
        const expDate = exp.created_at?.split(" ")[0];
        return expDate >= dateFrom;
      });
    }

    if (dateTo) {
      filtered = filtered.filter((exp) => {
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
      "certificate_name",
      "certificate_code",
      "automatic_code",
      "validation_code",
      "company.business_name",
      "company.rut",
      "user.name",
      "status",
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
      const response = await getCertificateExports({ per_page: 1000 });
      if (response.success && response.data) {
        const exportData = Array.isArray(response.data)
          ? response.data
          : response.data.data || [];
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
    { key: "certificate_name", label: "Certificado" },
    { key: "automatic_code", label: "Código", sortable: false },
    ...(isAdmin ? [{ key: "company", label: "Empresa" }] : []),
    { key: "filters", label: "Periodo", sortable: false },
    { key: "versions", label: "Versiones", sortable: false },
    { key: "status", label: "Estado" },
    ...(isAdmin ? [{ key: "user", label: "Usuario" }] : []),
    { key: "created_at", label: "Fecha" },
    { key: "actions", label: "Acciones", sortable: false, headerClassName: "text-center" },
  ];

  // Abrir modal de versiones
  const handleOpenVersions = (record) => {
    setSelectedExport(record);
    setVersionsModalOpen(true);
  };

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

  // Copiar código al portapapeles
  const handleCopyCode = (code, type = "código") => {
    navigator.clipboard.writeText(code);
    handleSnackbar(`${type} copiado al portapapeles`, "success");
  };

  // Eliminar exportación
  const handleDelete = (record) => {
    openConfirm({
      title: "Eliminar Registro",
      msg: (
        <div>
          <p>
            ¿Está seguro que desea eliminar el registro de exportación{" "}
            <strong>{record.automatic_code}</strong>?
          </p>
          <p className="text-sm text-red-600 mt-2">Esta acción no se puede deshacer.</p>
        </div>
      ),
      actionLabel: "Eliminar",
      variant: "danger",
      onConfirm: async () => {
        const response = await deleteCertificateExport(record.id);
        handleSnackbar(
          response.success ? "Registro eliminado correctamente" : response.message,
          response.success ? "success" : "error"
        );
        closeModal("confirm");
        if (response.success) {
          setTrigger((prev) => prev + 1);
        }
      },
    });
  };

  // Descargar certificado
  const handleDownload = async (record) => {
    try {
      handleSnackbar("Generando certificado...", "info");
      const response = await downloadCertificateExport(record.id);

      if (response && response.data) {
        // Crear blob y descargar
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `certificado_${record.automatic_code}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        handleSnackbar("Certificado descargado correctamente", "success");
      } else {
        handleSnackbar("Error al descargar el certificado", "error");
      }
    } catch (error) {
      console.error("Error downloading certificate:", error);
      handleSnackbar("Error al descargar el certificado", "error");
    }
  };

  // Descargar versión específica
  const handleDownloadVersion = async (version) => {
    try {
      setDownloadingVersionId(version.id);
      handleSnackbar("Generando certificado versión " + version.version_number + "...", "info");
      const response = await downloadCertificateVersion(version.id);

      if (response && response.data) {
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `certificado_${selectedExport?.automatic_code}_v${version.version_number}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        handleSnackbar("Certificado descargado correctamente", "success");
      } else {
        handleSnackbar("Error al descargar el certificado", "error");
      }
    } catch (error) {
      console.error("Error downloading version:", error);
      handleSnackbar("Error al descargar el certificado", "error");
    } finally {
      setDownloadingVersionId(null);
    }
  };

  // Configuración de acciones por fila
  const getRowActions = (record) => {
    const actions = [
      {
        icon: Download,
        onClick: () => handleDownload(record),
        title: "Descargar certificado",
        className: "text-amber-600 hover:text-amber-900 hover:bg-amber-50",
      },
    ];


    // Mostrar versiones si hay más de una
    if (record.versions_count > 0) {
      actions.push({
        icon: Layers,
        onClick: () => handleOpenVersions(record),
        title: `Historial de versiones`,
        className: "text-purple-600 hover:text-purple-900 hover:bg-purple-50",
      });
    }

    if (isAdmin) {
      actions.push({
        icon: Trash2,
        variant: "danger",
        onClick: () => handleDelete(record),
        title: "Eliminar",
      });
    }

    return actions;
  };

  // Formatear período
  const formatFilters = (filters) => {
    if (!filters) return "-";

    if (filters.month && filters.year) {
      const monthNames = [
        "",
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ];
      return `${monthNames[parseInt(filters.month)] || filters.month} ${filters.year}`;
    }

    if (filters.date_from && filters.date_to) {
      return `${filters.date_from} → ${filters.date_to}`;
    }

    return "-";
  };

  // Renderizado de filas
  const renderRow = (record) => {
    return (
      <tr key={record.id} className="border-t hover:bg-gray-50">
        <td className="px-3 py-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded flex items-center justify-center bg-amber-50">
              <Award className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">{record.certificate_name}</div>
              <div className="text-xs text-gray-500">{record.certificate_code}</div>
            </div>
          </div>
        </td>
        <td className="px-3 py-2">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Hash className="w-3 h-3 text-gray-400" />
              <code className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                {record.automatic_code}
              </code>
            </div>
            {record.validation_code && (
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-green-500" />
                <code className="text-xs font-mono text-green-600">
                  {record.validation_code}
                </code>
              </div>
            )}
          </div>
        </td>
        {isAdmin && (
          <td className="px-3 py-2">
            <div className="font-medium text-gray-900">
              {record.company?.business_name || "-"}
            </div>
            <div className="text-xs text-gray-500">{record.company?.rut || ""}</div>
          </td>
        )}
        <td className="px-3 py-2">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatFilters(record.filters)}</span>
          </div>
          {record.filters?.branch_code && (
            <div className="text-xs text-gray-500 mt-0.5">
              Sucursal: {record.filters.branch_code}
            </div>
          )}
        </td>
        <td className="px-3 py-2">
          {record.versions_count > 0 ? (
            <button
              onClick={() => handleOpenVersions(record)}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors"
            >
              <Layers className="w-3 h-3" />
              {record.versions_count} {record.versions_count === 1 ? "versión" : "versiones"}
              <ChevronRight className="w-3 h-3" />
            </button>
          ) : (
            <span className="text-xs text-gray-400">Sin versiones</span>
          )}
        </td>
        <td className="px-3 py-2">{renderStatusBadge(record.status)}</td>
        {isAdmin && (
          <td className="px-3 py-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-sm text-gray-900">{record.user?.name || "-"}</div>
                <div className="text-xs text-gray-500">{record.user?.email || ""}</div>
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
          <div className="w-12 h-12 border-4 border-gray-200 border-t-amber-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-gray-600 font-medium">Cargando datos...</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-bradford-navy mb-2">
            Historial de Certificados
          </h2>
          <p className="text-bradford-navy/70">
            Consulta el historial de certificados generados
          </p>
        </div>

        {/* Selector de empresa para admin */}
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-600" />
            <select
              value={selectedCompanyId}
              onChange={(e) => {
                setSelectedCompanyId(e.target.value);
                setPage(1);
              }}
              className="min-w-[250px] px-3 py-2 text-sm border border-amber-200 rounded-lg bg-amber-50 text-amber-800 font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
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
          <h3 className="font-medium text-gray-900">Filtros y busqueda</h3>
          {(dateFrom || dateTo || q) && (
            <button
              onClick={() => {
                setDateFrom("");
                setDateTo("");
                setQ("");
                setPage(1);
              }}
              className="text-sm text-amber-600 hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-end gap-4">
          {/* Busqueda */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <input
              type="text"
              placeholder="Buscar por certificado, codigo, empresa..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Fecha desde */}
          <div className="min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Fecha hasta */}
          <div className="min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="mt-3 text-sm text-gray-500">
          {filteredData.length} resultado{filteredData.length !== 1 ? "s" : ""} encontrado
          {filteredData.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Tabla */}
      <GenericTable
        title="Certificados generados"
        loading={loading}
        columns={columns}
        data={filteredData}
        pageData={pageData}
        emptyMessage="No hay certificados generados"
        emptyIcon={Award}
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

      {/* Modal de confirmacion */}
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

      {/* Modal de versiones */}
      <Modal
        open={versionsModalOpen}
        onClose={() => {
          setVersionsModalOpen(false);
          setSelectedExport(null);
        }}
        title={
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-600" />
            <span>Historial de Versiones</span>
          </div>
        }
        size="xl"
        actions={[
          {
            label: "Cerrar",
            variant: "outline",
            onClick: () => {
              setVersionsModalOpen(false);
              setSelectedExport(null);
            },
          },
        ]}
      >
        {selectedExport && (
          <div className="space-y-4">
            {/* Info del certificado */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 text-amber-600" />
                <div>
                  <div className="font-medium text-gray-900">
                    {selectedExport.certificate_name}
                  </div>
                  <code className="text-sm font-mono text-gray-600">
                    {selectedExport.automatic_code}
                  </code>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Periodo: {formatFilters(selectedExport.filters)}
              </div>
            </div>

            {/* Lista de versiones */}
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Versión
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código de Validación
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Generado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descargar
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedExport.versions && selectedExport.versions.length > 0 ? (
                    selectedExport.versions.map((version, index) => (
                      <tr
                        key={version.id}
                        className={index === 0 ? "bg-purple-50" : "hover:bg-gray-50"}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-medium">
                              v{version.version_number}
                            </span>
                            {index === 0 && (
                              <span className="px-2 py-0.5 text-xs bg-purple-200 text-purple-800 rounded-full">
                                Última
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={() =>
                              handleCopyCode(version.validation_code, "Código de validación")
                            }
                            className="flex items-center gap-1 font-mono text-sm text-green-600 hover:text-green-800"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {version.validation_code}
                          </button>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {version.generated_at || "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {version.user?.name || "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleDownloadVersion(version)}
                            disabled={downloadingVersionId === version.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Descargar esta versión"
                          >
                            {downloadingVersionId === version.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Download className="w-3.5 h-3.5" />
                            )}
                            PDF
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                        No hay versiones registradas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="text-xs text-gray-500 p-2 bg-blue-50 border border-blue-200 rounded">
              <strong>💡 Tip:</strong> Haz clic en el botón PDF para descargar cada versión con los datos exactos de ese momento.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
