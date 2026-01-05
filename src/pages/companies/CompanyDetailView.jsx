// File: src/pages/companies/CompanyDetailView.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Building2, FileText, Award, Save, ArrowLeft,
  CheckCircle, CheckSquare, Square,
  ToggleLeft, ToggleRight, Link2, ExternalLink, Loader2,
  Eye, EyeOff, X, Settings, Plus, Pencil, Trash2,
  BarChart3, Receipt
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  getCompanyById,
  updateCompany,
  getCompanyDocuments,
  createCompanyDocument,
  updateCompanyDocument,
  deleteCompanyDocument,
  getCompanyCertificates,
  getCertificateTemplates,
  assignCertificateToCompany,
  revokeCompanyCertificate,
  updateCompanyCertificate,
  getCompanyReports,
  getReportTemplates,
  createCompanyReport,
  revokeCompanyReport,
  getCompanyInvoices,
  getInvoiceTemplates,
  createCompanyInvoice,
  revokeCompanyInvoice,
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

  // Documentos
  const [companyDocuments, setCompanyDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [savingDoc, setSavingDoc] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [docModal, setDocModal] = useState({ open: false, mode: 'create', document: null });
  const [docFormData, setDocFormData] = useState({ name: '', description: '', file_path: '', status: true });
  const [deletingDoc, setDeletingDoc] = useState(null);

  // Certificados
  const [certificateTemplates, setCertificateTemplates] = useState([]);
  const [companyCertificates, setCompanyCertificates] = useState([]);
  const [assignedCertificates, setAssignedCertificates] = useState({});
  const [loadingCertificates, setLoadingCertificates] = useState(false);
  const [togglingCertificate, setTogglingCertificate] = useState(null); // ID del certificado en proceso

  // Modal configuracion de certificado
  const [configModal, setConfigModal] = useState({ open: false, certificate: null });
  const [configFormData, setConfigFormData] = useState({ report_url: "" });
  const [savingConfig, setSavingConfig] = useState(false);
  const [configPreview, setConfigPreview] = useState(false);
  const [configPreviewLoading, setConfigPreviewLoading] = useState(false);

  // Reportes (estructura similar a certificados)
  const [reportTemplates, setReportTemplates] = useState([]);
  const [companyReports, setCompanyReports] = useState([]);
  const [assignedReports, setAssignedReports] = useState({});
  const [loadingReports, setLoadingReports] = useState(false);
  const [togglingReport, setTogglingReport] = useState(null);

  // Facturas (estructura similar a certificados)
  const [invoiceTemplates, setInvoiceTemplates] = useState([]);
  const [companyInvoices, setCompanyInvoices] = useState([]);
  const [assignedInvoices, setAssignedInvoices] = useState({});
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [togglingInvoice, setTogglingInvoice] = useState(null);

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
      if (activeTab === "reports" && reportTemplates.length === 0) {
        loadReports();
      }
      if (activeTab === "invoices" && invoiceTemplates.length === 0) {
        loadInvoices();
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
      const response = await getCompanyDocuments(companyId);
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

  const loadReports = async () => {
    setLoadingReports(true);
    try {
      // Cargar plantillas de reportes disponibles
      const templatesResponse = await getReportTemplates();
      if (templatesResponse.success) {
        setReportTemplates(templatesResponse.data || []);
      }

      // Cargar reportes asignados a la empresa
      const assignedResponse = await getCompanyReports(companyId);
      if (assignedResponse.success) {
        setCompanyReports(assignedResponse.data || []);

        // Crear mapa de reportes asignados (solo los que NO estan revocados)
        const assignedMap = {};
        (assignedResponse.data || []).forEach(report => {
          const isActive = !['revoked'].includes(report.assignment_status);
          assignedMap[report.report_id] = isActive;
        });
        setAssignedReports(assignedMap);
      }
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoadingReports(false);
    }
  };

  const loadInvoices = async () => {
    setLoadingInvoices(true);
    try {
      // Cargar plantillas de facturas disponibles
      const templatesResponse = await getInvoiceTemplates();
      if (templatesResponse.success) {
        setInvoiceTemplates(templatesResponse.data || []);
      }

      // Cargar facturas asignadas a la empresa
      const assignedResponse = await getCompanyInvoices(companyId);
      if (assignedResponse.success) {
        setCompanyInvoices(assignedResponse.data || []);

        // Crear mapa de facturas asignadas (solo las que NO estan revocadas)
        const assignedMap = {};
        (assignedResponse.data || []).forEach(invoice => {
          const isActive = !['revoked'].includes(invoice.assignment_status);
          assignedMap[invoice.invoice_id] = isActive;
        });
        setAssignedInvoices(assignedMap);
      }
    } catch (error) {
      console.error("Error loading invoices:", error);
    } finally {
      setLoadingInvoices(false);
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

  // Handlers de documentos
  const handleOpenDocModal = (mode, doc = null) => {
    if (mode === 'edit' && doc) {
      setDocFormData({
        name: doc.name || '',
        description: doc.description || '',
        file_path: doc.file_path || '',
        status: doc.status ?? true,
      });
      setDocModal({ open: true, mode: 'edit', document: doc });
    } else {
      setDocFormData({ name: '', description: '', file_path: '', status: true });
      setDocModal({ open: true, mode: 'create', document: null });
    }
  };

  const handleSaveDocument = async () => {
    if (!docFormData.name?.trim()) {
      handleSnackbar("El nombre es obligatorio", "error");
      return;
    }
    setSavingDoc(true);
    try {
      if (docModal.mode === 'edit' && docModal.document) {
        const response = await updateCompanyDocument(docModal.document.id, docFormData);
        if (response.success) {
          handleSnackbar("Documento actualizado", "success");
          setDocModal({ open: false, mode: 'create', document: null });
          await loadDocuments();
        } else {
          handleSnackbar(response.message || "Error al actualizar", "error");
        }
      } else {
        const response = await createCompanyDocument({
          ...docFormData,
          company_id: companyId,
        });
        if (response.success) {
          handleSnackbar("Documento creado", "success");
          setDocModal({ open: false, mode: 'create', document: null });
          await loadDocuments();
        } else {
          handleSnackbar(response.message || "Error al crear", "error");
        }
      }
    } catch (error) {
      handleSnackbar("Error al guardar documento", "error");
    } finally {
      setSavingDoc(false);
    }
  };

  const handleDeleteDocument = async (doc) => {
    if (!window.confirm(`¿Eliminar el documento "${doc.name}"?`)) return;
    setDeletingDoc(doc.id);
    try {
      const response = await deleteCompanyDocument(doc.id);
      if (response.success) {
        handleSnackbar("Documento eliminado", "success");
        await loadDocuments();
      } else {
        handleSnackbar(response.message || "Error al eliminar", "error");
      }
    } catch (error) {
      handleSnackbar("Error al eliminar documento", "error");
    } finally {
      setDeletingDoc(null);
    }
  };

  const handleToggleDocumentStatus = async (doc) => {
    setSavingDoc(doc.id);
    try {
      const response = await updateCompanyDocument(doc.id, {
        ...doc,
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

  // Abrir modal de configuracion
  const handleOpenConfigModal = (e, templateId) => {
    e.stopPropagation(); // Evitar toggle del certificado
    const companyCert = companyCertificates.find(
      c => c.certificate_id === templateId && !['revoked', 'expired'].includes(c.assignment_status)
    );
    const template = certificateTemplates.find(t => t.id === templateId);
    if (companyCert && template) {
      setConfigFormData({ report_url: companyCert.report_url || "" });
      setConfigModal({ open: true, certificate: { ...companyCert, templateName: template.name } });
      setConfigPreview(false);
      setConfigPreviewLoading(false);
    }
  };

  // Guardar configuracion del certificado
  const handleSaveConfig = async () => {
    if (!configModal.certificate) return;
    setSavingConfig(true);
    try {
      const response = await updateCompanyCertificate(configModal.certificate.id, {
        report_url: configFormData.report_url,
      });
      if (response.success) {
        handleSnackbar("Configuracion guardada", "success");
        setConfigModal({ open: false, certificate: null });
        await loadCertificates();
      } else {
        handleSnackbar(response.message || "Error al guardar", "error");
      }
    } catch (error) {
      handleSnackbar("Error al guardar configuracion", "error");
    } finally {
      setSavingConfig(false);
    }
  };

  // Handlers de reportes (toggle similar a certificados)
  const handleToggleReport = async (templateId) => {
    if (togglingReport === templateId) return;

    setTogglingReport(templateId);
    const isCurrentlyAssigned = assignedReports[templateId];

    try {
      if (isCurrentlyAssigned) {
        // Buscar el company_report_id para revocar
        const companyReport = companyReports.find(r => r.report_id === templateId && !['revoked'].includes(r.assignment_status));
        if (companyReport) {
          const response = await revokeCompanyReport(companyReport.id);
          if (response.success) {
            setAssignedReports(prev => ({ ...prev, [templateId]: false }));
            handleSnackbar("Reporte revocado", "success");
            await loadReports();
          }
        }
      } else {
        // Asignar reporte
        const response = await createCompanyReport({
          company_id: companyId,
          report_id: templateId,
        });
        if (response.success) {
          setAssignedReports(prev => ({ ...prev, [templateId]: true }));
          handleSnackbar("Reporte asignado", "success");
          await loadReports();
        }
      }
    } catch (error) {
      handleSnackbar(error.response?.data?.error || "Error al modificar reporte", "error");
    } finally {
      setTogglingReport(null);
    }
  };

  // Handlers de facturas (toggle similar a certificados)
  const handleToggleInvoice = async (templateId) => {
    if (togglingInvoice === templateId) return;

    setTogglingInvoice(templateId);
    const isCurrentlyAssigned = assignedInvoices[templateId];

    try {
      if (isCurrentlyAssigned) {
        // Buscar el company_invoice_id para revocar
        const companyInvoice = companyInvoices.find(i => i.invoice_id === templateId && !['revoked'].includes(i.assignment_status));
        if (companyInvoice) {
          const response = await revokeCompanyInvoice(companyInvoice.id);
          if (response.success) {
            setAssignedInvoices(prev => ({ ...prev, [templateId]: false }));
            handleSnackbar("Factura revocada", "success");
            await loadInvoices();
          }
        }
      } else {
        // Asignar factura
        const response = await createCompanyInvoice({
          company_id: companyId,
          invoice_id: templateId,
        });
        if (response.success) {
          setAssignedInvoices(prev => ({ ...prev, [templateId]: true }));
          handleSnackbar("Factura asignada", "success");
          await loadInvoices();
        }
      }
    } catch (error) {
      handleSnackbar(error.response?.data?.error || "Error al modificar factura", "error");
    } finally {
      setTogglingInvoice(null);
    }
  };

  // Calculos
  const assignedCount = Object.values(assignedCertificates).filter(Boolean).length;
  const assignedReportsCount = Object.values(assignedReports).filter(Boolean).length;
  const assignedInvoicesCount = Object.values(assignedInvoices).filter(Boolean).length;
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
              { id: "reports", label: `Reportes (${assignedReportsCount})`, icon: BarChart3 },
              { id: "invoices", label: `Facturas (${assignedInvoicesCount})`, icon: Receipt },
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

          {/* TAB: Documentos */}
          {activeTab === "documents" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Accesos Directos</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Gestiona los enlaces a documentos y reportes para esta empresa.
                  </p>
                </div>
                <Button onClick={() => handleOpenDocModal('create')} icon={Plus}>
                  Nuevo Acceso
                </Button>
              </div>

              {loadingDocuments ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : companyDocuments.length > 0 ? (
                <div className="space-y-3">
                  {companyDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className={`border rounded-lg p-4 ${doc.status ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-70'}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`p-2 rounded-lg flex-shrink-0 ${doc.status ? 'bg-cyan-100' : 'bg-gray-200'}`}>
                            <FileText className={`w-5 h-5 ${doc.status ? 'text-cyan-600' : 'text-gray-500'}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-gray-900">{doc.name}</h4>
                            {doc.description && (
                              <p className="text-xs text-gray-500 mt-0.5">{doc.description}</p>
                            )}
                            {doc.file_path && (
                              <p className="text-xs text-gray-400 mt-1 truncate">{doc.file_path}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
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
                                {previewDoc === doc.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                              <a
                                href={doc.file_path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                                title="Abrir en nueva pestaña"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </>
                          )}
                          <button
                            onClick={() => handleToggleDocumentStatus(doc)}
                            disabled={savingDoc === doc.id}
                            className={`p-2 rounded-lg transition-colors ${
                              doc.status
                                ? 'text-green-600 hover:bg-green-50'
                                : 'text-gray-400 hover:bg-gray-100'
                            }`}
                            title={doc.status ? "Desactivar" : "Activar"}
                          >
                            {savingDoc === doc.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : doc.status ? (
                              <ToggleRight className="w-4 h-4" />
                            ) : (
                              <ToggleLeft className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleOpenDocModal('edit', doc)}
                            className="p-2 text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDocument(doc)}
                            disabled={deletingDoc === doc.id}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            {deletingDoc === doc.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
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
                          <div
                            className="relative border border-gray-200 rounded-lg overflow-hidden bg-white"
                            style={{ height: '500px' }}
                          >
                            {previewLoading && (
                              <div className="absolute inset-0 bg-white flex flex-col items-center justify-center z-10">
                                <div className="w-10 h-10 border-4 border-gray-200 border-t-cyan-500 rounded-full animate-spin"></div>
                                <p className="mt-3 text-sm text-gray-500">Cargando documento...</p>
                              </div>
                            )}
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
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <Link2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No hay accesos directos</p>
                  <p className="text-sm text-gray-400 mt-1">Crea un nuevo acceso para comenzar</p>
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
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-24">Configurar</th>
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
                          <td className="px-4 py-3 text-center">
                            {assignedCertificates[template.id] && (
                              <button
                                onClick={(e) => handleOpenConfigModal(e, template.id)}
                                className="p-2 text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                                title="Configurar URL del reporte"
                              >
                                <Settings className="w-4 h-4" />
                              </button>
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

          {/* TAB: Reportes */}
          {activeTab === "reports" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Asignar Reportes</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Selecciona los reportes disponibles para esta empresa.
                  </p>
                </div>
              </div>

              {loadingReports ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : reportTemplates.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12"></th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Codigo</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reporte</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportTemplates.map((template) => (
                        <tr
                          key={template.id}
                          className={`hover:bg-gray-50 ${togglingReport === template.id ? 'opacity-50 pointer-events-none' : 'cursor-pointer'} ${assignedReports[template.id] ? 'bg-indigo-50' : ''}`}
                          onClick={() => handleToggleReport(template.id)}
                        >
                          <td className="px-4 py-3">
                            <button className="p-1" disabled={togglingReport === template.id}>
                              {togglingReport === template.id
                                ? <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                                : assignedReports[template.id]
                                  ? <CheckSquare className="w-5 h-5 text-indigo-600" />
                                  : <Square className="w-5 h-5 text-gray-400" />
                              }
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">{template.code || '-'}</span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-gray-900">{template.name}</p>
                            {template.description && (
                              <p className="text-xs text-gray-500 mt-0.5">{template.description}</p>
                            )}
                            {template.data_source_name && (
                              <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mt-1 inline-block">
                                DS: {template.data_source_name}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {assignedReports[template.id] ? (
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
                  <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No hay plantillas de reportes disponibles</p>
                  <p className="text-sm text-gray-400 mt-1">Crea plantillas de reportes primero</p>
                </div>
              )}

              {reportTemplates.length > 0 && (
                <div className="flex justify-between items-center pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    <span className="font-medium text-indigo-600">{assignedReportsCount}</span> de <span className="font-medium">{reportTemplates.length}</span> reportes asignados
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB: Facturas */}
          {activeTab === "invoices" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Asignar Facturas</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Selecciona las configuraciones de facturas para esta empresa.
                  </p>
                </div>
              </div>

              {loadingInvoices ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : invoiceTemplates.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12"></th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Codigo</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Factura</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoiceTemplates.map((template) => (
                        <tr
                          key={template.id}
                          className={`hover:bg-gray-50 ${togglingInvoice === template.id ? 'opacity-50 pointer-events-none' : 'cursor-pointer'} ${assignedInvoices[template.id] ? 'bg-amber-50' : ''}`}
                          onClick={() => handleToggleInvoice(template.id)}
                        >
                          <td className="px-4 py-3">
                            <button className="p-1" disabled={togglingInvoice === template.id}>
                              {togglingInvoice === template.id
                                ? <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                                : assignedInvoices[template.id]
                                  ? <CheckSquare className="w-5 h-5 text-amber-600" />
                                  : <Square className="w-5 h-5 text-gray-400" />
                              }
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">{template.code || '-'}</span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-gray-900">{template.name}</p>
                            {template.description && (
                              <p className="text-xs text-gray-500 mt-0.5">{template.description}</p>
                            )}
                            {template.data_source_name && (
                              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded mt-1 inline-block">
                                DS: {template.data_source_name}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {assignedInvoices[template.id] ? (
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
                  <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No hay plantillas de facturas disponibles</p>
                  <p className="text-sm text-gray-400 mt-1">Crea plantillas de facturas primero</p>
                </div>
              )}

              {invoiceTemplates.length > 0 && (
                <div className="flex justify-between items-center pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    <span className="font-medium text-amber-600">{assignedInvoicesCount}</span> de <span className="font-medium">{invoiceTemplates.length}</span> facturas asignadas
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de configuracion de certificado */}
      {configModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`bg-white rounded-lg shadow-xl mx-4 transition-all ${configPreview ? 'w-full max-w-4xl' : 'w-full max-w-lg'}`}>
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Configurar Certificado</h3>
                <p className="text-sm text-gray-500">{configModal.certificate?.templateName}</p>
              </div>
              <button
                onClick={() => setConfigModal({ open: false, certificate: null })}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL del Reporte (iframe)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://app.powerbi.com/reportEmbed?..."
                    value={configFormData.report_url}
                    onChange={(e) => setConfigFormData({ ...configFormData, report_url: e.target.value })}
                    className="flex-1 px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                  {configFormData.report_url && (
                    <>
                      <button
                        onClick={() => {
                          setConfigPreview(!configPreview);
                          if (!configPreview) setConfigPreviewLoading(true);
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          configPreview
                            ? 'text-cyan-800 bg-cyan-100'
                            : 'text-gray-500 hover:text-cyan-600 hover:bg-cyan-50'
                        }`}
                        title={configPreview ? "Cerrar preview" : "Ver preview"}
                      >
                        {configPreview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                      <a
                        href={configFormData.report_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-cyan-600 hover:text-cyan-800 hover:bg-cyan-50 rounded-lg transition-colors"
                        title="Abrir en nueva pestaña"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    </>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  URL del reporte de Power BI u otro servicio que se mostrara junto al certificado.
                </p>
              </div>

              {/* Preview iframe */}
              {configPreview && configFormData.report_url && (
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500">Vista previa</span>
                    <button
                      onClick={() => setConfigPreview(false)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                      title="Cerrar preview"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div
                    className="relative border border-gray-200 rounded-lg overflow-hidden bg-white"
                    style={{ height: '450px' }}
                  >
                    {configPreviewLoading && (
                      <div className="absolute inset-0 bg-white flex flex-col items-center justify-center z-10">
                        <div className="w-10 h-10 border-4 border-gray-200 border-t-cyan-500 rounded-full animate-spin"></div>
                        <p className="mt-3 text-sm text-gray-500">Cargando reporte...</p>
                      </div>
                    )}
                    <iframe
                      src={configFormData.report_url}
                      title="Preview del reporte"
                      className="w-full border-0"
                      style={{ height: 'calc(100% + 56px)' }}
                      onLoad={() => setConfigPreviewLoading(false)}
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 rounded-b-lg">
              <Button
                variant="secondary"
                onClick={() => setConfigModal({ open: false, certificate: null })}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveConfig}
                disabled={savingConfig}
                icon={savingConfig ? Loader2 : Save}
              >
                {savingConfig ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de documento */}
      {docModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {docModal.mode === 'edit' ? 'Editar Acceso' : 'Nuevo Acceso'}
              </h3>
              <button
                onClick={() => setDocModal({ open: false, mode: 'create', document: null })}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Reporte de Ventas"
                  value={docFormData.name}
                  onChange={(e) => setDocFormData({ ...docFormData, name: e.target.value })}
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripcion
                </label>
                <input
                  type="text"
                  placeholder="Descripcion breve del documento"
                  value={docFormData.description}
                  onChange={(e) => setDocFormData({ ...docFormData, description: e.target.value })}
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL del documento
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={docFormData.file_path}
                  onChange={(e) => setDocFormData({ ...docFormData, file_path: e.target.value })}
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Estado:</label>
                <button
                  type="button"
                  onClick={() => setDocFormData({ ...docFormData, status: !docFormData.status })}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    docFormData.status
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {docFormData.status ? (
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
              <Button
                variant="secondary"
                onClick={() => setDocModal({ open: false, mode: 'create', document: null })}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveDocument}
                disabled={savingDoc === true}
                icon={savingDoc === true ? Loader2 : Save}
              >
                {savingDoc === true ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
