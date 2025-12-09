// File: src/pages/registration_requests/RegistrationRequestDetailView.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ClipboardList, ArrowLeft, Save, Building2, User,
  CheckCircle, XCircle, Clock, Check, X, AlertTriangle,
  FileText, BarChart3, Shield, ToggleLeft, ToggleRight,
  CheckSquare, Square, Eye, FileBarChart, Receipt, Truck
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

// Datos dummy para solicitudes
const dummyRequests = [
  {
    id: 1,
    company_rut: "76.123.456-7",
    company_name: "Constructora Los Andes SpA",
    sap_code: "SAP001",
    requester_name: "Juan Perez",
    requester_email: "jperez@losandes.cl",
    requester_rut: "12.345.678-9",
    position: "Gerente Comercial",
    phone: "+56 9 8765 4321",
    request_status: "pending",
    created_at: "2024-12-01 10:30"
  },
  {
    id: 2,
    company_rut: "76.987.654-3",
    company_name: "Servicios Integrales del Norte Ltda",
    sap_code: "SAP002",
    requester_name: "Maria Garcia",
    requester_email: "mgarcia@sinorte.cl",
    requester_rut: "15.678.901-2",
    position: "Administradora",
    phone: "+56 9 1234 5678",
    request_status: "approved",
    created_at: "2024-11-28 14:15",
    approved_at: "2024-11-29 09:00",
    approved_by: "Admin Sistema"
  },
  {
    id: 3,
    company_rut: "77.111.222-K",
    company_name: "Transportes del Sur SA",
    sap_code: "SAP003",
    requester_name: "Pedro Rodriguez",
    requester_email: "prodriguez@transur.cl",
    requester_rut: "18.234.567-8",
    position: "Encargado Logistica",
    phone: "+56 9 5555 4444",
    request_status: "rejected",
    rejection_reason: "El solicitante no esta autorizado por la empresa",
    created_at: "2024-11-25 16:45",
    rejected_at: "2024-11-26 11:30",
    rejected_by: "Admin Sistema"
  },
  {
    id: 4,
    company_rut: "76.555.444-1",
    company_name: "Minera Central SpA",
    sap_code: "SAP004",
    requester_name: "Ana Martinez",
    requester_email: "amartinez@mineracentral.cl",
    requester_rut: "16.789.012-3",
    position: "Jefe de Compras",
    phone: "+56 9 7777 8888",
    request_status: "pending",
    created_at: "2024-12-02 08:00"
  },
];

// Permisos disponibles para reportes y funcionalidades
const availablePermissions = {
  reports: [
    { id: "report_oc", name: "Ordenes de Compra", description: "Ver y descargar ordenes de compra", icon: Receipt },
    { id: "report_facturas", name: "Estado de Facturas", description: "Consultar estado de facturas", icon: FileBarChart },
    { id: "report_pagos", name: "Reporte de Pagos", description: "Ver historial de pagos", icon: BarChart3 },
    { id: "report_despachos", name: "Guias de Despacho", description: "Ver guias de despacho", icon: Truck },
    { id: "report_contratos", name: "Contratos", description: "Acceso a contratos vigentes", icon: FileText },
  ],
  functionalities: [
    { id: "func_documents", name: "Documentos SharePoint", description: "Acceso a documentos compartidos", icon: FileText },
    { id: "func_certificates", name: "Gestion de Certificados", description: "Subir y gestionar certificados", icon: Shield },
    { id: "func_profile", name: "Editar Perfil", description: "Modificar datos de usuario", icon: User },
  ]
};

// Permisos por defecto al aprobar
const defaultPermissions = ["report_oc", "report_facturas", "func_documents", "func_profile"];

const statusConfig = {
  pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800", icon: Clock, bgColor: "bg-yellow-50", borderColor: "border-yellow-200" },
  approved: { label: "Aprobada", color: "bg-green-100 text-green-800", icon: CheckCircle, bgColor: "bg-green-50", borderColor: "border-green-200" },
  rejected: { label: "Rechazada", color: "bg-red-100 text-red-800", icon: XCircle, bgColor: "bg-red-50", borderColor: "border-red-200" },
};

