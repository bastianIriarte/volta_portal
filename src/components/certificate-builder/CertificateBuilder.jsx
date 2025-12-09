import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  GripVertical,
  Plus,
  Save,
  Trash2,
  Settings,
  ChevronDown,
  ChevronRight,
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
  HelpCircle,
  Lightbulb,
  MousePointer2,
  Zap,
  Maximize2,
  Minimize2,
  Eye,
  Bold,
  Italic,
  Underline,
  Columns,
  Move,
  Palette,
  Copy,
  Undo2,
  Redo2,
  AlertTriangle,
  History,
  Clock,
  ArrowUpDown,
  Paintbrush,
  CheckCircle2,
  Upload,
  Loader2,
  FileDown,
  Printer,
  Link2,
} from "lucide-react";
import { handleSnackbar } from "../../utils/messageHelpers";
import {
  getBuilderConfig,
  getTemplateFields,
  saveTemplateFields,
  getSimulatedData,
  uploadBuilderImage,
  listBuilderImages,
  getCertificatePdfUrl,
} from "../../services/certificateBuilderService";

// Mapeo de iconos
const iconMap = {
  Type, Calendar, Hash, DollarSign, Image, AlignLeft, Table, PenTool, Minus,
  Square, FileText, Building, Users, MapPin, PanelTop, PanelBottom,
  LayoutTop: PanelTop, LayoutBottom: PanelBottom, Truck, Recycle, Droplet,
};

const getIcon = (iconName) => iconMap[iconName] || FileText;

