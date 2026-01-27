import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, Plus } from "lucide-react";
import { handleSnackbar } from "../../utils/messageHelpers";
import { getCertificateTemplates } from "../../services/certificateTemplateService";
import { getDataSources } from "../../services/dataSourceService";

// Componentes reutilizables
import GenericFilters from "../../components/common/GenericFilters";
import GenericTable from "../../components/common/GenericTable";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Can } from "../../components/permissions/Can";
import { useTableLogic } from "../../hooks/useTableLogic";
import { useModals } from "../../hooks/useModals";

// Componentes de la lista
import TemplateFormModal from "./components/list/TemplateFormModal";
import TemplateHistoryModal from "./components/list/TemplateHistoryModal";
import TemplateTableRow from "./components/list/TemplateTableRow";
import PdfPreviewModal from "./components/list/PdfPreviewModal";

// Hook personalizado
import { useTemplateHandlers } from "./hooks/useTemplateHandlers.jsx";
import CertificateBuilder from "./CertificateBuilder.jsx";

// Columnas de la tabla
const columns = [
  { key: "id", label: "ID" },
  { key: "name", label: "Plantilla" },
  { key: "data_source", label: "Fuente de Datos", sortable: false },
  { key: "table_processor", label: "Procesador de Tabla", sortable: false },
  { key: "search_type", label: "Filtro de Fecha", sortable: false },
  { key: "query_branches", label: "Sucursal", sortable: false },
  { key: "status", label: "Estado", sortable: false },
  { key: "actions", label: "Acciones", sortable: false, headerClassName: "text-center" },
];

// Configuración de la tabla
const tableConfig = {
  defaultSort: "id",
  defaultSortDir: "desc",
  pageSize: 10,
  searchFields: ["id", "name", "code", "description"],
};

export default function CertificateBuilderView() {
  const { templateId } = useParams();
  const navigate = useNavigate();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trigger, setTrigger] = useState(0);

  // Data sources disponibles
  const [dataSources, setDataSources] = useState([]);

  const { q, setQ, sortBy, sortDir, page, setPage, filteredData, pageData, totalPages, handleSort } =
    useTableLogic(templates, tableConfig);

  const { modals, openConfirm, closeModal } = useModals();

  // Hook con handlers
  const {
    formModal,
    formData,
    setFormData,
    saving,
    historyModal,
    historyLogs,
    loadingHistory,
    pdfPreview,
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
  } = useTemplateHandlers({ templates, openConfirm, closeModal, setTrigger });

  // Cargar plantillas y data sources
  const fetchData = async () => {
    try {
      setLoading(true);
      const [templatesRes, dataSourcesRes] = await Promise.all([
        getCertificateTemplates(),
        getDataSources(),
      ]);
      if (templatesRes.success && templatesRes.data) {
        setTemplates(templatesRes.data);
      }
      if (dataSourcesRes.success && dataSourcesRes.data) {
        setDataSources(dataSourcesRes.data);
      }
    } catch (error) {
      handleSnackbar("Error cargando plantillas", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!templateId) {
      fetchData();
      setPage(1);
    } else {
      setLoading(false);
    }
  }, [trigger, templateId]);

  // Volver
  const handleBack = () => {
    if (templateId) {
      navigate("/dashboard/certificate-builder");
    } else {
      navigate("/dashboard/templates");
    }
  };

  // Renderizado de filas
  const renderRow = (template) => (
    <TemplateTableRow
      key={template.id}
      template={template}
      dataSources={dataSources}
      onEdit={handleEdit}
      onEditBuilder={handleEditBuilder}
      onClone={handleClone}
      onPreview={handlePreview}
      onOpenHistory={handleOpenHistory}
      onDelete={handleDelete}
    />
  );

  // Si hay templateId, mostrar el builder
  if (templateId) {
    return (
      <div className="h-full">
        <CertificateBuilder templateId={parseInt(templateId)} onClose={handleBack} />
      </div>
    );
  }

  // Vista de lista
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-bradford-navy mb-2">Constructor de Certificados</h2>
        <p className="text-bradford-navy/70">
          Diseña y personaliza las plantillas de certificados con drag & drop
        </p>
      </div>

      {/* Filtros */}
      <GenericFilters
        searchPlaceholder="Buscar por nombre o código..."
        searchValue={q}
        onSearchChange={setQ}
        resultsCount={filteredData.length}
      >
        <Can permission="certificates.create">
          <Button icon={Plus} onClick={handleCreate}>
            Nueva Plantilla
          </Button>
        </Can>
      </GenericFilters>

      {/* Tabla */}
      <GenericTable
        title="Plantillas de certificados"
        loading={loading}
        columns={columns}
        data={filteredData}
        pageData={pageData}
        emptyMessage="No hay plantillas configuradas"
        emptyIcon={FileText}
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

      {/* Modal de Formulario (Crear/Editar) */}
      <TemplateFormModal
        open={formModal.open}
        mode={formModal.mode}
        formData={formData}
        setFormData={setFormData}
        dataSources={dataSources}
        saving={saving}
        onSave={handleSave}
        onClose={handleCloseForm}
      />

      {/* Modal de Historial */}
      <TemplateHistoryModal
        open={historyModal.open}
        template={historyModal.template}
        logs={historyLogs}
        loading={loadingHistory}
        onClose={handleCloseHistory}
      />

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

      {/* Modal de Preview PDF */}
      <PdfPreviewModal
        show={pdfPreview.show}
        url={pdfPreview.url}
        loading={pdfPreview.loading}
        template={pdfPreview.template}
        onRefresh={handleRefreshPreview}
        onDownload={handleDownloadPdf}
        onClose={handleClosePreview}
      />
    </div>
  );
}
