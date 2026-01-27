import { useState, useEffect } from "react";
import { Button } from "../../components/ui/Button.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import GenericFilters from "../../components/common/GenericFilters.jsx";
import GenericTable from "../../components/common/GenericTable.jsx";
import TableActions from "../../components/common/TableActions.jsx";
import { useModals } from "../../hooks/useModals.js";
import { handleSnackbar } from "../../utils/messageHelpers.js";
import SqlRunner from "./components/SqlRunner.jsx";
import { validateField } from "../../utils/validators.js";
import {
  Database,
  Edit2,
  Trash2,
  Play,
  CheckCircle,
  XCircle,
  Table2,
  Terminal,
} from "lucide-react";
import {
  getDataSources,
  createDataSource,
  updateDataSource,
  deleteDataSource,
  testQuery,
} from "../../services/dataSourceService.js";
import { getSuggestedQueryParams } from "../../services/systemConfigService.js";
import { useTableLogic } from "../../hooks/useTableLogic.js";

// Componentes separados
import DataSourceFormModal, { extractQueryParams } from "./components/DataSourceFormModal.jsx";
import DataSourceTestModal from "./components/DataSourceTestModal.jsx";
import DataSourceColumnsModal from "./components/DataSourceColumnsModal.jsx";

const emptyForm = {
  name: "",
  description: "",
  query_sql: "",
  query_connection: "agent",
};

/**
 * Parametros sugeridos por defecto (se cargan desde API)
 */
const DEFAULT_SUGGESTED_PARAMS = [
  { name: "company_id", label: "ID Empresa", example: "1" },
  { name: "date_from", label: "Fecha Desde", example: "2024-01-01" },
  { name: "date_to", label: "Fecha Hasta", example: "2024-12-31" },
];

