import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ClipboardList, ArrowLeft,
  CheckCircle, AlertTriangle,
  FileText, BarChart3, Loader2, Award
} from "lucide-react";
import {
  getRegistrationRequestById,
  approveRequest,
  rejectRequest
} from "../../services/registrationRequestService";
import {
  getCertificateTemplates,
  getReportTemplates,
  getDocumentTypes
} from "../../services/companyService";
import { handleSnackbar } from "../../utils/messageHelpers";

import {
  CompanyInfoSection,
  ApplicantInfoSection,
  RequestStatusBanner,
  RequestManagementSection,
  RejectModal,
  ApproveModal,
  PermissionSection,
  statusConfig
} from "./components";

export default function RegistrationRequestDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [request, setRequest] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);

  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  const [certificates, setCertificates] = useState([]);
  const [loadingCertificates, setLoadingCertificates] = useState(false);

  const [documents, setDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  useEffect(() => {
    loadRequest();
    loadReports();
    loadCertificates();
  }, [id]);

  const loadRequest = async () => {
    setLoading(true);
    try {
      const response = await getRegistrationRequestById(id);
      if (response.success) {
        setRequest(response.data);
        if (response.data.company_id) {
          loadDocuments(response.data.company_id);
        }
        // Cargar permisos asignados desde la solicitud
        if (response.data.assigned_permissions?.length > 0) {
          setSelectedPermissions(response.data.assigned_permissions);
        }
      } else {
        handleSnackbar(response.message || "Error al cargar solicitud", "error");
        navigate("/dashboard/solicitudes");
      }
    } catch (error) {
      console.error("Error loading request:", error);
      handleSnackbar("Error al cargar solicitud", "error");
      navigate("/dashboard/solicitudes");
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    setLoadingReports(true);
    try {
      const response = await getReportTemplates();
      if (response.success && response.data) {
        setReports(response.data.map(report => ({
          id: `report_${report.id}`,
          reportId: report.id,
          code: report.code,
          name: report.name,
          description: report.description || `Acceso a ${report.name}`,
        })));
      }
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoadingReports(false);
    }
  };

  const loadCertificates = async () => {
    setLoadingCertificates(true);
    try {
      const response = await getCertificateTemplates();
      if (response.success && response.data) {
        setCertificates(response.data.map(cert => ({
          id: `cert_${cert.id}`,
          certificateId: cert.id,
          code: cert.code,
          name: cert.name,
          description: cert.description || `Acceso a ${cert.name}`,
        })));
      }
    } catch (error) {
      console.error("Error loading certificates:", error);
    } finally {
      setLoadingCertificates(false);
    }
  };

  const loadDocuments = async (companyId) => {
    setLoadingDocuments(true);
    try {
      const response = await getDocumentTypes(companyId);
      if (response.success && response.data) {
        setDocuments(response.data);
      }
    } catch (error) {
      console.error("Error loading documents:", error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleTogglePermission = (permId) => {
    setSelectedPermissions(prev =>
      prev.includes(permId)
        ? prev.filter(p => p !== permId)
        : [...prev, permId]
    );
  };

  const handleSelectAll = (items) => {
    const ids = items.map(item => item.id);
    const allSelected = ids.every(itemId => selectedPermissions.includes(itemId));

    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(p => !ids.includes(p)));
    } else {
      setSelectedPermissions(prev => [...new Set([...prev, ...ids])]);
    }
  };

  const handleApprove = async () => {
    setProcessing(true);
    try {
      const response = await approveRequest(id, selectedPermissions);
      if (response.success) {
        handleSnackbar("Solicitud aprobada y permisos asignados exitosamente.", "success");
        setRequest(response.data);
        setShowApproveModal(false);
      } else {
        handleSnackbar(response.message || "Error al aprobar solicitud", "error");
      }
    } catch (error) {
      console.error("Error approving request:", error);
      handleSnackbar("Error al aprobar solicitud", "error");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      handleSnackbar("Debe ingresar un motivo de rechazo", "error");
      return;
    }

    setProcessing(true);
    try {
      const response = await rejectRequest(id, rejectionReason);
      if (response.success) {
        handleSnackbar("Solicitud rechazada", "success");
        setRequest(response.data);
        setShowRejectModal(false);
        setRejectionReason("");
      } else {
        handleSnackbar(response.message || "Error al rechazar solicitud", "error");
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      handleSnackbar("Error al rechazar solicitud", "error");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Solicitud no encontrada</p>
      </div>
    );
  }

  const status = statusConfig[request.request_status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const isReadOnly = request.request_status !== "pending";

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/solicitudes")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ClipboardList className="w-7 h-7" />
              Detalle de Solicitud #{request.id}
            </h1>
            <p className="text-gray-500 mt-1">{request.company_name}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${status.color}`}>
          <StatusIcon className="w-4 h-4" />
          {status.label}
        </span>
      </div>

      {/* Contenido principal */}
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <CompanyInfoSection request={request} />
        <ApplicantInfoSection request={request} />
        <RequestStatusBanner request={request} />

        {/* Sección de Permisos */}
        {request.request_status !== "rejected" && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Permisos de Acceso
            </h3>

            {request.request_status === "pending" && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3 mb-6">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Selecciona los permisos antes de aprobar
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    Una vez aprobada la solicitud, el usuario tendrá acceso a los reportes, certificados y documentos seleccionados.
                  </p>
                </div>
              </div>
            )}

            {request.request_status === "approved" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 mb-6">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Permisos asignados
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Los permisos fueron asignados al aprobar la solicitud. Para modificarlos, utilice el mantenedor de usuarios.
                  </p>
                </div>
              </div>
            )}

            <PermissionSection
              title="Reportes"
              icon={BarChart3}
              iconColor="text-cyan-600"
              colorScheme="cyan"
              items={reports}
              selectedPermissions={selectedPermissions}
              loading={loadingReports}
              isReadOnly={isReadOnly}
              onToggle={handleTogglePermission}
              onSelectAll={() => handleSelectAll(reports)}
              emptyMessage="No hay reportes disponibles"
            />

            <PermissionSection
              title="Certificados"
              icon={Award}
              iconColor="text-amber-600"
              colorScheme="amber"
              items={certificates}
              selectedPermissions={selectedPermissions}
              loading={loadingCertificates}
              isReadOnly={isReadOnly}
              onToggle={handleTogglePermission}
              onSelectAll={() => handleSelectAll(certificates)}
              emptyMessage="No hay certificados disponibles"
            />

            <PermissionSection
              title="Documentos"
              icon={FileText}
              iconColor="text-emerald-600"
              colorScheme="emerald"
              items={documents}
              selectedPermissions={selectedPermissions}
              loading={loadingDocuments}
              isReadOnly={isReadOnly}
              onToggle={handleTogglePermission}
              onSelectAll={() => handleSelectAll(documents)}
              emptyMessage="No hay documentos disponibles"
            />
          </div>
        )}

        {request.request_status === "pending" && (
          <RequestManagementSection
            processing={processing}
            onApprove={() => setShowApproveModal(true)}
            onReject={() => setShowRejectModal(true)}
          />
        )}
      </div>

      {showRejectModal && (
        <RejectModal
          request={request}
          rejectionReason={rejectionReason}
          setRejectionReason={setRejectionReason}
          processing={processing}
          onConfirm={handleReject}
          onCancel={() => {
            setShowRejectModal(false);
            setRejectionReason("");
          }}
        />
      )}

      {showApproveModal && (
        <ApproveModal
          request={request}
          selectedPermissions={selectedPermissions}
          reports={reports}
          certificates={certificates}
          documents={documents}
          processing={processing}
          onConfirm={handleApprove}
          onCancel={() => setShowApproveModal(false)}
        />
      )}
    </div>
  );
}
