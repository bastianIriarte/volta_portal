import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  MoreVertical,
  X,
} from "lucide-react";
import { CertificateBuilder } from "../../components/certificate-builder";
import { handleSnackbar } from "../../utils/messageHelpers";
import api from "../../services/api";

export default function CertificateBuilderView() {
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
    primary_color: "#0284c7",
    secondary_color: "#64748b",
  });

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
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Plantillas
          </button>
        </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={() => handleEditBuilder(template.id)}
            />
          ))}
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
    </div>
  );
}

// Componente de tarjeta de plantilla
function TemplateCard({ template, onEdit }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Preview thumbnail */}
      <div
        className="h-32 bg-gradient-to-br from-sky-50 to-sky-100 flex items-center justify-center border-b border-gray-200"
        style={{
          borderTopColor: template.primary_color || "#0284c7",
          borderTopWidth: "3px",
        }}
      >
        <FileText className="h-12 w-12 text-sky-300" />
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">
              {template.name}
            </h3>
            {template.code && (
              <p className="text-sm text-gray-500 font-mono">{template.code}</p>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Edit2 className="h-4 w-4" />
                    Editar Builder
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <Eye className="h-4 w-4" />
                    Vista Previa
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {template.description && (
          <p className="text-sm text-gray-500 mt-2 line-clamp-2">
            {template.description}
          </p>
        )}

        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm text-sky-600 bg-sky-50 rounded-md hover:bg-sky-100 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
            Diseñar
          </button>
        </div>
      </div>
    </div>
  );
}
