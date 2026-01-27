import { useState, useEffect } from "react";
import { Plus, Search, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { handleSnackbar } from "../../utils/messageHelpers";
import { useModals } from "../../hooks/useModals";
import { Can } from "../../components/permissions/Can";
import ReportTemplateFormModal from "./components/ReportTemplateFormModal";
import ReportTemplatesTable from "./components/ReportTemplatesTable";
import ColumnsConfigModal from "./components/ColumnsConfigModal";
import { INITIAL_FORM_DATA } from "./constants";
import {
  getReportTemplates,
  createReportTemplate,
  updateReportTemplate,
  deleteReportTemplate,
} from "../../services/reportTemplateService";
import { getDataSources } from "../../services/dataSourceService";
import { getConfigurations } from "../../services/configurationService";

export default function ReportTemplatesView() {
  const [templates, setTemplates] = useState([]);
  const [dataSources, setDataSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Microsoft Graph configuration
  const [msGraphConfig, setMsGraphConfig] = useState(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [saving, setSaving] = useState(false);
  const [formApiError, setFormApiError] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  // Selected template for edit
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Delete confirmation modal
  const { modals, openConfirm, closeModal } = useModals();

  // Modal de configuración de columnas
  const [showColumnsModal, setShowColumnsModal] = useState(false);
  const [columnsTemplate, setColumnsTemplate] = useState(null);
  const [availableColumns, setAvailableColumns] = useState([]);
  const [columnMapping, setColumnMapping] = useState([]);
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
    setFormData(INITIAL_FORM_DATA);
    setModalMode("create");
    setFormApiError(null);
    setShowModal(true);
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
    setFormApiError(null);
    setShowModal(true);
  };

  const handleCloseForm = () => {
    setShowModal(false);
    setFormApiError(null);
  };

  const handleSave = async () => {
    setFormApiError(null);
    setSaving(true);

    try {
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
          handleCloseForm();
          loadData();
        } else {
          setFormApiError(response.message || "Error al actualizar");
        }
      } else {
        const response = await createReportTemplate(dataToSend);
        if (response.success) {
          handleSnackbar("Plantilla creada", "success");
          handleCloseForm();
          loadData();
        } else {
          setFormApiError(response.message || "Error al crear");
        }
      }
    } catch (error) {
      setFormApiError(error.message || "Error al guardar");
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

  // Configurar columnas
  const handleOpenColumns = async (template) => {
    setColumnsTemplate(template);
    setShowColumnsModal(true);
    setLoadingColumns(true);

    try {
      const dataSource = dataSources.find(ds => ds.id === template.data_source_id);
      const dsColumns = dataSource?.columns || [];
      setAvailableColumns(dsColumns);

      if (template.selected_columns && template.selected_columns.length > 0) {
        const mappingWithFormat = template.selected_columns.map(col => ({
          ...col,
          format: col.format || "text"
        }));
        setColumnMapping(mappingWithFormat);
      } else {
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

  const handleCloseColumns = () => {
    setShowColumnsModal(false);
    setColumnsTemplate(null);
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
        handleCloseColumns();
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
          <Can permission="reports.create">
            <Button onClick={handleOpenCreate} icon={Plus}>
              Nueva Plantilla
            </Button>
          </Can>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          {filteredTemplates.length} resultado{filteredTemplates.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Templates List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <ReportTemplatesTable
          templates={filteredTemplates}
          onEdit={handleOpenEdit}
          onDelete={handleDeleteTemplate}
          onConfigureColumns={handleOpenColumns}
        />
      </div>

      {/* Create/Edit Modal */}
      <ReportTemplateFormModal
        open={showModal}
        mode={modalMode}
        formData={formData}
        setFormData={setFormData}
        dataSources={dataSources}
        msGraphConfig={msGraphConfig}
        saving={saving}
        onSave={handleSave}
        onClose={handleCloseForm}
        apiError={formApiError}
        onClearApiError={() => setFormApiError(null)}
      />

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
      <ColumnsConfigModal
        open={showColumnsModal}
        template={columnsTemplate}
        availableColumns={availableColumns}
        columnMapping={columnMapping}
        setColumnMapping={setColumnMapping}
        loading={loadingColumns}
        saving={savingColumns}
        onSave={handleSaveColumns}
        onClose={handleCloseColumns}
      />
    </div>
  );
}
