import { useState, useEffect } from "react";
import { Button } from "../../components/ui/Button.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import GenericFilters from "../../components/common/GenericFilters.jsx";
import GenericTable from "../../components/common/GenericTable.jsx";
import TableActions from "../../components/common/TableActions.jsx";
import { useModals } from "../../hooks/useModals.js";
import { handleSnackbar } from "../../utils/messageHelpers.js";
import TableProcessorFormModal from "./components/TableProcessorFormModal.jsx";
import {
  Table2,
  Eye,
  Edit2,
  Trash2,
  Play,
  Loader2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Code2,
  Info,
  Database,
} from "lucide-react";
import {
  getTableProcessors,
  createTableProcessor,
  updateTableProcessor,
  deleteTableProcessor,
  previewTableProcessor,
  getDataSources,
} from "../../services/dataSourceService.js";
import { useTableLogic } from "../../hooks/useTableLogic.js";

const emptyForm = {
  name: "",
  code: "",
  description: "",
  data_source_id: "",
};

export default function TableProcessorsView() {
  const [processors, setProcessors] = useState([]);
  const [dataSources, setDataSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trigger, setTrigger] = useState(0);

  // Modal de formulario
  const [formModal, setFormModal] = useState({ open: false, mode: "create", data: null });
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formApiError, setFormApiError] = useState(null);

  // Modal de preview
  const [previewModal, setPreviewModal] = useState({ open: false, processor: null });
  const [previewResult, setPreviewResult] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [previewParams, setPreviewParams] = useState({});

  const { modals, openConfirm, closeModal } = useModals();

  // Configuración de la tabla
  const tableConfig = {
    defaultSort: "id",
    defaultSortDir: "desc",
    pageSize: 10,
    searchFields: ["id", "name", "code", "description"],
  };

  const { q, setQ, sortBy, sortDir, page, setPage, filteredData, pageData, totalPages, handleSort } =
    useTableLogic(processors, tableConfig);

  // Cargar datos
  const fetchData = async () => {
    try {
      setLoading(true);
      const [processorsRes, dataSourcesRes] = await Promise.all([
        getTableProcessors(),
        getDataSources(),
      ]);

      if (processorsRes.success) {
        setProcessors(processorsRes.data || []);
      }
      if (dataSourcesRes.success) {
        setDataSources(dataSourcesRes.data || []);
      }
    } catch (error) {
      console.error("Error:", error);
      handleSnackbar("Error al cargar datos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setPage(1);
  }, [trigger]);

  // Columnas de la tabla
  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Procesador" },
    { key: "code", label: "Código" },
    { key: "data_source", label: "Origen de Datos", sortable: false },
    { key: "status", label: "Estado", sortable: false },
    { key: "actions", label: "Acciones", sortable: false, headerClassName: "text-center" },
  ];

  // Abrir modal de crear
  const handleCreate = () => {
    setFormData(emptyForm);
    setFormApiError(null);
    setFormModal({ open: true, mode: "create", data: null });
  };

  // Abrir modal de editar
  const handleEdit = (processor) => {
    setFormData({
      name: processor.name || "",
      code: processor.code || "",
      description: processor.description || "",
      data_source_id: processor.data_source_id || "",
    });
    setFormApiError(null);
    setFormModal({ open: true, mode: "edit", data: processor });
  };

  // Cerrar modal de formulario
  const handleCloseForm = () => {
    setFormModal({ open: false, mode: "create", data: null });
    setFormApiError(null);
  };

  // Guardar
  const handleSave = async () => {
    setFormApiError(null);

    try {
      setSaving(true);
      let response;
      if (formModal.mode === "create") {
        response = await createTableProcessor(formData);
      } else {
        response = await updateTableProcessor(formModal.data.id, formData);
      }

      if (response.success) {
        handleSnackbar(response.message || "Guardado exitosamente", "success");
        handleCloseForm();
        setTrigger((prev) => prev + 1);
      } else {
        setFormApiError(response.message || "Error al guardar");
      }
    } catch (error) {
      setFormApiError(error.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  // Eliminar
  const handleDelete = (processor) => {
    openConfirm({
      title: "Eliminar Procesador",
      msg: (
        <div>
          <p>
            ¿Está seguro que desea eliminar el procesador <strong>{processor.name}</strong>?
          </p>
          <p className="text-sm text-red-600 mt-2">
            Esta acción no se puede deshacer. Los certificados que usen este procesador podrían verse afectados.
          </p>
        </div>
      ),
      variant: "danger",
      actionLabel: "Eliminar",
      onConfirm: async () => {
        try {
          const response = await deleteTableProcessor(processor.id);
          if (response.success) {
            handleSnackbar("Procesador eliminado", "success");
            setTrigger((prev) => prev + 1);
          } else {
            handleSnackbar(response.message || "Error al eliminar", "error");
          }
        } catch (error) {
          handleSnackbar("Error al eliminar", "error");
        }
        closeModal("confirm");
      },
    });
  };

  // Preview
  const handlePreview = (processor) => {
    setPreviewModal({ open: true, processor });
    setPreviewResult(null);
    setPreviewParams({});
  };

  const runPreview = async () => {
    const processor = previewModal.processor;
    if (!processor) return;

    setPreviewing(true);
    setPreviewResult(null);

    try {
      const response = await previewTableProcessor(processor.id, previewParams);
      if (response.success) {
        setPreviewResult({ success: true, ...response.data });
      } else {
        setPreviewResult({ success: false, error: response.message });
      }
    } catch (error) {
      setPreviewResult({ success: false, error: error.message });
    } finally {
      setPreviewing(false);
    }
  };

  // Acciones por fila
  const getRowActions = () => [
    {
      label: "",
      icon: Eye,
      variant: "outline",
      onClick: handlePreview,
      title: "Ver preview",
      className: "text-cyan-600 hover:text-cyan-900 hover:bg-cyan-50",
    },
    {
      label: "",
      icon: Edit2,
      variant: "outline",
      onClick: handleEdit,
      title: "Editar procesador",
      className: "text-emerald-600 hover:text-emerald-900 hover:bg-emerald-50",
    },
    {
      icon: Trash2,
      variant: "danger",
      onClick: handleDelete,
      title: "Eliminar",
    },
  ];

  // Renderizado de filas
  const renderRow = (processor) => {
    return (
      <tr key={processor.id} className="border-t hover:bg-gray-50">
        <td className="px-3 py-2 text-sm text-gray-500">{processor.id}</td>
        <td className="px-3 py-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded flex items-center justify-center bg-indigo-50">
              <Table2 className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">{processor.name}</div>
              {processor.description && (
                <div className="text-xs text-gray-500 truncate max-w-xs">{processor.description}</div>
              )}
            </div>
          </div>
        </td>
        <td className="px-3 py-2">
          <code className="text-sm font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
            {processor.code}
          </code>
        </td>
        <td className="px-3 py-2">
          {processor.data_source ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-cyan-700 bg-cyan-50 px-2 py-1 rounded">
              <Database className="w-3.5 h-3.5" />
              {processor.data_source.name}
            </span>
          ) : (
            <span className="text-sm text-gray-400">-</span>
          )}
        </td>
        <td className="px-3 py-2">
          {processor.status === 1 ? (
            <span className="inline-flex items-center text-green-600 text-sm">
              <CheckCircle className="w-4 h-4 mr-1" />
              Activo
            </span>
          ) : (
            <span className="inline-flex items-center text-gray-400 text-sm">
              <XCircle className="w-4 h-4 mr-1" />
              Inactivo
            </span>
          )}
        </td>
        <td className="px-3 py-2">
          <TableActions actions={getRowActions()} item={processor} className="justify-center" />
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-bradford-navy mb-2">Procesadores de Tablas</h2>
        <p className="text-bradford-navy/70">
          Configura los procesadores que generan tablas HTML para certificados
        </p>
      </div>

      {/* Info box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">¿Cómo funcionan los procesadores?</p>
          <p className="text-blue-700">
            Cada procesador tiene un <strong>código único</strong> que se mapea a una función en el backend
            (ej: <code className="bg-blue-100 px-1 rounded">tabla_riles</code> → <code className="bg-blue-100 px-1 rounded">TableProcessorHelpers::tablaRiles()</code>).
            La función del backend genera el HTML de la tabla con la lógica específica que necesites.
          </p>
        </div>
      </div>

      {/* Filtros */}
      <GenericFilters
        searchPlaceholder="Buscar por nombre o código..."
        searchValue={q}
        onSearchChange={setQ}
        resultsCount={filteredData.length}
        showAddButton={true}
        onAdd={handleCreate}
        addButtonLabel="Nuevo Procesador"
      >
        <Button onClick={() => setTrigger((prev) => prev + 1)} variant="outline" icon={RefreshCw} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Actualizar"}
        </Button>
      </GenericFilters>

      {/* Tabla */}
      <GenericTable
        title="Procesadores configurados"
        loading={loading}
        columns={columns}
        data={filteredData}
        pageData={pageData}
        emptyMessage="No hay procesadores configurados"
        emptyIcon={Table2}
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

      {/* Modal de Formulario */}
      <TableProcessorFormModal
        open={formModal.open}
        mode={formModal.mode}
        formData={formData}
        setFormData={setFormData}
        dataSources={dataSources}
        saving={saving}
        onSave={handleSave}
        onClose={handleCloseForm}
        apiError={formApiError}
        onClearApiError={() => setFormApiError(null)}
      />

      {/* Modal de Preview */}
      <Modal
        open={previewModal.open}
        onClose={() => setPreviewModal({ open: false, processor: null })}
        title={`Preview: ${previewModal.processor?.name || ""}`}
        size="xl"
        actions={[
          {
            label: "Cerrar",
            variant: "outline",
            onClick: () => setPreviewModal({ open: false, processor: null }),
          },
          {
            label: previewing ? "Generando..." : "Generar Preview",
            variant: "primary",
            icon: Play,
            onClick: runPreview,
            disabled: previewing,
          },
        ]}
      >
        <div className="space-y-4">
          {/* Info del procesador */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Code2 className="w-4 h-4 text-gray-500" />
              <code className="text-sm font-mono text-sky-700">{previewModal.processor?.code}</code>
            </div>
            {previewModal.processor?.description && (
              <p className="text-sm text-gray-600">{previewModal.processor.description}</p>
            )}
          </div>

          {/* Parámetros */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1.5">Parámetros de prueba</label>
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="company_id"
                value={previewParams.company_id || ""}
                onChange={(e) => setPreviewParams({ ...previewParams, company_id: e.target.value })}
                className="rounded border px-3 py-2 bg-white outline-none transition shadow-sm text-[13px] border-gray-300 focus:ring-2 focus:ring-indigo-200 h-[37px]"
              />
              <input
                type="date"
                placeholder="date_from"
                value={previewParams.date_from || ""}
                onChange={(e) => setPreviewParams({ ...previewParams, date_from: e.target.value })}
                className="rounded border px-3 py-2 bg-white outline-none transition shadow-sm text-[13px] border-gray-300 focus:ring-2 focus:ring-indigo-200 h-[37px]"
              />
              <input
                type="date"
                placeholder="date_to"
                value={previewParams.date_to || ""}
                onChange={(e) => setPreviewParams({ ...previewParams, date_to: e.target.value })}
                className="rounded border px-3 py-2 bg-white outline-none transition shadow-sm text-[13px] border-gray-300 focus:ring-2 focus:ring-indigo-200 h-[37px]"
              />
            </div>
          </div>

          {/* Resultado */}
          {previewResult && (
            <div>
              {previewResult.success ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <p className="text-sm text-gray-600">
                      Tabla generada correctamente
                    </p>
                  </div>
                  {previewResult.html ? (
                    <div
                      className="border rounded-lg p-4 overflow-auto max-h-96 bg-white"
                      dangerouslySetInnerHTML={{ __html: previewResult.html }}
                    />
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No se pudo generar la vista previa
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                  <XCircle className="w-5 h-5 inline mr-2" />
                  {previewResult.error}
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Modal de confirmación */}
      <Modal
        open={!!modals.confirm}
        onClose={() => closeModal("confirm")}
        title={modals.confirm?.title}
        variant="warn"
        actions={[
          { label: "Cancelar", variant: "outline", onClick: () => closeModal("confirm") },
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
