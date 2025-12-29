// File: src/pages/companies/CompanyDetailView.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Building2, FileText, Award, Save, ArrowLeft,
  CheckCircle, CheckSquare, Square,
  ToggleLeft, ToggleRight, Link2, ExternalLink, Loader2,
  Eye, EyeOff, X
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  getCompanyById,
  updateCompany,
  getFixedDocuments,
  updateFixedDocument,
  getCompanyCertificates,
  getCertificateTemplates,
  assignCertificateToCompany,
  revokeCompanyCertificate,
} from "../../services/companyService";
import { handleSnackbar } from "../../utils/messageHelpers";

const categoryColors = {
  tributario: "bg-cyan-100 text-cyan-800",
  laboral: "bg-indigo-100 text-indigo-800",
  seguros: "bg-amber-100 text-amber-800",
  calidad: "bg-emerald-100 text-emerald-800",
  seguridad: "bg-rose-100 text-rose-800",
};

export default function CompanyDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const companyId = parseInt(id);

  // Estados principales
  const [activeTab, setActiveTab] = useState("info");
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form data
  const [formData, setFormData] = useState({});

  // Documentos fijos
  const [companyDocuments, setCompanyDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null); // ID del documento que se está editando
  const [savingDoc, setSavingDoc] = useState(null); // ID del documento que se está guardando
  const [previewDoc, setPreviewDoc] = useState(null); // ID del documento con preview abierto
  const [previewLoading, setPreviewLoading] = useState(false); // Estado de carga del iframe

  // Certificados
  const [certificateTemplates, setCertificateTemplates] = useState([]);
  const [companyCertificates, setCompanyCertificates] = useState([]);
  const [assignedCertificates, setAssignedCertificates] = useState({});
  const [loadingCertificates, setLoadingCertificates] = useState(false);
  const [togglingCertificate, setTogglingCertificate] = useState(null); // ID del certificado en proceso

  // Cargar datos iniciales
  useEffect(() => {
    loadCompany();
  }, [companyId]);

  // Cargar datos del tab activo
  useEffect(() => {
    if (company) {
      if (activeTab === "documents" && companyDocuments.length === 0) {
        loadDocuments();
      }
      if (activeTab === "certificates" && certificateTemplates.length === 0) {
        loadCertificates();
      }
    }
  }, [activeTab, company]);

  const loadCompany = async () => {
    setLoading(true);
    try {
      const response = await getCompanyById(companyId);
      if (response.success && response.data) {
        setCompany(response.data);
        setFormData({ ...response.data });
      } else {
        handleSnackbar("Empresa no encontrada", "error");
        navigate("/dashboard/empresas");
      }
    } catch (error) {
      handleSnackbar("Error al cargar empresa", "error");
      navigate("/dashboard/empresas");
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    setLoadingDocuments(true);
    try {
      const response = await getFixedDocuments(companyId);
      if (response.success) {
        setCompanyDocuments(response.data || []);
      }
    } catch (error) {
      console.error("Error loading documents:", error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const loadCertificates = async () => {
    setLoadingCertificates(true);
    try {
      // Cargar plantillas disponibles
      const templatesResponse = await getCertificateTemplates();
      if (templatesResponse.success) {
        setCertificateTemplates(templatesResponse.data || []);
      }

      // Cargar certificados asignados a la empresa
      const assignedResponse = await getCompanyCertificates(companyId);
      if (assignedResponse.success) {
        setCompanyCertificates(assignedResponse.data || []);

        // Crear mapa de certificados asignados (solo los que NO están revocados/expirados)
        const assignedMap = {};
        (assignedResponse.data || []).forEach(cert => {
          const isActive = !['revoked', 'expired'].includes(cert.assignment_status);
          assignedMap[cert.certificate_id] = isActive;
        });
        setAssignedCertificates(assignedMap);
      }
    } catch (error) {
      console.error("Error loading certificates:", error);
    } finally {
      setLoadingCertificates(false);
    }
  };

  // Handlers de formulario
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveCompany = async () => {
    setSaving(true);
    try {
      const response = await updateCompany(companyId, formData);
      if (response.success) {
        handleSnackbar("Empresa actualizada correctamente", "success");
        setCompany({ ...company, ...formData });
      } else {
        handleSnackbar(response.message || "Error al actualizar empresa", "error");
      }
    } catch (error) {
      handleSnackbar("Error al actualizar empresa", "error");
    } finally {
      setSaving(false);
    }
  };

  // Handlers de documentos fijos
  const handleDocumentChange = (docId, field, value) => {
    setCompanyDocuments(prev =>
      prev.map(d => d.id === docId ? { ...d, [field]: value } : d)
    );
    setEditingDoc(docId);
  };

  const handleSaveDocument = async (doc) => {
    setSavingDoc(doc.id);
    try {
      const response = await updateFixedDocument(doc.id, {
        file_path: doc.file_path,
        status: doc.status,
      });
      if (response.success) {
        handleSnackbar("Documento actualizado", "success");
        setEditingDoc(null);
      } else {
        handleSnackbar(response.message || "Error al actualizar", "error");
      }
    } catch (error) {
      handleSnackbar("Error al actualizar documento", "error");
    } finally {
      setSavingDoc(null);
    }
  };

  const handleToggleDocumentStatus = async (doc) => {
    setSavingDoc(doc.id);
    try {
      const response = await updateFixedDocument(doc.id, {
        file_path: doc.file_path,
        status: !doc.status,
      });
      if (response.success) {
        setCompanyDocuments(prev =>
          prev.map(d => d.id === doc.id ? { ...d, status: !d.status } : d)
        );
        handleSnackbar("Estado actualizado", "success");
      } else {
        handleSnackbar(response.message || "Error al actualizar estado", "error");
      }
    } catch (error) {
      handleSnackbar("Error al actualizar estado", "error");
    } finally {
      setSavingDoc(null);
    }
  };

  const handleTogglePreview = (docId) => {
    if (previewDoc === docId) {
      setPreviewDoc(null);
      setPreviewLoading(false);
    } else {
      setPreviewDoc(docId);
      setPreviewLoading(true);
    }
  };

  const handleIframeLoad = () => {
    setPreviewLoading(false);
  };

  // Handlers de certificados
  const handleToggleCertificate = async (templateId) => {
    // Prevenir clicks rápidos
    if (togglingCertificate === templateId) return;

    setTogglingCertificate(templateId);
    const isCurrentlyAssigned = assignedCertificates[templateId];

    try {
      if (isCurrentlyAssigned) {
        // Buscar el company_certificate_id para revocar
        const companyCert = companyCertificates.find(c => c.certificate_id === templateId && !['revoked', 'expired'].includes(c.assignment_status));
        if (companyCert) {
          const response = await revokeCompanyCertificate(companyCert.id);
          if (response.success) {
            setAssignedCertificates(prev => ({ ...prev, [templateId]: false }));
            handleSnackbar("Certificado revocado", "success");
            await loadCertificates();
          }
        }
      } else {
        // Asignar certificado
        const response = await assignCertificateToCompany({
          company_id: companyId,
          certificate_id: templateId,
        });
        if (response.success) {
          setAssignedCertificates(prev => ({ ...prev, [templateId]: true }));
          handleSnackbar("Certificado asignado", "success");
          await loadCertificates();
        }
      }
    } catch (error) {
      handleSnackbar(error.response?.data?.error || "Error al modificar certificado", "error");
    } finally {
      setTogglingCertificate(null);
    }
  };

  // Calculos
  const assignedCount = Object.values(assignedCertificates).filter(Boolean).length;
  const activeDocsCount = companyDocuments.filter(d => d.status).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Empresa no encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/empresas")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-7 h-7" />
              {company.business_name}
            </h1>
            <p className="text-gray-500 mt-1">{company.rut_formatted || company.rut} | {company.sap_code || 'Sin codigo SAP'}</p>
          </div>
        </div>
        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
          company.status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {company.status ? "Activa" : "Inactiva"}
        </span>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px px-6">
            {[
              { id: "info", label: "Informacion", icon: Building2 },
              { id: "certificates", label: `Certificados (${assignedCount})`, icon: Award },
              { id: "documents", label: `Documentos (${activeDocsCount}/${companyDocuments.length})`, icon: FileText },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-cyan-500 text-cyan-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* TAB: Informacion */}
          {activeTab === "info" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Informacion de la Empresa</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RUT</label>
                  <Input
                    value={formData.rut_formatted || formData.rut || ""}
                    onChange={(e) => handleFormChange("rut", e.target.value)}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Codigo SAP</label>
                  <Input
                    value={formData.sap_code || ""}
                    onChange={(e) => handleFormChange("sap_code", e.target.value)}
                    disabled
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Razon Social</label>
                  <Input
                    value={formData.business_name || ""}
                    onChange={(e) => handleFormChange("business_name", e.target.value)}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email de Contacto</label>
                  <Input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => handleFormChange("email", e.target.value)}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                  <Input
                    value={formData.phone || ""}
                    onChange={(e) => handleFormChange("phone", e.target.value)}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <button
                    onClick={() => handleFormChange("status", !formData.status)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      formData.status
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-red-50 border-red-200 text-red-700"
                    }`}
                  >
                    {formData.status ? (
                      <>
                        <ToggleRight className="w-5 h-5" />
                        Activa
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-5 h-5" />
                        Inactiva
                      </>
                    )}
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Registro</label>
                  <Input
                    value={formData.created_at || ""}
                    disabled
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSaveCompany} icon={Save} disabled={saving}>
                  {saving ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </div>
          )}

          {/* TAB: Documentos Fijos */}
          {activeTab === "documents" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Accesos a Documentos</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Configura los enlaces a documentos de SharePoint para esta empresa.
                </p>
              </div>

              {/* Lista de documentos fijos */}
              {loadingDocuments ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="space-y-4">
                  {companyDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className={`border rounded-lg p-4 ${doc.status ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-70'}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${doc.status ? 'bg-cyan-100' : 'bg-gray-200'}`}>
                            <FileText className={`w-5 h-5 ${doc.status ? 'text-cyan-600' : 'text-gray-500'}`} />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{doc.name}</h4>
                            <p className="text-xs text-gray-500 mt-0.5">{doc.description}</p>
                            <span className="text-xs font-mono text-gray-400">{doc.code}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggleDocumentStatus(doc)}
                          disabled={savingDoc === doc.id || !doc.file_path}
                          title={!doc.file_path ? "Ingrese una URL válida para activar/desactivar" : (doc.status ? "Desactivar documento" : "Activar documento")}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            !doc.file_path
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : doc.status
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                          } ${savingDoc === doc.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {savingDoc === doc.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : doc.status ? (
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

                      <div className="mt-4">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          URL del documento
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="https://voltacl.sharepoint.com/sites/..."
                            value={doc.file_path || ""}
                            onChange={(e) => handleDocumentChange(doc.id, 'file_path', e.target.value)}
                            className="flex-1 px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          />
                          {doc.file_path && (
                            <>
                              <button
                                onClick={() => handleTogglePreview(doc.id)}
                                className={`p-2 rounded-lg transition-colors ${
                                  previewDoc === doc.id
                                    ? 'text-cyan-800 bg-cyan-100'
                                    : 'text-gray-500 hover:text-cyan-600 hover:bg-cyan-50'
                                }`}
                                title={previewDoc === doc.id ? "Cerrar preview" : "Ver preview"}
                              >
                                {previewDoc === doc.id ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                              <a
                                href={doc.file_path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-cyan-600 hover:text-cyan-800 hover:bg-cyan-50 rounded-lg transition-colors"
                                title="Abrir en nueva pestaña"
                              >
                                <ExternalLink className="w-5 h-5" />
                              </a>
                            </>
                          )}
                          {editingDoc === doc.id && (
                            <Button
                              size="sm"
                              onClick={() => handleSaveDocument(doc)}
                              disabled={savingDoc === doc.id || !doc.file_path?.trim()}
                              icon={savingDoc === doc.id ? Loader2 : Save}
                              title={!doc.file_path?.trim() ? "Ingrese una URL válida" : "Guardar cambios"}
                            >
                              Guardar
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Preview iframe */}
                      {previewDoc === doc.id && doc.file_path && (
                        <div className="mt-4 relative">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-500">Vista previa</span>
                            <button
                              onClick={() => setPreviewDoc(null)}
                              className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                              title="Cerrar preview"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          {/* Contenedor con overflow hidden para ocultar footer de Power BI */}
                          <div
                            className="relative border border-gray-200 rounded-lg overflow-hidden bg-white"
                            style={{ height: '500px' }}
                          >
                            {/* Loader */}
                            {previewLoading && (
                              <div className="absolute inset-0 bg-white flex flex-col items-center justify-center z-10">
                                <div className="w-10 h-10 border-4 border-gray-200 border-t-cyan-500 rounded-full animate-spin"></div>
                                <p className="mt-3 text-sm text-gray-500">Cargando documento...</p>
                              </div>
                            )}
                            {/* iframe más alto que el contenedor para ocultar el footer */}
                            <iframe
                              src={doc.file_path}
                              title={doc.name}
                              className="w-full border-0"
                              style={{ height: 'calc(100% + 56px)' }}
                              onLoad={handleIframeLoad}
                              allowFullScreen
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {companyDocuments.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                      <Link2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">Cargando documentos...</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB: Certificados */}
          {activeTab === "certificates" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Asignar Certificados</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Selecciona los certificados que debe presentar esta empresa.
                  </p>
                </div>
              </div>

              {loadingCertificates ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : certificateTemplates.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12"></th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Codigo</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Certificado</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {certificateTemplates.map((template) => (
                        <tr
                          key={template.id}
                          className={`hover:bg-gray-50 ${togglingCertificate === template.id ? 'opacity-50 pointer-events-none' : 'cursor-pointer'} ${assignedCertificates[template.id] ? 'bg-cyan-50' : ''}`}
                          onClick={() => handleToggleCertificate(template.id)}
                        >
                          <td className="px-4 py-3">
                            <button className="p-1" disabled={togglingCertificate === template.id}>
                              {togglingCertificate === template.id
                                ? <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                                : assignedCertificates[template.id]
                                  ? <CheckSquare className="w-5 h-5 text-cyan-600" />
                                  : <Square className="w-5 h-5 text-gray-400" />
                              }
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">{template.code}</span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-gray-900">{template.name}</p>
                            {template.description && (
                              <p className="text-xs text-gray-500 mt-0.5">{template.description}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {assignedCertificates[template.id] ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3" />
                                Asignado
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">No asignado</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No hay plantillas de certificados disponibles</p>
                  <p className="text-sm text-gray-400 mt-1">Crea plantillas de certificados primero</p>
                </div>
              )}

              {certificateTemplates.length > 0 && (
                <div className="flex justify-between items-center pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    <span className="font-medium text-cyan-600">{assignedCount}</span> de <span className="font-medium">{certificateTemplates.length}</span> certificados asignados
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
