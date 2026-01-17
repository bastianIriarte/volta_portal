import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/Button.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { Input } from "../../components/ui/Input.jsx";
import GenericFilters from "../../components/common/GenericFilters.jsx";
import GenericTable from "../../components/common/GenericTable.jsx";
import TableActions from "../../components/common/TableActions.jsx";
import { useModals } from "../../hooks/useModals.js";
import { handleSnackbar } from "../../utils/messageHelpers.js";
import SqlRunner from "../admin/SqlRunner.jsx";
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
  AlertCircle,
  Table2,
  FileJson,
  Shield,
  Unlock,
  Eye,
  Terminal,
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

/**
 * Parametros sugeridos disponibles para las queries
 * Basados en datos de Company + rangos de fecha
 */
const SUGGESTED_PARAMS = [
  { name: "company_id", label: "ID Empresa", example: "1" },
  { name: "rut", label: "RUT", example: "76.XXX.XXX-X" },
  { name: "sap_code", label: "Codigo SAP", example: "C001" },
  { name: "card_code", label: "Card Code", example: "CC001" },
  { name: "business_name", label: "Razon Social", example: "Empresa S.A." },
  { name: "email", label: "Email", example: "contacto@empresa.cl" },
  { name: "date_from", label: "Fecha Desde", example: "2024-01-01" },
  { name: "date_to", label: "Fecha Hasta", example: "2024-12-31" },
];

/**
 * Extrae los parametros de una query SQL (formato :param)
 * @param {string} query - Query SQL
 * @returns {string[]} - Array de nombres de parametros unicos
 */
const extractQueryParams = (query) => {
  if (!query) return [];
  // Busca patrones :nombreParametro (letras, numeros y guiones bajos)
  const matches = query.match(/:([a-zA-Z_][a-zA-Z0-9_]*)/g);
  if (!matches) return [];
  // Elimina el : y devuelve valores unicos
  const params = matches.map((m) => m.slice(1));
  return [...new Set(params)];
};