export default function RegistrationRequestDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const requestId = parseInt(id);

  const [activeTab, setActiveTab] = useState("info");
  const [request, setRequest] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    const foundRequest = dummyRequests.find(r => r.id === requestId);
    if (foundRequest) {
      setRequest(foundRequest);
      // Si ya esta aprobada, cargar permisos guardados (dummy)
      if (foundRequest.request_status === "approved") {
        setSelectedPermissions(defaultPermissions);
      }
    }
  }, [requestId]);

  const handleTogglePermission = (permId) => {
    setSelectedPermissions(prev =>
      prev.includes(permId)
        ? prev.filter(p => p !== permId)
        : [...prev, permId]
    );
  };

  const handleSelectAllReports = () => {
    const reportIds = availablePermissions.reports.map(r => r.id);
    const allSelected = reportIds.every(id => selectedPermissions.includes(id));

    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(p => !reportIds.includes(p)));
    } else {
      setSelectedPermissions(prev => [...new Set([...prev, ...reportIds])]);
    }
  };

  const handleSelectAllFunctionalities = () => {
    const funcIds = availablePermissions.functionalities.map(f => f.id);
    const allSelected = funcIds.every(id => selectedPermissions.includes(id));

    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(p => !funcIds.includes(p)));
    } else {
      setSelectedPermissions(prev => [...new Set([...prev, ...funcIds])]);
    }
  };

  const handleApprove = () => {
    // Simular aprobacion
    setRequest(prev => ({
      ...prev,
      request_status: "approved",
      approved_at: new Date().toLocaleString(),
      approved_by: "Admin Sistema"
    }));
    alert("Solicitud aprobada. Ahora puede asignar permisos en la pestaña 'Permisos'.");
    setActiveTab("permissions");
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert("Debe ingresar un motivo de rechazo");
      return;
    }
    setRequest(prev => ({
      ...prev,
      request_status: "rejected",
      rejection_reason: rejectionReason,
      rejected_at: new Date().toLocaleString(),
      rejected_by: "Admin Sistema"
    }));
    setShowRejectModal(false);
    alert("Solicitud rechazada");
  };

  const handleSavePermissions = () => {
    alert(`Permisos actualizados: ${selectedPermissions.length} permisos asignados`);
  };

  if (!request) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Solicitud no encontrada</p>
      </div>
    );
  }

  const status = statusConfig[request.request_status];
  const StatusIcon = status.icon;

  const reportsCount = selectedPermissions.filter(p => p.startsWith("report_")).length;
  const funcsCount = selectedPermissions.filter(p => p.startsWith("func_")).length;

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
              { id: "permissions", label: `Permisos (${selectedPermissions.length})`, icon: Shield, disabled: request.request_status === "rejected" },
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
                    <p className="mt-1 text-sm font-medium text-gray-900">{request.company_name}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase">RUT Empresa</label>
                    <p className="mt-1 text-sm font-medium text-gray-900">{request.company_rut}</p>
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
                    <p className="mt-1 text-sm font-medium text-gray-900">{request.requester_name}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase">RUT</label>
                    <p className="mt-1 text-sm font-medium text-gray-900">{request.requester_rut}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase">Email</label>
                    <p className="mt-1 text-sm font-medium text-gray-900">{request.requester_email}</p>
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
                            icon={Check}
                          >
                            Aprobar y Crear Usuario
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
                            Aprobada el {request.approved_at} por {request.approved_by}
                          </p>
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700">Permisos asignados:</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {selectedPermissions.map(permId => {
                                const perm = [...availablePermissions.reports, ...availablePermissions.functionalities]
                                  .find(p => p.id === permId);
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
                            Rechazada el {request.rejected_at} por {request.rejected_by}
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
                      Una vez aprobada la solicitud, el usuario tendra acceso a los reportes y funcionalidades seleccionadas.
                    </p>
                  </div>
                </div>
              )}

              {/* Reportes */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-gray-600" />
                    Reportes ({reportsCount}/{availablePermissions.reports.length})
                  </h3>
                  <Button size="sm" variant="secondary" onClick={handleSelectAllReports}>
                    {availablePermissions.reports.every(r => selectedPermissions.includes(r.id))
                      ? "Quitar todos"
                      : "Seleccionar todos"
                    }
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availablePermissions.reports.map((perm) => {
                    const isSelected = selectedPermissions.includes(perm.id);
                    const PermIcon = perm.icon;
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
                          <PermIcon className={`w-4 h-4 ${isSelected ? "text-cyan-600" : "text-gray-500"}`} />
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

              {/* Funcionalidades */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-gray-600" />
                    Funcionalidades ({funcsCount}/{availablePermissions.functionalities.length})
                  </h3>
                  <Button size="sm" variant="secondary" onClick={handleSelectAllFunctionalities}>
                    {availablePermissions.functionalities.every(f => selectedPermissions.includes(f.id))
                      ? "Quitar todas"
                      : "Seleccionar todas"
                    }
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availablePermissions.functionalities.map((perm) => {
                    const isSelected = selectedPermissions.includes(perm.id);
                    const PermIcon = perm.icon;
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
                          <PermIcon className={`w-4 h-4 ${isSelected ? "text-cyan-600" : "text-gray-500"}`} />
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
                  <Button onClick={handleSavePermissions} icon={Save}>
                    Guardar Permisos
                  </Button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Modal de rechazo */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Rechazar Solicitud</h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Estas a punto de rechazar la solicitud de <strong>{request.requester_name}</strong> de la empresa <strong>{request.company_name}</strong>.
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
              }}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={handleReject} icon={X}>
                Confirmar Rechazo
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
