import { useState, useEffect, useRef } from "react";
import {
  Type,
  Calendar,
  Hash,
  DollarSign,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Table,
  PenTool,
  Minus,
  Square,
  FileText,
  Building,
  Users,
  MapPin,
  PanelTop,
  PanelBottom,
  Truck,
  Recycle,
  Droplet,
  X,
  Bold,
  Italic,
  Underline,
  Eye,
  Upload,
  Loader2,
  Link2,
  Search,
} from "lucide-react";
import { handleSnackbar } from "../../../../utils/messageHelpers";
import {
  uploadBuilderImage,
  listBuilderImages,
} from "../../../../services/certificateBuilderService";
import { previewTableProcessor } from "../../../../services/dataSourceService";

// Mapeo de iconos
const iconMap = {
  Type,
  Calendar,
  Hash,
  DollarSign,
  Image,
  AlignLeft,
  Table,
  PenTool,
  Minus,
  Square,
  FileText,
  Building,
  Users,
  MapPin,
  PanelTop,
  PanelBottom,
  LayoutTop: PanelTop,
  LayoutBottom: PanelBottom,
  Truck,
  Recycle,
  Droplet,
};

const getIcon = (iconName) => iconMap[iconName] || FileText;

const fontSizes = [
  { label: "8", value: "8px" },
  { label: "9", value: "9px" },
  { label: "10", value: "10px" },
  { label: "11", value: "11px" },
  { label: "12", value: "12px" },
  { label: "14", value: "14px" },
  { label: "16", value: "16px" },
  { label: "18", value: "18px" },
  { label: "20", value: "20px" },
  { label: "24", value: "24px" },
  { label: "28", value: "28px" },
  { label: "32", value: "32px" },
  { label: "36", value: "36px" },
  { label: "48", value: "48px" },
];

