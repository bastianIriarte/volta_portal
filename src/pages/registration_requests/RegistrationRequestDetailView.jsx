// File: src/pages/registration_requests/RegistrationRequestDetailView.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ClipboardList, ArrowLeft, Save, Building2, User,
  CheckCircle, XCircle, Clock, Check, X, AlertTriangle,
  FileText, BarChart3, Loader2,
  CheckSquare, Square
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { getRegistrationRequestById, approveRequest, rejectRequest, saveUserPermissions, getUserPermissions } from "../../services/registrationRequestService";
import { getCertificateTemplates } from "../../services/companyService";
import { handleSnackbar } from "../../utils/messageHelpers";

// Documentos fijos disponibles
const fixedDocuments = [
  { id: "doc_reporte_onsite", code: "reporte_onsite", name: "Reporte OnSite", description: "Acceso al reporte OnSite de la empresa" },
  { id: "doc_recoleccion", code: "recoleccion", name: "Recoleccion", description: "Acceso a documentos de recoleccion" },
];

const statusConfig = {
  pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800", icon: Clock, bgColor: "bg-yellow-50", borderColor: "border-yellow-200" },
  approved: { label: "Aprobada", color: "bg-green-100 text-green-800", icon: CheckCircle, bgColor: "bg-green-50", borderColor: "border-green-200" },
  rejected: { label: "Rechazada", color: "bg-red-100 text-red-800", icon: XCircle, bgColor: "bg-red-50", borderColor: "border-red-200" },
};

