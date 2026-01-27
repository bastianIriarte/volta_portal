import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { handleSnackbar } from "../../../utils/messageHelpers";
import { getTemplateLogs, getTemplateFields, saveTemplateFields } from "../../../services/certificateBuilderService";
import {
  getCertificateTemplates,
  createCertificateTemplate,
  updateCertificateTemplate,
  deleteCertificateTemplate,
  generatePreviewPdf,
  downloadPreviewPdf,
} from "../../../services/certificateTemplateService";

const emptyForm = {
  name: "",
  code: "",
  description: "",
  filepath: "",
  primary_color: "#0284c7",
  secondary_color: "#64748b",
  data_source_id: "",
  query_branches: false,
  branch_data_source_id: null,
  search_type: "range",
};

export function useTemplateHandlers({ templates, openConfirm, closeModal, setTrigger }) {
  const navigate = useNavigate();

  // Estados del formulario
  const [formModal, setFormModal] = useState({ open: false, mode: "create", data: null });
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Estados del historial
  const [historyModal, setHistoryModal] = useState({ open: false, template: null });
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Estados del preview PDF
  const [pdfPreview, setPdfPreview] = useState({ show: false, url: null, loading: false, template: null });

  // Crear plantilla
  const handleCreate = useCallback(() => {
    setFormData(emptyForm);
    setFormModal({ open: true, mode: "create", data: null });
  }, []);

  // Editar configuración
  const handleEdit = useCallback((template) => {
    setFormData({
      ...emptyForm,
      id: template.id,
      name: template.name || "",
      code: template.code || "",
      description: template.description || "",
      filepath: template.filepath || "",
      status: template.status ?? 1,
      data_source_id: template.data_source_id || "",
      query_branches: template.query_branches ?? false,
      branch_data_source_id: template.branch_data_source_id || null,
      search_type: template.search_type || "range",
    });
    setFormModal({ open: true, mode: "edit", data: template });
  }, []);

  // Guardar (crear o actualizar)
  const handleSave = useCallback(async () => {
    if (!formData.name?.trim()) {
      handleSnackbar("El nombre es requerido", "error");
      return;
    }

    if (formModal.mode === "edit" && formData.filepath?.trim()) {
      const url = formData.filepath.trim();
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        handleSnackbar("La URL debe comenzar con http:// o https://", "error");
        return;
      }
    }

    try {
      setSaving(true);

      if (formModal.mode === "create") {
        const response = await createCertificateTemplate({
          name: formData.name,
          code: formData.code || formData.name.toLowerCase().replace(/\s+/g, "_"),
          description: formData.description,
          filepath: formData.filepath || null,
          primary_color: formData.primary_color,
          secondary_color: formData.secondary_color,
          data_source_id: formData.data_source_id || null,
          query_branches: formData.query_branches ?? false,
          branch_data_source_id: formData.branch_data_source_id || null,
          search_type: formData.search_type || "range",
          status: 1,
        });

        if (response.success && response.data?.id) {
          handleSnackbar("Plantilla creada correctamente", "success");
          setFormModal({ open: false, mode: "create", data: null });
          navigate(`/dashboard/certificate-builder/${response.data.id}`);
        } else {
          handleSnackbar(response.message || "Error al crear plantilla", "error");
        }
      } else {
        const response = await updateCertificateTemplate(formData.id, {
          name: formData.name,
          code: formData.code,
          description: formData.description,
          filepath: formData.filepath || null,
          data_source_id: formData.data_source_id || null,
          query_branches: formData.query_branches ?? false,
          branch_data_source_id: formData.branch_data_source_id || null,
          search_type: formData.search_type || "range",
          status: formData.status,
        });

        if (response.success) {
          handleSnackbar("Plantilla actualizada correctamente", "success");
          setFormModal({ open: false, mode: "create", data: null });
          setTrigger((prev) => prev + 1);
        } else {
          handleSnackbar(response.message || "Error al actualizar", "error");
        }
      }
    } catch (error) {
      handleSnackbar(error.response?.data?.error || "Error al guardar plantilla", "error");
    } finally {
      setSaving(false);
    }
  }, [formData, formModal.mode, navigate, setTrigger]);

  // Ir al diseñador
  const handleEditBuilder = useCallback((template) => {
    navigate(`/dashboard/certificate-builder/${template.id}`);
  }, [navigate]);

  // Vista previa PDF en modal
  const handlePreview = useCallback(async (template) => {
    // Limpiar URL anterior si existe
    if (pdfPreview.url) {
      window.URL.revokeObjectURL(pdfPreview.url);
    }
    setPdfPreview({ show: true, url: null, loading: true, template });

    const result = await generatePreviewPdf(template.id);
    if (result.success) {
      setPdfPreview({ show: true, url: result.url, loading: false, template });
    } else {
      handleSnackbar(result.error || "Error al generar preview", "error");
      setPdfPreview({ show: false, url: null, loading: false, template: null });
    }
  }, [pdfPreview.url]);

  // Refrescar preview PDF
  const handleRefreshPreview = useCallback(async () => {
    if (!pdfPreview.template) return;
    if (pdfPreview.url) {
      window.URL.revokeObjectURL(pdfPreview.url);
    }
    setPdfPreview((prev) => ({ ...prev, url: null, loading: true }));

    const result = await generatePreviewPdf(pdfPreview.template.id);
    if (result.success) {
      setPdfPreview((prev) => ({ ...prev, url: result.url, loading: false }));
    } else {
      handleSnackbar(result.error || "Error al refrescar preview", "error");
      setPdfPreview((prev) => ({ ...prev, loading: false }));
    }
  }, [pdfPreview.template, pdfPreview.url]);

  // Descargar PDF
  const handleDownloadPdf = useCallback(async () => {
    if (!pdfPreview.template) return;
    const templateName = pdfPreview.template.code || pdfPreview.template.id;
    const result = await downloadPreviewPdf(pdfPreview.template.id, `certificado_${templateName}`);
    if (!result.success) {
      handleSnackbar(result.error || "Error al descargar PDF", "error");
    }
  }, [pdfPreview.template]);

  // Cerrar modal de preview
  const handleClosePreview = useCallback(() => {
    if (pdfPreview.url) {
      window.URL.revokeObjectURL(pdfPreview.url);
    }
    setPdfPreview({ show: false, url: null, loading: false, template: null });
  }, [pdfPreview.url]);

  // Eliminar
  const handleDelete = useCallback((template) => {
    openConfirm({
      title: "Eliminar Plantilla",
      msg: (
        <div>
          <p>
            ¿Está seguro que desea eliminar la plantilla <strong>{template.name}</strong>?
          </p>
          <p className="text-sm text-red-600 mt-2">
            Esta acción no se puede deshacer. Si la plantilla tiene certificados asignados a
            empresas, no podrá ser eliminada.
          </p>
        </div>
      ),
      variant: "danger",
      actionLabel: "Eliminar",
      onConfirm: async () => {
        try {
          const response = await deleteCertificateTemplate(template.id);
          if (response.success) {
            handleSnackbar("Plantilla eliminada correctamente", "success");
            setTrigger((prev) => prev + 1);
          } else {
            handleSnackbar(response.message || "Error al eliminar", "error");
          }
        } catch (error) {
          handleSnackbar(error.message || "Error al eliminar plantilla", "error");
        }
        closeModal("confirm");
      },
    });
  }, [openConfirm, closeModal, setTrigger]);

  // Ver historial
  const handleOpenHistory = useCallback(async (template) => {
    setHistoryModal({ open: true, template });
    setLoadingHistory(true);
    setHistoryLogs([]);

    try {
      const response = await getTemplateLogs(template.id, 100);
      if (response.success && response.data) {
        setHistoryLogs(response.data);
      } else {
        handleSnackbar("Error cargando historial", "error");
      }
    } catch (error) {
      handleSnackbar("Error cargando historial", "error");
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  // Cerrar modal de historial
  const handleCloseHistory = useCallback(() => {
    setHistoryModal({ open: false, template: null });
    setHistoryLogs([]);
  }, []);

  // Cerrar modal de formulario
  const handleCloseForm = useCallback(() => {
    setFormModal({ open: false, mode: "create", data: null });
  }, []);

  // Generar nombre/código para copia
  const generateCopyName = useCallback((baseName, existingNames, suffix = " - copia") => {
    const copyPattern = new RegExp(`^${baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}${suffix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?: \\((\\d+)\\))?$`);

    // Verificar si el nombre base con " - copia" ya existe
    const baseCopyName = `${baseName}${suffix}`;
    if (!existingNames.includes(baseCopyName)) {
      return baseCopyName;
    }

    // Buscar el número más alto existente
    let maxNumber = 1;
    existingNames.forEach(name => {
      const match = name.match(copyPattern);
      if (match) {
        const num = match[1] ? parseInt(match[1]) : 1;
        if (num >= maxNumber) {
          maxNumber = num + 1;
        }
      }
    });

    return `${baseName}${suffix} (${maxNumber})`;
  }, []);

  // Clonar plantilla
  const handleClone = useCallback(async (template) => {
    // Obtener lista fresca de plantillas para evitar duplicados
    let freshTemplates = templates;
    try {
      const freshRes = await getCertificateTemplates();
      if (freshRes.success && freshRes.data) {
        freshTemplates = freshRes.data;
      }
    } catch (e) {
      // Si falla, usar las plantillas en memoria
    }

    const existingNames = freshTemplates.map(t => t.name);
    const existingCodes = freshTemplates.map(t => t.code);
    const newName = generateCopyName(template.name, existingNames, " - copia");
    const newCode = generateCopyName(template.code || template.name.toLowerCase().replace(/\s+/g, "_"), existingCodes, "_copia");

    openConfirm({
      title: "Clonar Plantilla",
      msg: (
        <div>
          <p>
            ¿Desea crear una copia de la plantilla <strong>{template.name}</strong>?
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Se copiará todo el contenido y diseño de la plantilla.
          </p>
          <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
            <p><span className="font-medium">Nuevo nombre:</span> {newName}</p>
            <p><span className="font-medium">Nuevo código:</span> {newCode}</p>
          </div>
        </div>
      ),
      variant: "primary",
      actionLabel: "Clonar",
      onConfirm: async () => {
        try {
          setSaving(true);

          // 1. Crear la nueva plantilla con los metadatos
          const response = await createCertificateTemplate({
            name: newName,
            code: newCode,
            description: template.description || "",
            filepath: template.filepath || null,
            primary_color: template.primary_color || "#0284c7",
            secondary_color: template.secondary_color || "#64748b",
            data_source_id: template.data_source_id || null,
            query_branches: template.query_branches ?? false,
            branch_data_source_id: template.branch_data_source_id || null,
            search_type: template.search_type || "range",
            status: 1,
          });

          if (response.success && response.data?.id) {
            const newTemplateId = response.data.id;

            // 2. Obtener los campos/contenido de la plantilla original
            const fieldsResponse = await getTemplateFields(template.id);

            // fieldsResponse.data contiene { template, fields, availableVariables }
            const originalFields = fieldsResponse.data?.fields || [];

            if (fieldsResponse.success && originalFields.length > 0) {
              // 3. Limpiar los campos - quitar id y template_id para que se creen nuevos registros
              const cleanedFields = originalFields.map(field => {
                // eslint-disable-next-line no-unused-vars
                const { id, template_id, created_at, updated_at, ...fieldData } = field;
                return fieldData;
              });

              // 4. Guardar los campos en la nueva plantilla
              const saveResponse = await saveTemplateFields(newTemplateId, cleanedFields);

              if (saveResponse.success) {
                handleSnackbar("Plantilla clonada correctamente con todo su contenido", "success");
              } else {
                handleSnackbar("Plantilla creada, pero hubo un error copiando el contenido", "warning");
              }
            } else {
              handleSnackbar("Plantilla clonada correctamente", "success");
            }

            setTrigger((prev) => prev + 1);
          } else {
            handleSnackbar("Error al clonar plantilla", "error");
          }
        } catch (error) {
          handleSnackbar(error.response?.data?.error || "Error al clonar plantilla", "error");
        } finally {
          setSaving(false);
        }
        closeModal("confirm");
      },
    });
  }, [templates, generateCopyName, openConfirm, closeModal, setTrigger]);

  return {
    // Estados del formulario
    formModal,
    formData,
    setFormData,
    saving,

    // Estados del historial
    historyModal,
    historyLogs,
    loadingHistory,

    // Estados del preview PDF
    pdfPreview,

    // Handlers
    handleCreate,
    handleEdit,
    handleSave,
    handleEditBuilder,
    handlePreview,
    handleRefreshPreview,
    handleDownloadPdf,
    handleClosePreview,
    handleDelete,
    handleOpenHistory,
    handleCloseHistory,
    handleCloseForm,
    handleClone,
  };
}