export default function DataSourcesView() {
  const [dataSources, setDataSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trigger, setTrigger] = useState(0);

  // Modal de formulario
  const [formModal, setFormModal] = useState({ open: false, mode: "create", data: null });
  const [formData, setFormData] = useState(emptyForm);
  const [formTestParams, setFormTestParams] = useState({});
  const [saving, setSaving] = useState(false);

  // Modal de preview/test
  const [testModal, setTestModal] = useState({ open: false, source: null });
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [testParams, setTestParams] = useState({});
  const [detectedParams, setDetectedParams] = useState([]);

  // Modal de columnas
  const [columnsModal, setColumnsModal] = useState({ open: false, source: null });

  // SQL Runner
  const [showSqlRunner, setShowSqlRunner] = useState(false);

  // Errores de validación del formulario
  const [formErrors, setFormErrors] = useState({
    name: null,
    query_sql: null,
  });

  // Error de API persistente en el modal
  const [formApiError, setFormApiError] = useState(null);

  // Parámetros sugeridos (cargados desde API)
  const [suggestedParams, setSuggestedParams] = useState(DEFAULT_SUGGESTED_PARAMS);

  const { modals, openConfirm, closeModal } = useModals();

  // Validar un campo individual
  const validateSingleField = (field, value) => {
    let result;
    switch (field) {
      case "name":
        result = validateField(value, "text_min", true, "El nombre es obligatorio");
        break;
      case "query_sql":
        result = validateField(value, "text_min_description", true, "La query SQL es obligatoria");
        break;
      default:
        result = { validate: true, msg: null };
    }
    return result;
  };

  // Validar todo el formulario
  const validateForm = () => {
    const nameResult = validateSingleField("name", formData.name || "");
    const queryResult = validateSingleField("query_sql", formData.query_sql || "");

    const newErrors = {
      name: nameResult.msg,
      query_sql: queryResult.msg,
    };

    setFormErrors(newErrors);

    return nameResult.validate && queryResult.validate;
  };

  // Manejar cambio de campo con validación
  const handleFieldChange = (field, value) => {
    setFormData({ ...formData, [field]: value });

    if (value) {
      const result = validateSingleField(field, value);
      setFormErrors((prev) => ({ ...prev, [field]: result.msg }));
    } else {
      setFormErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Configuración de la tabla
  const tableConfig = {
    defaultSort: "id",
    defaultSortDir: "desc",
    pageSize: 10,
    searchFields: ["id", "name", "key", "code", "description"],
  };

  const { q, setQ, sortBy, sortDir, page, setPage, filteredData, pageData, totalPages, handleSort } =
    useTableLogic(dataSources, tableConfig);

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

  // Cargar parámetros sugeridos desde la API
  useEffect(() => {
    const loadSuggestedParams = async () => {
      try {
        const response = await getSuggestedQueryParams();
        if (response.success && response.data) {
          const flatParams = Object.values(response.data).flat();
          setSuggestedParams(flatParams);
        }
      } catch (error) {
        console.error("Error cargando parámetros sugeridos:", error);
      }
    };
    loadSuggestedParams();
  }, []);

  // Columnas de la tabla
  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Consulta" },
    { key: "columns", label: "Columnas", sortable: false },
    { key: "status", label: "Estado", sortable: false },
    { key: "actions", label: "Acciones", sortable: false, headerClassName: "text-center" },
  ];

  // Abrir modal de crear
  const handleCreate = () => {
    setFormData(emptyForm);
    setFormTestParams({});
    setFormErrors({ name: null, query_sql: null });
    setFormApiError(null);
    setFormModal({ open: true, mode: "create", data: null });
  };

  // Abrir modal de editar
  const handleEdit = (source) => {
    setFormData({
      ...emptyForm,
      ...source,
    });
    const params = extractQueryParams(source.query_sql);
    const initialParams = {};
    params.forEach((p) => {
      initialParams[p] = "";
    });
    setFormTestParams(initialParams);
    setFormErrors({ name: null, query_sql: null });
    setFormApiError(null);
    setFormModal({ open: true, mode: "edit", data: source });
  };

  // Guardar (crear o actualizar)
  const handleSave = async () => {
    setFormApiError(null);

    if (!validateForm()) {
      return;
    }

    const currentParams = extractQueryParams(formData.query_sql);
    const missingParams = currentParams.filter((p) => !formTestParams[p]?.trim());
    if (missingParams.length > 0) {
      let errorMsg = `Debes proporcionar valores de prueba para los parametros: ${missingParams.map((p) => `:${p}`).join(", ")}`;
      setFormApiError(errorMsg);
      handleSnackbar(errorMsg, "error");
      return;
    }

    try {
      setSaving(true);
      const dataToSave = {
        ...formData,
        code: formData.code || formData.key,
        test_params: formTestParams,
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
        const errorMsg = response.message || "Error al guardar";
        setFormApiError(errorMsg);
        handleSnackbar(errorMsg, "error");
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMsg = error?.message || "Error al guardar";
      setFormApiError(errorMsg);
      handleSnackbar(errorMsg, "error");
    } finally {
      setSaving(false);
    }
  };

  // Eliminar
  const handleDelete = (source) => {
    openConfirm({
      title: "Eliminar Consulta SQL",
      msg: (
        <div>
          <p>
            ¿Está seguro que desea eliminar la consulta <strong>{source.name}</strong>?
          </p>
          <p className="text-sm text-red-600 mt-2">
            Esta acción no se puede deshacer. Los certificados que usen esta consulta podrían verse
            afectados.
          </p>
        </div>
      ),
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
    const params = extractQueryParams(source.query_sql);
    setDetectedParams(params);
    const initialParams = {};
    params.forEach((p) => {
      initialParams[p] = "";
    });
    setTestParams(initialParams);
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
        handleSnackbar(`Consulta ejecutada: ${response.data?.total || 0} registros`, "success");
      } else {
        setTestResult({ success: false, error: response.message });
        handleSnackbar(response.message || "Error al ejecutar la consulta", "error");
      }
    } catch (error) {
      setTestResult({ success: false, error: error.message || "Error al ejecutar" });
      handleSnackbar(error.message || "Error al ejecutar la consulta", "error");
    } finally {
      setTesting(false);
    }
  };

  // Acciones por fila
  const getRowActions = () => [
    {
      label: "",
      icon: Play,
      variant: "outline",
      onClick: handleTest,
      title: "Probar consulta",
      className: "text-cyan-600 hover:text-cyan-900 hover:bg-cyan-50",
    },
    {
      label: "",
      icon: Edit2,
      variant: "outline",
      onClick: handleEdit,
      title: "Editar consulta",
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
  const renderRow = (source) => {
    const columnsArray = source.columns || [];
    const columnsCount = columnsArray.length;

    return (
      <tr key={source.id} className="border-t hover:bg-gray-50">
        <td className="px-3 py-2 text-sm text-gray-500">{source.id}</td>
        <td className="px-3 py-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded flex items-center justify-center bg-blue-50">
              <Database className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">{source.name}</div>
              {source.description && (
                <div className="text-xs text-gray-500 max-w-xs">{source.description}</div>
              )}
            </div>
          </div>
        </td>
        <td className="px-3 py-2">
          {columnsCount > 0 ? (
            <button
              onClick={() => setColumnsModal({ open: true, source })}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              <Table2 className="w-3 h-3" />
              {columnsCount} columnas
            </button>
          ) : (
            <span className="text-xs text-gray-400">Sin columnas</span>
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
          <TableActions actions={getRowActions()} item={source} className="justify-center" />
        </td>
      </tr>
    );
  };

  const closeFormModal = () => setFormModal({ open: false, mode: "create", data: null });
  const closeTestModal = () => setTestModal({ open: false, source: null });
  const closeColumnsModal = () => setColumnsModal({ open: false, source: null });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-bradford-navy mb-2">Fuentes de Datos</h2>
          <p className="text-bradford-navy/70">
            Configura consultas SQL para alimentar reportes y certificados
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={Terminal}
          onClick={() => setShowSqlRunner(true)}
        >
          SQL Runner
        </Button>
      </div>

      {/* SQL Runner Modal */}
      <SqlRunner open={showSqlRunner} onClose={() => setShowSqlRunner(false)} />

      {/* Filtros */}
      <GenericFilters
        searchPlaceholder="Buscar por nombre o descripción..."
        searchValue={q}
        onSearchChange={setQ}
        resultsCount={filteredData.length}
        showAddButton={true}
        onAdd={handleCreate}
        addButtonLabel="Nueva Consulta"
      />

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
      <DataSourceFormModal
        open={formModal.open}
        mode={formModal.mode}
        onClose={closeFormModal}
        formData={formData}
        formErrors={formErrors}
        formApiError={formApiError}
        formTestParams={formTestParams}
        suggestedParams={suggestedParams}
        saving={saving}
        onFieldChange={handleFieldChange}
        onFormDataChange={setFormData}
        onTestParamsChange={setFormTestParams}
        onClearApiError={() => setFormApiError(null)}
        onSave={handleSave}
      />

      {/* Modal de Test */}
      <DataSourceTestModal
        open={testModal.open}
        source={testModal.source}
        onClose={closeTestModal}
        testing={testing}
        testResult={testResult}
        testParams={testParams}
        detectedParams={detectedParams}
        suggestedParams={suggestedParams}
        onTestParamsChange={setTestParams}
        onRunTest={runTest}
      />

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

      {/* Modal de Columnas */}
      <DataSourceColumnsModal
        open={columnsModal.open}
        source={columnsModal.source}
        onClose={closeColumnsModal}
      />
    </div>
  );
}