export default function FieldConfigPanel({
  field,
  config,
  tableProcessors = [],
  availableVariables = { system: [], data_source: [], data_source_info: null },
  onSave,
  onClose,
}) {
  const [editedField, setEditedField] = useState({ ...field });
  const [activeTab, setActiveTab] = useState("general");
  const [uploading, setUploading] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [previewingProcessor, setPreviewingProcessor] = useState(false);
  const [processorPreview, setProcessorPreview] = useState(null);
  const [variableSearch, setVariableSearch] = useState("");
  const fileInputRef = useRef(null);

  // Estados para espaciado tipo Elementor
  const [paddingLinked, setPaddingLinked] = useState(true);
  const [marginLinked, setMarginLinked] = useState(true);
  const [paddingUnit, setPaddingUnit] = useState("px");
  const [marginUnit, setMarginUnit] = useState("px");

  // Helper para extraer valor numérico de una propiedad de estilo
  const getSpacingValue = (value, defaultVal = 0) => {
    if (value === undefined || value === null || value === "") return defaultVal;
    if (typeof value === "string") {
      const parsed = parseInt(value);
      return isNaN(parsed) ? defaultVal : parsed;
    }
    if (typeof value === "number") return value;
    return defaultVal;
  };

  // Actualizar editedField cuando cambia el field seleccionado
  useEffect(() => {
    setEditedField({ ...field });
  }, [field?.id]);

  const handleChange = (key, value) => {
    const updated = { ...editedField, [key]: value };
    setEditedField(updated);
    onSave(updated);
  };

  // Cargar imágenes existentes
  const loadExistingImages = async () => {
    setLoadingImages(true);
    try {
      const result = await listBuilderImages();
      if (result.success && result.data) {
        setExistingImages(result.data);
      }
    } catch (error) {
      console.error("Error loading images:", error);
    } finally {
      setLoadingImages(false);
    }
  };

  // Cargar imágenes al abrir galería
  useEffect(() => {
    if (showGallery && existingImages.length === 0) {
      loadExistingImages();
    }
  }, [showGallery]);

  // Manejar upload de imagen
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/svg+xml",
      "image/webp",
    ];
    if (!validTypes.includes(file.type)) {
      handleSnackbar(
        "Tipo de archivo no válido. Usa JPG, PNG, GIF, SVG o WebP",
        "error"
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      handleSnackbar("La imagen no puede superar 5MB", "error");
      return;
    }

    setUploading(true);
    try {
      const imageType =
        field.field_type === "signature"
          ? "signature"
          : field.field_key?.includes("logo")
            ? "logo"
            : field.field_key?.includes("header")
              ? "header"
              : "general";

      const result = await uploadBuilderImage(file, imageType);

      if (result.success && result.data?.url) {
        handleChange("default_value", result.data.url);
        handleSnackbar("Imagen subida correctamente", "success");
        loadExistingImages();
      } else {
        handleSnackbar(result.message || "Error al subir la imagen", "error");
      }
    } catch (error) {
      handleSnackbar("Error al subir la imagen", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSelectFromGallery = (url) => {
    handleChange("default_value", url);
    setShowGallery(false);
    handleSnackbar("Imagen seleccionada", "success");
  };

  const handleRemoveImage = () => {
    handleChange("default_value", "");
  };

  const handleStyleChange = (key, value) => {
    const updated = {
      ...editedField,
      styles: { ...editedField.styles, [key]: value },
    };
    setEditedField(updated);
    onSave(updated);
  };

  const handleMultipleStyleChanges = (changes) => {
    const updated = {
      ...editedField,
      styles: { ...editedField.styles, ...changes },
    };
    setEditedField(updated);
    onSave(updated);
  };

  const FieldIcon = getIcon(config?.field_types?.[field.field_type]?.icon || "Type");

  return (
    <div className="w-full sm:w-80 lg:w-72 bg-white border-l border-gray-200 flex flex-col flex-shrink-0 h-full max-h-screen lg:max-h-full overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-2 min-w-0">
          <FieldIcon className="h-4 w-4 text-sky-600 flex-shrink-0" />
          <span className="font-semibold text-gray-900 text-sm truncate">
            {field.field_label}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 rounded flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        {[
          { key: "general", label: "General" },
          { key: "styles", label: "Estilos" },
          { key: "data", label: "Datos" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-2 py-2 text-xs font-medium transition-colors ${activeTab === tab.key
              ? "text-sky-600 border-b-2 border-sky-600 bg-sky-50/50"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === "general" && (
          <div className="space-y-3">
            {/* Mostrar etiqueta */}
            {!["image", "signature", "table", "paragraph", "divider", "spacer"].includes(
              field.field_type
            ) && (
                <label className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                  <input
                    type="checkbox"
                    checked={editedField.styles?.showLabel === true}
                    onChange={(e) => handleStyleChange("showLabel", e.target.checked)}
                    className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span className="text-xs font-medium text-gray-700">
                    Mostrar etiqueta en el certificado
                  </span>
                </label>
              )}

            <div>
              <label
                className={`block text-xs font-medium mb-1 ${editedField.styles?.showLabel ? "text-gray-700" : "text-gray-400"
                  }`}
              >
                Etiqueta
              </label>
              <input
                type="text"
                value={editedField.field_label}
                onChange={(e) => handleChange("field_label", e.target.value)}
                disabled={
                  !["image", "signature", "table", "paragraph", "divider", "spacer"].includes(
                    field.field_type
                  ) && !editedField.styles?.showLabel
                }
                className={`w-full px-2 py-1.5 border border-gray-300 rounded text-sm ${!["image", "signature", "table", "paragraph", "divider", "spacer"].includes(
                  field.field_type
                ) && !editedField.styles?.showLabel
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : ""
                  }`}
              />
            </div>

            {/* Sección de imagen */}
            {(field.field_type === "image" || field.field_type === "signature") && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  {field.field_type === "signature" ? "Imagen de Firma" : "Imagen"}
                </label>

                {editedField.default_value && (
                  <div className="mb-2 relative inline-block">
                    <img
                      src={editedField.default_value}
                      alt="Preview"
                      className="max-h-24 max-w-full rounded border border-gray-200 shadow-sm"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute -top-1.5 -right-1.5 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md"
                      title="Eliminar imagen"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}

                <div className="flex gap-1.5 mb-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/svg+xml,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                    id={`image-upload-${field.id}`}
                    disabled={uploading}
                  />
                  <label
                    htmlFor={`image-upload-${field.id}`}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 border-2 border-dashed rounded cursor-pointer transition-colors ${uploading
                      ? "border-sky-300 bg-sky-50"
                      : "border-gray-300 hover:border-sky-400 hover:bg-sky-50"
                      }`}
                  >
                    {uploading ? (
                      <Loader2 className="h-3.5 w-3.5 text-sky-500 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5 text-gray-400" />
                    )}
                    <span className="text-xs text-gray-600">
                      {uploading ? "..." : "Subir"}
                    </span>
                  </label>

                  <button
                    onClick={() => setShowGallery(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  >
                    <Image className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs text-gray-600">Galería</span>
                  </button>
                </div>

                {showGallery && (
                  <div className="border border-gray-200 rounded-lg p-3 mb-3 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-700">
                        Imágenes disponibles
                      </span>
                      <button
                        onClick={() => setShowGallery(false)}
                        className="p-0.5 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {loadingImages ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-5 w-5 text-sky-500 animate-spin" />
                      </div>
                    ) : existingImages.length === 0 ? (
                      <p className="text-xs text-gray-500 text-center py-4">
                        No hay imágenes subidas aún
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 gap-1.5 max-h-32 overflow-y-auto">
                        {existingImages.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSelectFromGallery(img.url)}
                            className={`aspect-square border-2 rounded overflow-hidden hover:border-sky-400 transition-colors ${editedField.default_value === img.url
                              ? "border-sky-500 ring-2 ring-sky-200"
                              : "border-gray-200"
                              }`}
                            title={img.filename}
                          >
                            <img
                              src={img.url}
                              alt={img.filename}
                              className="w-full h-full object-contain bg-white"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-xs text-gray-500 mb-1">O ingresa URL</label>
                  <input
                    type="text"
                    value={editedField.default_value || ""}
                    onChange={(e) => handleChange("default_value", e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
                    placeholder="https://..."
                  />
                </div>
              </div>
            )}

            {/* Valor por defecto para otros tipos */}
            {field.field_type !== "image" && field.field_type !== "signature" && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Valor por defecto
                </label>

                {field.field_type === "paragraph" && (
                  <div className="flex gap-1 mb-2 p-1 bg-gray-50 border border-gray-200 rounded">
                    <button
                      type="button"
                      onClick={() => {
                        const textarea = document.getElementById(`textarea-${field.id}`);
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const selectedText = (editedField.default_value || "").substring(
                          start,
                          end
                        );
                        const newValue =
                          (editedField.default_value || "").substring(0, start) +
                          `<strong>${selectedText || "texto"}</strong>` +
                          (editedField.default_value || "").substring(end);
                        handleChange("default_value", newValue);
                        setTimeout(() => textarea.focus(), 0);
                      }}
                      className="p-1.5 text-gray-600 hover:bg-white hover:text-gray-900 rounded transition-colors"
                      title="Negrita"
                    >
                      <Bold className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const textarea = document.getElementById(`textarea-${field.id}`);
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const selectedText = (editedField.default_value || "").substring(
                          start,
                          end
                        );
                        const newValue =
                          (editedField.default_value || "").substring(0, start) +
                          `<em>${selectedText || "texto"}</em>` +
                          (editedField.default_value || "").substring(end);
                        handleChange("default_value", newValue);
                        setTimeout(() => textarea.focus(), 0);
                      }}
                      className="p-1.5 text-gray-600 hover:bg-white hover:text-gray-900 rounded transition-colors"
                      title="Cursiva"
                    >
                      <Italic className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const textarea = document.getElementById(`textarea-${field.id}`);
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const selectedText = (editedField.default_value || "").substring(
                          start,
                          end
                        );
                        const newValue =
                          (editedField.default_value || "").substring(0, start) +
                          `<u>${selectedText || "texto"}</u>` +
                          (editedField.default_value || "").substring(end);
                        handleChange("default_value", newValue);
                        setTimeout(() => textarea.focus(), 0);
                      }}
                      className="p-1.5 text-gray-600 hover:bg-white hover:text-gray-900 rounded transition-colors"
                      title="Subrayado"
                    >
                      <Underline className="h-3.5 w-3.5" />
                    </button>
                    <div className="w-px bg-gray-300 mx-1"></div>
                    <span className="text-xs text-gray-500 px-2 flex items-center">
                      Selecciona texto y aplica formato
                    </span>
                  </div>
                )}

                <textarea
                  id={`textarea-${field.id}`}
                  value={editedField.default_value || ""}
                  onChange={(e) => handleChange("default_value", e.target.value)}
                  rows={8}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm font-mono"
                  placeholder="Texto o template con {variables}"
                />

                {/* Insertar variables disponibles */}
                <details className="border border-gray-200 rounded mt-2 bg-gray-50">
                  <summary className="text-xs font-medium text-gray-600 cursor-pointer px-2 py-1.5 hover:bg-gray-100 flex items-center gap-1">
                    <span>Insertar variable</span>
                    <span className="text-[10px] bg-gray-200 px-1 rounded ml-auto">
                      {((availableVariables.system?.sistema?.length || 0) +
                        (availableVariables.system?.empresa?.length || 0) +
                        (availableVariables.system?.certificado?.length || 0) +
                        (availableVariables.data_source_info?.columns?.length || 0))}
                    </span>
                  </summary>
                  <div className="p-2 border-t border-gray-200 space-y-2">
                    {/* Buscador rápido */}
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                      <input
                        type="text"
                        value={variableSearch}
                        onChange={(e) => setVariableSearch(e.target.value)}
                        placeholder="Buscar..."
                        className="w-full pl-6 pr-2 py-1 border border-gray-300 rounded text-[10px] focus:border-sky-400"
                      />
                    </div>

                    {/* Variables de Sistema (fechas) */}
                    {(availableVariables.system?.sistema || [])
                      .filter((v) => !variableSearch || v.key.toLowerCase().includes(variableSearch.toLowerCase()) || v.label.toLowerCase().includes(variableSearch.toLowerCase()))
                      .length > 0 && (
                        <div>
                          <p className="text-[10px] font-medium text-sky-600 mb-1">Sistema</p>
                          <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                            {(availableVariables.system?.sistema || [])
                              .filter((v) => !variableSearch || v.key.toLowerCase().includes(variableSearch.toLowerCase()) || v.label.toLowerCase().includes(variableSearch.toLowerCase()))
                              .map((v) => (
                                <button
                                  key={v.key}
                                  type="button"
                                  onClick={() => {
                                    const textarea = document.getElementById(`textarea-${field.id}`);
                                    const start = textarea?.selectionStart || (editedField.default_value || "").length;
                                    const currentValue = editedField.default_value || "";
                                    const newValue = currentValue.slice(0, start) + `{${v.key}}` + currentValue.slice(start);
                                    handleChange("default_value", newValue);
                                    handleSnackbar(`{${v.key}} insertado`, "info");
                                  }}
                                  className="px-1.5 py-0.5 text-[10px] bg-sky-100 text-sky-700 rounded hover:bg-sky-200 transition-colors"
                                  title={v.label}
                                >
                                  {v.label.split('.').pop()}
                                </button>
                              ))}
                          </div>
                        </div>
                      )}

                    {/* Variables de Empresa */}
                    {(availableVariables.system?.empresa || [])
                      .filter((v) => !variableSearch || v.key.toLowerCase().includes(variableSearch.toLowerCase()) || v.label.toLowerCase().includes(variableSearch.toLowerCase()))
                      .length > 0 && (
                        <div>
                          <p className="text-[10px] font-medium text-violet-600 mb-1">Empresa</p>
                          <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                            {(availableVariables.system?.empresa || [])
                              .filter((v) => !variableSearch || v.key.toLowerCase().includes(variableSearch.toLowerCase()) || v.label.toLowerCase().includes(variableSearch.toLowerCase()))
                              .map((v) => (
                                <button
                                  key={v.key}
                                  type="button"
                                  onClick={() => {
                                    const textarea = document.getElementById(`textarea-${field.id}`);
                                    const start = textarea?.selectionStart || (editedField.default_value || "").length;
                                    const currentValue = editedField.default_value || "";
                                    const newValue = currentValue.slice(0, start) + `{${v.key}}` + currentValue.slice(start);
                                    handleChange("default_value", newValue);
                                    handleSnackbar(`{${v.key}} insertado`, "info");
                                  }}
                                  className="px-1.5 py-0.5 text-[10px] bg-violet-100 text-violet-700 rounded hover:bg-violet-200 transition-colors"
                                  title={v.label}
                                >
                                  {v.label.split('.').pop()}
                                </button>
                              ))}
                          </div>
                        </div>
                      )}

                    {/* Variables de Certificado */}
                    {(availableVariables.system?.certificado || [])
                      .filter((v) => !variableSearch || v.key.toLowerCase().includes(variableSearch.toLowerCase()) || v.label.toLowerCase().includes(variableSearch.toLowerCase()))
                      .length > 0 && (
                        <div>
                          <p className="text-[10px] font-medium text-amber-600 mb-1">Certificado</p>
                          <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                            {(availableVariables.system?.certificado || [])
                              .filter((v) => !variableSearch || v.key.toLowerCase().includes(variableSearch.toLowerCase()) || v.label.toLowerCase().includes(variableSearch.toLowerCase()))
                              .map((v) => (
                                <button
                                  key={v.key}
                                  type="button"
                                  onClick={() => {
                                    const textarea = document.getElementById(`textarea-${field.id}`);
                                    const start = textarea?.selectionStart || (editedField.default_value || "").length;
                                    const currentValue = editedField.default_value || "";
                                    const newValue = currentValue.slice(0, start) + `{${v.key}}` + currentValue.slice(start);
                                    handleChange("default_value", newValue);
                                    handleSnackbar(`{${v.key}} insertado`, "info");
                                  }}
                                  className="px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition-colors"
                                  title={v.label}
                                >
                                  {v.label.split('.').pop()}
                                </button>
                              ))}
                          </div>
                        </div>
                      )}
                    {/* Variables de Certificado */}
                    {(availableVariables.system?.filtros || [])
                      .filter((v) => !variableSearch || v.key.toLowerCase().includes(variableSearch.toLowerCase()) || v.label.toLowerCase().includes(variableSearch.toLowerCase()))
                      .length > 0 && (
                        <div>
                          <p className="text-[10px] font-medium text-amber-600 mb-1">Filtros de Ejecución</p>
                          <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                            {(availableVariables.system?.filtros || [])
                              .filter((v) => !variableSearch || v.key.toLowerCase().includes(variableSearch.toLowerCase()) || v.label.toLowerCase().includes(variableSearch.toLowerCase()))
                              .map((v) => (
                                <button
                                  key={v.key}
                                  type="button"
                                  onClick={() => {
                                    const textarea = document.getElementById(`textarea-${field.id}`);
                                    const start = textarea?.selectionStart || (editedField.default_value || "").length;
                                    const currentValue = editedField.default_value || "";
                                    const newValue = currentValue.slice(0, start) + `{${v.key}}` + currentValue.slice(start);
                                    handleChange("default_value", newValue);
                                    handleSnackbar(`{${v.key}} insertado`, "info");
                                  }}
                                  className="px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition-colors"
                                  title={v.label}
                                >
                                  {v.label.split('.').pop()}
                                </button>
                              ))}
                          </div>
                        </div>
                      )}

                    {/* Variables del origen de datos */}
                    {(availableVariables.data_source_info?.columns || [])
                      .filter((v) => !variableSearch || v.key.toLowerCase().includes(variableSearch.toLowerCase()) || v.label.toLowerCase().includes(variableSearch.toLowerCase()))
                      .length > 0 && (
                        <div>
                          <p className="text-[10px] font-medium text-emerald-600 mb-1">
                            Consulta SQL Asociada
                          </p>
                          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                            {(availableVariables.data_source_info?.columns || [])
                              .filter((v) => !variableSearch || v.key.toLowerCase().includes(variableSearch.toLowerCase()) || v.label.toLowerCase().includes(variableSearch.toLowerCase()))
                              .map((v) => (
                                <button
                                  key={v.key}
                                  type="button"
                                  onClick={() => {
                                    const textarea = document.getElementById(`textarea-${field.id}`);
                                    const start = textarea?.selectionStart || (editedField.default_value || "").length;
                                    const currentValue = editedField.default_value || "";
                                    const newValue = currentValue.slice(0, start) + `{${v.key}}` + currentValue.slice(start);
                                    handleChange("default_value", newValue);
                                    handleSnackbar(`{${v.key}} insertado`, "info");
                                  }}
                                  className="px-1.5 py-0.5 text-[10px] bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition-colors"
                                  title={v.label}
                                >
                                  {v.key.replace('data.', '')}
                                </button>
                              ))}
                          </div>
                        </div>
                      )}

                    {/* Sin variables */}
                    {((availableVariables.system?.sistema?.length || 0) +
                      (availableVariables.system?.empresa?.length || 0) +
                      (availableVariables.system?.certificado?.length || 0)) === 0 &&
                      (availableVariables.data_source_info?.columns?.length || 0) === 0 && (
                      <p className="text-[10px] text-gray-500 text-center py-2">
                        Sin variables disponibles. Configura un origen de datos en la plantilla.
                      </p>
                    )}
                  </div>
                </details>
              </div>
            )}

            <div className="flex items-center gap-3 pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editedField.is_visible !== false}
                  onChange={(e) => handleChange("is_visible", e.target.checked)}
                  className="rounded border-gray-300 h-3.5 w-3.5"
                />
                <span className="text-xs text-gray-700">Visible</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editedField.is_required || false}
                  onChange={(e) => handleChange("is_required", e.target.checked)}
                  className="rounded border-gray-300 h-3.5 w-3.5"
                />
                <span className="text-xs text-gray-700">Requerido</span>
              </label>
            </div>
          </div>
        )}

        {activeTab === "styles" && (
          <div className="space-y-3">
            {/* Controles de tamaño para imágenes */}
            {(field.field_type === "image" || field.field_type === "signature") && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Tamaño de imagen
                  </label>
                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="text-xs text-gray-500">Ancho</label>
                        <button
                          onClick={() => handleStyleChange("maxWidth", "auto")}
                          className={`text-xs px-1 py-0.5 rounded ${editedField.styles?.maxWidth === "auto" ||
                            !editedField.styles?.maxWidth
                            ? "bg-sky-100 text-sky-700"
                            : "text-gray-500 hover:bg-gray-100"
                            }`}
                        >
                          Auto
                        </button>
                      </div>
                      <div className="flex gap-1.5 items-center">
                        <input
                          type="range"
                          min="20"
                          max="400"
                          value={parseInt(editedField.styles?.maxWidth) || 100}
                          onChange={(e) =>
                            handleStyleChange("maxWidth", `${e.target.value}px`)
                          }
                          className="flex-1"
                        />
                        <input
                          type="text"
                          value={editedField.styles?.maxWidth || "auto"}
                          onChange={(e) => handleStyleChange("maxWidth", e.target.value)}
                          className="w-16 px-1.5 py-1 border border-gray-300 rounded text-xs text-center"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="text-xs text-gray-500">Alto</label>
                        <button
                          onClick={() => handleStyleChange("maxHeight", "auto")}
                          className={`text-xs px-1 py-0.5 rounded ${editedField.styles?.maxHeight === "auto"
                            ? "bg-sky-100 text-sky-700"
                            : "text-gray-500 hover:bg-gray-100"
                            }`}
                        >
                          Auto
                        </button>
                      </div>
                      <div className="flex gap-1.5 items-center">
                        <input
                          type="range"
                          min="20"
                          max="300"
                          value={parseInt(editedField.styles?.maxHeight) || 80}
                          onChange={(e) =>
                            handleStyleChange("maxHeight", `${e.target.value}px`)
                          }
                          className="flex-1"
                        />
                        <input
                          type="text"
                          value={editedField.styles?.maxHeight || "80px"}
                          onChange={(e) => handleStyleChange("maxHeight", e.target.value)}
                          className="w-16 px-1.5 py-1 border border-gray-300 rounded text-xs text-center"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Ajuste
                  </label>
                  <div className="flex gap-1 flex-wrap">
                    {[
                      { value: "contain", label: "Contener" },
                      { value: "cover", label: "Cubrir" },
                      { value: "fill", label: "Estirar" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleStyleChange("objectFit", opt.value)}
                        className={`px-1.5 py-1 text-xs rounded ${editedField.styles?.objectFit === opt.value ||
                          (!editedField.styles?.objectFit && opt.value === "contain")
                          ? "bg-sky-100 text-sky-700 border border-sky-300"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Tamaño de fuente */}
            {field.field_type !== "image" && field.field_type !== "signature" && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Tamaño fuente
                </label>
                <div className="flex gap-1 flex-wrap mb-2">
                  {fontSizes.map((size) => (
                    <button
                      key={size.value}
                      onClick={() => handleStyleChange("fontSize", size.value)}
                      className={`px-1.5 py-1 text-xs rounded ${editedField.styles?.fontSize === size.value
                        ? "bg-sky-100 text-sky-700 border border-sky-300"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1 items-center">
                  <input
                    type="number"
                    min="6"
                    max="120"
                    value={parseInt(editedField.styles?.fontSize) || 14}
                    onChange={(e) => handleStyleChange("fontSize", `${e.target.value}px`)}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-xs text-center"
                  />
                  <span className="text-xs text-gray-500">px (personalizado)</span>
                </div>
              </div>
            )}

            {/* Formato */}
            {field.field_type !== "image" && field.field_type !== "signature" && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Formato
                </label>
                <div className="flex gap-1">
                  <button
                    onClick={() =>
                      handleStyleChange(
                        "fontWeight",
                        editedField.styles?.fontWeight === "bold" ? "normal" : "bold"
                      )
                    }
                    className={`p-1.5 rounded ${editedField.styles?.fontWeight === "bold"
                      ? "bg-sky-100 text-sky-700"
                      : "bg-gray-100 text-gray-600"
                      }`}
                  >
                    <Bold className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      handleStyleChange(
                        "fontStyle",
                        editedField.styles?.fontStyle === "italic" ? "normal" : "italic"
                      )
                    }
                    className={`p-1.5 rounded ${editedField.styles?.fontStyle === "italic"
                      ? "bg-sky-100 text-sky-700"
                      : "bg-gray-100 text-gray-600"
                      }`}
                  >
                    <Italic className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      handleStyleChange(
                        "textDecoration",
                        editedField.styles?.textDecoration === "underline"
                          ? "none"
                          : "underline"
                      )
                    }
                    className={`p-1.5 rounded ${editedField.styles?.textDecoration === "underline"
                      ? "bg-sky-100 text-sky-700"
                      : "bg-gray-100 text-gray-600"
                      }`}
                  >
                    <Underline className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Alineación */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Alineación
              </label>
              <div className="flex gap-1">
                {[
                  { value: "left", icon: AlignLeft },
                  { value: "center", icon: AlignCenter },
                  { value: "right", icon: AlignRight },
                  { value: "justify", icon: AlignJustify },
                ].map(({ value, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => handleStyleChange("textAlign", value)}
                    className={`p-1.5 rounded ${editedField.styles?.textAlign === value
                      ? "bg-sky-100 text-sky-700"
                      : "bg-gray-100 text-gray-600"
                      }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            {field.field_type !== "image" && field.field_type !== "signature" && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Color texto
                </label>
                <div className="flex gap-1.5 items-center">
                  <input
                    type="color"
                    value={editedField.styles?.color || "#000000"}
                    onChange={(e) => handleStyleChange("color", e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={editedField.styles?.color || "#000000"}
                    onChange={(e) => handleStyleChange("color", e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {/* Color etiqueta */}
            {!["image", "signature", "table", "paragraph", "divider", "spacer"].includes(
              field.field_type
            ) &&
              editedField.styles?.showLabel && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Color etiqueta
                  </label>
                  <div className="flex gap-1.5 items-center">
                    <input
                      type="color"
                      value={editedField.styles?.labelColor || "#6b7280"}
                      onChange={(e) => handleStyleChange("labelColor", e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={editedField.styles?.labelColor || "#6b7280"}
                      onChange={(e) => handleStyleChange("labelColor", e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs font-mono"
                    />
                  </div>
                </div>
              )}

            {/* Ancho del campo */}
            {field.field_type !== "spacer" && field.field_type !== "divider" && field.field_type !== "break_page" && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Ancho campo
                </label>
                <div className="flex gap-1 flex-wrap">
                  {[
                    { value: "100%", label: "100%" },
                    { value: "75%", label: "75%" },
                    { value: "50%", label: "50%" },
                    { value: "33.33%", label: "33%" },
                    { value: "25%", label: "25%" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleStyleChange("width", opt.value)}
                      className={`px-2 py-1 text-xs rounded ${editedField.styles?.width === opt.value ||
                        (!editedField.styles?.width && opt.value === "100%")
                        ? "bg-sky-100 text-sky-700 border border-sky-300"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Altura del espacio (solo para spacer) */}
            {field.field_type === "spacer" && (
              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Altura del espacio
                </label>
                <p className="text-[10px] text-gray-500 mb-2">
                  Controla qué tan grande es el espacio vertical
                </p>

                <div className="flex gap-1 flex-wrap mb-2">
                  {[
                    { value: "20px", label: "Pequeño (20px)" },
                    { value: "40px", label: "Mediano (40px)" },
                    { value: "60px", label: "Grande (60px)" },
                    { value: "100px", label: "Muy grande (100px)" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleStyleChange("spacerHeight", opt.value)}
                      className={`px-2 py-1 text-[10px] rounded ${editedField.styles?.spacerHeight === opt.value
                        ? "bg-sky-100 text-sky-700 border border-sky-300 font-medium"
                        : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-300"
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 items-center">
                  <label className="text-[10px] text-gray-600">Personalizado:</label>
                  <input
                    type="number"
                    value={parseInt(editedField.styles?.spacerHeight || "20") || 20}
                    onChange={(e) =>
                      handleStyleChange("spacerHeight", `${e.target.value}px`)
                    }
                    className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                    min="1"
                    max="500"
                  />
                  <span className="text-[10px] text-gray-500">px</span>
                </div>

                <div className="mt-3 p-2 bg-white rounded border border-gray-200">
                  <p className="text-[9px] text-gray-500 mb-1">Vista previa:</p>
                  <div
                    className="bg-gray-200 border border-dashed border-gray-400 rounded"
                    style={{ height: editedField.styles?.spacerHeight || "20px" }}
                  />
                  <p className="text-[9px] text-gray-500 mt-1 text-center">
                    {editedField.styles?.spacerHeight || "20px"} de altura
                  </p>
                </div>
              </div>
            )}

            {/* Espaciado - Padding */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-700">Padding</label>
                <div className="flex items-center gap-1">
                  {["px", "em", "%", "rem"].map((unit) => (
                    <button
                      key={unit}
                      onClick={() => setPaddingUnit(unit)}
                      className={`px-1.5 py-0.5 text-[10px] rounded ${paddingUnit === unit
                        ? "bg-sky-100 text-sky-700 font-medium"
                        : "text-gray-400 hover:text-gray-600"
                        }`}
                    >
                      {unit.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <div className="grid grid-cols-4 gap-1 flex-1">
                  {[
                    { key: "paddingTop", label: "TOP" },
                    { key: "paddingRight", label: "RIGHT" },
                    { key: "paddingBottom", label: "BOTTOM" },
                    { key: "paddingLeft", label: "LEFT" },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <input
                        type="number"
                        value={getSpacingValue(editedField.styles?.[key], 0)}
                        onChange={(e) => {
                          const val = e.target.value;
                          const valueWithUnit = val + paddingUnit;
                          if (paddingLinked) {
                            handleMultipleStyleChanges({
                              paddingTop: valueWithUnit,
                              paddingRight: valueWithUnit,
                              paddingBottom: valueWithUnit,
                              paddingLeft: valueWithUnit,
                            });
                          } else {
                            handleStyleChange(key, valueWithUnit);
                          }
                        }}
                        className="w-full px-1 py-1.5 border border-gray-300 rounded text-xs text-center"
                      />
                      <label className="block text-[9px] text-gray-400 text-center mt-0.5">
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setPaddingLinked(!paddingLinked)}
                  className={`p-1.5 rounded ${paddingLinked
                    ? "bg-sky-100 text-sky-600"
                    : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                    }`}
                  title={paddingLinked ? "Valores vinculados" : "Valores independientes"}
                >
                  <Link2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Espaciado - Margin */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-700">Margin</label>
                <div className="flex items-center gap-1">
                  {["px", "em", "%", "rem"].map((unit) => (
                    <button
                      key={unit}
                      onClick={() => setMarginUnit(unit)}
                      className={`px-1.5 py-0.5 text-[10px] rounded ${marginUnit === unit
                        ? "bg-sky-100 text-sky-700 font-medium"
                        : "text-gray-400 hover:text-gray-600"
                        }`}
                    >
                      {unit.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <div className="grid grid-cols-4 gap-1 flex-1">
                  {[
                    { key: "marginTop", label: "TOP", defaultVal: 0 },
                    { key: "marginRight", label: "RIGHT", defaultVal: 0 },
                    { key: "marginBottom", label: "BOTTOM", defaultVal: 0 },
                    { key: "marginLeft", label: "LEFT", defaultVal: 0 },
                  ].map(({ key, label, defaultVal }) => (
                    <div key={key}>
                      <input
                        type="number"
                        value={getSpacingValue(editedField.styles?.[key], defaultVal)}
                        onChange={(e) => {
                          const val = e.target.value;
                          const valueWithUnit = val + marginUnit;
                          if (marginLinked) {
                            handleMultipleStyleChanges({
                              marginTop: valueWithUnit,
                              marginRight: valueWithUnit,
                              marginBottom: valueWithUnit,
                              marginLeft: valueWithUnit,
                            });
                          } else {
                            handleStyleChange(key, valueWithUnit);
                          }
                        }}
                        className="w-full px-1 py-1.5 border border-gray-300 rounded text-xs text-center"
                      />
                      <label className="block text-[9px] text-gray-400 text-center mt-0.5">
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setMarginLinked(!marginLinked)}
                  className={`p-1.5 rounded ${marginLinked
                    ? "bg-sky-100 text-sky-600"
                    : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                    }`}
                  title={marginLinked ? "Valores vinculados" : "Valores independientes"}
                >
                  <Link2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Fondo y borde */}
            <details className="border border-gray-200 rounded p-2">
              <summary className="text-xs font-medium text-gray-700 cursor-pointer">
                Más opciones
              </summary>
              <div className="mt-2 space-y-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Fondo</label>
                  <div className="flex gap-1.5 items-center">
                    <input
                      type="color"
                      value={editedField.styles?.backgroundColor || "#ffffff"}
                      onChange={(e) => handleStyleChange("backgroundColor", e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={editedField.styles?.backgroundColor || "transparent"}
                      onChange={(e) => handleStyleChange("backgroundColor", e.target.value)}
                      className="flex-1 px-1.5 py-1 border border-gray-300 rounded text-xs font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Borde</label>
                  <input
                    type="text"
                    value={editedField.styles?.border || ""}
                    onChange={(e) => handleStyleChange("border", e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                    placeholder="1px solid #ccc"
                  />
                </div>
              </div>
            </details>
          </div>
        )}

        {activeTab === "data" && (
          <div className="space-y-3">
            {field.field_type === "table" ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Procesador de Tabla
                  </label>
                  <select
                    value={editedField.processor_id || ""}
                    onChange={(e) => {
                      const processorId = e.target.value ? parseInt(e.target.value) : null;
                      const selectedProcessor = tableProcessors.find(p => p.id === processorId);
                      const updated = {
                        ...editedField,
                        processor_id: processorId,
                        processor_name: selectedProcessor?.name || null,
                      };
                      setEditedField(updated);
                      onSave(updated);
                      setProcessorPreview(null);
                    }}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
                  >
                    <option value="">-- Seleccionar procesador --</option>
                    {tableProcessors.map((proc) => (
                      <option key={proc.id} value={proc.id}>
                        {proc.name} ({proc.code})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-0.5">
                    El procesador genera el HTML de la tabla desde el backend
                  </p>
                </div>

                {editedField.processor_id && (
                  <div className="space-y-2">
                    <button
                      onClick={async () => {
                        setPreviewingProcessor(true);
                        try {
                          const res = await previewTableProcessor(
                            editedField.processor_id,
                            {}
                          );
                          if (res.success) {
                            setProcessorPreview(res.data);
                          } else {
                            handleSnackbar("Error al previsualizar: " + res.message, "error");
                          }
                        } catch (err) {
                          handleSnackbar("Error de conexión", "error");
                        } finally {
                          setPreviewingProcessor(false);
                        }
                      }}
                      disabled={previewingProcessor}
                      className="w-full px-3 py-1.5 bg-sky-50 text-sky-700 border border-sky-200 rounded text-xs hover:bg-sky-100 flex items-center justify-center gap-2"
                    >
                      {previewingProcessor ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Eye className="w-3 h-3" />
                      )}
                      Previsualizar Tabla
                    </button>

                    {processorPreview?.html && (
                      <div className="border border-gray-200 rounded p-2 bg-white max-h-48 overflow-auto">
                        <p className="text-xs text-gray-500 mb-1">Vista previa:</p>
                        <div
                          className="text-xs"
                          dangerouslySetInnerHTML={{ __html: processorPreview.html }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {tableProcessors.length === 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
                    <p className="font-medium">No hay procesadores configurados</p>
                    <p className="mt-1">
                      Ve a <strong>Procesadores</strong> en el menú para crear uno.
                      El código del procesador debe tener su función en el backend.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Header con info del origen de datos */}
                {availableVariables.data_source_info ? (
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <Table className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-emerald-800">
                          {availableVariables.data_source_info.name}
                        </p>
                        {availableVariables.data_source_info?.columns?.length > 0 && (
                          <p className="text-[10px] text-emerald-600">
                            {availableVariables.data_source_info.columns.length} variables disponibles
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs font-medium text-amber-800">Sin origen de datos</p>
                    <p className="text-[10px] text-amber-600 mt-0.5">
                      Configura un origen de datos SQL en la plantilla para habilitar variables dinámicas.
                    </p>
                  </div>
                )}

                {/* Buscador de variables */}
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={variableSearch}
                    onChange={(e) => setVariableSearch(e.target.value)}
                    placeholder="Buscar variable..."
                    className="w-full pl-7 pr-7 py-1.5 border border-gray-300 rounded text-xs focus:border-sky-400 focus:ring-1 focus:ring-sky-200"
                  />
                  {variableSearch && (
                    <button
                      onClick={() => setVariableSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Variables de Sistema (fechas) */}
                {(() => {
                  const filteredSistema = (availableVariables.system?.sistema || []).filter(
                    (v) =>
                      !variableSearch ||
                      v.key.toLowerCase().includes(variableSearch.toLowerCase()) ||
                      v.label.toLowerCase().includes(variableSearch.toLowerCase())
                  );
                  if (filteredSistema.length === 0) return null;
                  return (
                    <div className="border border-sky-200 rounded-lg overflow-hidden">
                      <div className="px-2 py-1.5 bg-sky-100 flex items-center justify-between">
                        <span className="text-xs font-medium text-sky-800">Sistema</span>
                        <span className="text-[10px] bg-sky-200 text-sky-700 px-1.5 rounded-full">
                          {filteredSistema.length}
                        </span>
                      </div>
                      <div className="divide-y divide-sky-100 max-h-32 overflow-y-auto">
                        {filteredSistema.map((v) => (
                          <div
                            key={v.key}
                            className="px-2 py-1.5 hover:bg-sky-50 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0 flex-1">
                              <code className="text-[11px] text-sky-700 font-mono font-medium">
                                {`{${v.key}}`}
                              </code>
                              <p className="text-[10px] text-gray-500 truncate">{v.label}</p>
                            </div>
                            <div className="flex-shrink-0 text-right">
                              <span className="text-[9px] text-gray-400 block italic">
                                {v.sample || "-"}
                              </span>
                              <span className="text-[8px] text-sky-500 uppercase">{v.type}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Variables de Empresa */}
                {(() => {
                  const filteredEmpresa = (availableVariables.system?.empresa || []).filter(
                    (v) =>
                      !variableSearch ||
                      v.key.toLowerCase().includes(variableSearch.toLowerCase()) ||
                      v.label.toLowerCase().includes(variableSearch.toLowerCase())
                  );
                  if (filteredEmpresa.length === 0) return null;
                  return (
                    <div className="border border-violet-200 rounded-lg overflow-hidden">
                      <div className="px-2 py-1.5 bg-violet-100 flex items-center justify-between">
                        <span className="text-xs font-medium text-violet-800">Empresa</span>
                        <span className="text-[10px] bg-violet-200 text-violet-700 px-1.5 rounded-full">
                          {filteredEmpresa.length}
                        </span>
                      </div>
                      <div className="divide-y divide-violet-100 max-h-32 overflow-y-auto">
                        {filteredEmpresa.map((v) => (
                          <div
                            key={v.key}
                            className="px-2 py-1.5 hover:bg-violet-50 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0 flex-1">
                              <code className="text-[11px] text-violet-700 font-mono font-medium">
                                {`{${v.key}}`}
                              </code>
                              <p className="text-[10px] text-gray-500 truncate">{v.label}</p>
                            </div>
                            <div className="flex-shrink-0 text-right">
                              <span className="text-[9px] text-gray-400 block italic">
                                {v.sample || "-"}
                              </span>
                              <span className="text-[8px] text-violet-500 uppercase">{v.type}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Variables de Certificado */}
                {(() => {
                  const filteredCertificado = (availableVariables.system?.certificado || []).filter(
                    (v) =>
                      !variableSearch ||
                      v.key.toLowerCase().includes(variableSearch.toLowerCase()) ||
                      v.label.toLowerCase().includes(variableSearch.toLowerCase())
                  );
                  if (filteredCertificado.length === 0) return null;
                  return (
                    <div className="border border-amber-200 rounded-lg overflow-hidden">
                      <div className="px-2 py-1.5 bg-amber-100 flex items-center justify-between">
                        <span className="text-xs font-medium text-amber-800">Certificado</span>
                        <span className="text-[10px] bg-amber-200 text-amber-700 px-1.5 rounded-full">
                          {filteredCertificado.length}
                        </span>
                      </div>
                      <div className="divide-y divide-amber-100 max-h-32 overflow-y-auto">
                        {filteredCertificado.map((v) => (
                          <div
                            key={v.key}
                            className="px-2 py-1.5 hover:bg-amber-50 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0 flex-1">
                              <code className="text-[11px] text-amber-700 font-mono font-medium">
                                {`{${v.key}}`}
                              </code>
                              <p className="text-[10px] text-gray-500 truncate">{v.label}</p>
                            </div>
                            <div className="flex-shrink-0 text-right">
                              <span className="text-[9px] text-gray-400 block italic">
                                {v.sample || "-"}
                              </span>
                              <span className="text-[8px] text-amber-500 uppercase">{v.type}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Variables del Origen de Datos */}
                {(() => {
                  const filteredDataSource = (availableVariables.data_source_info?.columns || []).filter(
                    (v) =>
                      !variableSearch ||
                      v.key.toLowerCase().includes(variableSearch.toLowerCase()) ||
                      v.label.toLowerCase().includes(variableSearch.toLowerCase())
                  );
                  if (filteredDataSource.length === 0) return null;
                  return (
                    <div className="border border-emerald-200 rounded-lg overflow-hidden">
                      <div className="px-2 py-1.5 bg-emerald-100 flex items-center justify-between">
                        <span className="text-xs font-medium text-emerald-800">Variables del Origen de Datos</span>
                        <span className="text-[10px] bg-emerald-200 text-emerald-700 px-1.5 rounded-full">
                          {filteredDataSource.length}
                        </span>
                      </div>
                      <div className="divide-y divide-emerald-100 max-h-48 overflow-y-auto">
                        {filteredDataSource.map((v) => (
                          <div
                            key={v.key}
                            className="px-2 py-1.5 hover:bg-emerald-50 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0 flex-1">
                              <code className="text-[11px] text-emerald-700 font-mono font-medium">
                                {`{${v.key}}`}
                              </code>
                              <p className="text-[10px] text-gray-500 truncate">{v.label}</p>
                            </div>
                            <div className="flex-shrink-0 text-right">
                              <span className="text-[9px] text-gray-400 block italic truncate max-w-[80px]">
                                {v.sample || "-"}
                              </span>
                              <span className="text-[8px] text-emerald-500 uppercase">{v.type || "string"}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Mensaje si no hay resultados en búsqueda */}
                {variableSearch && (() => {
                  const allSystemVars = [
                    ...(availableVariables.system?.sistema || []),
                    ...(availableVariables.system?.empresa || []),
                    ...(availableVariables.system?.certificado || []),
                  ];
                  const filteredSystem = allSystemVars.filter(
                    (v) =>
                      v.key.toLowerCase().includes(variableSearch.toLowerCase()) ||
                      v.label.toLowerCase().includes(variableSearch.toLowerCase())
                  );
                  const filteredDataSource = (availableVariables.data_source_info?.columns || []).filter(
                    (v) =>
                      v.key.toLowerCase().includes(variableSearch.toLowerCase()) ||
                      v.label.toLowerCase().includes(variableSearch.toLowerCase())
                  );
                  if (filteredSystem.length === 0 && filteredDataSource.length === 0) {
                    return (
                      <div className="p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-500 text-center">
                        No se encontraron variables con "{variableSearch}"
                      </div>
                    );
                  }
                  return null;
                })()}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
