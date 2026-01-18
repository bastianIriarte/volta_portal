import { useState, useEffect } from "react";
import {
  BarChart3,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
  Database,
  ExternalLink,
  Globe,
  Cloud,
  Layers,
  PlusCircle,
  MinusCircle,
  AlertCircle,
  CheckCircle,
  XCircle,
  Settings,
  Table2,
  GripVertical,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import TableActions from "../../components/common/TableActions";
import { handleSnackbar } from "../../utils/messageHelpers";
import { useModals } from "../../hooks/useModals";
import {
  getReportTemplates,
  createReportTemplate,
  updateReportTemplate,
  deleteReportTemplate,
} from "../../services/reportTemplateService";
import { getDataSources } from "../../services/dataSourceService";
import { getConfigurations } from "../../services/configurationService";

const ORIGIN_TYPES = [
  { value: "iframe", label: "Iframe (URL externa)", icon: Globe, color: "blue" },
  { value: "sql", label: "SQL (Fuente de datos)", icon: Database, color: "indigo" },
  { value: "sharepoint", label: "SharePoint", icon: Cloud, color: "green" },
  { value: "mixed", label: "Mixto (Múltiples orígenes)", icon: Layers, color: "purple" },
];

// Formatos de visualización disponibles para columnas
const COLUMN_FORMATS = [
  { value: "text", label: "Texto" },
  { value: "number", label: "Número entero" },
  { value: "decimal", label: "Decimal (10,25)" },
  { value: "currency", label: "Moneda ($)" },
  { value: "date", label: "Fecha (dd/mm/yyyy)" },
  { value: "date_dmy", label: "Fecha (d-m-Y)" },
  { value: "date_split", label: "Fecha (Año | Mes | Día)" },
  { value: "doc_num", label: "Nº Documento (para imágenes)" },
  { value: "image", label: "Imagen" },
];

const getOriginTypeInfo = (type) => ORIGIN_TYPES.find(t => t.value === type) || ORIGIN_TYPES[0];

export default function ReportTemplatesView() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [dataSources, setDataSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Microsoft Graph configuration
  const [msGraphConfig, setMsGraphConfig] = useState(null);
  const msGraphConfigured = msGraphConfig?.status === 1 && msGraphConfig?.site_id;

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    origin_type: "iframe",
    // Para iframe
    report_url: "",
    // Para SQL
    data_source_id: "",
    // Para SharePoint
    sharepoint_site_id: "",
    sharepoint_list_id: "",
    sharepoint_path: "",
    // Para mixto - array de orígenes
    origins: [],
    // Opciones adicionales
    query_branches: false,
    status: true,
  });

  // Selected template for edit
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Delete confirmation modal
  const { modals, openConfirm, closeModal } = useModals();

  // Preview
  const [previewUrl, setPreviewUrl] = useState(null);

  // Modal de configuración de columnas
  const [showColumnsModal, setShowColumnsModal] = useState(false);
  const [columnsTemplate, setColumnsTemplate] = useState(null);
  const [availableColumns, setAvailableColumns] = useState([]);
  const [columnMapping, setColumnMapping] = useState([]); // {key, label, visible}
  const [loadingColumns, setLoadingColumns] = useState(false);
  const [savingColumns, setSavingColumns] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [templatesRes, dataSourcesRes, msGraphRes] = await Promise.all([
        getReportTemplates(),
        getDataSources(),
        getConfigurations("microsoft_graph"),
      ]);

      if (templatesRes.success) {
        setTemplates(templatesRes.data || []);
      }
      if (dataSourcesRes.success) {
        setDataSources(dataSourcesRes.data || []);
      }
      if (msGraphRes.success && msGraphRes.data) {
        setMsGraphConfig(msGraphRes.data);
      }
    } catch (error) {
      handleSnackbar("Error cargando datos", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      origin_type: "iframe",
      report_url: "",
      data_source_id: "",
      sharepoint_site_id: "",
      sharepoint_list_id: "",
      sharepoint_path: "",
      origins: [],
      query_branches: false,
      status: true,
    });
    setModalMode("create");
    setShowModal(true);
    setPreviewUrl(null);
  };

  const handleOpenEdit = (template) => {
    setFormData({
      name: template.name || "",
      code: template.code || "",
      description: template.description || "",
      origin_type: template.origin_type || "iframe",
      report_url: template.report_url || "",
      data_source_id: template.data_source_id || "",
      sharepoint_site_id: template.sharepoint_site_id || "",
      sharepoint_list_id: template.sharepoint_list_id || "",
      sharepoint_path: template.sharepoint_path || "",
      origins: template.origins || [],
      query_branches: template.query_branches ?? false,
      status: template.status ?? true,
    });
    setSelectedTemplate(template);
    setModalMode("edit");
    setShowModal(true);
    setPreviewUrl(null);
  };

  // Función para validar URL
  const isValidUrl = (url) => {
    if (!url?.trim()) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Función para validar un origen individual
  const validateOrigin = (origin, index) => {
    if (!origin.type) {
      return { valid: false, message: `Origen #${index + 1}: Debe seleccionar un tipo` };
    }

    if (origin.type === "iframe") {
      if (!origin.report_url?.trim()) {
        return { valid: false, message: `Origen #${index + 1}: La URL es obligatoria` };
      }
      if (!isValidUrl(origin.report_url)) {
        return { valid: false, message: `Origen #${index + 1}: La URL no es válida` };
      }
    }

    if (origin.type === "sql") {
      if (!origin.data_source_id) {
        return { valid: false, message: `Origen #${index + 1}: Debe seleccionar una fuente de datos` };
      }
    }

    if (origin.type === "sharepoint") {
      if (!msGraphConfigured) {
        return { valid: false, message: `Origen #${index + 1}: Microsoft Graph no está configurado` };
      }
      if (!origin.sharepoint_list_id?.trim()) {
        return { valid: false, message: `Origen #${index + 1}: El List ID es obligatorio` };
      }
    }

    return { valid: true };
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      handleSnackbar("El nombre es obligatorio", "error");
      return;
    }

    // Validar según tipo de origen
    // Para iframe: la URL es OPCIONAL en la plantilla porque se configura por empresa en company_reports
    if (formData.origin_type === "iframe") {
      // Solo validar formato si se proporciona una URL
      if (formData.report_url?.trim() && !isValidUrl(formData.report_url)) {
        handleSnackbar("La URL del iframe no es válida. Debe incluir http:// o https://", "error");
        return;
      }
    }

    if (formData.origin_type === "sql") {
      if (!formData.data_source_id) {
        handleSnackbar("Debe seleccionar una fuente de datos", "error");
        return;
      }
    }

    if (formData.origin_type === "sharepoint") {
      if (!msGraphConfigured) {
        handleSnackbar("Debe configurar Microsoft Graph antes de usar SharePoint", "error");
        return;
      }
      if (!formData.sharepoint_list_id?.trim()) {
        handleSnackbar("El List ID de SharePoint es obligatorio", "error");
        return;
      }
    }

    if (formData.origin_type === "mixed") {
      if (formData.origins.length === 0) {
        handleSnackbar("Debe agregar al menos un origen", "error");
        return;
      }

      // Validar cada origen individualmente
      for (let i = 0; i < formData.origins.length; i++) {
        const validation = validateOrigin(formData.origins[i], i);
        if (!validation.valid) {
          handleSnackbar(validation.message, "error");
          return;
        }
      }
    }

    setSaving(true);
    try {
      // Preparar datos para enviar
      let dataToSend = { ...formData };

      // Si es SharePoint, usar site_id de la configuración global
      if (formData.origin_type === "sharepoint" && msGraphConfig?.site_id) {
        dataToSend.sharepoint_site_id = msGraphConfig.site_id;
      }

      // Si es mixto, procesar los orígenes para usar site_id global en SharePoint
      if (formData.origin_type === "mixed") {
        dataToSend.origins = formData.origins.map(origin => {
          if (origin.type === "sharepoint" && msGraphConfig?.site_id) {
            return { ...origin, sharepoint_site_id: msGraphConfig.site_id };
          }
          return origin;
        });
      } else {
        dataToSend.origins = null;
      }

      if (modalMode === "edit" && selectedTemplate) {
        const response = await updateReportTemplate(selectedTemplate.id, dataToSend);
        if (response.success) {
          handleSnackbar("Plantilla actualizada", "success");
          setShowModal(false);
          loadData();
        } else {
          handleSnackbar(response.message || "Error al actualizar", "error");
        }
      } else {
        const response = await createReportTemplate(dataToSend);
        if (response.success) {
          handleSnackbar("Plantilla creada", "success");
          setShowModal(false);
          loadData();
        } else {
          handleSnackbar(response.message || "Error al crear", "error");
        }
      }
    } catch (error) {
      handleSnackbar("Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemplate = (template) => {
    openConfirm({
      title: "Eliminar Plantilla",
      msg: (
        <div>
          <p>
            ¿Está seguro que desea eliminar la plantilla <strong>{template.name}</strong>?
          </p>
          <p className="text-sm text-red-600 mt-2">
            Esta acción no se puede deshacer.
          </p>
        </div>
      ),
      variant: "danger",
      actionLabel: "Eliminar",
      onConfirm: async () => {
        try {
          const response = await deleteReportTemplate(template.id);
          if (response.success) {
            handleSnackbar("Plantilla eliminada", "success");
            loadData();
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

  // Acciones por fila
  const getRowActions = (template) => {
    const actions = [
      {
        label: "",
        icon: Edit2,
        variant: "outline",
        onClick: handleOpenEdit,
        title: "Editar plantilla",
        className: "text-emerald-600 hover:text-emerald-900 hover:bg-emerald-50",
      },
    ];

    // Agregar botón de configurar columnas solo para SQL con fuente de datos
    if (template.origin_type === "sql" && template.data_source_id) {
      actions.push({
        label: "",
        icon: Table2,
        variant: "outline",
        onClick: handleOpenColumns,
        title: "Configurar columnas",
        className: "text-cyan-600 hover:text-cyan-900 hover:bg-cyan-50",
      });
    }

    actions.push({
      label: "",
      icon: Trash2,
      variant: "danger",
      onClick: handleDeleteTemplate,
      title: "Eliminar",
    });

    return actions;
  };

  // Funciones para configurar columnas
  const handleOpenColumns = async (template) => {
    setColumnsTemplate(template);
    setShowColumnsModal(true);
    setLoadingColumns(true);

    try {
      // Buscar la fuente de datos para obtener las columnas disponibles
      const dataSource = dataSources.find(ds => ds.id === template.data_source_id);
      const dsColumns = dataSource?.columns || [];
      setAvailableColumns(dsColumns);

      // Si ya tiene columnas configuradas, cargarlas
      if (template.selected_columns && template.selected_columns.length > 0) {
        // Asegurar que todas las columnas tengan el campo format
        const mappingWithFormat = template.selected_columns.map(col => ({
          ...col,
          format: col.format || "text"
        }));
        setColumnMapping(mappingWithFormat);
      } else {
        // Crear mapping inicial con todas las columnas visibles
        const initialMapping = dsColumns.map(col => ({
          key: col,
          label: col,
          visible: true,
          format: "text"
        }));
        setColumnMapping(initialMapping);
      }
    } catch (error) {
      handleSnackbar("Error al cargar columnas", "error");
    } finally {
      setLoadingColumns(false);
    }
  };

  // Agregar columna a la selección
  const addColumn = (key) => {
    setColumnMapping(prev => prev.map(col =>
      col.key === key ? { ...col, visible: true } : col
    ));
  };

  // Quitar columna de la selección
  const removeColumn = (key) => {
    setColumnMapping(prev => prev.map(col =>
      col.key === key ? { ...col, visible: false } : col
    ));
  };

  const updateColumnLabel = (key, newLabel) => {
    setColumnMapping(prev => prev.map(col =>
      col.key === key ? { ...col, label: newLabel } : col
    ));
  };

  const updateColumnFormat = (key, newFormat) => {
    setColumnMapping(prev => prev.map(col =>
      col.key === key ? { ...col, format: newFormat } : col
    ));
  };

  const selectAllColumns = () => {
    setColumnMapping(prev => prev.map(col => ({ ...col, visible: true })));
  };

  const deselectAllColumns = () => {
    setColumnMapping(prev => prev.map(col => ({ ...col, visible: false })));
  };

  // Columnas disponibles (no seleccionadas) y seleccionadas
  const unselectedColumns = columnMapping.filter(col => !col.visible);
  const selectedColumns = columnMapping.filter(col => col.visible);

  // Drag & Drop state
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
    // Agregar clase al elemento arrastrado
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e) => {
    // Solo limpiar si salimos del contenedor principal
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = draggedIndex;

    if (dragIndex === null || dragIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Trabajar solo con las columnas seleccionadas para el reordenamiento
    setColumnMapping(prev => {
      const visible = prev.filter(c => c.visible);
      const hidden = prev.filter(c => !c.visible);

      // Reordenar solo las visibles
      const [draggedItem] = visible.splice(dragIndex, 1);
      visible.splice(dropIndex, 0, draggedItem);

      // Retornar visibles primero (en nuevo orden) + hidden al final
      return [...visible, ...hidden];
    });

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleSaveColumns = async () => {
    if (!columnsTemplate) return;

    setSavingColumns(true);
    try {
      const response = await updateReportTemplate(columnsTemplate.id, {
        selected_columns: columnMapping
      });

      if (response.success) {
        handleSnackbar("Columnas configuradas correctamente", "success");
        setShowColumnsModal(false);
        setColumnsTemplate(null);
        loadData();
      } else {
        handleSnackbar(response.message || "Error al guardar", "error");
      }
    } catch (error) {
      handleSnackbar("Error al guardar columnas", "error");
    } finally {
      setSavingColumns(false);
    }
  };

  // Funciones para manejar orígenes múltiples
  const addOrigin = () => {
    setFormData({
      ...formData,
      origins: [
        ...formData.origins,
        { type: "", report_url: "", data_source_id: "", sharepoint_site_id: "", sharepoint_list_id: "" }
      ]
    });
  };

  const removeOrigin = (index) => {
    setFormData({
      ...formData,
      origins: formData.origins.filter((_, i) => i !== index)
    });
  };

  const updateOrigin = (index, field, value) => {
    const newOrigins = [...formData.origins];
    newOrigins[index] = { ...newOrigins[index], [field]: value };
    setFormData({ ...formData, origins: newOrigins });
  };

  const filteredTemplates = templates.filter(
    (t) =>
      t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-bradford-navy mb-2">Plantillas de Reportes</h2>
        <p className="text-bradford-navy/70">
          Gestiona las plantillas de reportes disponibles para asignar a empresas
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, código o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <Button onClick={handleOpenCreate} icon={Plus}>
            Nueva Plantilla
          </Button>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          {filteredTemplates.length} resultado{filteredTemplates.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Templates List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredTemplates.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Plantilla
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Código
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tipo Origen
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTemplates.map((template) => {
                const originInfo = getOriginTypeInfo(template.origin_type);
                const OriginIcon = originInfo.icon;
                return (
                  <tr key={template.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm text-gray-500">{template.id}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded flex items-center justify-center bg-indigo-50">
                          <BarChart3 className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{template.name}</div>
                          {template.description && (
                            <div className="text-xs text-gray-500 truncate max-w-xs">
                              {template.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-sm text-gray-500 font-mono">{template.code || "-"}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-${originInfo.color}-100 text-${originInfo.color}-800`}>
                        <OriginIcon className="w-3.5 h-3.5" />
                        {originInfo.label.split(" ")[0]}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {template.status ? (
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
                      <TableActions actions={getRowActions(template)} item={template} className="justify-end mr-12" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No hay plantillas de reportes</p>
            <p className="text-sm text-gray-400 mt-1">
              Crea una nueva plantilla para comenzar
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 top-[-30px]">
          <div className={`bg-white rounded-lg shadow-xl w-full transition-all ${previewUrl ? 'max-w-5xl' : 'max-w-2xl'} max-h-[90vh] flex flex-col`}>
            <div className="flex items-center justify-between p-4 border-b shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">
                {modalMode === "edit" ? "Editar Plantilla" : "Nueva Plantilla de Reporte"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              {/* Nombre y Código */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Nombre"
                  required
                  placeholder="Ej: Reporte de Ventas Mensual"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Input
                  label="Código"
                  placeholder="RPT-001"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="font-mono"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1.5">
                  Descripción
                </label>
                <textarea
                  placeholder="Descripción del reporte..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full rounded border px-3 py-2 bg-white outline-none transition shadow-sm text-[13px] border-gray-300 focus:ring-2 focus:ring-indigo-200 resize-none"
                />
              </div>

              {/* Selector de Tipo de Origen */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-2">
                  Tipo de Origen de Datos *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ORIGIN_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isSelected = formData.origin_type === type.value;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, origin_type: type.value })}
                        className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                          isSelected
                            ? `border-${type.color}-500 bg-${type.color}-50 text-${type.color}-700`
                            : "border-gray-200 hover:border-gray-300 text-gray-600"
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isSelected ? `text-${type.color}-600` : ""}`} />
                        <span className="text-xs font-medium text-center">{type.label.split(" ")[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Campos condicionales según tipo de origen */}
              {formData.origin_type === "iframe" && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-800 font-medium text-sm">
                    <Globe className="w-4 h-4" />
                    Configuración de Iframe
                  </div>
                  <p className="mt-2 text-sm text-blue-700">
                    La URL del reporte se configurará desde la asignación de reportes a cada empresa.
                  </p>
                </div>
              )}

              {formData.origin_type === "sql" && (
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-800 font-medium text-sm">
                    <Database className="w-4 h-4" />
                    Configuración de Fuente de Datos SQL
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1.5">
                      Fuente de Datos *
                    </label>
                    <select
                      value={formData.data_source_id}
                      onChange={(e) => setFormData({ ...formData, data_source_id: e.target.value })}
                      className="w-full rounded border px-3 py-2 bg-white outline-none transition shadow-sm text-[13px] border-gray-300 focus:ring-2 focus:ring-indigo-200 h-[37px]"
                    >
                      <option value="">Seleccionar fuente de datos...</option>
                      {dataSources.map((ds) => (
                        <option key={ds.id} value={ds.id}>
                          {ds.name} {ds.description ? `- ${ds.description}` : ""}
                        </option>
                      ))}
                    </select>
                    {dataSources.length === 0 && (
                      <p className="mt-1 text-xs text-amber-600">
                        No hay fuentes de datos disponibles. Crea una primero.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {formData.origin_type === "sharepoint" && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200 space-y-3">
                  <div className="flex items-center gap-2 text-green-800 font-medium text-sm">
                    <Cloud className="w-4 h-4" />
                    Configuración de SharePoint
                  </div>

                  {/* Alerta si no está configurado Microsoft Graph */}
                  {!msGraphConfigured ? (
                    <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-amber-800">
                            Microsoft Graph no está configurado
                          </p>
                          <p className="text-xs text-amber-700 mt-1">
                            Para usar SharePoint, primero debes configurar la conexión a Microsoft Graph con un Site ID válido.
                          </p>
                          <button
                            type="button"
                            onClick={() => navigate("/dashboard/settings/connection-microsoft-graph")}
                            className="mt-2 flex items-center gap-1 text-xs font-medium text-amber-800 hover:text-amber-900 underline"
                          >
                            <Settings className="w-3.5 h-3.5" />
                            Ir a configuración
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Site ID desde configuración global (solo lectura) */}
                      <div className="p-3 bg-green-100 border border-green-300 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-medium text-green-800">Conexión configurada</span>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-green-700 uppercase mb-1">
                            Site ID (desde configuración global)
                          </label>
                          <input
                            type="text"
                            value={msGraphConfig?.site_id || ""}
                            disabled
                            className="w-full rounded border px-3 py-2 bg-green-50 text-[13px] border-green-300 h-[37px] font-mono text-green-800 cursor-not-allowed"
                          />
                        </div>
                      </div>

                      {/* List ID editable */}
                      <div>
                        <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1.5">
                          List ID
                        </label>
                        <input
                          type="text"
                          placeholder="xxx-xxx-xxx"
                          value={formData.sharepoint_list_id}
                          onChange={(e) => setFormData({ ...formData, sharepoint_list_id: e.target.value })}
                          className="w-full rounded border px-3 py-2 bg-white outline-none transition shadow-sm text-[13px] border-gray-300 focus:ring-2 focus:ring-green-200 h-[37px] font-mono"
                        />
                      </div>

                      {/* Ruta del archivo */}
                      <div>
                        <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1.5">
                          Ruta del archivo/carpeta
                        </label>
                        <input
                          type="text"
                          placeholder="/Documentos/Reportes/archivo.xlsx"
                          value={formData.sharepoint_path}
                          onChange={(e) => setFormData({ ...formData, sharepoint_path: e.target.value })}
                          className="w-full rounded border px-3 py-2 bg-white outline-none transition shadow-sm text-[13px] border-gray-300 focus:ring-2 focus:ring-green-200 h-[37px]"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              {formData.origin_type === "mixed" && (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-purple-800 font-medium text-sm">
                      <Layers className="w-4 h-4" />
                      Configuración de Múltiples Orígenes
                    </div>
                    <button
                      type="button"
                      onClick={addOrigin}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Agregar Origen
                    </button>
                  </div>

                  {formData.origins.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 text-sm">
                      No hay orígenes configurados. Haz clic en "Agregar Origen" para comenzar.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.origins.map((origin, index) => (
                        <div key={index} className="bg-white p-3 rounded-lg border border-purple-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-500 uppercase">
                              Origen #{index + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeOrigin(index)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                              title="Eliminar origen"
                            >
                              <MinusCircle className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Selector de tipo primero */}
                          <div>
                            <label className="block text-[10px] font-medium text-gray-500 mb-1">
                              Tipo de origen
                            </label>
                            <select
                              value={origin.type || ""}
                              onChange={(e) => updateOrigin(index, "type", e.target.value)}
                              className="w-full rounded border px-2 py-1.5 text-[12px] border-gray-300 focus:ring-2 focus:ring-purple-200"
                            >
                              <option value="">Seleccionar tipo...</option>
                              <option value="iframe">Iframe (URL externa)</option>
                              <option value="sql">SQL (Fuente de datos)</option>
                              <option value="sharepoint">SharePoint</option>
                            </select>
                          </div>

                          {/* Campos según el tipo seleccionado */}
                          {origin.type === "iframe" && (
                            <div>
                              <label className="block text-[10px] font-medium text-gray-500 mb-1">
                                URL del reporte *
                              </label>
                              <input
                                type="text"
                                placeholder="https://app.powerbi.com/..."
                                value={origin.report_url || ""}
                                onChange={(e) => updateOrigin(index, "report_url", e.target.value)}
                                className="w-full rounded border px-2 py-1.5 text-[12px] border-gray-300 focus:ring-2 focus:ring-purple-200"
                              />
                            </div>
                          )}

                          {origin.type === "sql" && (
                            <div>
                              <label className="block text-[10px] font-medium text-gray-500 mb-1">
                                Fuente de Datos *
                              </label>
                              <select
                                value={origin.data_source_id || ""}
                                onChange={(e) => updateOrigin(index, "data_source_id", e.target.value)}
                                className="w-full rounded border px-2 py-1.5 text-[12px] border-gray-300 focus:ring-2 focus:ring-purple-200"
                              >
                                <option value="">Seleccionar...</option>
                                {dataSources.map((ds) => (
                                  <option key={ds.id} value={ds.id}>{ds.name}</option>
                                ))}
                              </select>
                            </div>
                          )}

                          {origin.type === "sharepoint" && (
                            <>
                              {!msGraphConfigured ? (
                                <div className="p-2 bg-amber-50 border border-amber-200 rounded">
                                  <div className="flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                                    <div className="flex-1">
                                      <p className="text-[11px] font-medium text-amber-800">
                                        Microsoft Graph no configurado
                                      </p>
                                      <button
                                        type="button"
                                        onClick={() => navigate("/dashboard/settings/connection-microsoft-graph")}
                                        className="text-[10px] text-amber-700 underline"
                                      >
                                        Configurar
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <div className="p-2 bg-green-50 border border-green-200 rounded">
                                    <div className="flex items-center gap-1 mb-1">
                                      <CheckCircle className="w-3 h-3 text-green-600" />
                                      <span className="text-[10px] text-green-700 font-medium">Site ID (config global)</span>
                                    </div>
                                    <input
                                      type="text"
                                      value={msGraphConfig?.site_id || ""}
                                      disabled
                                      className="w-full rounded border px-2 py-1 text-[11px] bg-green-50 border-green-200 font-mono text-green-800 cursor-not-allowed"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-medium text-gray-500 mb-1">
                                      List ID
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="xxx-xxx"
                                      value={origin.sharepoint_list_id || ""}
                                      onChange={(e) => updateOrigin(index, "sharepoint_list_id", e.target.value)}
                                      className="w-full rounded border px-2 py-1.5 text-[12px] border-gray-300 focus:ring-2 focus:ring-purple-200 font-mono"
                                    />
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Preview */}
              {previewUrl && (
                <div className="border rounded-lg overflow-hidden" style={{ height: "300px" }}>
                  <iframe
                    src={previewUrl}
                    title="Preview"
                    className="w-full h-full border-0"
                    allowFullScreen
                  />
                </div>
              )}

              {/* Opciones adicionales */}
              <div className="space-y-3 pt-3 border-t border-gray-200">
                {/* Consulta sucursales - Checkbox */}
                <label className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.query_branches || false}
                    onChange={(e) => setFormData({ ...formData, query_branches: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <Database className="h-4 w-4 text-gray-400" />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-700">Consulta sucursales</span>
                    <p className="text-xs text-gray-500">Permite filtrar por sucursal al consultar el reporte</p>
                  </div>
                </label>

                {/* Estado - Select */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1">
                    Estado
                  </label>
                  <select
                    value={formData.status ? "1" : "0"}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value === "1" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="1">Activo</option>
                    <option value="0">Inactivo</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 rounded-b-lg shrink-0">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving} icon={saving ? Loader2 : Save}>
                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
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

      {/* Modal Configurar Columnas */}
      {showColumnsModal && columnsTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 top-[-30px]">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Table2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Configurar Columnas</h3>
                  <p className="text-sm text-gray-500">{columnsTemplate.name}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowColumnsModal(false);
                  setColumnsTemplate(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto flex-1">
              {loadingColumns ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                </div>
              ) : availableColumns.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">No hay columnas disponibles</p>
                  <p className="text-sm text-gray-400 mt-1">
                    La fuente de datos no tiene columnas configuradas
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Campos disponibles */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Campos disponibles</span>
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                          {unselectedColumns.length}
                        </span>
                      </div>
                      <button
                        onClick={selectAllColumns}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        Agregar todos
                      </button>
                    </div>

                    {unselectedColumns.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {unselectedColumns.map((col) => (
                          <button
                            key={col.key}
                            onClick={() => addColumn(col.key)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 transition-all group"
                          >
                            <Plus className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-500" />
                            <span className="font-mono">{col.key}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 text-center py-2">
                        Todos los campos están seleccionados
                      </p>
                    )}
                  </div>

                  {/* Campos seleccionados - tabla con drag & drop */}
                  <div className="bg-white rounded-lg border border-emerald-200">
                    <div className="flex items-center justify-between p-3 border-b border-emerald-100 bg-emerald-50 rounded-t-lg">
                      <div className="flex items-center gap-2">
                        <Table2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-800">Columnas del reporte</span>
                        <span className="text-xs bg-emerald-200 text-emerald-700 px-2 py-0.5 rounded-full">
                          {selectedColumns.length}
                        </span>
                      </div>
                      {selectedColumns.length > 0 && (
                        <button
                          onClick={deselectAllColumns}
                          className="text-xs text-gray-500 hover:text-red-600 font-medium"
                        >
                          Quitar todos
                        </button>
                      )}
                    </div>

                    {selectedColumns.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {/* Header de la tabla */}
                        <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-gray-50 text-[10px] font-bold text-gray-500 uppercase">
                          <div className="col-span-1"></div>
                          <div className="col-span-1 text-center">#</div>
                          <div className="col-span-3">Key (SQL)</div>
                          <div className="col-span-3">Label (Mostrar)</div>
                          <div className="col-span-3">Formato</div>
                          <div className="col-span-1"></div>
                        </div>

                        {/* Filas arrastrables */}
                        {selectedColumns.map((col, index) => (
                          <div
                            key={col.key}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, index)}
                            className={`grid grid-cols-12 gap-2 px-3 py-2 items-center transition-all ${
                              dragOverIndex === index
                                ? "bg-emerald-100 border-l-4 border-emerald-500"
                                : "hover:bg-gray-50"
                            } ${draggedIndex === index ? "opacity-50" : ""}`}
                          >
                            {/* Handle de arrastre */}
                            <div className="col-span-1 cursor-grab active:cursor-grabbing text-gray-300 hover:text-emerald-500">
                              <GripVertical className="w-4 h-4" />
                            </div>

                            {/* Número de orden */}
                            <div className="col-span-1 text-center">
                              <span className="text-xs font-mono text-gray-400">{index + 1}</span>
                            </div>

                            {/* Key (solo lectura) */}
                            <div className="col-span-3">
                              <span className="text-sm font-mono text-gray-600 truncate block" title={col.key}>
                                {col.key}
                              </span>
                            </div>

                            {/* Label (editable) */}
                            <div className="col-span-3">
                              <input
                                type="text"
                                value={col.label}
                                onChange={(e) => updateColumnLabel(col.key, e.target.value)}
                                placeholder={col.key}
                                onClick={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                                className="w-full text-sm px-2 py-1 rounded border border-gray-200 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 transition-colors"
                                draggable={false}
                              />
                            </div>

                            {/* Formato (selector) */}
                            <div className="col-span-3">
                              <select
                                value={col.format || "text"}
                                onChange={(e) => updateColumnFormat(col.key, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                                className="w-full text-sm px-2 py-1 rounded border border-gray-200 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 transition-colors bg-white"
                                draggable={false}
                              >
                                {COLUMN_FORMATS.map((fmt) => (
                                  <option key={fmt.value} value={fmt.value}>
                                    {fmt.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Botón quitar */}
                            <div className="col-span-1 text-right">
                              <button
                                onClick={() => removeColumn(col.key)}
                                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                title="Quitar columna"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <Table2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">Selecciona campos para agregar columnas</p>
                        <p className="text-xs mt-1">Haz clic en los campos disponibles arriba</p>
                      </div>
                    )}
                  </div>

                  {/* Tip */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 px-1">
                    <GripVertical className="w-3 h-3" />
                    <span>Arrastra las filas para cambiar el orden de las columnas</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 rounded-b-lg shrink-0">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowColumnsModal(false);
                  setColumnsTemplate(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveColumns}
                disabled={savingColumns || availableColumns.length === 0}
                icon={savingColumns ? Loader2 : Save}
              >
                {savingColumns ? "Guardando..." : "Guardar Configuración"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
