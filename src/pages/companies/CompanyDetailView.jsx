// File: src/pages/companies/CompanyDetailView.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Building2, FileText, Award, ArrowLeft, Loader2, BarChart3 } from "lucide-react";
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
  getCompanyReports,
  getReportTemplates,
  createCompanyReport,
  revokeCompanyReport,
  updateCompanyReport,
} from "../../services/companyService";
import { handleSnackbar } from "../../utils/messageHelpers";
import { useModals } from "../../hooks/useModals";
import { Modal } from "../../components/ui/Modal";

// Componentes de tabs
import CompanyInfoTab from "./components/CompanyInfoTab";
import CompanyDocumentsTab from "./components/CompanyDocumentsTab";
import CompanyCertificatesTab from "./components/CompanyCertificatesTab";
import CompanyReportsTab from "./components/CompanyReportsTab";

// Modales
import DocumentModal from "./components/DocumentModal";
import ReportConfigModal from "./components/ReportConfigModal";

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
  const [docModal, setDocModal] = useState({ open: false, mode: 'create', document: null });
  const [docFormData, setDocFormData] = useState({ name: '', description: '', file_path: '', status: true });
  const [deletingDoc, setDeletingDoc] = useState(null);

  // Certificados
  const [certificateTemplates, setCertificateTemplates] = useState([]);
  const [companyCertificates, setCompanyCertificates] = useState([]);
  const [assignedCertificates, setAssignedCertificates] = useState({});
  const [loadingCertificates, setLoadingCertificates] = useState(false);
  const [togglingCertificate, setTogglingCertificate] = useState(null);

  // Reportes
  const [reportTemplates, setReportTemplates] = useState([]);
  const [companyReports, setCompanyReports] = useState([]);
  const [assignedReports, setAssignedReports] = useState({});
  const [loadingReports, setLoadingReports] = useState(false);
  const [togglingReport, setTogglingReport] = useState(null);

  // Config modal para reportes
  const [reportConfigModal, setReportConfigModal] = useState({ open: false, report: null });
  const [reportConfigFormData, setReportConfigFormData] = useState({ report_url: '' });
  const [savingReportConfig, setSavingReportConfig] = useState(false);

  // Modales de confirmación
  const { modals, openConfirm, closeModal } = useModals();

  // Cargar datos iniciales
  useEffect(() => {
    loadCompany();
  }, [companyId]);

  // Cargar todos los datos cuando la empresa esta lista
  useEffect(() => {
    if (company) {
      loadDocuments();
      loadCertificates();
      loadReports();
    }
  }, [company]);

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
      const templatesResponse = await getCertificateTemplates();
      if (templatesResponse.success) {
        setCertificateTemplates(templatesResponse.data || []);
      }

      const assignedResponse = await getCompanyCertificates(companyId);
      if (assignedResponse.success) {
        setCompanyCertificates(assignedResponse.data || []);
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
      const templatesResponse = await getReportTemplates();
      if (templatesResponse.success) {
        setReportTemplates(templatesResponse.data || []);
      }

      const assignedResponse = await getCompanyReports(companyId);
      if (assignedResponse.success) {
        setCompanyReports(assignedResponse.data || []);
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

  const handleDeleteDocument = (doc) => {
    openConfirm({
      title: "Eliminar Documento",
      msg: (
        <div>
          <p>
            ¿Está seguro que desea eliminar el documento <strong>{doc.name}</strong>?
          </p>
          <p className="text-sm text-red-600 mt-2">
            Esta acción no se puede deshacer.
          </p>
        </div>
      ),
      actionLabel: "Eliminar",
      variant: "danger",
      onConfirm: async () => {
        closeModal("confirm");
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
      }
    });
  };

  // Bulk toggle certificados
  const handleToggleAllCertificates = async (assignAll) => {
    const templatesToToggle = certificateTemplates.filter((t) =>
      assignAll ? !assignedCertificates[t.id] : assignedCertificates[t.id]
    );
    if (templatesToToggle.length === 0) return;

    for (const template of templatesToToggle) {
      setTogglingCertificate(template.id);
      try {
        if (assignAll) {
          await assignCertificateToCompany({ company_id: companyId, certificate_id: template.id });
        } else {
          const companyCert = companyCertificates.find(
            (c) => c.certificate_id === template.id && !['revoked', 'expired'].includes(c.assignment_status)
          );
          if (companyCert) await revokeCompanyCertificate(companyCert.id);
        }
      } catch (error) {
        console.error("Error toggling certificate:", error);
      }
    }
    setTogglingCertificate(null);
    handleSnackbar(assignAll ? "Todos los certificados asignados" : "Todos los certificados removidos", "success");
    await loadCertificates();
  };

  // Handlers de certificados
  const handleToggleCertificate = async (templateId) => {
    if (togglingCertificate === templateId) return;

    setTogglingCertificate(templateId);
    const isCurrentlyAssigned = assignedCertificates[templateId];

    try {
      if (isCurrentlyAssigned) {
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

  // Bulk toggle reportes
  const handleToggleAllReports = async (assignAll) => {
    const templatesToToggle = reportTemplates.filter((t) =>
      assignAll ? !assignedReports[t.id] : assignedReports[t.id]
    );
    if (templatesToToggle.length === 0) return;

    for (const template of templatesToToggle) {
      setTogglingReport(template.id);
      try {
        if (assignAll) {
          await createCompanyReport({ company_id: companyId, report_id: template.id });
        } else {
          const companyRep = companyReports.find(
            (r) => r.report_id === template.id && !['revoked'].includes(r.assignment_status)
          );
          if (companyRep) await revokeCompanyReport(companyRep.id);
        }
      } catch (error) {
        console.error("Error toggling report:", error);
      }
    }
    setTogglingReport(null);
    handleSnackbar(assignAll ? "Todos los reportes asignados" : "Todos los reportes removidos", "success");
    await loadReports();
  };

  // Handlers de reportes
  const handleToggleReport = async (templateId) => {
    if (togglingReport === templateId) return;

    setTogglingReport(templateId);
    const isCurrentlyAssigned = assignedReports[templateId];

    try {
      if (isCurrentlyAssigned) {
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

  // Handlers de configuracion de reportes
  const handleOpenReportConfigModal = (report) => {
    setReportConfigFormData({
      report_url: report.report_url || '',
    });
    setReportConfigModal({ open: true, report });
  };

  const handleCloseReportConfigModal = () => {
    setReportConfigModal({ open: false, report: null });
  };

  const handleSaveReportConfig = async () => {
    setSavingReportConfig(true);
    try {
      const response = await updateCompanyReport(reportConfigModal.report.id, {
        report_url: reportConfigFormData.report_url,
      });
      if (response.success) {
        handleSnackbar("Configuracion guardada", "success");
        handleCloseReportConfigModal();
        await loadReports();
      } else {
        handleSnackbar(response.message || "Error al guardar configuracion", "error");
      }
    } catch (error) {
      handleSnackbar("Error al guardar configuracion", "error");
    } finally {
      setSavingReportConfig(false);
    }
  };

  // Calculos
  const assignedCount = Object.values(assignedCertificates).filter(Boolean).length;
  const assignedReportsCount = Object.values(assignedReports).filter(Boolean).length;

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
              { id: "certificates", label: `Certificados (${assignedCount}/${certificateTemplates.length})`, icon: Award },
              { id: "reports", label: `Reportes (${assignedReportsCount}/${reportTemplates.length})`, icon: BarChart3 },
              { id: "documents", label: `Documentos (${companyDocuments.length})`, icon: FileText },
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
          {activeTab === "info" && (
            <CompanyInfoTab
              formData={formData}
              onFormChange={handleFormChange}
              onSave={handleSaveCompany}
              saving={saving}
            />
          )}

          {activeTab === "documents" && (
            <CompanyDocumentsTab
              documents={companyDocuments}
              loading={loadingDocuments}
              deletingDoc={deletingDoc}
              onOpenModal={handleOpenDocModal}
              onDelete={handleDeleteDocument}
            />
          )}

          {activeTab === "certificates" && (
            <CompanyCertificatesTab
              templates={certificateTemplates}
              assignedCertificates={assignedCertificates}
              loading={loadingCertificates}
              toggling={togglingCertificate}
              onToggle={handleToggleCertificate}
              onToggleAll={handleToggleAllCertificates}
            />
          )}

          {activeTab === "reports" && (
            <CompanyReportsTab
              templates={reportTemplates}
              companyReports={companyReports}
              assignedReports={assignedReports}
              loading={loadingReports}
              toggling={togglingReport}
              onToggle={handleToggleReport}
              onToggleAll={handleToggleAllReports}
              onOpenConfig={handleOpenReportConfigModal}
            />
          )}
        </div>
      </div>

      {/* Modales */}
      <DocumentModal
        open={docModal.open}
        mode={docModal.mode}
        formData={docFormData}
        saving={savingDoc === true}
        onFormChange={setDocFormData}
        onSave={handleSaveDocument}
        onClose={() => setDocModal({ open: false, mode: 'create', document: null })}
      />

      <ReportConfigModal
        open={reportConfigModal.open}
        report={reportConfigModal.report}
        formData={reportConfigFormData}
        saving={savingReportConfig}
        onFormChange={setReportConfigFormData}
        onSave={handleSaveReportConfig}
        onClose={handleCloseReportConfigModal}
      />

      {/* Modal de confirmación */}
      <Modal
        open={!!modals.confirm}
        onClose={() => closeModal("confirm")}
        title={modals.confirm?.title}
        variant="warn"
        actions={[
          {
            label: "Cancelar",
            variant: "outline",
            onClick: () => closeModal("confirm")
          },
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
