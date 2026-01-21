import { useState, useEffect, useCallback, useRef } from "react";
import { handleSnackbar } from "../../../utils/messageHelpers";
import {
  getBuilderConfig,
  getTemplateFields,
  saveTemplateFields,
} from "../../../services/certificateBuilderService";
import { generatePreviewPdf, downloadPreviewPdf } from "../../../services/certificateTemplateService";
import { getTableProcessors } from "../../../services/dataSourceService";

export function useCertificateBuilder(templateId) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState(null);
  const [template, setTemplate] = useState(null);
  const [fields, setFields] = useState([]);
  const [simulatedData] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});
  const [draggedField, setDraggedField] = useState(null);
  const [dragOverSection, setDragOverSection] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [showFieldConfig, setShowFieldConfig] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [scale, setScale] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 1024 ? 0.4 : 0.9;
    }
    return 0.9;
  });
  const [stylePanel, setStylePanel] = useState({ show: false, fieldId: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, field: null });

  // Sistema de Undo/Redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Sistema de Log de Actividad
  const [activityLogs, setActivityLogs] = useState([]);
  const [showActivityLog, setShowActivityLog] = useState(false);

  // Modal de Preview PDF
  const [pdfPreview, setPdfPreview] = useState({ show: false, url: null, loading: false });

  // Estados para Mobile
  const [showMobileFields, setShowMobileFields] = useState(false);
  const [showMobileConfig, setShowMobileConfig] = useState(false);

  // Modal para "tap to add" en mobile
  const [addFieldModal, setAddFieldModal] = useState({ show: false, field: null });

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
  }, [handleUndo, handleRedo]);

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
          if (fieldsRes.data.availableVariables) {
            setAvailableVariables(fieldsRes.data.availableVariables);
          }
        }
      }

      const processorsRes = await getTableProcessors();
      if (processorsRes.success) setTableProcessors(processorsRes.data || []);
    } catch (error) {
      handleSnackbar("Error cargando configuración", "error");
    } finally {
      setLoading(false);
    }
  };

  // Función helper para generar field_key único
  const generateUniqueFieldKey = (baseType, currentFields) => {
    let counter = 1;
    let candidateKey = `${baseType}_${counter}`;
    while (currentFields.some((f) => f.field_key === candidateKey)) {
      counter++;
      candidateKey = `${baseType}_${counter}`;
    }
    return candidateKey;
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

  const handleAddFieldToSection = (field, section) => {
    const sectionLabels = {
      header: "Encabezado",
      body: "Cuerpo",
      signature_area: "Área de Firma",
      footer: "Pie",
    };

    const timestamp = Date.now();
    const uniqueFieldKey = generateUniqueFieldKey(field.field_type, fields);
    const autoLabel = field.field_label || `${field.field_type}_${timestamp}`;

    const newField = {
      ...field,
      id: `temp_${timestamp}`,
      field_key: uniqueFieldKey,
      field_label: autoLabel,
      section,
      order_index: fields.filter((f) => f.section === section).length,
      styles: field.styles || {},
    };
    setFields([...fields, newField]);
    handleSnackbar(`"${autoLabel}" agregado a ${sectionLabels[section]}`, "success");
    addLog("add", `Agregado "${autoLabel}" en ${sectionLabels[section]}`);
    setHasInteracted(true);
    setAddFieldModal({ show: false, field: null });
    setShowMobileFields(false);
  };

  const handleFieldTap = (field) => {
    const isMobile = window.innerWidth < 1024;
    if (isMobile) {
      setAddFieldModal({ show: true, field });
    }
  };

  const handleDrop = (e, section) => {
    e.preventDefault();
    setDragOverSection(null);
    if (!draggedField) return;

    const sectionLabels = {
      header: "Encabezado",
      body: "Cuerpo",
      signature_area: "Área de Firma",
      footer: "Pie",
    };

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
    setShowMobileConfig(true);
  };

  const configLogTimeout = useRef(null);

  const handleUpdateField = (updatedField) => {
    setFields(fields.map((f) => (f.id === updatedField.id ? updatedField : f)));
    setSelectedField(updatedField);

    if (configLogTimeout.current) clearTimeout(configLogTimeout.current);
    configLogTimeout.current = setTimeout(() => {
      addLog("config", `Configuración actualizada: "${updatedField.field_label}"`);
    }, 1000);
  };

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

  // Handlers para PDF Preview
  const handleOpenPdfPreview = async () => {
    if (pdfPreview.url) {
      window.URL.revokeObjectURL(pdfPreview.url);
    }
    setPdfPreview({ show: true, url: null, loading: true });

    const result = await generatePreviewPdf(templateId);
    if (result.success) {
      setPdfPreview({ show: true, url: result.url, loading: false });
    } else {
      handleSnackbar(result.error || "Error al generar preview", "error");
      setPdfPreview({ show: false, url: null, loading: false });
    }
  };

  const handleRefreshPdfPreview = async () => {
    if (pdfPreview.url) {
      window.URL.revokeObjectURL(pdfPreview.url);
    }
    setPdfPreview({ show: true, url: null, loading: true });

    const result = await generatePreviewPdf(templateId);
    if (result.success) {
      setPdfPreview({ show: true, url: result.url, loading: false });
    } else {
      handleSnackbar(result.error || "Error al refrescar preview", "error");
      setPdfPreview({ show: true, url: null, loading: false });
    }
  };

  const handleDownloadPdf = async () => {
    const templateName = template?.code || templateId;
    const result = await downloadPreviewPdf(templateId, `certificado_${templateName}`);
    if (!result.success) {
      handleSnackbar(result.error || "Error al descargar PDF", "error");
    }
  };

  const handleClosePdfPreview = () => {
    if (pdfPreview.url) {
      window.URL.revokeObjectURL(pdfPreview.url);
    }
    setPdfPreview({ show: false, url: null, loading: false });
  };

  return {
    // Estados
    loading,
    saving,
    config,
    template,
    fields,
    simulatedData,
    expandedCategories,
    draggedField,
    dragOverSection,
    selectedField,
    showFieldConfig,
    showHelp,
    hasInteracted,
    scale,
    stylePanel,
    deleteConfirm,
    activityLogs,
    showActivityLog,
    pdfPreview,
    showMobileFields,
    showMobileConfig,
    addFieldModal,
    tableProcessors,
    availableVariables,
    canUndo,
    canRedo,

    // Setters
    setScale,
    setStylePanel,
    setShowHelp,
    setShowActivityLog,
    setActivityLogs,
    setShowMobileFields,
    setShowMobileConfig,
    setAddFieldModal,
    setShowFieldConfig,
    setSelectedField,

    // Handlers
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFieldTap,
    handleAddFieldToSection,
    handleReorder,
    handleRemoveField,
    confirmDeleteField,
    cancelDeleteField,
    handleConfigureField,
    handleUpdateField,
    handleQuickStyleUpdate,
    handleDuplicateField,
    handleSave,
    handleUndo,
    handleRedo,
    toggleCategory,
    getFieldsBySection,
    groupedPredefinedFields,
    resolveValue,

    // PDF Preview handlers
    handleOpenPdfPreview,
    handleRefreshPdfPreview,
    handleDownloadPdf,
    handleClosePdfPreview,
  };
}