export default function DataSourcesView() {
  const [dataSources, setDataSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trigger, setTrigger] = useState(0);

  // Modal de formulario
  const [formModal, setFormModal] = useState({ open: false, mode: "create", data: null });
  const [formData, setFormData] = useState(emptyForm);
  const [formTestParams, setFormTestParams] = useState({}); // Valores de prueba para validar query
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
    { key: "columns", label: "Columnas", sortable: false },
    { key: "status", label: "Estado", sortable: false },
    { key: "actions", label: "Acciones", sortable: false, headerClassName: "text-center" },
  ];

  // Abrir modal de crear
  const handleCreate = () => {
    setFormData(emptyForm);
    setFormTestParams({});
    setFormModal({ open: true, mode: "create", data: null });
  };

  // Abrir modal de editar
  const handleEdit = (source) => {
    setFormData({
      ...emptyForm,
      ...source,
    });
    // Inicializar valores de prueba vacios para los parametros existentes
    const params = extractQueryParams(source.query_sql);
    const initialParams = {};
    params.forEach((p) => {
      initialParams[p] = "";
    });
    setFormTestParams(initialParams);
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

    // Validar que se proporcionen valores de prueba si hay parametros
    const currentParams = extractQueryParams(formData.query_sql);
    const missingParams = currentParams.filter((p) => !formTestParams[p]?.trim());
    if (missingParams.length > 0) {
      handleSnackbar(`Debes proporcionar valores de prueba para: ${missingParams.map(p => `:${p}`).join(", ")}`, "error");
      return;
    }

    try {
      setSaving(true);
      const dataToSave = {
        ...formData,
        code: formData.code || formData.key,
        test_params: formTestParams, // Enviar parametros de prueba al backend
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
    // Detectar parametros de la query
    const params = extractQueryParams(source.query_sql);
    setDetectedParams(params);
    // Inicializar valores vacios para cada parametro
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
    const columnsArray = source.columns || [];
    const columnsCount = columnsArray.length;

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
          {columnsCount > 0 ? (
            <button
              onClick={() => setColumnsModal({ open: true, source })}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors cursor-pointer"
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
          <TableActions actions={getRowActions()} item={source} className="space-x-2" />
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-bradford-navy mb-2">Consultas SQL</h2>
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
      {showSqlRunner && <SqlRunner onClose={() => setShowSqlRunner(false)} />}

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
            </label>
            <Textarea
              value={formData.query_sql}
              onChange={(e) => setFormData({ ...formData, query_sql: e.target.value })}
              className="w-full rounded border px-3 py-2 bg-white outline-none transition shadow-sm text-[13px] border-gray-300 focus:ring-2 focus:ring-indigo-200 font-mono"
              rows={6}
              placeholder="SELECT * FROM productos WHERE company_id = :company_id"
            />

            {/* Parametros sugeridos - click para insertar */}
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 mb-2">
                <strong>Parametros disponibles</strong> (click para insertar):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_PARAMS.map((param) => (
                  <button
                    key={param.name}
                    type="button"
                    onClick={() => {
                      const paramText = `:${param.name}`;
                      setFormData({ ...formData, query_sql: formData.query_sql + paramText });
                    }}
                    className="text-xs font-mono px-2 py-1 rounded bg-white border border-gray-300 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 transition-colors"
                    title={`${param.label} - Ej: ${param.example}`}
                  >
                    :{param.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Valores de prueba para parametros detectados */}
            {formData.query_sql && extractQueryParams(formData.query_sql).length > 0 && (
              <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-xs text-amber-700 font-medium mb-2">
                  Valores de prueba (requeridos para validar la query):
                </p>
                <div className="space-y-2">
                  {extractQueryParams(formData.query_sql).map((param) => {
                    const suggested = SUGGESTED_PARAMS.find((p) => p.name === param);
                    const placeholder = suggested ? `Ej: ${suggested.example}` : `Valor para ${param}`;

                    return (
                      <div key={param} className="flex items-center gap-2">
                        <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded min-w-[120px]">
                          :{param}
                        </span>
                        <input
                          type="text"
                          placeholder={placeholder}
                          value={formTestParams[param] || ""}
                          className="flex-1 rounded border px-3 py-1.5 bg-white outline-none transition shadow-sm text-[13px] border-gray-300 focus:ring-2 focus:ring-amber-200 h-[32px]"
                          onChange={(e) => setFormTestParams({ ...formTestParams, [param]: e.target.value })}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Modal de Test */}
      <Modal
        open={testModal.open}
        onClose={() => setTestModal({ open: false, source: null })}
        title={
          <div className="flex items-center gap-2">
            <Play className="w-5 h-5 text-cyan-600" />
            <span>Probar consulta</span>
            <span className="text-gray-400 font-normal">|</span>
            <span className="text-cyan-600 font-normal">{testModal.source?.name || ""}</span>
          </div>
        }
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
            icon: testing ? Loader2 : Play,
            onClick: runTest,
            disabled: testing,
          },
        ]}
      >
        <div className="space-y-4">
          {/* Parámetros de prueba - generados dinámicamente */}
          {detectedParams.length > 0 && (
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                  <span className="text-amber-600 text-xs font-bold">{detectedParams.length}</span>
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {detectedParams.length === 1 ? "Parametro requerido" : "Parametros requeridos"}
                </span>
              </div>
              <div className="grid gap-2">
                {detectedParams.map((param) => {
                  const suggested = SUGGESTED_PARAMS.find((p) => p.name === param);
                  const placeholder = suggested ? `Ej: ${suggested.example}` : `Valor para ${param}`;
                  const label = suggested ? suggested.label : param;

                  return (
                    <div key={param} className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-2">
                      <div className="flex items-center gap-2 min-w-[130px]">
                        <code className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded font-mono">
                          :{param}
                        </code>
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder={placeholder}
                          value={testParams[param] || ""}
                          className="w-full rounded border px-3 py-1.5 bg-white outline-none transition text-sm border-slate-300 focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400"
                          onChange={(e) => setTestParams({ ...testParams, [param]: e.target.value })}
                        />
                      </div>
                      {suggested && (
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">{label}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mensaje cuando no hay parámetros */}
          {detectedParams.length === 0 && !testResult && (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 text-sm px-4 py-3 rounded-lg border border-emerald-200">
              <CheckCircle className="w-4 h-4" />
              Esta consulta no requiere parametros
            </div>
          )}

          {/* Query - Vista previa */}
          <div className="bg-slate-900 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-400 uppercase tracking-wide">Query SQL</span>
              </div>
              {detectedParams.length > 0 && Object.values(testParams).some(v => v) && (
                <div className="flex items-center gap-1.5 text-xs text-cyan-400">
                  <Eye className="w-3 h-3" />
                  Vista previa con valores
                </div>
              )}
            </div>
            <pre className="p-4 text-sm overflow-auto max-h-28 font-mono text-emerald-400">
              {(() => {
                let sql = testModal.source?.query_sql || "Sin query";
                // Reemplazar parametros con valores para vista previa
                Object.entries(testParams).forEach(([key, value]) => {
                  if (value) {
                    sql = sql.replace(
                      new RegExp(`:${key}`, 'g'),
                      `<span class="text-amber-400">'${value}'</span>`
                    );
                  }
                });
                return <span dangerouslySetInnerHTML={{ __html: sql }} />;
              })()}
            </pre>
          </div>

          {/* Resultados */}
          {testResult && (
            <div className="rounded-lg border overflow-hidden">
              {/* Header de resultados */}
              <div className={`px-4 py-3 flex items-center justify-between ${
                testResult.success ? "bg-emerald-50 border-b border-emerald-200" : "bg-red-50 border-b border-red-200"
              }`}>
                <div className="flex items-center gap-2">
                  {testResult.success ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      <span className="font-medium text-emerald-700">Ejecucion exitosa</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-500" />
                      <span className="font-medium text-red-700">Error en la consulta</span>
                    </>
                  )}
                </div>
                {testResult.success && (
                  <div className="flex items-center gap-3">
                    {/* Método usado */}
                    {testResult.data?.query_method && (
                      <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded ${
                        testResult.data.query_method === 'encrypted'
                          ? "bg-violet-100 text-violet-700"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {testResult.data.query_method === 'encrypted' ? (
                          <Shield className="w-3 h-3" />
                        ) : (
                          <Unlock className="w-3 h-3" />
                        )}
                        {testResult.data.query_method === 'encrypted' ? 'Encriptado' : 'Plano'}
                      </div>
                    )}
                    {/* Total de registros */}
                    <div className="flex items-center gap-1.5 text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                      <Table2 className="w-3 h-3" />
                      {testResult.data?.total || 0} {(testResult.data?.total || 0) === 1 ? 'registro' : 'registros'}
                    </div>
                  </div>
                )}
              </div>

              {/* Contenido de resultados */}
              <div className="bg-white">
                {testResult.success ? (
                  testResult.data?.data?.length > 0 ? (
                    // Tabla de resultados
                    <div className="overflow-auto max-h-64">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 sticky top-0">
                          <tr>
                            {testResult.data.columns?.map((col, i) => (
                              <th key={i} className="px-3 py-2 text-left text-xs font-medium text-slate-600 uppercase tracking-wider border-b border-slate-200">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {testResult.data.data.slice(0, 10).map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              {testResult.data.columns?.map((col, j) => (
                                <td key={j} className="px-3 py-2 text-slate-700 whitespace-nowrap max-w-xs truncate">
                                  {row[col] !== null && row[col] !== undefined ? String(row[col]) : '-'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {testResult.data.data.length > 10 && (
                        <div className="px-4 py-2 bg-slate-50 text-xs text-slate-500 text-center border-t">
                          Mostrando 10 de {testResult.data.data.length} registros
                        </div>
                      )}
                    </div>
                  ) : (
                    // Sin resultados
                    <div className="py-8 text-center">
                      <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-500 text-sm">La consulta no retorno resultados</p>
                      <p className="text-slate-400 text-xs mt-1">Verifica los parametros e intenta nuevamente</p>
                    </div>
                  )
                ) : (
                  // Error
                  <div className="p-4">
                    <pre className="text-sm text-red-600 bg-red-50 p-3 rounded-lg overflow-auto font-mono">
                      {testResult.error}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Estado de ejecución */}
          {testing && (
            <div className="flex items-center justify-center gap-3 py-6 bg-slate-50 rounded-lg">
              <Loader2 className="w-5 h-5 text-cyan-600 animate-spin" />
              <span className="text-sm text-slate-600">Ejecutando consulta...</span>
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

      {/* Modal de Columnas */}
      <Modal
        open={columnsModal.open}
        onClose={() => setColumnsModal({ open: false, source: null })}
        title={
          <div className="flex items-center gap-2">
            <Table2 className="w-5 h-5 text-indigo-600" />
            <span>Columnas detectadas</span>
            {columnsModal.source && (
              <>
                <span className="text-gray-400 font-normal">|</span>
                <span className="text-indigo-600 font-normal">{columnsModal.source?.name}</span>
              </>
            )}
          </div>
        }
        size="md"
        actions={[
          {
            label: "Cerrar",
            variant: "outline",
            onClick: () => setColumnsModal({ open: false, source: null }),
          },
        ]}
      >
        {columnsModal.source && (
          <div className="space-y-4">
            {/* Info de la consulta */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">Consulta SQL</p>
              <p className="text-sm font-medium text-slate-700">{columnsModal.source.name}</p>
              {columnsModal.source.description && (
                <p className="text-xs text-slate-500 mt-1">{columnsModal.source.description}</p>
              )}
            </div>

            {/* Lista de columnas */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-700">
                  {columnsModal.source.columns?.length || 0} columnas detectadas
                </p>
              </div>

              {columnsModal.source.columns?.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-80 overflow-y-auto">
                  {columnsModal.source.columns.map((col, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                    >
                      <span className="text-xs text-gray-400 font-mono w-5">{index + 1}</span>
                      <span className="text-sm font-mono text-gray-700 truncate" title={col}>
                        {col}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No hay columnas detectadas</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
