import { useState, useEffect } from "react";
import {
  BarChart3,
  Plus,
  Search,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  Save,
  Loader2,
  Database,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  Cloud,
  Layers,
  PlusCircle,
  MinusCircle,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { handleSnackbar } from "../../utils/messageHelpers";
import {
  getReportTemplates,
  createReportTemplate,
  updateReportTemplate,
  deleteReportTemplate,
} from "../../services/reportTemplateService";
import { getDataSources } from "../../services/dataSourceService";

const ORIGIN_TYPES = [
  { value: "iframe", label: "Iframe (URL externa)", icon: Globe, color: "blue" },
  { value: "sql", label: "SQL (Fuente de datos)", icon: Database, color: "indigo" },
  { value: "sharepoint", label: "SharePoint", icon: Cloud, color: "green" },
  { value: "mixed", label: "Mixto (Múltiples orígenes)", icon: Layers, color: "purple" },
];

const getOriginTypeInfo = (type) => ORIGIN_TYPES.find(t => t.value === type) || ORIGIN_TYPES[0];

export default function ReportTemplatesView() {
  const [templates, setTemplates] = useState([]);
  const [dataSources, setDataSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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
    status: true,
  });

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Preview
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [templatesRes, dataSourcesRes] = await Promise.all([
        getReportTemplates(),
        getDataSources(),
      ]);

      if (templatesRes.success) {
        setTemplates(templatesRes.data || []);
      }
      if (dataSourcesRes.success) {
        setDataSources(dataSourcesRes.data || []);
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
      status: template.status ?? true,
    });
    setSelectedTemplate(template);
    setModalMode("edit");
    setShowModal(true);
    setPreviewUrl(null);
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      handleSnackbar("El nombre es obligatorio", "error");
      return;
    }

    // Validar según tipo de origen
    if (formData.origin_type === "iframe" && !formData.report_url?.trim()) {
      handleSnackbar("La URL del iframe es obligatoria", "error");
      return;
    }
    if (formData.origin_type === "sql" && !formData.data_source_id) {
      handleSnackbar("Debe seleccionar una fuente de datos", "error");
      return;
    }
    if (formData.origin_type === "sharepoint" && !formData.sharepoint_site_id?.trim()) {
      handleSnackbar("El Site ID de SharePoint es obligatorio", "error");
      return;
    }
    if (formData.origin_type === "mixed" && formData.origins.length === 0) {
      handleSnackbar("Debe agregar al menos un origen", "error");
      return;
    }

    setSaving(true);
    try {
      const dataToSend = {
        ...formData,
        origins: formData.origin_type === "mixed" ? formData.origins : null,
      };

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

  const handleOpenDelete = (template) => {
    setSelectedTemplate(template);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedTemplate) return;

    setDeleting(true);
    try {
      const response = await deleteReportTemplate(selectedTemplate.id);
      if (response.success) {
        handleSnackbar("Plantilla eliminada", "success");
        setShowDeleteModal(false);
        setSelectedTemplate(null);
        loadData();
      } else {
        handleSnackbar(response.message || "Error al eliminar", "error");
      }
    } catch (error) {
      handleSnackbar("Error al eliminar", "error");
    } finally {
      setDeleting(false);
    }
  };

  // Funciones para manejar orígenes múltiples
  const addOrigin = () => {
    setFormData({
      ...formData,
      origins: [
        ...formData.origins,
        { type: "iframe", label: "", report_url: "", data_source_id: "", sharepoint_site_id: "", sharepoint_list_id: "" }
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-indigo-600" />
            Plantillas de Reportes
          </h1>
          <p className="text-gray-500 mt-1">
            Gestiona las plantillas de reportes disponibles para asignar a empresas
          </p>
        </div>
        <Button onClick={handleOpenCreate} icon={Plus}>
          Nueva Plantilla
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, codigo o descripcion..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Templates List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredTemplates.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Codigo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tipo Origen
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
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
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {template.code || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{template.name}</p>
                        {template.description && (
                          <p className="text-sm text-gray-500 mt-0.5 truncate max-w-xs">
                            {template.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-${originInfo.color}-100 text-${originInfo.color}-800`}>
                        <OriginIcon className="w-3.5 h-3.5" />
                        {originInfo.label.split(" ")[0]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          template.status
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {template.status ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {template.report_url && (
                          <a
                            href={template.report_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Abrir reporte"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleOpenEdit(template)}
                          className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(template)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
                  <div className="flex items-center gap-2 text-blue-800 font-medium text-sm">
                    <Globe className="w-4 h-4" />
                    Configuración de Iframe
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1.5">
                      URL del Reporte *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="https://app.powerbi.com/reportEmbed?..."
                        value={formData.report_url}
                        onChange={(e) => setFormData({ ...formData, report_url: e.target.value })}
                        className="flex-1 rounded border px-3 py-2 bg-white outline-none transition shadow-sm text-[13px] border-gray-300 focus:ring-2 focus:ring-blue-200 h-[37px]"
                      />
                      {formData.report_url && (
                        <>
                          <button
                            type="button"
                            onClick={() => setPreviewUrl(previewUrl ? null : formData.report_url)}
                            className={`p-2 rounded-lg transition-colors ${
                              previewUrl ? "bg-blue-100 text-blue-800" : "text-gray-500 hover:bg-blue-50"
                            }`}
                            title={previewUrl ? "Cerrar preview" : "Ver preview"}
                          >
                            {previewUrl ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                          <a
                            href={formData.report_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Abrir en nueva pestaña"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </a>
                        </>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      URL del reporte de Power BI u otro servicio que se mostrará en iframe.
                    </p>
                  </div>
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
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1.5">
                        Site ID *
                      </label>
                      <input
                        type="text"
                        placeholder="xxx-xxx-xxx"
                        value={formData.sharepoint_site_id}
                        onChange={(e) => setFormData({ ...formData, sharepoint_site_id: e.target.value })}
                        className="w-full rounded border px-3 py-2 bg-white outline-none transition shadow-sm text-[13px] border-gray-300 focus:ring-2 focus:ring-green-200 h-[37px] font-mono"
                      />
                    </div>
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
                  </div>
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

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-medium text-gray-500 mb-1">
                                Etiqueta
                              </label>
                              <input
                                type="text"
                                placeholder="Ej: Tabla de datos"
                                value={origin.label || ""}
                                onChange={(e) => updateOrigin(index, "label", e.target.value)}
                                className="w-full rounded border px-2 py-1.5 text-[12px] border-gray-300 focus:ring-2 focus:ring-purple-200"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-medium text-gray-500 mb-1">
                                Tipo
                              </label>
                              <select
                                value={origin.type || "iframe"}
                                onChange={(e) => updateOrigin(index, "type", e.target.value)}
                                className="w-full rounded border px-2 py-1.5 text-[12px] border-gray-300 focus:ring-2 focus:ring-purple-200"
                              >
                                <option value="iframe">Iframe</option>
                                <option value="sql">SQL</option>
                                <option value="sharepoint">SharePoint</option>
                              </select>
                            </div>
                          </div>

                          {origin.type === "iframe" && (
                            <div>
                              <label className="block text-[10px] font-medium text-gray-500 mb-1">
                                URL
                              </label>
                              <input
                                type="text"
                                placeholder="https://..."
                                value={origin.report_url || ""}
                                onChange={(e) => updateOrigin(index, "report_url", e.target.value)}
                                className="w-full rounded border px-2 py-1.5 text-[12px] border-gray-300 focus:ring-2 focus:ring-purple-200"
                              />
                            </div>
                          )}

                          {origin.type === "sql" && (
                            <div>
                              <label className="block text-[10px] font-medium text-gray-500 mb-1">
                                Fuente de Datos
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
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-medium text-gray-500 mb-1">
                                  Site ID
                                </label>
                                <input
                                  type="text"
                                  placeholder="xxx-xxx"
                                  value={origin.sharepoint_site_id || ""}
                                  onChange={(e) => updateOrigin(index, "sharepoint_site_id", e.target.value)}
                                  className="w-full rounded border px-2 py-1.5 text-[12px] border-gray-300 focus:ring-2 focus:ring-purple-200 font-mono"
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

              {/* Estado */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Estado:</label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, status: !formData.status })}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    formData.status ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {formData.status ? (
                    <>
                      <ToggleRight className="w-4 h-4" />
                      Activo
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4" />
                      Inactivo
                    </>
                  )}
                </button>
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

      {/* Delete Modal */}
      {showDeleteModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Eliminar Plantilla</h3>
                  <p className="text-sm text-gray-500">Esta accion no se puede deshacer</p>
                </div>
              </div>

              <p className="text-gray-600 mb-6">
                ¿Estas seguro que deseas eliminar la plantilla{" "}
                <strong>"{selectedTemplate.name}"</strong>?
              </p>

              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedTemplate(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  disabled={deleting}
                  icon={deleting ? Loader2 : Trash2}
                >
                  {deleting ? "Eliminando..." : "Eliminar"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
