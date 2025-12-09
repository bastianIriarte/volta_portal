// File: src/pages/registration_requests/RegistrationRequestsView.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Search, Clock, CheckCircle, XCircle, Settings } from "lucide-react";
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
    request_status: "approved",
    created_at: "2024-11-28 14:15",
    approved_at: "2024-11-29 09:00"
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
    request_status: "rejected",
    rejection_reason: "El solicitante no esta autorizado por la empresa",
    created_at: "2024-11-25 16:45",
    rejected_at: "2024-11-26 11:30"
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
    request_status: "pending",
    created_at: "2024-12-02 08:00"
  },
];

const statusConfig = {
  pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  approved: { label: "Aprobada", color: "bg-green-100 text-green-800", icon: CheckCircle },
  rejected: { label: "Rechazada", color: "bg-red-100 text-red-800", icon: XCircle },
};

export default function RegistrationRequestsView() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredRequests = dummyRequests.filter(request => {
    const matchesSearch =
      request.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requester_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requester_email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" || request.request_status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = dummyRequests.filter(r => r.request_status === "pending").length;

  const handleManageRequest = (requestId) => {
    navigate(`/dashboard/solicitudes/${requestId}/gestionar`);
  };

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-7 h-7" />
            Solicitudes de Registro
          </h1>
          <p className="text-gray-500 mt-1">
            Gestiona las solicitudes de acceso al portal
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {pendingCount} pendientes
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por empresa, nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
          <div className="flex gap-2">
            {[
              { value: "all", label: "Todas" },
              { value: "pending", label: "Pendientes" },
              { value: "approved", label: "Aprobadas" },
              { value: "rejected", label: "Rechazadas" },
            ].map((status) => (
              <button
                key={status.value}
                onClick={() => setFilterStatus(status.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === status.value
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Empresa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Solicitante
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cargo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRequests.map((request) => {
              const status = statusConfig[request.request_status];
              const StatusIcon = status.icon;

              return (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{request.company_name}</div>
                      <div className="text-sm text-gray-500">{request.company_rut} | {request.sap_code}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{request.requester_name}</div>
                      <div className="text-sm text-gray-500">{request.requester_email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.position || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.created_at}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleManageRequest(request.id)}
                      className="inline-flex items-center gap-1 text-cyan-600 hover:text-cyan-900 px-3 py-1.5 rounded-lg hover:bg-cyan-50 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Gestionar</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron solicitudes</p>
          </div>
        )}
      </div>
    </div>
  );
}