export default function RegistrationRequestDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [request, setRequest] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Reportes desde la base de datos (certificate templates)
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  useEffect(() => {
    loadRequest();
    loadReports();
  }, [id]);

  const loadRequest = async () => {
    setLoading(true);
    try {
      const response = await getRegistrationRequestById(id);
      if (response.success) {
        setRequest(response.data);
        // Si la solicitud esta aprobada, cargar permisos existentes
        if (response.data.request_status === "approved") {
          loadExistingPermissions();
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

  const loadExistingPermissions = async () => {
    try {
      const response = await getUserPermissions(id);
      if (response.success && response.data) {
        setSelectedPermissions(response.data);
      }
    } catch (error) {
      console.error("Error loading permissions:", error);
    }
  };

  const loadReports = async () => {
    setLoadingReports(true);
    try {
      const response = await getCertificateTemplates();
      if (response.success && response.data) {
        // Transformar los certificate templates a formato de reportes
        const reportsData = response.data.map(cert => ({
          id: `report_${cert.id}`,
          certificateId: cert.id,
          code: cert.code,
          name: cert.name,
          description: cert.description || `Acceso a ${cert.name}`,
        }));
        setReports(reportsData);
      }
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleTogglePermission = (permId) => {
    setSelectedPermissions(prev =>
      prev.includes(permId)
        ? prev.filter(p => p !== permId)
        : [...prev, permId]
    );
  };

  const handleSelectAllReports = () => {
    const reportIds = reports.map(r => r.id);
    const allSelected = reportIds.every(id => selectedPermissions.includes(id));

    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(p => !reportIds.includes(p)));
    } else {
      setSelectedPermissions(prev => [...new Set([...prev, ...reportIds])]);
    }
  };

  const handleSelectAllDocuments = () => {
    const docIds = fixedDocuments.map(d => d.id);
    const allSelected = docIds.every(id => selectedPermissions.includes(id));

    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(p => !docIds.includes(p)));
    } else {
      setSelectedPermissions(prev => [...new Set([...prev, ...docIds])]);
    }
  };

  const handleApprove = async () => {
    setProcessing(true);
    try {
      const response = await approveRequest(id);
      if (response.success) {
        handleSnackbar("Solicitud aprobada. Ahora puede asignar permisos.", "success");
        setRequest(response.data);
        // Seleccionar todos los reportes y documentos por defecto
        const allReportIds = reports.map(r => r.id);
        const allDocIds = fixedDocuments.map(d => d.id);
        setSelectedPermissions([...allReportIds, ...allDocIds]);
        setActiveTab("permissions");
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

  const handleSavePermissions = async () => {
    setProcessing(true);
    try {
      const response = await saveUserPermissions(id, selectedPermissions);
      if (response.success) {
        handleSnackbar(`Permisos actualizados: ${selectedPermissions.length} permisos asignados`, "success");
      } else {
        handleSnackbar(response.message || "Error al guardar permisos", "error");
      }
    } catch (error) {
      console.error("Error saving permissions:", error);
      handleSnackbar("Error al guardar permisos", "error");
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

  const reportsCount = selectedPermissions.filter(p => p.startsWith("report_")).length;
  const docsCount = selectedPermissions.filter(p => p.startsWith("doc_")).length;

  // Combinar reportes y documentos para mostrar permisos asignados
  const allPermissions = [...reports, ...fixedDocuments];

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
              Solicitud #{request.id}
            </h1>
            <p className="text-gray-500 mt-1">{request.company_name}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${status.color}`}>
          <StatusIcon className="w-4 h-4" />
          {status.label}
        </span>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px px-6">
            {[
              { id: "info", label: "Informacion", icon: Building2 },
              { id: "permissions", label: `Permisos (${selectedPermissions.length})`, icon: BarChart3, disabled: request.request_status === "rejected" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                disabled={tab.disabled}
                className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                  tab.disabled
                    ? "border-transparent text-gray-300 cursor-not-allowed"
                    : activeTab === tab.id
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
              {/* Datos de la empresa */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-gray-600" />
                  Datos de la Empresa
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase">Razon Social</label>
                    <p className="mt-1 text-sm font-medium text-gray-900">{request.company_name || "-"}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase">RUT Empresa</label>
                    <p className="mt-1 text-sm font-medium text-gray-900">{request.company_rut_formatted || request.company_rut}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase">Codigo SAP</label>
                    <p className="mt-1 text-sm font-mono text-gray-900">{request.sap_code}</p>
                  </div>
                </div>
              </div>

              {/* Datos del solicitante */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-gray-600" />
                  Datos del Solicitante
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase">Nombre Completo</label>
                    <p className="mt-1 text-sm font-medium text-gray-900">{request.name}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase">RUT</label>
                    <p className="mt-1 text-sm font-medium text-gray-900">{request.rut_formatted || request.rut}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase">Email</label>
                    <p className="mt-1 text-sm font-medium text-gray-900">{request.email}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase">Telefono</label>
                    <p className="mt-1 text-sm font-medium text-gray-900">{request.phone || "-"}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase">Cargo</label>
                    <p className="mt-1 text-sm font-medium text-gray-900">{request.position || "-"}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase">Fecha Solicitud</label>
                    <p className="mt-1 text-sm font-medium text-gray-900">{request.created_at}</p>
                  </div>
                </div>
              </div>

              {/* Gestion de Solicitud */}
              {request.request_status === "pending" ? (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-semibold text-gray-900">Gestion de Solicitud</h3>

                  {/* Acciones */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <div>
                          <h4 className="font-medium text-green-900">Aprobar Solicitud</h4>
                          <p className="text-sm text-green-700 mt-1">
                            El usuario recibira un email con sus credenciales de acceso.
                          </p>
                          <Button
                            className="mt-3"
                            onClick={handleApprove}
                            icon={processing ? Loader2 : Check}
                            disabled={processing}
                          >
                            {processing ? "Procesando..." : "Aprobar y Crear Usuario"}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <XCircle className="w-6 h-6 text-red-600" />
                        <div>
                          <h4 className="font-medium text-red-900">Rechazar Solicitud</h4>
                          <p className="text-sm text-red-700 mt-1">
                            Debera indicar un motivo de rechazo.
                          </p>
                          <Button
                            className="mt-3"
                            variant="danger"
                            onClick={() => setShowRejectModal(true)}
                            icon={X}
                            disabled={processing}
                          >
                            Rechazar Solicitud
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`${status.bgColor} border ${status.borderColor} rounded-lg p-4`}>
                  <div className="flex items-start gap-3">
                    <StatusIcon className={`w-5 h-5 mt-0.5 ${request.request_status === "approved" ? "text-green-600" : "text-red-600"}`} />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Solicitud {status.label}
                      </h4>
                      {request.request_status === "approved" && (
                        <>
                          <p className="text-sm text-gray-600 mt-1">
                            Aprobada el {request.approved_at} por {request.approved_by_name || "Sistema"}
                          </p>
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700">Permisos asignados:</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {selectedPermissions.map(permId => {
                                const perm = allPermissions.find(p => p.id === permId);
                                return perm ? (
                                  <span
                                    key={permId}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs"
                                  >
                                    {perm.name}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          </div>
                        </>
                      )}
                      {request.request_status === "rejected" && (
                        <>
                          <p className="text-sm text-gray-600 mt-1">
                            Rechazada el {request.rejected_at} por {request.rejected_by_name || "Sistema"}
                          </p>
                          {request.rejection_reason && (
                            <p className="text-sm text-red-700 mt-2">
                              <strong>Motivo:</strong> {request.rejection_reason}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: Permisos */}
          {activeTab === "permissions" && (
            <div className="space-y-6">
              {request.request_status === "pending" && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      Selecciona los permisos antes de aprobar
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      Una vez aprobada la solicitud, el usuario tendra acceso a los reportes y documentos seleccionados.
                    </p>
                  </div>
                </div>
              )}

              {/* Reportes */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-gray-600" />
                    Reportes ({reportsCount}/{reports.length})
                  </h3>
                  <Button size="sm" variant="secondary" onClick={handleSelectAllReports} disabled={loadingReports}>
                    {reports.every(r => selectedPermissions.includes(r.id))
                      ? "Quitar todos"
                      : "Seleccionar todos"
                    }
                  </Button>
                </div>
                {loadingReports ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : reports.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {reports.map((perm) => {
                      const isSelected = selectedPermissions.includes(perm.id);
                      return (
                        <div
                          key={perm.id}
                          onClick={() => handleTogglePermission(perm.id)}
                          className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                            isSelected
                              ? "bg-cyan-50 border-cyan-300"
                              : "bg-white border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex-shrink-0">
                            {isSelected
                              ? <CheckSquare className="w-5 h-5 text-cyan-600" />
                              : <Square className="w-5 h-5 text-gray-400" />
                            }
                          </div>
                          <div className={`p-2 rounded-lg ${isSelected ? "bg-cyan-100" : "bg-gray-100"}`}>
                            <BarChart3 className={`w-4 h-4 ${isSelected ? "text-cyan-600" : "text-gray-500"}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${isSelected ? "text-gray-900" : "text-gray-700"}`}>
                              {perm.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{perm.description}</p>
                            {perm.code && (
                              <span className="text-xs font-mono text-gray-400">{perm.code}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <BarChart3 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No hay reportes disponibles</p>
                  </div>
                )}
              </div>

              {/* Documentos */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-600" />
                    Documentos ({docsCount}/{fixedDocuments.length})
                  </h3>
                  <Button size="sm" variant="secondary" onClick={handleSelectAllDocuments}>
                    {fixedDocuments.every(d => selectedPermissions.includes(d.id))
                      ? "Quitar todos"
                      : "Seleccionar todos"
                    }
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {fixedDocuments.map((perm) => {
                    const isSelected = selectedPermissions.includes(perm.id);
                    return (
                      <div
                        key={perm.id}
                        onClick={() => handleTogglePermission(perm.id)}
                        className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? "bg-cyan-50 border-cyan-300"
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex-shrink-0">
                          {isSelected
                            ? <CheckSquare className="w-5 h-5 text-cyan-600" />
                            : <Square className="w-5 h-5 text-gray-400" />
                          }
                        </div>
                        <div className={`p-2 rounded-lg ${isSelected ? "bg-cyan-100" : "bg-gray-100"}`}>
                          <FileText className={`w-4 h-4 ${isSelected ? "text-cyan-600" : "text-gray-500"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${isSelected ? "text-gray-900" : "text-gray-700"}`}>
                            {perm.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{perm.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Boton guardar (solo si ya esta aprobada) */}
              {request.request_status === "approved" && (
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    onClick={handleSavePermissions}
                    icon={processing ? Loader2 : Save}
                    disabled={processing}
                  >
                    {processing ? "Guardando..." : "Guardar Permisos"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de rechazo */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 top-[-30px]">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Rechazar Solicitud</h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Estas a punto de rechazar la solicitud de <strong>{request.name}</strong> de la empresa <strong>{request.company_name}</strong>.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo del rechazo *
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows={4}
                  placeholder="Ingrese el motivo del rechazo..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => {
                setShowRejectModal(false);
                setRejectionReason("");
              }} disabled={processing}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleReject}
                icon={processing ? Loader2 : X}
                disabled={processing}
              >
                {processing ? "Procesando..." : "Confirmar Rechazo"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
