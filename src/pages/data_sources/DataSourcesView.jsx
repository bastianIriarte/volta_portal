import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/Button.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { Input } from "../../components/ui/Input.jsx";
import GenericFilters from "../../components/common/GenericFilters.jsx";
import GenericTable from "../../components/common/GenericTable.jsx";
import TableActions from "../../components/common/TableActions.jsx";
import { useModals } from "../../hooks/useModals.js";
import { handleSnackbar } from "../../utils/messageHelpers.js";
import {
  Database,
  Edit2,
  Trash2,
  Play,
  Loader2,
  RefreshCw,
  Code2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  getDataSources,
  createDataSource,
  updateDataSource,
  deleteDataSource,
  testQuery,
} from "../../services/dataSourceService.js";
import { useTableLogic } from "../../hooks/useTableLogic.js";
import { Textarea } from "../../components/ui/Textarea.jsx";

const emptyForm = {
  name: "",
  description: "",
  query_sql: "",
  query_connection: "agent",
};

export default function DataSourcesView() {
  const [dataSources, setDataSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trigger, setTrigger] = useState(0);

  // Modal de formulario
  const [formModal, setFormModal] = useState({ open: false, mode: "create", data: null });
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Modal de preview/test
  const [testModal, setTestModal] = useState({ open: false, source: null });
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [testParams, setTestParams] = useState({});

  // Configuración de la tabla
  const tableConfig = {
    defaultSort: "id",
    defaultSortDir: "desc",
    pageSize: 10,
    searchFields: ["id","name", "key", "code", "description"],
  };

  const { q, setQ, sortBy, sortDir, page, setPage, filteredData, pageData, totalPages, handleSort } =
    useTableLogic(dataSources, tableConfig);

  const { modals, openConfirm, closeModal } = useModals();

  // Cargar datos
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getDataSources();
      if (response.success) {
        setDataSources(response.data || []);
      } else {
        handleSnackbar(response.message || "Error al cargar consultas SQL", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      handleSnackbar("Error al cargar consultas SQL", "error");
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
    { key: "name", label: "Nombre" },
    { key: "status", label: "Estado", sortable: false },
    { key: "actions", label: "Acciones", sortable: false, headerClassName: "text-center" },
  ];

  // Abrir modal de crear
  const handleCreate = () => {
    setFormData(emptyForm);
    setFormModal({ open: true, mode: "create", data: null });
  };

  // Abrir modal de editar
  const handleEdit = (source) => {
    setFormData({
      ...emptyForm,
      ...source,
    });
    setFormModal({ open: true, mode: "edit", data: source });
  };

  // Guardar (crear o actualizar)
  const handleSave = async () => {
    if (!formData.name?.trim()) {
      handleSnackbar("Nombre es requerido", "error");
      return;
    }

    if (!formData.query_sql?.trim()) {
      handleSnackbar("Query SQL es requerido", "error");
      return;
    }

    try {
      setSaving(true);
      const dataToSave = {
        ...formData,
        code: formData.code || formData.key,
      };

      let response;
      if (formModal.mode === "create") {
        response = await createDataSource(dataToSave);
      } else {
        response = await updateDataSource(formModal.data.id, dataToSave);
      }

      if (response.success) {
        handleSnackbar(response.message || "Guardado exitosamente", "success");
        setFormModal({ open: false, mode: "create", data: null });
        setTrigger((prev) => prev + 1);
      } else {
        handleSnackbar(response.message || "Error al guardar", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      handleSnackbar("Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  };

  // Eliminar
  const handleDelete = (source) => {
    openConfirm({
      title: "Eliminar consulta SQL",
      msg: `¿Estás seguro de eliminar la consulta "${source.name}"?`,
      variant: "danger",
      actionLabel: "Eliminar",
      onConfirm: async () => {
        try {
          const response = await deleteDataSource(source.id);
          if (response.success) {
            handleSnackbar("Consulta eliminada", "success");
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

  // Probar query
  const handleTest = (source) => {
    setTestModal({ open: true, source });
    setTestResult(null);
    setTestParams({});
  };

  const runTest = async () => {
    const source = testModal.source;
    if (!source) return;

    setTesting(true);
    setTestResult(null);

    try {
      const response = await testQuery(source.query_sql, testParams, source.query_connection);

      if (response.success) {
        setTestResult({ success: true, data: response.data });
      } else {
        setTestResult({ success: false, error: response.message });
      }
    } catch (error) {
      setTestResult({ success: false, error: error.message || "Error al ejecutar" });
    } finally {
      setTesting(false);
    }
  };

  // Acciones por fila
  const getRowActions = () => [
    {
      label: "Probar",
      icon: Play,
      variant: "outline",
      onClick: handleTest,
      title: "Probar consulta SQL",
    },
    {
      label: "Editar",
      icon: Edit2,
      variant: "outline",
      onClick: handleEdit,
      title: "Editar consulta",
    },
    {
      label: "Eliminar",
      icon: Trash2,
      variant: "danger",
      onClick: handleDelete,
      title: "Eliminar consulta",
    },
  ];

  // Renderizado de filas
  const renderRow = (source) => {
    return (
      <tr key={source.id} className="border-t hover:bg-gray-50">
        <td className="px-3 py-2">
          {source.id}
        </td>
        <td className="px-3 py-2">
          <div className="font-medium text-gray-900 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-blue-600" />
            {source.name}
          </div>
          {source.description && (
            <div className="text-xs text-gray-500 truncate max-w-xs ml-6">{source.description}</div>
          )}
        </td>
        <td className="px-3 py-2">
          {source.status === 1 ? (
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
          <TableActions actions={getRowActions()} item={source} className="space-x-2" />
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-bradford-navy mb-2">Consultas SQL</h2>
        <p className="text-bradford-navy/70">
          Configura consultas SQL para alimentar reportes y certificados
        </p>
      </div>

      {/* Filtros */}
      <GenericFilters
        searchPlaceholder="Buscar por nombre..."
        searchValue={q}
        onSearchChange={setQ}
        resultsCount={filteredData.length}
        showAddButton={true}
        onAdd={handleCreate}
        addButtonLabel="Nueva Consulta"
      >
      </GenericFilters>

      {/* Tabla */}
      <GenericTable
        title="Consultas SQL configuradas"
        loading={loading}
        columns={columns}
        data={filteredData}
        pageData={pageData}
        emptyMessage="No hay consultas SQL configuradas"
        emptyIcon={Database}
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
      <Modal
        open={formModal.open}
        onClose={() => setFormModal({ open: false, mode: "create", data: null })}
        title={formModal.mode === "create" ? "Nueva Consulta SQL" : "Editar Consulta SQL"}
        size="lg"
        actions={[
          {
            label: "Cancelar",
            variant: "outline",
            onClick: () => setFormModal({ open: false, mode: "create", data: null }),
          },
          {
            label: saving ? "Guardando..." : "Guardar",
            variant: "primary",
            onClick: handleSave,
            disabled: saving,
          },
        ]}
      >
        <div className="space-y-4">
          {/* Nombre */}
          <Input
            label="Nombre"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej: Productos del cliente"
          />

          {/* Descripción */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1.5">Descripción</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded border px-3 py-2 bg-white outline-none transition shadow-sm text-[13px] border-gray-300 focus:ring-2 focus:ring-indigo-200"
              rows={2}
              placeholder="Describe qué datos obtiene esta consulta..."
            />
          </div>

          {/* Query SQL */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1.5">
              Query SQL <span className="text-red-500">*</span>
              <span className="text-xs text-gray-500 ml-2 normal-case font-normal">Usa :param para parámetros dinámicos</span>
            </label>
            <Textarea
              value={formData.query_sql}
              onChange={(e) => setFormData({ ...formData, query_sql: e.target.value })}
              className="w-full rounded border px-3 py-2 bg-white outline-none transition shadow-sm text-[13px] border-gray-300 focus:ring-2 focus:ring-indigo-200 font-mono"
              rows={6}
              placeholder="SELECT * FROM productos WHERE company_id = :company_id"
            />
          </div>
        </div>
      </Modal>

      {/* Modal de Test */}
      <Modal
        open={testModal.open}
        onClose={() => setTestModal({ open: false, source: null })}
        title={`Probar: ${testModal.source?.name || ""}`}
        size="xl"
        actions={[
          {
            label: "Cerrar",
            variant: "outline",
            onClick: () => setTestModal({ open: false, source: null }),
          },
          {
            label: testing ? "Ejecutando..." : "Ejecutar",
            variant: "primary",
            icon: Play,
            onClick: runTest,
            disabled: testing,
          },
        ]}
      >
        <div className="space-y-4">
          {/* Parámetros de prueba */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1.5">
              Parámetros de prueba (opcional)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="company_id"
                className="rounded border px-3 py-2 bg-white outline-none transition shadow-sm text-[13px] border-gray-300 focus:ring-2 focus:ring-indigo-200 h-[37px]"
                onChange={(e) => setTestParams({ ...testParams, company_id: e.target.value })}
              />
              <input
                type="text"
                placeholder="Valor"
                className="rounded border px-3 py-2 bg-white outline-none transition shadow-sm text-[13px] border-gray-300 focus:ring-2 focus:ring-indigo-200 h-[37px]"
                onChange={(e) =>
                  setTestParams({ ...testParams, company_id: e.target.value || testParams.company_id })
                }
              />
            </div>
          </div>

          {/* Query a ejecutar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Query</label>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-auto max-h-32 font-mono">
              {testModal.source?.query_sql || "Sin query"}
            </pre>
          </div>

          {/* Resultados */}
          {testResult && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                {testResult.success ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Resultado ({Array.isArray(testResult.data?.data) ? testResult.data.data.length : 1} registros)
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-500" />
                    Error
                  </>
                )}
              </label>
              <pre
                className={`p-4 rounded-lg text-xs overflow-auto max-h-80 font-mono ${testResult.success ? "bg-gray-900 text-green-400" : "bg-red-50 text-red-600"
                  }`}
              >
                {testResult.success
                  ? JSON.stringify(testResult.data, null, 2)
                  : testResult.error}
              </pre>
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
