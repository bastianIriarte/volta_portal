import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  FileText,
  Plus,
  Search,
  Eye,
  Edit2,
  X,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Settings,
  History,
  User,
  Clock,
} from "lucide-react";
import { CertificateBuilder } from "../../components/certificate-builder";
import { handleSnackbar } from "../../utils/messageHelpers";
import api from "../../services/api";
import { getTemplateLogs } from "../../services/certificateBuilderService";

export default function CertificateBuilderView() {
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const { templateId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "list"; // list, builder

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    code: "",
    description: "",
    filepath: "",
    primary_color: "#0284c7",
    secondary_color: "#64748b",
  });

  // Estados para acciones
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Estados para editar plantilla
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Estados para historial
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyTemplate, setHistoryTemplate] = useState(null);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (mode === "list" && !templateId) {
      loadTemplates();
    } else {
      setLoading(false);
    }
  }, [mode, templateId]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
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

  const handleCreateTemplate = () => {
    setNewTemplate({
      name: "",
      code: "",
      description: "",
      filepath: "",
      primary_color: "#0284c7",
      secondary_color: "#64748b",
    });
    setShowCreateModal(true);
  };

  const handleSaveNewTemplate = async () => {
    if (!newTemplate.name.trim()) {
      handleSnackbar("El nombre es requerido", "error");
      return;
    }

    setCreating(true);
    try {
      const response = await api.post("/api/certificate-templates/store", {
        name: newTemplate.name,
        code: newTemplate.code || newTemplate.name.toLowerCase().replace(/\s+/g, "_"),
        description: newTemplate.description,
        filepath: newTemplate.filepath || null,
        primary_color: newTemplate.primary_color,
        secondary_color: newTemplate.secondary_color,
        status: 1,
      });

      if (response.data?.data?.id) {
        handleSnackbar("Plantilla creada correctamente", "success");
        setShowCreateModal(false);
        // Ir directamente al builder con la nueva plantilla
        navigate(`/dashboard/certificate-builder/${response.data.data.id}`);
      } else {
        handleSnackbar("Error al crear plantilla", "error");
      }
    } catch (error) {
      handleSnackbar(error.response?.data?.error || "Error al crear plantilla", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleEditBuilder = (id) => {
    navigate(`/dashboard/certificate-builder/${id}`);
  };

  // Eliminar plantilla
  const handleOpenDelete = (template) => {
    setSelectedTemplate(template);
    setShowDeleteModal(true);
  };

  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return;

    setDeleting(true);
    try {
      const response = await api.delete(`/api/certificate-templates/${selectedTemplate.id}`);
      if (response.status === 200) {
        handleSnackbar("Plantilla eliminada correctamente", "success");
        setShowDeleteModal(false);
        setSelectedTemplate(null);
        loadTemplates();
      } else {
        handleSnackbar(response.data?.error || "Error al eliminar", "error");
      }
    } catch (error) {
      handleSnackbar(error.response?.data?.error || "Error al eliminar plantilla", "error");
    } finally {
      setDeleting(false);
    }
  };

  // Abrir modal de edicion
  const handleOpenEdit = (template) => {
    setEditingTemplate({
      id: template.id,
      name: template.name || "",
      code: template.code || "",
      description: template.description || "",
      filepath: template.filepath || "",
    });
    setShowEditModal(true);
  };

  // Guardar cambios de plantilla
  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;

    if (!editingTemplate.name.trim()) {
      handleSnackbar("El nombre es requerido", "error");
      return;
    }

    // Validar URL si tiene contenido
    if (editingTemplate.filepath && editingTemplate.filepath.trim()) {
      const url = editingTemplate.filepath.trim();
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        handleSnackbar("La URL debe comenzar con http:// o https://", "error");
        return;
      }
    }

    setUpdating(true);
    try {
      const response = await api.put(`/api/certificate-templates/${editingTemplate.id}`, {
        name: editingTemplate.name,
        code: editingTemplate.code,
        description: editingTemplate.description,
        filepath: editingTemplate.filepath || null,
      });

      if (response.status === 200 || response.status === 204) {
        handleSnackbar("Plantilla actualizada correctamente", "success");
        setShowEditModal(false);
        setEditingTemplate(null);
        loadTemplates();
      } else {
        handleSnackbar(response.data?.error || "Error al actualizar", "error");
      }
    } catch (error) {
      handleSnackbar(error.response?.data?.error || "Error al actualizar plantilla", "error");
    } finally {
      setUpdating(false);
    }
  };

  // Toggle estado activo/inactivo
  const handleToggleStatus = async (template) => {
    try {
      const newStatus = template.status === 1 ? 0 : 1;
      const response = await api.put(`/api/certificate-templates/${template.id}`, {
        status: newStatus,
      });
      if (response.status === 204 || response.status === 200) {
        handleSnackbar(
          newStatus === 1 ? "Plantilla activada" : "Plantilla desactivada",
          "success"
        );
        loadTemplates();
      }
    } catch (error) {
      handleSnackbar("Error al cambiar estado", "error");
    }
  };

  // Ver historial de cambios
  const handleOpenHistory = async (template) => {
    setHistoryTemplate(template);
    setShowHistoryModal(true);
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

  // Duplicar plantilla
  const handleDuplicateTemplate = async (template) => {
    try {
      const response = await api.post("/api/certificate-templates/store", {
        name: `${template.name} (copia)`,
        code: `${template.code}_copy_${Date.now()}`,
        description: template.description,
        primary_color: template.primary_color,
        secondary_color: template.secondary_color,
        background_color: template.background_color,
        header_image: template.header_image,
        logo: template.logo,
        signature_image: template.signature_image,
        signature_name: template.signature_name,
        signature_position: template.signature_position,
        header_text: template.header_text,
        body_text: template.body_text,
        footer_text: template.footer_text,
        status: 1,
      });

      if (response.data?.data?.id) {
        // También copiar los campos del builder si existen
        try {
          const fieldsResponse = await api.get(`/api/certificate-builder/templates/${template.id}/fields`);
          if (fieldsResponse.data?.data?.fields) {
            await api.post(`/api/certificate-builder/templates/${response.data.data.id}/fields`, {
              fields: fieldsResponse.data.data.fields,
            });
          }
        } catch (e) {
          // Si no hay campos, ignorar
        }

        handleSnackbar("Plantilla duplicada correctamente", "success");
        loadTemplates();
      }
    } catch (error) {
      handleSnackbar(error.response?.data?.error || "Error al duplicar", "error");
    }
  };

  const handleBack = () => {
    if (templateId) {
      navigate("/dashboard/certificate-builder");
    } else {
      navigate("/dashboard/templates");
    }
  };

  const filteredTemplates = templates.filter(
    (t) =>
      t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Si hay templateId, mostrar el builder
  if (templateId) {
    return (
      <div className="h-full">
        <CertificateBuilder
          templateId={parseInt(templateId)}
          onClose={handleBack}
        />
      </div>
    );
  }

  // Vista de lista de plantillas para el builder
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Constructor de Certificados
          </h1>
          <p className="text-gray-500 mt-1">
            Diseña y personaliza las plantillas de certificados con drag & drop
          </p>
        </div>
        <button
          onClick={handleCreateTemplate}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nueva Plantilla
        </button>
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar plantilla..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
      </div>

      {/* Lista de plantillas */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay plantillas
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm
              ? "No se encontraron plantillas con ese término"
              : "Crea tu primera plantilla para comenzar"}
          </p>
          {!searchTerm && (
            <button
              onClick={handleCreateTemplate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
            >
              <Plus className="h-4 w-4" />
              Crear Plantilla
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plantilla
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Codigo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL Reporte
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTemplates.map((template) => (
                <tr key={template.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: (template.primary_color || "#0284c7") + "20" }}
                      >
                        <FileText className="h-5 w-5" style={{ color: template.primary_color || "#0284c7" }} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{template.name}</div>
                        {template.description && (
                          <div className="text-xs text-gray-500 truncate max-w-xs">{template.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500 font-mono">{template.code || "-"}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {template.filepath ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Configurado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                        Sin configurar
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      template.status === 1 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}>
                      {template.status === 1 ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(template)}
                        className="flex items-center gap-1 text-emerald-600 hover:text-emerald-900 px-2 py-1 rounded hover:bg-emerald-50 text-sm"
                        title="Configurar plantilla"
                      >
                        <Settings className="w-4 h-4" />
                        Configurar
                      </button>
                      <button
                        onClick={() => handleEditBuilder(template.id)}
                        className="flex items-center gap-1 text-sky-600 hover:text-sky-900 px-2 py-1 rounded hover:bg-sky-50 text-sm"
                        title="Diseñar"
                      >
                        <Edit2 className="w-4 h-4" />
                        Diseñar
                      </button>
                      <button
                        onClick={() => window.open(`${baseURL}/api/certificate-builder/templates/${template.id}/pdf?data_type=transporte_residuos`, "_blank")}
                        className="p-1.5 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
                        title="Vista Previa"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenHistory(template)}
                        className="p-1.5 text-violet-500 hover:text-violet-700 rounded hover:bg-violet-50"
                        title="Historial de cambios"
                      >
                        <History className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(template)}
                        className={`p-1.5 rounded ${
                          template.status === 1
                            ? "text-amber-500 hover:text-amber-700 hover:bg-amber-50"
                            : "text-green-500 hover:text-green-700 hover:bg-green-50"
                        }`}
                        title={template.status === 1 ? "Desactivar" : "Activar"}
                      >
                        {template.status === 1 ? (
                          <ToggleRight className="w-4 h-4" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleOpenDelete(template)}
                        className="p-1.5 text-red-500 hover:text-red-700 rounded hover:bg-red-50"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal para crear nueva plantilla */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Nueva Plantilla
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, name: e.target.value })
                  }
                  placeholder="Ej: Certificado de Transporte"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código
                </label>
                <input
                  type="text"
                  value={newTemplate.code}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, code: e.target.value })
                  }
                  placeholder="Ej: cert_transporte"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={newTemplate.description}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, description: e.target.value })
                  }
                  rows={2}
                  placeholder="Descripción de la plantilla..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL del Reporte (iframe)
                </label>
                <input
                  type="url"
                  value={newTemplate.filepath}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, filepath: e.target.value })
                  }
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500 text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  URL del iframe que se mostrará en el reporte
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color Primario
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={newTemplate.primary_color}
                      onChange={(e) =>
                        setNewTemplate({ ...newTemplate, primary_color: e.target.value })
                      }
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={newTemplate.primary_color}
                      onChange={(e) =>
                        setNewTemplate({ ...newTemplate, primary_color: e.target.value })
                      }
                      className="flex-1 px-2 py-1 border border-gray-300 rounded-md font-mono text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color Secundario
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={newTemplate.secondary_color}
                      onChange={(e) =>
                        setNewTemplate({ ...newTemplate, secondary_color: e.target.value })
                      }
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={newTemplate.secondary_color}
                      onChange={(e) =>
                        setNewTemplate({ ...newTemplate, secondary_color: e.target.value })
                      }
                      className="flex-1 px-2 py-1 border border-gray-300 rounded-md font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveNewTemplate}
                disabled={creating}
                className="px-4 py-2 text-sm text-white bg-sky-600 rounded-md hover:bg-sky-700 disabled:opacity-50"
              >
                {creating ? "Creando..." : "Crear y Diseñar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para confirmar eliminación */}
      {showDeleteModal && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Eliminar Plantilla
              </h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-600">
                ¿Está seguro que desea eliminar la plantilla{" "}
                <strong className="text-gray-900">{selectedTemplate.name}</strong>?
              </p>
              <p className="text-sm text-red-600 mt-2">
                Esta acción no se puede deshacer. Si la plantilla tiene certificados asignados a empresas, no podrá ser eliminada.
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteTemplate}
                disabled={deleting}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar plantilla */}
      {showEditModal && editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Configurar Plantilla
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTemplate(null);
                }}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={editingTemplate.name}
                    onChange={(e) =>
                      setEditingTemplate({ ...editingTemplate, name: e.target.value })
                    }
                    placeholder="Ej: Certificado de Transporte"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Codigo
                  </label>
                  <input
                    type="text"
                    value={editingTemplate.code}
                    onChange={(e) =>
                      setEditingTemplate({ ...editingTemplate, code: e.target.value })
                    }
                    placeholder="Ej: cert_transporte"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500 font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripcion
                </label>
                <textarea
                  value={editingTemplate.description}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, description: e.target.value })
                  }
                  rows={3}
                  placeholder="Descripcion de la plantilla..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL del Reporte (iframe)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingTemplate.filepath}
                    onChange={(e) =>
                      setEditingTemplate({ ...editingTemplate, filepath: e.target.value })
                    }
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500 text-sm"
                  />
                  {editingTemplate.filepath && (
                    <button
                      type="button"
                      onClick={() => window.open(editingTemplate.filepath, "_blank")}
                      className="px-3 py-2 text-gray-500 hover:text-sky-600 border border-gray-300 rounded-md hover:bg-gray-50"
                      title="Previsualizar URL"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  URL del iframe que se mostrara en el reporte OnSite
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTemplate(null);
                }}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateTemplate}
                disabled={updating}
                className="px-4 py-2 text-sm text-white bg-emerald-600 rounded-md hover:bg-emerald-700 disabled:opacity-50"
              >
                {updating ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para ver historial de cambios */}
      {showHistoryModal && historyTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-violet-500" />
                  Historial de Cambios
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {historyTemplate.name}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowHistoryModal(false);
                  setHistoryTemplate(null);
                  setHistoryLogs([]);
                }}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingHistory ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                </div>
              ) : historyLogs.length === 0 ? (
                <div className="text-center py-12">
                  <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No hay registros de cambios</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {historyLogs.map((log, index) => (
                    <div
                      key={log.id || index}
                      className="relative pl-8 pb-4 border-l-2 border-gray-200 last:border-l-transparent last:pb-0"
                    >
                      {/* Dot indicator */}
                      <div className={`absolute left-[-9px] top-0 w-4 h-4 rounded-full border-2 border-white ${
                        log.action === 'created' ? 'bg-green-500' :
                        log.action === 'deleted' ? 'bg-red-500' :
                        log.action === 'status_changed' ? 'bg-amber-500' :
                        log.action === 'builder_updated' ? 'bg-violet-500' :
                        'bg-blue-500'
                      }`}></div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        {/* Header del log */}
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              log.action === 'created' ? 'bg-green-100 text-green-800' :
                              log.action === 'deleted' ? 'bg-red-100 text-red-800' :
                              log.action === 'status_changed' ? 'bg-amber-100 text-amber-800' :
                              log.action === 'builder_updated' ? 'bg-violet-100 text-violet-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {log.action_label}
                            </span>
                            {log.field_label && log.field_label !== 'builder_fields' && (
                              <span className="text-sm text-gray-600">
                                - {log.field_label}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {log.created_at}
                          </div>
                        </div>

                        {/* Descripcion - soporta multilínea */}
                        {log.description && (
                          <div className="text-sm text-gray-700 mb-2 space-y-1">
                            {log.description.split('\n').map((line, idx) => (
                              <p key={idx} className={line.includes('agregado') ? 'text-green-700' : line.includes('eliminado') ? 'text-red-700' : line.includes('modificado') ? 'text-blue-700' : ''}>
                                {line}
                              </p>
                            ))}
                          </div>
                        )}

                        {/* Cambios de valor - no mostrar para builder_updated (tiene JSON complejo) */}
                        {(log.old_value || log.new_value) && log.action !== 'created' && log.action !== 'deleted' && log.action !== 'builder_updated' && (
                          <div className="flex flex-wrap gap-2 text-xs">
                            {log.old_value && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded">
                                <span className="font-medium">Antes:</span>
                                <span className="max-w-[200px] truncate">{log.old_value}</span>
                              </span>
                            )}
                            {log.new_value && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded">
                                <span className="font-medium">Despues:</span>
                                <span className="max-w-[200px] truncate">{log.new_value}</span>
                              </span>
                            )}
                          </div>
                        )}

                        {/* Usuario */}
                        {log.user && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                            <User className="w-3 h-3" />
                            <span>{log.user.name || log.user.username}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowHistoryModal(false);
                  setHistoryTemplate(null);
                  setHistoryLogs([]);
                }}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
