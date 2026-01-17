import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  GripVertical,
  Save,
  ChevronDown,
  ChevronRight,
  Type,
  Calendar,
  Hash,
  DollarSign,
  Image,
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
  Zap,
  Maximize2,
  Minimize2,
  Box,
  Undo2,
  Redo2,
  FileDown,
  Printer,
  RefreshCw,
} from "lucide-react";
import { handleSnackbar } from "../../utils/messageHelpers";
import {
  getBuilderConfig,
  getTemplateFields,
  saveTemplateFields,
} from "../../services/certificateBuilderService";
import api from "../../services/api";
import { getTableProcessors } from "../../services/dataSourceService";

// Componentes extraídos
import {
  HelpGuide,
  ConfirmDialog,
  ActivityLog,
  FieldConfigPanel,
  CertificateSection,
} from "./components";

// Mapeo de iconos
const iconMap = {
  Type,
  Calendar,
  Hash,
  DollarSign,
  Image,
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

export default function CertificateBuilder({ templateId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState(null);
  const [template, setTemplate] = useState(null);
  const [fields, setFields] = useState([]);
  const [simulatedData] = useState({});
  const selectedDataType = "transporte_residuos";
  const [expandedCategories, setExpandedCategories] = useState({});
  const [draggedField, setDraggedField] = useState(null);
  const [dragOverSection, setDragOverSection] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [showFieldConfig, setShowFieldConfig] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [scale, setScale] = useState(0.9);
  const [stylePanel, setStylePanel] = useState({ show: false, fieldId: null });

  // Estado para confirmación de eliminación
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, field: null });

  // Sistema de Undo/Redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Sistema de Log de Actividad
  const [activityLogs, setActivityLogs] = useState([]);
  const [showActivityLog, setShowActivityLog] = useState(false);

  // Modal de Preview PDF
  const [pdfPreview, setPdfPreview] = useState({ show: false, url: null, loading: false });

  // Procesadores de tabla disponibles
  const [tableProcessors, setTableProcessors] = useState([]);

  // Variables disponibles para el template
  const [availableVariables, setAvailableVariables] = useState({
    system: [],
    data_source: [],
    data_source_info: null,
  });

  const addLog = useCallback((type, message) => {
    setActivityLogs((prev) =>
      [
        ...prev,
        { id: Date.now(), type, message, timestamp: new Date().toISOString() },
      ].slice(-100)
    );
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
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
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
      addLog("undo", "Acción deshecha");
    }
  }, [historyIndex, history, addLog]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedo.current = true;
      setHistoryIndex(historyIndex + 1);
      setFields(JSON.parse(history[historyIndex + 1]));
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
        Object.keys(configRes.data.field_categories || {}).forEach(
          (k) => (expanded[k] = true)
        );
        setExpandedCategories(expanded);
      }

      if (templateId) {
        const fieldsRes = await getTemplateFields(templateId);
        if (fieldsRes.success) {
          setTemplate(fieldsRes.data.template);
          setFields(fieldsRes.data.fields || []);
          if (fieldsRes.data.fields?.length > 0) setHasInteracted(true);
          // Cargar variables disponibles
          if (fieldsRes.data.availableVariables) {
            setAvailableVariables(fieldsRes.data.availableVariables);
          }
        }
      }

      // Cargar procesadores de tabla disponibles
      const processorsRes = await getTableProcessors();
      if (processorsRes.success) setTableProcessors(processorsRes.data || []);
    } catch (error) {
      handleSnackbar("Error cargando configuración", "error");
    } finally {
      setLoading(false);
    }
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

  // Función helper para generar field_key único
  const generateUniqueFieldKey = (baseType, currentFields) => {
    let counter = 1;
    let candidateKey = `${baseType}_${counter}`;
    while (currentFields.some(f => f.field_key === candidateKey)) {
      counter++;
      candidateKey = `${baseType}_${counter}`;
    }
    return candidateKey;
  };

  const handleDrop = (e, section) => {
    e.preventDefault();
    setDragOverSection(null);
    if (!draggedField) return;

    const sectionLabels = { header: "Encabezado", body: "Cuerpo", footer: "Pie" };

    // Cerrar panel de estilos si está abierto
    setStylePanel({ show: false, fieldId: null });

    if (draggedField.isNew) {
      const timestamp = Date.now();
      const uniqueFieldKey = generateUniqueFieldKey(draggedField.field_type, fields);
      const autoLabel =
        draggedField.field_label || `${draggedField.field_type}_${timestamp}`;

      const newField = {
        ...draggedField,
        id: `temp_${timestamp}`,
        field_key: uniqueFieldKey,
        field_label: autoLabel,
        section,
        order_index: fields.filter((f) => f.section === section).length,
        styles: draggedField.styles || {},
        isNew: undefined,
      };
      setFields([...fields, newField]);
      handleSnackbar(`"${autoLabel}" agregado`, "success");
      addLog("add", `Agregado "${autoLabel}" en ${sectionLabels[section]}`);
    } else {
      const oldSection = draggedField.section;
      setFields(
        fields.map((f) =>
          f.id === draggedField.id
            ? {
                ...f,
                section,
                order_index: fields.filter((f) => f.section === section).length,
              }
            : f
        )
      );
      if (oldSection !== section) {
        addLog(
          "move",
          `Movido "${draggedField.field_label}" a ${sectionLabels[section]}`
        );
      }
    }
    setDraggedField(null);
  };

  const handleReorder = (section, dragIndex, hoverIndex) => {
    const sectionFields = fields.filter((f) => f.section === section);
    const otherFields = fields.filter((f) => f.section !== section);
    const [draggedItem] = sectionFields.splice(dragIndex, 1);
    sectionFields.splice(hoverIndex, 0, draggedItem);
    setFields([
      ...otherFields,
      ...sectionFields.map((f, i) => ({ ...f, order_index: i })),
    ]);
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
      // Si el campo eliminado es el que está seleccionado, cerrar el panel
      if (selectedField?.id === deleteConfirm.field.id) {
        setShowFieldConfig(false);
        setSelectedField(null);
      }
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
    setSelectedField(updatedField);

    if (configLogTimeout.current) clearTimeout(configLogTimeout.current);
    configLogTimeout.current = setTimeout(() => {
      addLog("config", `Configuración actualizada: "${updatedField.field_label}"`);
    }, 1000);
  };

  // Referencia para debounce del log de estilos
  const styleLogTimeout = useRef(null);

  const handleQuickStyleUpdate = (updatedField) => {
    setFields(fields.map((f) => (f.id === updatedField.id ? updatedField : f)));
    if (styleLogTimeout.current) clearTimeout(styleLogTimeout.current);
    styleLogTimeout.current = setTimeout(() => {
      addLog("style", `Estilos modificados: "${updatedField.field_label}"`);
    }, 1000);
  };

  const handleDuplicateField = (field) => {
    const timestamp = Date.now();
    const uniqueFieldKey = generateUniqueFieldKey(field.field_type, fields);

    const newField = {
      ...field,
      id: `temp_${timestamp}`,
      field_key: uniqueFieldKey,
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

  const toggleCategory = (cat) =>
    setExpandedCategories((p) => ({ ...p, [cat]: !p[cat] }));

  const getFieldsBySection = (section) =>
    fields
      .filter((f) => f.section === section)
      .sort((a, b) => a.order_index - b.order_index);

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
          <button
            onClick={() => setShowHelp(true)}
            className="p-1 text-gray-400 hover:text-sky-600 rounded"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>

        {!hasInteracted && (
          <div className="mx-3 mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
            <Zap className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              Arrastra campos hacia el certificado
            </p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {/* Elementos de Layout */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleCategory("layout_elements")}
              className="w-full flex items-center justify-between px-2 py-1.5 bg-gray-50 hover:bg-gray-100 text-left"
            >
              <div className="flex items-center gap-1.5">
                <Box className="h-3.5 w-3.5 text-gray-500" />
                <span className="text-xs font-medium text-gray-700">
                  Elementos de Layout
                </span>
                <span className="text-xs text-gray-400 bg-gray-200 px-1 rounded">
                  2
                </span>
              </div>
              {expandedCategories["layout_elements"] ? (
                <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
              )}
            </button>
            {expandedCategories["layout_elements"] && (
              <div className="p-1.5 space-y-1">
                {/* Divisor */}
                <div
                  draggable
                  onDragStart={(e) =>
                    handleDragStart(
                      e,
                      {
                        field_key: `divider_${Date.now()}`,
                        field_label: "Divisor",
                        field_type: "divider",
                        section: null,
                        styles: {},
                      },
                      true
                    )
                  }
                  className="flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 rounded cursor-move hover:border-sky-400 hover:bg-sky-50 group"
                >
                  <GripVertical className="h-3 w-3 text-gray-300 group-hover:text-sky-400" />
                  <Minus className="h-3 w-3 text-gray-500 group-hover:text-sky-600" />
                  <span className="text-xs text-gray-700 truncate">Divisor</span>
                </div>

                {/* Espacio */}
                <div
                  draggable
                  onDragStart={(e) =>
                    handleDragStart(
                      e,
                      {
                        field_key: `spacer_${Date.now()}`,
                        field_label: "Espacio",
                        field_type: "spacer",
                        section: null,
                        styles: { spacerHeight: "40px" },
                      },
                      true
                    )
                  }
                  className="flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 rounded cursor-move hover:border-sky-400 hover:bg-sky-50 group"
                >
                  <GripVertical className="h-3 w-3 text-gray-300 group-hover:text-sky-400" />
                  <Square className="h-3 w-3 text-gray-500 group-hover:text-sky-600" />
                  <span className="text-xs text-gray-700 truncate">Espacio</span>
                </div>
              </div>
            )}
          </div>

          {/* Campos predefinidos por categoría */}
          {Object.entries(groupedPredefinedFields()).map(
            ([category, categoryFields]) => {
              const catInfo = config?.field_categories?.[category] || {
                label: category,
                icon: "FileText",
              };
              const CatIcon = getIcon(catInfo.icon);
              return (
                <div
                  key={category}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between px-2 py-1.5 bg-gray-50 hover:bg-gray-100 text-left"
                  >
                    <div className="flex items-center gap-1.5">
                      <CatIcon className="h-3.5 w-3.5 text-gray-500" />
                      <span className="text-xs font-medium text-gray-700">
                        {catInfo.label}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-200 px-1 rounded">
                        {categoryFields.length}
                      </span>
                    </div>
                    {expandedCategories[category] ? (
                      <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                    )}
                  </button>
                  {expandedCategories[category] && (
                    <div className="p-1.5 space-y-1">
                      {categoryFields.map((field) => {
                        const FIcon = getIcon(
                          config?.field_types?.[field.field_type]?.icon || "Type"
                        );
                        return (
                          <div
                            key={field.field_key}
                            draggable
                            onDragStart={(e) => handleDragStart(e, field, true)}
                            className="flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 rounded cursor-move hover:border-sky-400 hover:bg-sky-50 group"
                          >
                            <GripVertical className="h-3 w-3 text-gray-300 group-hover:text-sky-400" />
                            <FIcon className="h-3 w-3 text-gray-500 group-hover:text-sky-600" />
                            <span className="text-xs text-gray-700 truncate">
                              {field.field_label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Panel Central */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-gray-900 text-sm truncate">
              {template?.name || "Nueva Plantilla"}
            </h2>
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
            <button
              onClick={() => setScale(Math.max(0.5, scale - 0.1))}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
            <span className="text-xs text-gray-500 w-10 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale(Math.min(1.2, scale + 0.1))}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            <div className="h-4 w-px bg-gray-200" />
            {/* Botones de PDF */}
            <button
              onClick={async () => {
                // Limpiar URL anterior si existe
                if (pdfPreview.url) {
                  window.URL.revokeObjectURL(pdfPreview.url);
                }
                setPdfPreview({ show: true, url: null, loading: true });
                try {
                  const response = await api.get(
                    `/api/certificate-builder/templates/${templateId}/pdf?preview=true`,
                    { responseType: "blob" }
                  );
                  if (response.status === 200) {
                    const blob = new Blob([response.data], { type: "application/pdf" });
                    const url = window.URL.createObjectURL(blob);
                    setPdfPreview({ show: true, url, loading: false });
                  } else {
                    handleSnackbar("Error al generar preview", "error");
                    setPdfPreview({ show: false, url: null, loading: false });
                  }
                } catch (error) {
                  handleSnackbar("Error al generar preview", "error");
                  setPdfPreview({ show: false, url: null, loading: false });
                }
              }}
              disabled={pdfPreview.loading}
              className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
              title="Vista previa PDF"
            >
              <Printer className={`h-3.5 w-3.5 ${pdfPreview.loading ? 'animate-spin' : ''}`} />
              {pdfPreview.loading ? 'Generando...' : 'Preview'}
            </button>
            <button
              onClick={async () => {
                try {
                  const response = await api.get(
                    `/api/certificate-builder/templates/${templateId}/pdf?preview=true&download=true`,
                    { responseType: "blob" }
                  );
                  if (response.status === 200) {
                    const blob = new Blob([response.data], { type: "application/pdf" });
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `certificado_${template?.code || templateId}_preview.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                  } else {
                    handleSnackbar("Error al descargar PDF", "error");
                  }
                } catch (error) {
                  handleSnackbar("Error al descargar PDF", "error");
                }
              }}
              className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
              title="Descargar PDF"
            >
              <FileDown className="h-3.5 w-3.5" />
              PDF
            </button>
            <div className="h-4 w-px bg-gray-200" />
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-sky-600 text-white rounded hover:bg-sky-700 disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? "Guardando..." : "Guardar"}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Certificado */}
        <div className="flex-1 overflow-auto p-6 flex items-start justify-center">
          <div
            className="bg-white shadow-xl overflow-hidden transition-transform origin-top flex flex-col"
            style={{
              transform: `scale(${scale})`,
              width: "900px",
              minHeight: "297mm",
              padding: "30px 100px 0 100px",
            }}
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
          tableProcessors={tableProcessors}
          availableVariables={availableVariables}
          onSave={handleUpdateField}
          onClose={() => {
            setShowFieldConfig(false);
            setSelectedField(null);
          }}
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

      {/* Modal de Preview PDF */}
      {pdfPreview.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl w-[90vw] h-[90vh] max-w-6xl flex flex-col">
            {/* Header del modal */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Vista Previa del Certificado</h3>
              <div className="flex items-center gap-2">
                {/* Botón de refrescar */}
                <button
                  onClick={async () => {
                    if (pdfPreview.url) {
                      window.URL.revokeObjectURL(pdfPreview.url);
                    }
                    setPdfPreview({ show: true, url: null, loading: true });
                    try {
                      const response = await api.get(
                        `/api/certificate-builder/templates/${templateId}/pdf?preview=true`,
                        { responseType: "blob" }
                      );
                      if (response.status === 200) {
                        const blob = new Blob([response.data], { type: "application/pdf" });
                        const url = window.URL.createObjectURL(blob);
                        setPdfPreview({ show: true, url, loading: false });
                      } else {
                        handleSnackbar("Error al refrescar preview", "error");
                        setPdfPreview({ show: true, url: null, loading: false });
                      }
                    } catch (error) {
                      handleSnackbar("Error al refrescar preview", "error");
                      setPdfPreview({ show: true, url: null, loading: false });
                    }
                  }}
                  disabled={pdfPreview.loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                  title="Refrescar preview"
                >
                  <RefreshCw className={`h-4 w-4 ${pdfPreview.loading ? 'animate-spin' : ''}`} />
                  Refrescar
                </button>
                {/* Botón de descargar */}
                <button
                  onClick={async () => {
                    try {
                      const response = await api.get(
                        `/api/certificate-builder/templates/${templateId}/pdf?preview=true&download=true`,
                        { responseType: "blob" }
                      );
                      if (response.status === 200) {
                        const blob = new Blob([response.data], { type: "application/pdf" });
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = `certificado_${template?.code || templateId}_preview.pdf`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                      } else {
                        handleSnackbar("Error al descargar PDF", "error");
                      }
                    } catch (error) {
                      handleSnackbar("Error al descargar PDF", "error");
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-sky-600 rounded hover:bg-sky-700"
                  title="Descargar PDF"
                >
                  <FileDown className="h-4 w-4" />
                  Descargar
                </button>
                {/* Botón de cerrar */}
                <button
                  onClick={() => {
                    if (pdfPreview.url) {
                      window.URL.revokeObjectURL(pdfPreview.url);
                    }
                    setPdfPreview({ show: false, url: null, loading: false });
                  }}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                  title="Cerrar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            {/* Contenido del modal */}
            <div className="flex-1 p-4 bg-gray-100 overflow-hidden">
              {pdfPreview.loading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
                    <span className="text-gray-600">Generando PDF...</span>
                  </div>
                </div>
              ) : pdfPreview.url ? (
                <iframe
                  src={pdfPreview.url}
                  className="w-full h-full rounded border border-gray-300"
                  title="Vista previa del certificado"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No se pudo cargar el preview</p>
                    <button
                      onClick={async () => {
                        setPdfPreview({ show: true, url: null, loading: true });
                        try {
                          const response = await api.get(
                            `/api/certificate-builder/templates/${templateId}/pdf?preview=true`,
                            { responseType: "blob" }
                          );
                          if (response.status === 200) {
                            const blob = new Blob([response.data], { type: "application/pdf" });
                            const url = window.URL.createObjectURL(blob);
                            setPdfPreview({ show: true, url, loading: false });
                          }
                        } catch (error) {
                          handleSnackbar("Error al generar preview", "error");
                          setPdfPreview({ show: true, url: null, loading: false });
                        }
                      }}
                      className="mt-3 px-4 py-2 text-sm text-sky-600 hover:text-sky-700 hover:underline"
                    >
                      Intentar de nuevo
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