// Panel de Estilos Rápidos
function StylePanel({ field, onUpdate, onClose }) {
  const [styles, setStyles] = useState(field.styles || {});
  const panelRef = useRef(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    // Delay para evitar cerrar inmediatamente al abrir
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleStyleChange = (key, value) => {
    const newStyles = { ...styles, [key]: value };
    setStyles(newStyles);
    onUpdate({ ...field, styles: newStyles });
  };

  const fontSizes = [
    { label: "XS", value: "10px" },
    { label: "S", value: "12px" },
    { label: "M", value: "14px" },
    { label: "L", value: "16px" },
    { label: "XL", value: "20px" },
    { label: "2XL", value: "24px" },
    { label: "3XL", value: "32px" },
  ];

  const columnOptions = [
    { label: "100%", value: "100%" },
    { label: "75%", value: "75%" },
    { label: "66%", value: "66.66%" },
    { label: "50%", value: "50%" },
    { label: "33%", value: "33.33%" },
    { label: "25%", value: "25%" },
  ];

  return (
    <div ref={panelRef} className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-3 w-72" style={{ textAlign: "left" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-700">Estilos Rápidos</span>
        <button onClick={onClose} className="p-0.5 text-gray-400 hover:text-gray-600">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Tamaño de fuente - solo para campos de texto (no imagen/signature) */}
      {field.field_type !== "image" && field.field_type !== "signature" && (
        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">Tamaño</label>
          <div className="flex gap-1 flex-wrap">
            {fontSizes.map((size) => (
              <button
                key={size.value}
                onClick={() => handleStyleChange("fontSize", size.value)}
                className={`px-2 py-1 text-xs rounded ${
                  styles.fontSize === size.value
                    ? "bg-sky-100 text-sky-700 border border-sky-300"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Formato de texto - solo para campos de texto (no imagen/signature) */}
      {field.field_type !== "image" && field.field_type !== "signature" && (
        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">Formato</label>
          <div className="flex gap-1">
            <button
              onClick={() => handleStyleChange("fontWeight", styles.fontWeight === "bold" ? "normal" : "bold")}
              className={`p-1.5 rounded ${styles.fontWeight === "bold" ? "bg-sky-100 text-sky-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleStyleChange("fontStyle", styles.fontStyle === "italic" ? "normal" : "italic")}
              className={`p-1.5 rounded ${styles.fontStyle === "italic" ? "bg-sky-100 text-sky-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleStyleChange("textDecoration", styles.textDecoration === "underline" ? "none" : "underline")}
              className={`p-1.5 rounded ${styles.textDecoration === "underline" ? "bg-sky-100 text-sky-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              <Underline className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Alineación - visible para todos los tipos de campo */}
      <div className="mb-3">
        <label className="text-xs text-gray-500 mb-1 block">Alineación</label>
        <div className="flex gap-1">
          <button
            onClick={() => handleStyleChange("textAlign", "left")}
            className={`p-1.5 rounded ${styles.textAlign === "left" || !styles.textAlign ? "bg-sky-100 text-sky-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            <AlignLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleStyleChange("textAlign", "center")}
            className={`p-1.5 rounded ${styles.textAlign === "center" ? "bg-sky-100 text-sky-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            <AlignCenter className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleStyleChange("textAlign", "right")}
            className={`p-1.5 rounded ${styles.textAlign === "right" ? "bg-sky-100 text-sky-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            <AlignRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Color - solo para campos de texto */}
      {field.field_type !== "image" && field.field_type !== "signature" && (
        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">Color</label>
          <div className="flex gap-1 items-center">
            {["#000000", "#374151", "#0284c7", "#dc2626", "#16a34a", "#ca8a04"].map((color) => (
              <button
                key={color}
                onClick={() => handleStyleChange("color", color)}
                className={`w-6 h-6 rounded border-2 ${styles.color === color ? "border-sky-500" : "border-transparent"}`}
                style={{ backgroundColor: color }}
              />
            ))}
            <input
              type="color"
              value={styles.color || "#000000"}
              onChange={(e) => handleStyleChange("color", e.target.value)}
              className="w-6 h-6 rounded cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Tamaño de imagen - solo para campos de imagen */}
      {(field.field_type === "image" || field.field_type === "signature") && (
        <>
          <div className="mb-2">
            <label className="text-xs text-gray-500 mb-1 block">Ancho imagen</label>
            <div className="flex gap-2 items-center">
              <input
                type="range"
                min="20"
                max="300"
                value={parseInt(styles.maxWidth) || 100}
                onChange={(e) => handleStyleChange("maxWidth", `${e.target.value}px`)}
                className="flex-1"
              />
              <input
                type="text"
                value={styles.maxWidth || "auto"}
                onChange={(e) => handleStyleChange("maxWidth", e.target.value)}
                className="w-16 px-1.5 py-0.5 border border-gray-300 rounded text-xs text-center"
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="text-xs text-gray-500 mb-1 block">Alto imagen</label>
            <div className="flex gap-2 items-center">
              <input
                type="range"
                min="20"
                max="200"
                value={parseInt(styles.maxHeight) || 80}
                onChange={(e) => handleStyleChange("maxHeight", `${e.target.value}px`)}
                className="flex-1"
              />
              <input
                type="text"
                value={styles.maxHeight || "80px"}
                onChange={(e) => handleStyleChange("maxHeight", e.target.value)}
                className="w-16 px-1.5 py-0.5 border border-gray-300 rounded text-xs text-center"
              />
            </div>
          </div>
        </>
      )}

      {/* Ancho del campo */}
      <div className="mb-3">
        <label className="text-xs text-gray-500 mb-1 block">Ancho</label>
        <div className="flex gap-1 flex-wrap">
          {columnOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleStyleChange("width", opt.value)}
              className={`px-2 py-1 text-xs rounded ${
                styles.width === opt.value
                  ? "bg-sky-100 text-sky-700 border border-sky-300"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Espaciado */}
      <div className="mb-2">
        <label className="text-xs text-gray-500 mb-1 block">Espaciado (padding)</label>
        <div className="flex gap-2 items-center">
          <input
            type="range"
            min="0"
            max="32"
            value={parseInt(styles.padding) || 0}
            onChange={(e) => handleStyleChange("padding", `${e.target.value}px`)}
            className="flex-1"
          />
          <span className="text-xs text-gray-500 w-8">{parseInt(styles.padding) || 0}px</span>
        </div>
      </div>

      {/* Margen inferior */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Margen inferior</label>
        <div className="flex gap-2 items-center">
          <input
            type="range"
            min="0"
            max="32"
            value={parseInt(styles.marginBottom) || 8}
            onChange={(e) => handleStyleChange("marginBottom", `${e.target.value}px`)}
            className="flex-1"
          />
          <span className="text-xs text-gray-500 w-8">{parseInt(styles.marginBottom) || 8}px</span>
        </div>
      </div>
    </div>
  );
}

// Panel lateral de Configuración de Campo
function FieldConfigPanel({ field, config, onSave, onClose }) {
  const [editedField, setEditedField] = useState({ ...field });
  const [activeTab, setActiveTab] = useState("general");
  const [uploading, setUploading] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const fileInputRef = useRef(null);

  // Estados para espaciado tipo Elementor
  const [paddingLinked, setPaddingLinked] = useState(true);
  const [marginLinked, setMarginLinked] = useState(true);
  const [paddingUnit, setPaddingUnit] = useState("px");
  const [marginUnit, setMarginUnit] = useState("px");

  // Helper para extraer valor numérico de una propiedad de estilo
  const getSpacingValue = (value, defaultVal = 0) => {
    // Si es undefined, null, o string vacío, retornar default
    if (value === undefined || value === null || value === '') return defaultVal;
    // Si es un string con unidades, extraer el número
    if (typeof value === 'string') {
      const parsed = parseInt(value);
      return isNaN(parsed) ? defaultVal : parsed;
    }
    // Si es número, retornarlo
    if (typeof value === 'number') return value;
    // Cualquier otro caso, retornar default
    return defaultVal;
  };

  // Actualizar editedField cuando cambia el field seleccionado
  useEffect(() => {
    setEditedField({ ...field });
  }, [field?.id]);

  const handleChange = (key, value) => {
    const updated = { ...editedField, [key]: value };
    setEditedField(updated);
    // Auto-guardar al cambiar
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

    // Validar tipo de archivo
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/svg+xml", "image/webp"];
    if (!validTypes.includes(file.type)) {
      handleSnackbar("Tipo de archivo no válido. Usa JPG, PNG, GIF, SVG o WebP", "error");
      return;
    }

    // Validar tamaño (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      handleSnackbar("La imagen no puede superar 5MB", "error");
      return;
    }

    setUploading(true);
    try {
      // Determinar tipo según el campo
      const imageType = field.field_type === "signature" ? "signature" :
                       field.field_key?.includes("logo") ? "logo" :
                       field.field_key?.includes("header") ? "header" : "general";

      const result = await uploadBuilderImage(file, imageType);

      if (result.success && result.data?.url) {
        handleChange("default_value", result.data.url);
        handleSnackbar("Imagen subida correctamente", "success");
        // Recargar galería para incluir la nueva imagen
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
    // Auto-guardar al cambiar estilo
    onSave(updated);
  };

  // Para actualizar múltiples estilos de una vez (ej: linked padding/margin)
  const handleMultipleStyleChanges = (changes) => {
    const updated = {
      ...editedField,
      styles: { ...editedField.styles, ...changes },
    };
    setEditedField(updated);
    onSave(updated);
  };

  // Helper para parsear valor con unidad
  const parseSize = (value) => {
    if (!value || value === "auto") return { num: "", unit: "px" };
    const match = value.match(/^(\d+)(px|%|em|rem)?$/);
    if (match) return { num: match[1], unit: match[2] || "px" };
    return { num: "", unit: "px" };
  };

  // Obtener icono del tipo de campo
  const FieldIcon = getIcon(config?.field_types?.[field.field_type]?.icon || "Type");

  return (
    <div className="w-72 bg-white border-l border-gray-200 flex flex-col flex-shrink-0 h-full">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-2 min-w-0">
          <FieldIcon className="h-4 w-4 text-sky-600 flex-shrink-0" />
          <span className="font-semibold text-gray-900 text-sm truncate">{field.field_label}</span>
        </div>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded flex-shrink-0">
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
            className={`flex-1 px-2 py-2 text-xs font-medium transition-colors ${
              activeTab === tab.key
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
              {/* Mostrar etiqueta - solo para campos que pueden tener label */}
              {!["image", "signature", "table", "paragraph", "divider", "spacer"].includes(field.field_type) && (
                <label className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                  <input
                    type="checkbox"
                    checked={editedField.styles?.showLabel === true}
                    onChange={(e) => handleStyleChange("showLabel", e.target.checked)}
                    className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span className="text-xs font-medium text-gray-700">Mostrar etiqueta en el certificado</span>
                </label>
              )}

              <div>
                <label className={`block text-xs font-medium mb-1 ${editedField.styles?.showLabel ? "text-gray-700" : "text-gray-400"}`}>
                  Etiqueta
                </label>
                <input
                  type="text"
                  value={editedField.field_label}
                  onChange={(e) => handleChange("field_label", e.target.value)}
                  disabled={!["image", "signature", "table", "paragraph", "divider", "spacer"].includes(field.field_type) && !editedField.styles?.showLabel}
                  className={`w-full px-2 py-1.5 border border-gray-300 rounded text-sm ${
                    !["image", "signature", "table", "paragraph", "divider", "spacer"].includes(field.field_type) && !editedField.styles?.showLabel
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : ""
                  }`}
                />
              </div>

              {/* Sección de imagen para campos de tipo image o signature */}
              {(field.field_type === "image" || field.field_type === "signature") && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    {field.field_type === "signature" ? "Imagen de Firma" : "Imagen"}
                  </label>

                  {/* Preview de imagen actual */}
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

                  {/* Botones de acción */}
                  <div className="flex gap-1.5 mb-2">
                    {/* Subir nueva */}
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
                      className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 border-2 border-dashed rounded cursor-pointer transition-colors ${
                        uploading ? "border-sky-300 bg-sky-50" : "border-gray-300 hover:border-sky-400 hover:bg-sky-50"
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

                    {/* Seleccionar existente */}
                    <button
                      onClick={() => setShowGallery(true)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      <Image className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-xs text-gray-600">Galería</span>
                    </button>
                  </div>

                  {/* Galería de imágenes existentes */}
                  {showGallery && (
                    <div className="border border-gray-200 rounded-lg p-3 mb-3 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-700">Imágenes disponibles</span>
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
                              className={`aspect-square border-2 rounded overflow-hidden hover:border-sky-400 transition-colors ${
                                editedField.default_value === img.url ? "border-sky-500 ring-2 ring-sky-200" : "border-gray-200"
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

                  {/* O usar URL externa */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      O ingresa URL
                    </label>
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

              {/* Valor por defecto para otros tipos de campo */}
              {field.field_type !== "image" && field.field_type !== "signature" && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Valor por defecto</label>

                  {/* Barra de herramientas de formato para párrafos */}
                  {field.field_type === "paragraph" && (
                    <div className="flex gap-1 mb-2 p-1 bg-gray-50 border border-gray-200 rounded">
                      <button
                        type="button"
                        onClick={() => {
                          const textarea = document.getElementById(`textarea-${field.id}`);
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const selectedText = (editedField.default_value || "").substring(start, end);
                          const newValue = (editedField.default_value || "").substring(0, start) +
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
                          const selectedText = (editedField.default_value || "").substring(start, end);
                          const newValue = (editedField.default_value || "").substring(0, start) +
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
                          const selectedText = (editedField.default_value || "").substring(start, end);
                          const newValue = (editedField.default_value || "").substring(0, start) +
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
                      <span className="text-xs text-gray-500 px-2 flex items-center">Selecciona texto y aplica formato</span>
                    </div>
                  )}

                  <textarea
                    id={`textarea-${field.id}`}
                    value={editedField.default_value || ""}
                    onChange={(e) => handleChange("default_value", e.target.value)}
                    rows={12}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm font-mono"
                    placeholder="Texto o template con {variables}"
                  />
                  <p className="text-xs text-gray-400 mt-0.5">
                    {field.field_type === "paragraph"
                      ? "Selecciona texto y usa los botones de formato. Usa {variable} para datos dinámicos. Ej: {client.name}"
                      : "Usa {variable} para datos. Ej: {client.name}"}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Placeholder</label>
                <input
                  type="text"
                  value={editedField.placeholder || ""}
                  onChange={(e) => handleChange("placeholder", e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
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
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Tamaño de imagen</label>
                    <div className="space-y-2">
                      {/* Ancho máximo */}
                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <label className="text-xs text-gray-500">Ancho</label>
                          <button
                            onClick={() => handleStyleChange("maxWidth", "auto")}
                            className={`text-xs px-1 py-0.5 rounded ${
                              editedField.styles?.maxWidth === "auto" || !editedField.styles?.maxWidth
                                ? "bg-sky-100 text-sky-700" : "text-gray-500 hover:bg-gray-100"
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
                            onChange={(e) => handleStyleChange("maxWidth", `${e.target.value}px`)}
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

                      {/* Alto máximo */}
                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <label className="text-xs text-gray-500">Alto</label>
                          <button
                            onClick={() => handleStyleChange("maxHeight", "auto")}
                            className={`text-xs px-1 py-0.5 rounded ${
                              editedField.styles?.maxHeight === "auto"
                                ? "bg-sky-100 text-sky-700" : "text-gray-500 hover:bg-gray-100"
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
                            onChange={(e) => handleStyleChange("maxHeight", `${e.target.value}px`)}
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
                    <label className="block text-xs font-medium text-gray-700 mb-1">Ajuste</label>
                    <div className="flex gap-1 flex-wrap">
                      {[
                        { value: "contain", label: "Contener" },
                        { value: "cover", label: "Cubrir" },
                        { value: "fill", label: "Estirar" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleStyleChange("objectFit", opt.value)}
                          className={`px-1.5 py-1 text-xs rounded ${
                            editedField.styles?.objectFit === opt.value || (!editedField.styles?.objectFit && opt.value === "contain")
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

              {/* Tamaño de fuente - solo para no imágenes */}
              {field.field_type !== "image" && field.field_type !== "signature" && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tamaño fuente</label>
                  <div className="flex gap-1 flex-wrap">
                    {["10px", "12px", "14px", "16px", "18px", "20px", "24px"].map((size) => (
                      <button
                        key={size}
                        onClick={() => handleStyleChange("fontSize", size)}
                        className={`px-1.5 py-1 text-xs rounded ${
                          editedField.styles?.fontSize === size
                            ? "bg-sky-100 text-sky-700 border border-sky-300"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {parseInt(size)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Formato - solo para no imágenes */}
              {field.field_type !== "image" && field.field_type !== "signature" && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Formato</label>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleStyleChange("fontWeight", editedField.styles?.fontWeight === "bold" ? "normal" : "bold")}
                      className={`p-1.5 rounded ${editedField.styles?.fontWeight === "bold" ? "bg-sky-100 text-sky-700" : "bg-gray-100 text-gray-600"}`}
                    >
                      <Bold className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleStyleChange("fontStyle", editedField.styles?.fontStyle === "italic" ? "normal" : "italic")}
                      className={`p-1.5 rounded ${editedField.styles?.fontStyle === "italic" ? "bg-sky-100 text-sky-700" : "bg-gray-100 text-gray-600"}`}
                    >
                      <Italic className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleStyleChange("textDecoration", editedField.styles?.textDecoration === "underline" ? "none" : "underline")}
                      className={`p-1.5 rounded ${editedField.styles?.textDecoration === "underline" ? "bg-sky-100 text-sky-700" : "bg-gray-100 text-gray-600"}`}
                    >
                      <Underline className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Alineación - para todos */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Alineación</label>
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
                      className={`p-1.5 rounded ${
                        editedField.styles?.textAlign === value ? "bg-sky-100 text-sky-700" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Color - solo para no imágenes */}
              {field.field_type !== "image" && field.field_type !== "signature" && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Color texto</label>
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

              {/* Color etiqueta - solo cuando showLabel está habilitado */}
              {!["image", "signature", "table", "paragraph", "divider", "spacer"].includes(field.field_type) && editedField.styles?.showLabel && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Color etiqueta</label>
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
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Ancho campo</label>
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
                      className={`px-2 py-1 text-xs rounded ${
                        editedField.styles?.width === opt.value || (!editedField.styles?.width && opt.value === "100%")
                          ? "bg-sky-100 text-sky-700 border border-sky-300"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Espaciado - Padding (estilo Elementor) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-gray-700">Padding</label>
                  <div className="flex items-center gap-1">
                    {["px", "em", "%", "rem"].map((unit) => (
                      <button
                        key={unit}
                        onClick={() => setPaddingUnit(unit)}
                        className={`px-1.5 py-0.5 text-[10px] rounded ${
                          paddingUnit === unit
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
                              // Si está linkeado, cambiar todos de una vez
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
                        <label className="block text-[9px] text-gray-400 text-center mt-0.5">{label}</label>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setPaddingLinked(!paddingLinked)}
                    className={`p-1.5 rounded ${
                      paddingLinked
                        ? "bg-sky-100 text-sky-600"
                        : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                    }`}
                    title={paddingLinked ? "Valores vinculados" : "Valores independientes"}
                  >
                    <Link2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Espaciado - Margin (estilo Elementor) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-gray-700">Margin</label>
                  <div className="flex items-center gap-1">
                    {["px", "em", "%", "rem"].map((unit) => (
                      <button
                        key={unit}
                        onClick={() => setMarginUnit(unit)}
                        className={`px-1.5 py-0.5 text-[10px] rounded ${
                          marginUnit === unit
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
                              // Si está linkeado, cambiar todos de una vez
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
                        <label className="block text-[9px] text-gray-400 text-center mt-0.5">{label}</label>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setMarginLinked(!marginLinked)}
                    className={`p-1.5 rounded ${
                      marginLinked
                        ? "bg-sky-100 text-sky-600"
                        : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                    }`}
                    title={marginLinked ? "Valores vinculados" : "Valores independientes"}
                  >
                    <Link2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Fondo y borde - colapsable */}
              <details className="border border-gray-200 rounded p-2">
                <summary className="text-xs font-medium text-gray-700 cursor-pointer">Más opciones</summary>
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
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Fuente de datos</label>
                <input
                  type="text"
                  value={editedField.data_source || ""}
                  onChange={(e) => handleChange("data_source", e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs font-mono"
                  placeholder="certificate.date, client.name"
                />
                <p className="text-xs text-gray-400 mt-0.5">
                  Ruta del dato en los datos simulados
                </p>
              </div>

              {field.field_type === "table" && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Columnas (JSON)</label>
                  <textarea
                    value={JSON.stringify(editedField.table_columns || [], null, 2)}
                    onChange={(e) => {
                      try {
                        handleChange("table_columns", JSON.parse(e.target.value));
                      } catch {}
                    }}
                    rows={4}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs font-mono"
                    placeholder='[{"key": "fecha", "label": "Fecha"}]'
                  />
                </div>
              )}

              <details className="border border-gray-200 rounded p-2 bg-gray-50">
                <summary className="text-xs font-medium text-gray-700 cursor-pointer">Variables disponibles</summary>
                <div className="mt-2 text-xs text-gray-600 space-y-0.5">
                  <p><code className="bg-gray-200 px-1 rounded text-xs">certificate.date</code></p>
                  <p><code className="bg-gray-200 px-1 rounded text-xs">certificate.code</code></p>
                  <p><code className="bg-gray-200 px-1 rounded text-xs">issuer.name</code></p>
                  <p><code className="bg-gray-200 px-1 rounded text-xs">client.name</code></p>
                  <p><code className="bg-gray-200 px-1 rounded text-xs">client.rut</code></p>
                  <p><code className="bg-gray-200 px-1 rounded text-xs">signature.name</code></p>
                </div>
              </details>
            </div>
          )}
        </div>
    </div>
  );
}

// Modal de Ayuda
function HelpGuide({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-sky-500 to-sky-600 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-white" />
            <h3 className="font-semibold text-white">Guía del Builder</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 space-y-3 text-sm">
          <div className="flex gap-3 p-2 bg-gray-50 rounded-lg">
            <MousePointer2 className="h-5 w-5 text-sky-600 flex-shrink-0" />
            <div>
              <p className="font-medium">Arrastra campos</p>
              <p className="text-xs text-gray-600">Desde la izquierda hacia el certificado</p>
            </div>
          </div>
          <div className="flex gap-3 p-2 bg-gray-50 rounded-lg">
            <Palette className="h-5 w-5 text-sky-600 flex-shrink-0" />
            <div>
              <p className="font-medium">Personaliza estilos</p>
              <p className="text-xs text-gray-600">Clic en el icono de paleta para estilos rápidos</p>
            </div>
          </div>
          <div className="flex gap-3 p-2 bg-gray-50 rounded-lg">
            <Settings className="h-5 w-5 text-sky-600 flex-shrink-0" />
            <div>
              <p className="font-medium">Configuración avanzada</p>
              <p className="text-xs text-gray-600">Clic en engranaje para todas las opciones</p>
            </div>
          </div>
          <div className="flex gap-3 p-2 bg-gray-50 rounded-lg">
            <Columns className="h-5 w-5 text-sky-600 flex-shrink-0" />
            <div>
              <p className="font-medium">Layouts flexibles</p>
              <p className="text-xs text-gray-600">Cambia el ancho de cada campo (50%, 33%, etc.)</p>
            </div>
          </div>
          <div className="flex gap-3 p-2 bg-gray-50 rounded-lg">
            <Undo2 className="h-5 w-5 text-sky-600 flex-shrink-0" />
            <div>
              <p className="font-medium">Deshacer / Rehacer</p>
              <p className="text-xs text-gray-600">Ctrl+Z para deshacer, Ctrl+Y para rehacer</p>
            </div>
          </div>
        </div>
        <div className="px-5 py-3 bg-gray-50 border-t">
          <button onClick={onClose} className="w-full py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 text-sm font-medium">
            ¡Entendido!
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal de Confirmación
function ConfirmDialog({ title, message, onConfirm, onCancel, confirmText = "Eliminar", confirmColor = "red" }) {
  const colorClasses = {
    red: "bg-red-600 hover:bg-red-700",
    sky: "bg-sky-600 hover:bg-sky-700",
    amber: "bg-amber-600 hover:bg-amber-700",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
          </div>
          <p className="text-sm text-gray-600 ml-13">{message}</p>
        </div>
        <div className="px-5 py-3 bg-gray-50 border-t flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm text-white rounded-lg ${colorClasses[confirmColor]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// Panel de Historial de Actividad
function ActivityLog({ logs, onClear, isOpen, onToggle }) {
  const getActionIcon = (type) => {
    const icons = {
      add: { icon: Plus, color: "text-green-500", bg: "bg-green-50" },
      delete: { icon: Trash2, color: "text-red-500", bg: "bg-red-50" },
      move: { icon: ArrowUpDown, color: "text-blue-500", bg: "bg-blue-50" },
      style: { icon: Paintbrush, color: "text-purple-500", bg: "bg-purple-50" },
      duplicate: { icon: Copy, color: "text-amber-500", bg: "bg-amber-50" },
      config: { icon: Settings, color: "text-gray-500", bg: "bg-gray-50" },
      save: { icon: CheckCircle2, color: "text-sky-500", bg: "bg-sky-50" },
      undo: { icon: Undo2, color: "text-orange-500", bg: "bg-orange-50" },
      redo: { icon: Redo2, color: "text-orange-500", bg: "bg-orange-50" },
    };
    return icons[type] || icons.config;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 p-3 bg-white border border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-shadow z-40"
        title="Ver historial de cambios"
      >
        <History className="h-5 w-5 text-gray-600" />
        {logs.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-sky-500 text-white text-xs rounded-full flex items-center justify-center">
            {logs.length > 99 ? "99+" : logs.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-40 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-gray-600" />
          <span className="font-medium text-sm text-gray-900">Historial</span>
          <span className="text-xs text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded">{logs.length}</span>
        </div>
        <div className="flex items-center gap-1">
          {logs.length > 0 && (
            <button
              onClick={onClear}
              className="p-1 text-gray-400 hover:text-red-500 rounded"
              title="Limpiar historial"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
          <button onClick={onToggle} className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-72 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Sin actividad aún</p>
            <p className="text-xs text-gray-400 mt-1">Los cambios aparecerán aquí</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {logs.slice().reverse().map((log, index) => {
              const { icon: Icon, color, bg } = getActionIcon(log.type);
              return (
                <div key={log.id || index} className="px-3 py-2 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-2">
                    <div className={`p-1.5 rounded ${bg} flex-shrink-0`}>
                      <Icon className={`h-3 w-3 ${color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 truncate">{log.message}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatTime(log.timestamp)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CertificateBuilder({ templateId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState(null);
  const [template, setTemplate] = useState(null);
  const [fields, setFields] = useState([]);
  const [simulatedData, setSimulatedData] = useState(null);
  const [selectedDataType, setSelectedDataType] = useState("transporte_residuos");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [draggedField, setDraggedField] = useState(null);
  const [dragOverSection, setDragOverSection] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [showFieldConfig, setShowFieldConfig] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [scale, setScale] = useState(0.75);
  const [stylePanel, setStylePanel] = useState({ show: false, fieldId: null });

  // Estado para confirmación de eliminación
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, field: null });

  // Sistema de Undo/Redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Sistema de Log de Actividad
  const [activityLogs, setActivityLogs] = useState([]);
  const [showActivityLog, setShowActivityLog] = useState(false);

  const addLog = useCallback((type, message) => {
    setActivityLogs((prev) => [
      ...prev,
      { id: Date.now(), type, message, timestamp: new Date().toISOString() },
    ].slice(-100)); // Mantener últimos 100 logs
  }, []);
  const isUndoRedo = useRef(false);
  const MAX_HISTORY = 50;

  useEffect(() => {
    loadInitialData();
  }, [templateId]);

  // Guardar en historial cuando cambian los campos
  useEffect(() => {
    if (isUndoRedo.current) {
      isUndoRedo.current = false;
      return;
    }
    if (fields.length > 0 || history.length > 0) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(JSON.stringify(fields));
      if (newHistory.length > MAX_HISTORY) newHistory.shift();
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [fields]);

  // Atajos de teclado para Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [historyIndex, history]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedo.current = true;
      setHistoryIndex(historyIndex - 1);
      setFields(JSON.parse(history[historyIndex - 1]));
      // handleSnackbar("Acción deshecha", "info");
      addLog("undo", "Acción deshecha");
    }
  }, [historyIndex, history, addLog]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedo.current = true;
      setHistoryIndex(historyIndex + 1);
      setFields(JSON.parse(history[historyIndex + 1]));
      // handleSnackbar("Acción rehecha", "info");
      addLog("redo", "Acción rehecha");
    }
  }, [historyIndex, history, addLog]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const configRes = await getBuilderConfig();
      if (configRes.success) {
        setConfig(configRes.data);
        const expanded = {};
        Object.keys(configRes.data.field_categories || {}).forEach((k) => expanded[k] = true);
        setExpandedCategories(expanded);
      }

      if (templateId) {
        const fieldsRes = await getTemplateFields(templateId);
        if (fieldsRes.success) {
          setTemplate(fieldsRes.data.template);
          setFields(fieldsRes.data.fields || []);
          if (fieldsRes.data.fields?.length > 0) setHasInteracted(true);
        }
      }

      const dataRes = await getSimulatedData(selectedDataType);
      if (dataRes.success) setSimulatedData(dataRes.data);
    } catch (error) {
      handleSnackbar("Error cargando configuración", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDataTypeChange = async (type) => {
    setSelectedDataType(type);
    const dataRes = await getSimulatedData(type);
    if (dataRes.success) setSimulatedData(dataRes.data);
  };

  const handleDragStart = (e, field, isNew = false) => {
    setDraggedField({ ...field, isNew });
    setHasInteracted(true);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, section) => {
    e.preventDefault();
    setDragOverSection(section);
  };

  const handleDragLeave = () => setDragOverSection(null);

  const handleDrop = (e, section) => {
    e.preventDefault();
    setDragOverSection(null);
    if (!draggedField) return;

    const sectionLabels = { header: "Encabezado", body: "Cuerpo", footer: "Pie" };

    // Cerrar panel de estilos si está abierto
    setStylePanel({ show: false, fieldId: null });

    if (draggedField.isNew) {
      // Auto-generar field_label si no existe o está vacío
      const autoLabel = draggedField.field_label ||
        `${draggedField.field_type}_${Date.now()}`;

      const newField = {
        ...draggedField,
        id: `temp_${Date.now()}`,
        field_label: autoLabel,
        section,
        order_index: fields.filter((f) => f.section === section).length,
        styles: { display: "inline-block", width: "100%", marginBottom: "8px" },
        isNew: undefined,
      };
      setFields([...fields, newField]);
      handleSnackbar(`"${autoLabel}" agregado`, "success");
      addLog("add", `Agregado "${autoLabel}" en ${sectionLabels[section]}`);
    } else {
      const oldSection = draggedField.section;
      setFields(fields.map((f) =>
        f.id === draggedField.id ? { ...f, section, order_index: fields.filter((f) => f.section === section).length } : f
      ));
      if (oldSection !== section) {
        addLog("move", `Movido "${draggedField.field_label}" a ${sectionLabels[section]}`);
      }
    }
    setDraggedField(null);
  };

  const handleReorder = (section, dragIndex, hoverIndex) => {
    const sectionFields = fields.filter((f) => f.section === section);
    const otherFields = fields.filter((f) => f.section !== section);
    const [draggedItem] = sectionFields.splice(dragIndex, 1);
    sectionFields.splice(hoverIndex, 0, draggedItem);
    setFields([...otherFields, ...sectionFields.map((f, i) => ({ ...f, order_index: i }))]);
  };

  const handleRemoveField = (fieldId) => {
    const field = fields.find((f) => f.id === fieldId);
    if (field) {
      setDeleteConfirm({ show: true, field });
    }
    setStylePanel({ show: false, fieldId: null });
  };

  const confirmDeleteField = () => {
    if (deleteConfirm.field) {
      setFields(fields.filter((f) => f.id !== deleteConfirm.field.id));
      handleSnackbar(`"${deleteConfirm.field.field_label}" eliminado`, "success");
      addLog("delete", `Eliminado "${deleteConfirm.field.field_label}"`);
    }
    setDeleteConfirm({ show: false, field: null });
  };

  const cancelDeleteField = () => {
    setDeleteConfirm({ show: false, field: null });
  };

  const handleConfigureField = (field) => {
    setSelectedField(field);
    setShowFieldConfig(true);
  };

  // Referencia para debounce del log de configuración
  const configLogTimeout = useRef(null);

  const handleUpdateField = (updatedField) => {
    setFields(fields.map((f) => (f.id === updatedField.id ? updatedField : f)));
    // Actualizar el campo seleccionado para mantener sincronizado el panel
    setSelectedField(updatedField);
    // NO cerrar el panel - solo actualizar el campo
    // El panel se cierra solo cuando el usuario hace clic en la X

    // Debounce el log para no saturar con cada cambio
    if (configLogTimeout.current) clearTimeout(configLogTimeout.current);
    configLogTimeout.current = setTimeout(() => {
      addLog("config", `Configuración actualizada: "${updatedField.field_label}"`);
    }, 1000);
  };

  // Referencia para debounce del log de estilos
  const styleLogTimeout = useRef(null);

  const handleQuickStyleUpdate = (updatedField) => {
    setFields(fields.map((f) => (f.id === updatedField.id ? updatedField : f)));
    // Debounce el log para no saturar con cada cambio
    if (styleLogTimeout.current) clearTimeout(styleLogTimeout.current);
    styleLogTimeout.current = setTimeout(() => {
      addLog("style", `Estilos modificados: "${updatedField.field_label}"`);
    }, 1000);
  };

  const handleDuplicateField = (field) => {
    const newField = {
      ...field,
      id: `temp_${Date.now()}`,
      order_index: fields.filter((f) => f.section === field.section).length,
    };
    setFields([...fields, newField]);
    handleSnackbar("Campo duplicado", "success");
    addLog("duplicate", `Duplicado "${field.field_label}"`);
  };

  const handleSave = async () => {
    if (fields.length === 0) {
      handleSnackbar("Agrega al menos un campo", "warning");
      return;
    }
    setSaving(true);
    try {
      const res = await saveTemplateFields(templateId, fields);
      if (res.success) {
        handleSnackbar("Guardado correctamente", "success");
        addLog("save", `Plantilla guardada (${fields.length} campos)`);
      } else {
        handleSnackbar(res.message || "Error al guardar", "error");
      }
    } catch {
      handleSnackbar("Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (cat) => setExpandedCategories((p) => ({ ...p, [cat]: !p[cat] }));

  const getFieldsBySection = (section) =>
    fields.filter((f) => f.section === section).sort((a, b) => a.order_index - b.order_index);

  const groupedPredefinedFields = () => {
    if (!config?.predefined_fields) return {};
    return config.predefined_fields.reduce((acc, field) => {
      const cat = field.category || "other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(field);
      return acc;
    }, {});
  };

  const resolveValue = (key) => {
    if (!simulatedData || !key) return "";
    const parts = key.split(".");
    let value = simulatedData;
    for (const part of parts) {
      if (value && typeof value === "object") value = value[part];
      else return "";
    }
    return value || "";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-120px)] bg-gray-100">
      {/* Panel Izquierdo */}
      <div className="w-56 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="p-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-sm">Campos</h3>
          <button onClick={() => setShowHelp(true)} className="p-1 text-gray-400 hover:text-sky-600 rounded">
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>

        {!hasInteracted && (
          <div className="mx-3 mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
            <Zap className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">Arrastra campos hacia el certificado</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {Object.entries(groupedPredefinedFields()).map(([category, categoryFields]) => {
            const catInfo = config?.field_categories?.[category] || { label: category, icon: "FileText" };
            const CatIcon = getIcon(catInfo.icon);
            return (
              <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between px-2 py-1.5 bg-gray-50 hover:bg-gray-100 text-left"
                >
                  <div className="flex items-center gap-1.5">
                    <CatIcon className="h-3.5 w-3.5 text-gray-500" />
                    <span className="text-xs font-medium text-gray-700">{catInfo.label}</span>
                    <span className="text-xs text-gray-400 bg-gray-200 px-1 rounded">{categoryFields.length}</span>
                  </div>
                  {expandedCategories[category] ? <ChevronDown className="h-3.5 w-3.5 text-gray-400" /> : <ChevronRight className="h-3.5 w-3.5 text-gray-400" />}
                </button>
                {expandedCategories[category] && (
                  <div className="p-1.5 space-y-1">
                    {categoryFields.map((field) => {
                      const FIcon = getIcon(config?.field_types?.[field.field_type]?.icon || "Type");
                      return (
                        <div
                          key={field.field_key}
                          draggable
                          onDragStart={(e) => handleDragStart(e, field, true)}
                          className="flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 rounded cursor-move hover:border-sky-400 hover:bg-sky-50 group"
                        >
                          <GripVertical className="h-3 w-3 text-gray-300 group-hover:text-sky-400" />
                          <FIcon className="h-3 w-3 text-gray-500 group-hover:text-sky-600" />
                          <span className="text-xs text-gray-700 truncate">{field.field_label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Panel Central */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-gray-900 text-sm truncate">{template?.name || "Nueva Plantilla"}</h2>
            <select
              value={selectedDataType}
              onChange={(e) => handleDataTypeChange(e.target.value)}
              className="text-xs border border-gray-300 rounded px-2 py-1"
            >
              <option value="transporte_residuos">Transporte Residuos</option>
              <option value="gestion_residuos">Gestión Residuos</option>
              <option value="lodos_grasos">Lodos Grasos</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            {/* Undo/Redo */}
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className={`p-1.5 rounded transition-colors ${
                canUndo
                  ? "text-gray-600 hover:text-sky-600 hover:bg-sky-50"
                  : "text-gray-300 cursor-not-allowed"
              }`}
              title="Deshacer (Ctrl+Z)"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              className={`p-1.5 rounded transition-colors ${
                canRedo
                  ? "text-gray-600 hover:text-sky-600 hover:bg-sky-50"
                  : "text-gray-300 cursor-not-allowed"
              }`}
              title="Rehacer (Ctrl+Y)"
            >
              <Redo2 className="h-4 w-4" />
            </button>
            <div className="h-4 w-px bg-gray-200" />
            <span className="text-xs text-gray-500">{fields.length} campos</span>
            <div className="h-4 w-px bg-gray-200" />
            <button onClick={() => setScale(Math.max(0.5, scale - 0.1))} className="p-1 text-gray-400 hover:text-gray-600">
              <Minimize2 className="h-4 w-4" />
            </button>
            <span className="text-xs text-gray-500 w-10 text-center">{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale(Math.min(1.2, scale + 0.1))} className="p-1 text-gray-400 hover:text-gray-600">
              <Maximize2 className="h-4 w-4" />
            </button>
            <div className="h-4 w-px bg-gray-200" />
            {/* Botones de PDF */}
            <button
              onClick={() => {
                const url = getCertificatePdfUrl(templateId, selectedDataType, false);
                window.open(url, "_blank");
              }}
              className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
              title="Vista previa PDF"
            >
              <Printer className="h-3.5 w-3.5" />
              Preview
            </button>
            <button
              onClick={() => {
                const url = getCertificatePdfUrl(templateId, selectedDataType, true);
                window.open(url, "_blank");
              }}
              className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
              title="Descargar PDF"
            >
              <FileDown className="h-3.5 w-3.5" />
              PDF
            </button>
            <div className="h-4 w-px bg-gray-200" />
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-sky-600 text-white rounded hover:bg-sky-700 disabled:opacity-50">
              <Save className="h-3.5 w-3.5" />
              {saving ? "Guardando..." : "Guardar"}
            </button>
            {onClose && (
              <button onClick={onClose} className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Certificado */}
        <div className="flex-1 overflow-auto p-6 flex items-start justify-center">
          <div
            className="bg-white shadow-xl overflow-hidden transition-transform origin-top flex flex-col"
            style={{ transform: `scale(${scale})`, width: "210mm", minHeight: "297mm" }}
          >
            {/* Header */}
            <CertificateSection
              section="header"
              label="Encabezado"
              fields={getFieldsBySection("header")}
              dragOverSection={dragOverSection}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onRemoveField={handleRemoveField}
              onConfigureField={handleConfigureField}
              onDuplicateField={handleDuplicateField}
              onReorder={handleReorder}
              onQuickStyleUpdate={handleQuickStyleUpdate}
              config={config}
              resolveValue={resolveValue}
              simulatedData={simulatedData}
              template={template}
              stylePanel={stylePanel}
              setStylePanel={setStylePanel}
            />

            {/* Body */}
            <CertificateSection
              section="body"
              label="Cuerpo"
              fields={getFieldsBySection("body")}
              dragOverSection={dragOverSection}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onRemoveField={handleRemoveField}
              onConfigureField={handleConfigureField}
              onDuplicateField={handleDuplicateField}
              onReorder={handleReorder}
              onQuickStyleUpdate={handleQuickStyleUpdate}
              config={config}
              resolveValue={resolveValue}
              simulatedData={simulatedData}
              template={template}
              stylePanel={stylePanel}
              setStylePanel={setStylePanel}
              isMain
            />

            {/* Footer */}
            <CertificateSection
              section="footer"
              label="Pie de página"
              fields={getFieldsBySection("footer")}
              dragOverSection={dragOverSection}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onRemoveField={handleRemoveField}
              onConfigureField={handleConfigureField}
              onDuplicateField={handleDuplicateField}
              onReorder={handleReorder}
              onQuickStyleUpdate={handleQuickStyleUpdate}
              config={config}
              resolveValue={resolveValue}
              simulatedData={simulatedData}
              template={template}
              stylePanel={stylePanel}
              setStylePanel={setStylePanel}
            />
          </div>
        </div>
      </div>

      {/* Panel Derecho - Configuración de Campo */}
      {showFieldConfig && selectedField && (
        <FieldConfigPanel
          field={selectedField}
          config={config}
          onSave={handleUpdateField}
          onClose={() => { setShowFieldConfig(false); setSelectedField(null); }}
        />
      )}

      {/* Modales */}
      {showHelp && <HelpGuide onClose={() => setShowHelp(false)} />}
      {deleteConfirm.show && deleteConfirm.field && (
        <ConfirmDialog
          title="¿Eliminar campo?"
          message={`¿Estás seguro de eliminar "${deleteConfirm.field.field_label}"? Puedes usar Deshacer (Ctrl+Z) para recuperarlo.`}
          onConfirm={confirmDeleteField}
          onCancel={cancelDeleteField}
          confirmText="Eliminar"
          confirmColor="red"
        />
      )}

      {/* Panel de Historial */}
      <ActivityLog
        logs={activityLogs}
        isOpen={showActivityLog}
        onToggle={() => setShowActivityLog(!showActivityLog)}
        onClear={() => setActivityLogs([])}
      />
    </div>
  );
}

// Sección del Certificado
function CertificateSection({
  section, label, fields, dragOverSection, onDragOver, onDragLeave, onDrop,
  onRemoveField, onConfigureField, onDuplicateField, onReorder, onQuickStyleUpdate,
  config, resolveValue, simulatedData, template, isMain, stylePanel, setStylePanel,
}) {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [hoveredField, setHoveredField] = useState(null);
  const isDragOver = dragOverSection === section;

  const handleFieldDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleFieldDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      onReorder(section, draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleFieldDragEnd = () => setDraggedIndex(null);

  const renderFieldValue = (field) => {
    const value = resolveValue(field.data_source || field.field_key);

    switch (field.field_type) {
      case "image":
        // Prioridad: imagen subida (default_value con URL http) > data_source > placeholder
        const uploadedImage = field.default_value?.startsWith("http") ? field.default_value : null;
        const imageUrl = uploadedImage || value || field.default_value;
        const imageStyles = {
          maxWidth: field.styles?.maxWidth || "auto",
          maxHeight: field.styles?.maxHeight || "80px",
          objectFit: field.styles?.objectFit || "contain",
        };
        return imageUrl ? (
          <img src={imageUrl} alt={field.field_label} style={imageStyles} />
        ) : (
          <div className="w-24 h-16 bg-gray-100 rounded flex items-center justify-center border-2 border-dashed border-gray-300">
            <Image className="h-8 w-8 text-gray-300" />
          </div>
        );

      case "signature":
        // Para firma: priorizar imagen subida > data_source > línea de firma
        const uploadedSig = field.default_value?.startsWith("http") ? field.default_value : null;
        const signatureImage = uploadedSig || field.default_value || resolveValue("signature.image");
        const sigStyles = {
          maxWidth: field.styles?.maxWidth || "auto",
          maxHeight: field.styles?.maxHeight || "64px",
          objectFit: field.styles?.objectFit || "contain",
        };
        return (
          <div className="text-center py-4">
            {signatureImage ? (
              <img src={signatureImage} alt="Firma" className="mx-auto mb-2" style={sigStyles} />
            ) : (
              <div className="w-40 h-20 border-b-2 border-gray-400 mx-auto mb-2"></div>
            )}
            <p className="font-medium">{resolveValue("signature.name") || "Nombre Firmante"}</p>
            <p className="text-sm text-gray-500">{resolveValue("signature.position") || "Cargo"}</p>
          </div>
        );

      case "table":
        const tableData = simulatedData?.details || [];
        const columns = field.table_columns || [
          { key: "fecha", label: "Fecha", width: "15%" },
          { key: "orden_trabajo", label: "OT", width: "15%" },
          { key: "tipo_residuo", label: "Tipo Residuo", width: "35%" },
          { key: "cantidad", label: "Cantidad", width: "15%" },
          { key: "unidad", label: "Unidad", width: "10%" },
        ];
        return (
          <table className="w-full text-sm border-collapse" style={{ borderColor: template?.primary_color || "#0284c7" }}>
            <thead>
              <tr style={{ backgroundColor: template?.primary_color || "#0284c7" }}>
                {columns.map((col, i) => (
                  <th key={i} className="border border-gray-300 px-2 py-1.5 text-left text-white font-medium text-xs" style={{ width: col.width }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  {columns.map((col, ci) => (
                    <td key={ci} className="border border-gray-300 px-2 py-1 text-xs">
                      {row[col.key] || "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );

      case "paragraph":
        let text = field.default_value || value || "Texto de párrafo...";
        text = text.replace(/\{([^}]+)\}/g, (_, key) => resolveValue(key) || `{${key}}`);
        return <p className="leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: text }} />;

      case "date":
        return <span>{value || new Date().toLocaleDateString("es-CL")}</span>;

      case "divider":
        return <hr className="border-t-2 border-gray-300 my-2" />;

      case "spacer":
        return <div className="h-8" />;

      default:
        return <span>{value || field.default_value || field.placeholder || field.field_label}</span>;
    }
  };

  const sectionBg = {
    header: "bg-gradient-to-b from-gray-50 to-white border-b",
    body: "bg-white",
    footer: "bg-gradient-to-t from-gray-50 to-white border-t",
  };

  return (
    <div
      className={`relative transition-all ${sectionBg[section]} ${isMain ? "flex-1 min-h-[450px]" : "min-h-[100px] flex-shrink-0"} ${isDragOver ? "ring-2 ring-sky-400 ring-inset" : ""}`}
      onDragOver={(e) => onDragOver(e, section)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, section)}
    >
      {(isDragOver || fields.length === 0) && (
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${isDragOver ? "bg-sky-50/80" : ""}`}>
          <div className={`flex flex-col items-center gap-2 ${isDragOver ? "text-sky-600" : "text-gray-300"}`}>
            <Plus className="h-8 w-8" />
            <span className="text-sm font-medium">{isDragOver ? "Suelta aquí" : `Arrastra campos al ${label}`}</span>
          </div>
        </div>
      )}

      <div className={`px-8 pt-4 ${fields.length === 0 ? "opacity-0" : ""}`} style={{ minHeight: isMain ? "400px" : "80px" }}>
        <div className="flex flex-wrap">
          {fields.map((field, index) => {
            const isHovered = hoveredField === field.id;
            const fieldStyles = {
              display: field.styles?.display || "inline-block",
              width: field.styles?.width || "100%",
              verticalAlign: "top",
              ...field.styles,
            };

            return (
              <div
                key={field.id}
                draggable
                onDragStart={(e) => handleFieldDragStart(e, index)}
                onDragOver={(e) => handleFieldDragOver(e, index)}
                onDragEnd={handleFieldDragEnd}
                onMouseEnter={() => setHoveredField(field.id)}
                onMouseLeave={() => setHoveredField(null)}
                className={`relative group ${draggedIndex === index ? "opacity-50" : ""}`}
                style={fieldStyles}
              >
                {/* Controles */}
                {isHovered && (
                  <div className="absolute -top-3 right-0 flex gap-0.5 z-20 bg-white rounded-lg shadow-lg border border-gray-200 p-0.5">
                    <button
                      onClick={() => setStylePanel({ show: true, fieldId: field.id })}
                      className="p-1 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded"
                      title="Estilos rápidos"
                    >
                      <Palette className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onConfigureField(field)}
                      className="p-1 text-gray-500 hover:text-sky-600 hover:bg-sky-50 rounded"
                      title="Configurar"
                    >
                      <Settings className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDuplicateField(field)}
                      className="p-1 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
                      title="Duplicar"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onRemoveField(field.id)}
                      className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Eliminar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {/* Handle de arrastre */}
                {isHovered && (
                  <div className="absolute -left-5 top-1/2 -translate-y-1/2 p-1 bg-white border border-gray-200 rounded shadow-sm cursor-move z-20">
                    <GripVertical className="h-3 w-3 text-gray-400" />
                  </div>
                )}

                {/* Panel de estilos */}
                {stylePanel.show && stylePanel.fieldId === field.id && (
                  <StylePanel
                    field={field}
                    onUpdate={onQuickStyleUpdate}
                    onClose={() => setStylePanel({ show: false, fieldId: null })}
                  />
                )}

                {/* Contenido */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onConfigureField(field);
                  }}
                  className={`transition-all cursor-pointer ${isHovered ? "ring-2 ring-sky-300 ring-offset-1 rounded" : ""}`}
                  style={{
                    // Para imágenes usar flexbox, para otros textAlign
                    ...(["image", "signature"].includes(field.field_type)
                      ? {
                          display: "flex",
                          justifyContent: field.styles?.textAlign === "center" ? "center" : field.styles?.textAlign === "right" ? "flex-end" : "flex-start",
                          width: "100%",
                        }
                      : {
                          textAlign: field.styles?.textAlign || "left",
                          display: "block",
                          width: "100%",
                        }),
                  }}
                >
                  {!["image", "signature", "table", "paragraph", "divider", "spacer"].includes(field.field_type) && field.styles?.showLabel === true && (
                    <p className="text-xs mb-0.5" style={{ color: field.styles?.labelColor || "#6b7280" }}>{field.field_label}</p>
                  )}
                  {renderFieldValue(field)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
