import { useState, useEffect } from "react";
import {
  Receipt,
  Plus,
  Search,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  Save,
  Loader2,
  Database,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { handleSnackbar } from "../../utils/messageHelpers";
import {
  getInvoiceTemplates,
  createInvoiceTemplate,
  updateInvoiceTemplate,
  deleteInvoiceTemplate,
} from "../../services/invoiceTemplateService";
import { getDataSources } from "../../services/dataSourceService";

export default function InvoiceTemplatesView() {
  const [templates, setTemplates] = useState([]);
  const [dataSources, setDataSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create | edit
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    data_source_id: "",
    status: true,
  });

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [templatesRes, dataSourcesRes] = await Promise.all([
        getInvoiceTemplates(),
        getDataSources(),
      ]);

      if (templatesRes.success) {
        setTemplates(templatesRes.data || []);
      }
      if (dataSourcesRes.success) {
        setDataSources(dataSourcesRes.data || []);
      }
    } catch (error) {
      handleSnackbar("Error cargando datos", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      data_source_id: "",
      status: true,
    });
    setModalMode("create");
    setShowModal(true);
  };

  const handleOpenEdit = (template) => {
    setFormData({
      name: template.name || "",
      code: template.code || "",
      description: template.description || "",
      data_source_id: template.data_source_id || "",
      status: template.status ?? true,
    });
    setSelectedTemplate(template);
    setModalMode("edit");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      handleSnackbar("El nombre es obligatorio", "error");
      return;
    }

    setSaving(true);
    try {
      if (modalMode === "edit" && selectedTemplate) {
        const response = await updateInvoiceTemplate(selectedTemplate.id, formData);
        if (response.success) {
          handleSnackbar("Plantilla actualizada", "success");
          setShowModal(false);
          loadData();
        } else {
          handleSnackbar(response.message || "Error al actualizar", "error");
        }
      } else {
        const response = await createInvoiceTemplate(formData);
        if (response.success) {
          handleSnackbar("Plantilla creada", "success");
          setShowModal(false);
          loadData();
        } else {
          handleSnackbar(response.message || "Error al crear", "error");
        }
      }
    } catch (error) {
      handleSnackbar("Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDelete = (template) => {
    setSelectedTemplate(template);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedTemplate) return;

    setDeleting(true);
    try {
      const response = await deleteInvoiceTemplate(selectedTemplate.id);
      if (response.success) {
        handleSnackbar("Plantilla eliminada", "success");
        setShowDeleteModal(false);
        setSelectedTemplate(null);
        loadData();
      } else {
        handleSnackbar(response.message || "Error al eliminar", "error");
      }
    } catch (error) {
      handleSnackbar("Error al eliminar", "error");
    } finally {
      setDeleting(false);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Receipt className="w-7 h-7 text-amber-600" />
            Plantillas de Facturas
          </h1>
          <p className="text-gray-500 mt-1">
            Gestiona las plantillas de facturas disponibles para asignar a empresas
          </p>
        </div>
        <Button onClick={handleOpenCreate} icon={Plus}>
          Nueva Plantilla
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, codigo o descripcion..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Templates List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredTemplates.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Codigo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Fuente de Datos
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTemplates.map((template) => (
                <tr key={template.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {template.code || "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{template.name}</p>
                      {template.description && (
                        <p className="text-sm text-gray-500 mt-0.5">
                          {template.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {template.data_source_name ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        <Database className="w-3 h-3" />
                        {template.data_source_name}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">Sin fuente</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        template.status
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {template.status ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(template)}
                        className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(template)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        ) : (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No hay plantillas de facturas</p>
            <p className="text-sm text-gray-400 mt-1">
              Crea una nueva plantilla para comenzar
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {modalMode === "edit" ? "Editar Plantilla" : "Nueva Plantilla de Factura"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Nombre"
                  required
                  placeholder="Ej: Facturas Pendientes de Pago"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Input
                  label="Código"
                  placeholder="FAC-001"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1.5">
                  Fuente de Datos
                </label>
                <select
                  value={formData.data_source_id}
                  onChange={(e) => setFormData({ ...formData, data_source_id: e.target.value })}
                  className="w-full rounded border px-3 py-2 bg-white outline-none transition shadow-sm text-[13px] border-gray-300 focus:ring-2 focus:ring-indigo-200 h-[37px]"
                >
                  <option value="">Sin fuente</option>
                  {dataSources.map((ds) => (
                    <option key={ds.id} value={ds.id}>
                      {ds.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1.5">
                  Descripción
                </label>
                <textarea
                  placeholder="Descripción de la plantilla de factura..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full rounded border px-3 py-2 bg-white outline-none transition shadow-sm text-[13px] border-gray-300 focus:ring-2 focus:ring-indigo-200 resize-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Estado:</label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, status: !formData.status })}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    formData.status ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {formData.status ? (
                    <>
                      <ToggleRight className="w-4 h-4" />
                      Activo
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4" />
                      Inactivo
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 rounded-b-lg">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving} icon={saving ? Loader2 : Save}>
                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Eliminar Plantilla</h3>
                  <p className="text-sm text-gray-500">Esta accion no se puede deshacer</p>
                </div>
              </div>

              <p className="text-gray-600 mb-6">
                ¿Estas seguro que deseas eliminar la plantilla{" "}
                <strong>"{selectedTemplate.name}"</strong>?
              </p>

              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedTemplate(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  disabled={deleting}
                  icon={deleting ? Loader2 : Trash2}
                >
                  {deleting ? "Eliminando..." : "Eliminar"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
