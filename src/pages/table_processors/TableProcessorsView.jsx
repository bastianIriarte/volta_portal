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
  Table2,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Play,
  Loader2,
  RefreshCw,
  Columns3,
  Calculator,
  Filter,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Palette,
} from "lucide-react";
import {
  getTableProcessors,
  createTableProcessor,
  updateTableProcessor,
  deleteTableProcessor,
  previewTableProcessor,
  getDataSources,
  getDataSourceSchema,
} from "../../services/dataSourceService.js";
import { useTableLogic } from "../../hooks/useTableLogic.js";

const COLUMN_FORMATS = [
  { value: "", label: "Sin formato" },
  { value: "number", label: "Número (1.234,56)" },
  { value: "currency", label: "Moneda ($1.234)" },
  { value: "date", label: "Fecha (dd/mm/yyyy)" },
  { value: "datetime", label: "Fecha y hora" },
  { value: "percentage", label: "Porcentaje (%)" },
];

const COLUMN_ALIGNS = [
  { value: "left", label: "Izquierda" },
  { value: "center", label: "Centro" },
  { value: "right", label: "Derecha" },
];

const COMPUTED_TYPES = [
  { value: "sum", label: "Suma" },
  { value: "count", label: "Conteo" },
  { value: "avg", label: "Promedio" },
];

const emptyForm = {
  name: "",
  code: "",
  description: "",
  data_source_id: "",
  columns: [],
  computed_rows: [],
  filters: [],
  order_by: [],
  group_by: null,
  primary_color: "#0284c7",
  font_size: "10px",
  striped_rows: true,
  show_header: true,
};

const emptyColumn = {
  key: "",
  label: "",
  width: "",
  align: "left",
  format: "",
};

