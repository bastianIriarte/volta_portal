import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FileText,
  Eye,
  Edit2,
  Trash2,
  Settings,
  History,
  Database,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { CertificateBuilder } from "../../components/certificate-builder";
import { handleSnackbar } from "../../utils/messageHelpers";
import api from "../../services/api";
import { getTemplateLogs } from "../../services/certificateBuilderService";

// Componentes reutilizables
import GenericFilters from "../../components/common/GenericFilters";
import GenericTable from "../../components/common/GenericTable";
import TableActions from "../../components/common/TableActions";
import { Modal } from "../../components/ui/Modal";
import { useTableLogic } from "../../hooks/useTableLogic";
import { useModals } from "../../hooks/useModals";

// Componentes extraídos
import TemplateFormModal from "./components/TemplateFormModal";
import TemplateHistoryModal from "./components/TemplateHistoryModal";

const emptyForm = {
  name: "",
  code: "",
  description: "",
  filepath: "",
  primary_color: "#0284c7",
  secondary_color: "#64748b",
};

export default function CertificateBuilderView() {
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const { templateId } = useParams();
  const navigate = useNavigate();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trigger, setTrigger] = useState(0);

  // Modal de formulario (crear/editar)
  const [formModal, setFormModal] = useState({ open: false, mode: "create", data: null });
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Modal de historial
  const [historyModal, setHistoryModal] = useState({ open: false, template: null });
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Configuración de la tabla
  const tableConfig = {
    defaultSort: "id",
    defaultSortDir: "desc",
    pageSize: 10,
    searchFields: ["id", "name", "code", "description"],
  };

  const { q, setQ, sortBy, sortDir, page, setPage, filteredData, pageData, totalPages, handleSort } =
    useTableLogic(templates, tableConfig);

  const { modals, openConfirm, closeModal } = useModals();

  // Cargar plantillas
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/certificate-templates");
      if (response.data?.data) {
        setTemplates(response.data.data);
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

  // Columnas de la tabla
  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Plantilla" },
    { key: "code", label: "Código" },
    { key: "status", label: "Estado", sortable: false },
    { key: "actions", label: "Acciones", sortable: false, headerClassName: "text-center" },
  ];

  // === Handlers ===

  // Crear plantilla
  const handleCreate = () => {
    setFormData(emptyForm);
    setFormModal({ open: true, mode: "create", data: null });
  };

  // Editar configuración
  const handleEdit = (template) => {
    setFormData({
      ...emptyForm,
      id: template.id,
      name: template.name || "",
      code: template.code || "",
      description: template.description || "",
      filepath: template.filepath || "",
      status: template.status ?? 1,
    });
    setFormModal({ open: true, mode: "edit", data: template });
  };

  // Guardar (crear o actualizar)
  const handleSave = async () => {
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
        const response = await api.post("/api/certificate-templates/store", {
          name: formData.name,
          code: formData.code || formData.name.toLowerCase().replace(/\s+/g, "_"),
          description: formData.description,
          filepath: formData.filepath || null,
          primary_color: formData.primary_color,
          secondary_color: formData.secondary_color,
          status: 1,
        });

        if (response.data?.data?.id) {
          handleSnackbar("Plantilla creada correctamente", "success");
          setFormModal({ open: false, mode: "create", data: null });
          navigate(`/dashboard/certificate-builder/${response.data.data.id}`);
        } else {
          handleSnackbar("Error al crear plantilla", "error");
        }
      } else {
        const response = await api.put(`/api/certificate-templates/${formData.id}`, {
          name: formData.name,
          code: formData.code,
          description: formData.description,
          filepath: formData.filepath || null,
          status: formData.status,
        });

        if (response.status === 200 || response.status === 204) {
          handleSnackbar("Plantilla actualizada correctamente", "success");
          setFormModal({ open: false, mode: "create", data: null });
          setTrigger((prev) => prev + 1);
        } else {
          handleSnackbar(response.data?.error || "Error al actualizar", "error");
        }
      }
    } catch (error) {
      handleSnackbar(error.response?.data?.error || "Error al guardar plantilla", "error");
    } finally {
      setSaving(false);
    }
  };

  // Ir al diseñador
  const handleEditBuilder = (template) => {
    navigate(`/dashboard/certificate-builder/${template.id}`);
  };

  // Vista previa
  const handlePreview = (template) => {
    window.open(
      `${baseURL}/api/certificate-builder/templates/${template.id}/pdf?data_type=transporte_residuos`,
      "_blank"
    );
  };

  // Eliminar
  const handleDelete = (template) => {
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
          const response = await api.delete(`/api/certificate-templates/${template.id}`);
          if (response.status === 200) {
            handleSnackbar("Plantilla eliminada correctamente", "success");
            setTrigger((prev) => prev + 1);
          } else {
            handleSnackbar(response.data?.error || "Error al eliminar", "error");
          }
        } catch (error) {
          handleSnackbar(error.response?.data?.error || "Error al eliminar plantilla", "error");
        }
        closeModal("confirm");
      },
    });
  };

  // Ver historial
  const handleOpenHistory = async (template) => {
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
  };

  // Ir a fuentes de datos
  const handleOpenDataSources = () => {
    navigate("/dashboard/fuentes-datos");
  };

  // Volver
  const handleBack = () => {
    if (templateId) {
      navigate("/dashboard/certificate-builder");
    } else {
      navigate("/dashboard/templates");
    }
  };

  // Acciones por fila
  const getRowActions = () => [
    {
      label: "",
      icon: Edit2,
      variant: "outline",
      onClick: handleEdit,
      title: "Editar plantilla",
      className: "text-emerald-600 hover:text-emerald-900 hover:bg-emerald-50",
    },
    {
      label: "",
      icon: Settings,
      variant: "outline",
      onClick: handleEditBuilder,
      title: "Configurar plantilla",
      className: "text-sky-600 hover:text-sky-900 hover:bg-sky-50",
    },
    {
      icon: Eye,
      variant: "ghost",
      onClick: handlePreview,
      title: "Vista Previa",
      className: "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
    },
    {
      icon: History,
      variant: "ghost",
      onClick: handleOpenHistory,
      title: "Historial de cambios",
      className: "text-violet-500 hover:text-violet-700 hover:bg-violet-50",
    },
    {
      icon: Database,
      variant: "ghost",
      onClick: handleOpenDataSources,
      title: "Ir a Fuentes de Datos",
      className: "text-cyan-500 hover:text-cyan-700 hover:bg-cyan-50",
    },
    {
      icon: Trash2,
      variant: "danger",
      onClick: handleDelete,
      title: "Eliminar",
    },
  ];

  // Renderizado de filas
  const renderRow = (template) => {
    return (
      <tr key={template.id} className="border-t hover:bg-gray-50">
        <td className="px-3 py-2 text-sm text-gray-500">{template.id}</td>
        <td className="px-3 py-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded flex items-center justify-center bg-sky-50">
              <FileText className="h-4 w-4 text-sky-600" />
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
          {template.status == 1 ? (
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
          <TableActions actions={getRowActions()} item={template} className="justify-center" />
        </td>
      </tr>
    );
  };

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
        showAddButton={true}
        onAdd={handleCreate}
        addButtonLabel="Nueva Plantilla"
      />

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
        saving={saving}
        onSave={handleSave}
        onClose={() => setFormModal({ open: false, mode: "create", data: null })}
      />

      {/* Modal de Historial */}
      <TemplateHistoryModal
        open={historyModal.open}
        template={historyModal.template}
        logs={historyLogs}
        loading={loadingHistory}
        onClose={() => {
          setHistoryModal({ open: false, template: null });
          setHistoryLogs([]);
        }}
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
    </div>
  );
}