const emptyComputedRow = {
  label: "Total",
  type: "sum",
  field: "",
  format: "",
  labelColspan: 1,
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

  // Modal de preview
  const [previewModal, setPreviewModal] = useState({ open: false, processor: null });
  const [previewResult, setPreviewResult] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [previewParams, setPreviewParams] = useState({});

  // Campos disponibles de la fuente de datos seleccionada
  const [availableFields, setAvailableFields] = useState([]);
  const [loadingFields, setLoadingFields] = useState(false);

  // Tab activa en el formulario
  const [activeTab, setActiveTab] = useState("general");

  // Configuración de la tabla
  const tableConfig = {
    defaultSort: "name",
    defaultSortDir: "asc",
    pageSize: 10,
    searchFields: ["name", "code", "description"],
  };

  const { q, setQ, sortBy, sortDir, page, setPage, filteredData, pageData, totalPages, handleSort } =
    useTableLogic(processors, tableConfig);

  const { modals, openConfirm, closeModal } = useModals();

  // Cargar datos
  const fetchData = async () => {
    try {
      setLoading(true);
      const [processorsRes, sourcesRes] = await Promise.all([getTableProcessors(), getDataSources()]);

      if (processorsRes.success) {
        setProcessors(processorsRes.data || []);
      }
      if (sourcesRes.success) {
        setDataSources(sourcesRes.data || []);
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

  // Cargar campos disponibles cuando cambia la fuente de datos seleccionada
  const loadAvailableFields = async (dataSourceId) => {
    if (!dataSourceId) {
      setAvailableFields([]);
      return;
    }

    setLoadingFields(true);
    try {
      // Usar get-schema para obtener solo los nombres de columnas sin ejecutar la query completa
      const response = await getDataSourceSchema(dataSourceId);
      if (response.success && response.data) {
        const fields = response.data.map((col) => ({
          key: col.ColumnName,
          label: col.ColumnName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
          type: col.DotNetType || "String",
        }));
        setAvailableFields(fields);
      }
    } catch (error) {
      console.error("Error cargando campos:", error);
    } finally {
      setLoadingFields(false);
    }
  };

  // Cargar campos cuando cambia la fuente de datos en el formulario
  useEffect(() => {
    if (formModal.open && formData.data_source_id) {
      loadAvailableFields(formData.data_source_id);
    } else {
      setAvailableFields([]);
    }
  }, [formModal.open, formData.data_source_id]);

  // Columnas de la tabla
  const columns = [
    { key: "name", label: "Nombre" },
    { key: "code", label: "Código" },
    { key: "data_source", label: "Fuente de Datos", sortable: false },
    { key: "columns_count", label: "Columnas", sortable: false },
    { key: "status", label: "Estado", sortable: false },
    { key: "actions", label: "Acciones", sortable: false, headerClassName: "text-right" },
  ];

  // Abrir modal de crear
  const handleCreate = () => {
    setFormData(emptyForm);
    setActiveTab("general");
    setFormModal({ open: true, mode: "create", data: null });
  };

  // Abrir modal de editar
  const handleEdit = (processor) => {
    setFormData({
      ...emptyForm,
      ...processor,
      columns: processor.columns || [],
      computed_rows: processor.computed_rows || [],
      filters: processor.filters || [],
      order_by: processor.order_by || [],
    });
    setActiveTab("general");
    setFormModal({ open: true, mode: "edit", data: processor });
  };

  // Guardar
  const handleSave = async () => {
    if (!formData.name?.trim() || !formData.code?.trim() || !formData.data_source_id) {
      handleSnackbar("Nombre, código y fuente de datos son requeridos", "error");
      return;
    }

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
        setFormModal({ open: false, mode: "create", data: null });
        setTrigger((prev) => prev + 1);
      } else {
        handleSnackbar(response.message || "Error al guardar", "error");
      }
    } catch (error) {
      handleSnackbar("Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  };

  // Eliminar
  const handleDelete = (processor) => {
    openConfirm({
      title: "Eliminar procesador",
      msg: `¿Estás seguro de eliminar "${processor.name}"?`,
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

  // Agregar columna
  const addColumn = () => {
    setFormData({
      ...formData,
      columns: [...formData.columns, { ...emptyColumn }],
    });
  };

  // Actualizar columna
  const updateColumn = (index, field, value) => {
    const newColumns = [...formData.columns];
    newColumns[index] = { ...newColumns[index], [field]: value };
    setFormData({ ...formData, columns: newColumns });
  };

  // Eliminar columna
  const removeColumn = (index) => {
    const newColumns = formData.columns.filter((_, i) => i !== index);
    setFormData({ ...formData, columns: newColumns });
  };

  // Agregar fila calculada
  const addComputedRow = () => {
    setFormData({
      ...formData,
      computed_rows: [...formData.computed_rows, { ...emptyComputedRow }],
    });
  };

  // Actualizar fila calculada
  const updateComputedRow = (index, field, value) => {
    const newRows = [...formData.computed_rows];
    newRows[index] = { ...newRows[index], [field]: value };
    setFormData({ ...formData, computed_rows: newRows });
  };

  // Eliminar fila calculada
  const removeComputedRow = (index) => {
    const newRows = formData.computed_rows.filter((_, i) => i !== index);
    setFormData({ ...formData, computed_rows: newRows });
  };

  // Acciones por fila
  const getRowActions = () => [
    {
      label: "Preview",
      icon: Eye,
      variant: "outline",
      onClick: handlePreview,
      title: "Ver preview",
    },
    {
      label: "Editar",
      icon: Edit2,
      variant: "outline",
      onClick: handleEdit,
      title: "Editar procesador",
    },
    {
      label: "Eliminar",
      icon: Trash2,
      variant: "danger",
      onClick: handleDelete,
      title: "Eliminar procesador",
    },
  ];

  // Renderizado de filas
  const renderRow = (processor, index) => {
    const source = dataSources.find((s) => s.id === processor.data_source_id);
    const columnsCount = processor.columns?.length || 0;

    return (
      <tr key={processor.id} className="border-t hover:bg-gray-50">
        <td className="px-3 py-2">
          <div className="font-medium text-gray-900">{processor.name}</div>
          {processor.description && (
            <div className="text-xs text-gray-500 truncate max-w-xs">{processor.description}</div>
          )}
        </td>
        <td className="px-3 py-2 text-sm font-mono text-gray-600">{processor.code}</td>
        <td className="px-3 py-2 text-sm">
          {source ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {source.name}
            </span>
          ) : (
            <span className="text-gray-400">Sin fuente</span>
          )}
        </td>
        <td className="px-3 py-2 text-sm text-center">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Columns3 className="w-3 h-3 mr-1" />
            {columnsCount}
          </span>
        </td>
        <td className="px-3 py-2">
          {processor.status === 1 ? (
            <span className="inline-flex items-center text-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              Activo
            </span>
          ) : (
            <span className="inline-flex items-center text-gray-400">
              <XCircle className="w-4 h-4 mr-1" />
              Inactivo
            </span>
          )}
        </td>
        <td className="px-3 py-2">
          <TableActions actions={getRowActions()} item={processor} className="space-x-2" />
        </td>
      </tr>
    );
  };

  // Tabs del formulario
  const tabs = [
    { id: "general", label: "General", icon: Table2 },
    { id: "columns", label: "Columnas", icon: Columns3 },
    { id: "computed", label: "Cálculos", icon: Calculator },
    { id: "style", label: "Estilos", icon: Palette },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-bradford-navy mb-2">Procesadores de Tablas</h2>
        <p className="text-bradford-navy/70">
          Configura cómo se transforman y muestran los datos en tablas HTML para certificados
        </p>
      </div>

      {/* Filtros */}
      <GenericFilters
        searchPlaceholder="Buscar por nombre, código..."
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
      <Modal
        open={formModal.open}
        onClose={() => setFormModal({ open: false, mode: "create", data: null })}
        title={formModal.mode === "create" ? "Nuevo Procesador" : "Editar Procesador"}
        size="xl"
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
          {/* Tabs */}
          <div className="flex border-b">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab General */}
          {activeTab === "general" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Nombre"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Tabla de productos"
                />
                <Input
                  label="Código"
                  required
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/\s/g, "_") })
                  }
                  placeholder="tabla_productos"
                  className="font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1.5">
                  Fuente de Datos <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.data_source_id}
                  onChange={(e) => setFormData({ ...formData, data_source_id: e.target.value })}
                  className="w-full rounded border px-3 py-2 bg-white outline-none transition shadow-sm text-[13px] border-gray-300 focus:ring-2 focus:ring-indigo-200 h-[37px]"
                >
                  <option value="">Selecciona una fuente...</option>
                  {dataSources
                    .filter((s) => s.is_array)
                    .map((source) => (
                      <option key={source.id} value={source.id}>
                        {source.name} ({source.key})
                      </option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Solo se muestran fuentes de datos tipo array</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1.5">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded border px-3 py-2 bg-white outline-none transition shadow-sm text-[13px] border-gray-300 focus:ring-2 focus:ring-indigo-200"
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Tab Columnas */}
          {activeTab === "columns" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-600">Define las columnas que se mostrarán en la tabla</p>
                  {loadingFields && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
                </div>
                <Button onClick={addColumn} variant="outline" size="sm" icon={Plus} disabled={availableFields.length === 0}>
                  Agregar Columna
                </Button>
              </div>

              {!formData.data_source_id ? (
                <div className="text-center py-8 text-amber-600 bg-amber-50 rounded-lg">
                  Primero selecciona una fuente de datos en la pestaña General.
                </div>
              ) : availableFields.length === 0 && !loadingFields ? (
                <div className="text-center py-8 text-gray-500">
                  No se pudieron cargar los campos. Verifica que la fuente de datos funcione correctamente.
                </div>
              ) : formData.columns.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay columnas definidas. Agrega una columna para comenzar.
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.columns.map((col, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-3">
                        <label className="block text-xs text-gray-500 mb-1">Campo</label>
                        <select
                          value={col.key}
                          onChange={(e) => {
                            const selectedKey = e.target.value;
                            const field = availableFields.find((f) => f.key === selectedKey);
                            // Actualizar en una sola operación para evitar race conditions
                            const newColumns = [...formData.columns];
                            newColumns[index] = {
                              ...newColumns[index],
                              key: selectedKey,
                              // Siempre actualizar etiqueta al cambiar campo
                              label: field ? field.label : selectedKey,
                            };
                            setFormData({ ...formData, columns: newColumns });
                          }}
                          className="w-full px-2 py-1.5 border rounded text-sm"
                        >
                          <option value="">-- Seleccionar --</option>
                          {availableFields.map((field) => (
                            <option key={field.key} value={field.key}>
                              {field.key}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-3">
                        <label className="block text-xs text-gray-500 mb-1">Etiqueta</label>
                        <input
                          type="text"
                          value={col.label}
                          onChange={(e) => updateColumn(index, "label", e.target.value)}
                          className="w-full px-2 py-1.5 border rounded text-sm"
                          placeholder="Nombre Campo"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-500 mb-1">Ancho</label>
                        <input
                          type="text"
                          value={col.width}
                          onChange={(e) => updateColumn(index, "width", e.target.value)}
                          className="w-full px-2 py-1.5 border rounded text-sm"
                          placeholder="100px o 20%"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-xs text-gray-500 mb-1">Alinear</label>
                        <select
                          value={col.align}
                          onChange={(e) => updateColumn(index, "align", e.target.value)}
                          className="w-full px-2 py-1.5 border rounded text-sm"
                        >
                          {COLUMN_ALIGNS.map((a) => (
                            <option key={a.value} value={a.value}>
                              {a.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-500 mb-1">Formato</label>
                        <select
                          value={col.format}
                          onChange={(e) => updateColumn(index, "format", e.target.value)}
                          className="w-full px-2 py-1.5 border rounded text-sm"
                        >
                          {COLUMN_FORMATS.map((f) => (
                            <option key={f.value} value={f.value}>
                              {f.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-1">
                        <button
                          onClick={() => removeColumn(index)}
                          className="p-1.5 text-red-500 hover:bg-red-100 rounded"
                          title="Eliminar columna"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab Cálculos */}
          {activeTab === "computed" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">Define filas calculadas (totales, promedios, etc.)</p>
                <Button onClick={addComputedRow} variant="outline" size="sm" icon={Plus}>
                  Agregar Cálculo
                </Button>
              </div>

              {formData.computed_rows.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay filas calculadas. Agrega una para mostrar totales.
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.computed_rows.map((row, index) => (
                    <div key={index} className="p-3 bg-orange-50 rounded-lg grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-3">
                        <label className="block text-xs text-gray-500 mb-1">Etiqueta</label>
                        <input
                          type="text"
                          value={row.label}
                          onChange={(e) => updateComputedRow(index, "label", e.target.value)}
                          className="w-full px-2 py-1.5 border rounded text-sm"
                          placeholder="Total"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-500 mb-1">Tipo</label>
                        <select
                          value={row.type}
                          onChange={(e) => updateComputedRow(index, "type", e.target.value)}
                          className="w-full px-2 py-1.5 border rounded text-sm"
                        >
                          {COMPUTED_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-3">
                        <label className="block text-xs text-gray-500 mb-1">Campo a calcular</label>
                        <input
                          type="text"
                          value={row.field}
                          onChange={(e) => updateComputedRow(index, "field", e.target.value)}
                          className="w-full px-2 py-1.5 border rounded text-sm font-mono"
                          placeholder="monto"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-500 mb-1">Formato</label>
                        <select
                          value={row.format}
                          onChange={(e) => updateComputedRow(index, "format", e.target.value)}
                          className="w-full px-2 py-1.5 border rounded text-sm"
                        >
                          {COLUMN_FORMATS.map((f) => (
                            <option key={f.value} value={f.value}>
                              {f.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-1">
                        <label className="block text-xs text-gray-500 mb-1">Colspan</label>
                        <input
                          type="number"
                          value={row.labelColspan}
                          onChange={(e) => updateComputedRow(index, "labelColspan", parseInt(e.target.value))}
                          className="w-full px-2 py-1.5 border rounded text-sm"
                          min={1}
                        />
                      </div>
                      <div className="col-span-1">
                        <button
                          onClick={() => removeComputedRow(index)}
                          className="p-1.5 text-red-500 hover:bg-red-100 rounded"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab Estilos */}
          {activeTab === "style" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color Principal</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                      className="w-12 h-10 border rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.primary_color}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                      className="flex-1 px-3 py-2 border rounded-lg font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tamaño de Fuente</label>
                  <select
                    value={formData.font_size}
                    onChange={(e) => setFormData({ ...formData, font_size: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="8px">8px - Muy pequeño</option>
                    <option value="9px">9px - Pequeño</option>
                    <option value="10px">10px - Normal</option>
                    <option value="11px">11px - Mediano</option>
                    <option value="12px">12px - Grande</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.striped_rows}
                    onChange={(e) => setFormData({ ...formData, striped_rows: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Filas alternadas (zebra)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.show_header}
                    onChange={(e) => setFormData({ ...formData, show_header: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Mostrar encabezado</span>
                </label>
              </div>

              {/* Preview de estilos */}
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Vista previa de estilos:</p>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: formData.font_size }}>
                  <thead>
                    {formData.show_header && (
                      <tr>
                        <th
                          style={{
                            background: formData.primary_color,
                            color: "#fff",
                            padding: "6px 8px",
                            border: "1px solid #d1d5db",
                          }}
                        >
                          Columna 1
                        </th>
                        <th
                          style={{
                            background: formData.primary_color,
                            color: "#fff",
                            padding: "6px 8px",
                            border: "1px solid #d1d5db",
                          }}
                        >
                          Columna 2
                        </th>
                      </tr>
                    )}
                  </thead>
                  <tbody>
                    <tr style={{ background: formData.striped_rows ? "#fff" : "transparent" }}>
                      <td style={{ padding: "5px 8px", border: "1px solid #d1d5db" }}>Dato 1</td>
                      <td style={{ padding: "5px 8px", border: "1px solid #d1d5db" }}>Dato 2</td>
                    </tr>
                    <tr style={{ background: formData.striped_rows ? "#f9fafb" : "transparent" }}>
                      <td style={{ padding: "5px 8px", border: "1px solid #d1d5db" }}>Dato 3</td>
                      <td style={{ padding: "5px 8px", border: "1px solid #d1d5db" }}>Dato 4</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Modal>

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
          {/* Parámetros */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1.5">Parámetros de prueba</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="company_id"
                value={previewParams.company_id || ""}
                onChange={(e) => setPreviewParams({ ...previewParams, company_id: e.target.value })}
                className="rounded border px-3 py-2 bg-white outline-none transition shadow-sm text-[13px] border-gray-300 focus:ring-2 focus:ring-indigo-200 h-[37px]"
              />
            </div>
          </div>

          {/* Resultado */}
          {previewResult && (
            <div>
              {previewResult.success ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 inline mr-1 text-green-500" />
                      {previewResult.total || previewResult.data?.length || 0} registros encontrados
                      {previewResult.limited && (
                        <span className="text-xs text-blue-600 ml-2">
                          (mostrando {previewResult.data?.length} de {previewResult.total})
                        </span>
                      )}
                    </p>
                    {(previewResult.columns?.length === 0 || !previewResult.columns) && (
                      <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                        Sin columnas configuradas (mostrando todas)
                      </span>
                    )}
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
