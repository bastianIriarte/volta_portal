// File: src/pages/registration_requests/RegistrationRequestsView.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Clock, CheckCircle, XCircle, Settings, Trash2 } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import GenericFilters from "../../components/common/GenericFilters";
import GenericTable from "../../components/common/GenericTable";
import TableActions from "../../components/common/TableActions";
import { useTableLogic } from "../../hooks/useTableLogic";
import { useModals } from "../../hooks/useModals";
import { getRegistrationRequests, deleteRequest } from "../../services/registrationRequestService";
import { handleSnackbar } from "../../utils/messageHelpers";

const statusConfig = {
  pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  approved: { label: "Aprobada", color: "bg-green-100 text-green-800", icon: CheckCircle },
  rejected: { label: "Rechazada", color: "bg-red-100 text-red-800", icon: XCircle },
};

export default function RegistrationRequestsView() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trigger, setTrigger] = useState(0);
  const [filterStatus, setFilterStatus] = useState("all");

  const tableConfig = {
    defaultSort: "created_at",
    defaultSortDir: "desc",
    pageSize: 10,
    searchFields: ["company_name", "company_rut_formatted", "sap_code", "name", "email", "rut_formatted", "position"]
  };

  const {
    q,
    setQ,
    sortBy,
    sortDir,
    page,
    setPage,
    filteredData,
    pageData,
    totalPages,
    handleSort
  } = useTableLogic(requests, tableConfig);

  const { modals, openConfirm, closeModal } = useModals();

  useEffect(() => {
    loadRequests();
    setPage(1);
  }, [trigger, filterStatus]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const status = filterStatus === "all" ? null : filterStatus;
      const response = await getRegistrationRequests(status);
      if (response.success) {
        setRequests(response.data || []);
      } else {
        handleSnackbar(response.message || "Error al cargar solicitudes", "error");
      }
    } catch (error) {
      console.error("Error loading requests:", error);
      handleSnackbar("Error al cargar solicitudes", "error");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: "company_name", label: "Empresa" },
    { key: "name", label: "Solicitante" },
    { key: "position", label: "Cargo" },
    { key: "created_at", label: "Fecha" },
    { key: "request_status", label: "Estado", sortable: false },
    { key: "actions", label: "Acciones", sortable: false, headerClassName: "text-right" }
  ];

  const handleManageRequest = (requestId) => {
    navigate(`/dashboard/solicitudes/${requestId}/gestionar`);
  };

  const handleDelete = async (request) => {
    openConfirm({
      title: "Eliminar solicitud",
      msg: `¿Seguro que deseas eliminar la solicitud de <b>${request.name}</b>?<br/><br/><span class="text-sm text-gray-500">Esta accion no se puede deshacer.</span>`,
      actionLabel: "Eliminar",
      variant: "danger",
      onConfirm: async () => {
        const response = await deleteRequest(request.id);
        handleSnackbar(response.message, response.success ? 'success' : 'error');
        closeModal('confirm');
        if (response.success) {
          setTrigger(prev => prev + 1);
        }
      },
    });
  };

  const getRowActions = () => [
    {
      icon: Settings,
      variant: "outline",
      onClick: (request) => handleManageRequest(request.id),
      title: "Gestionar solicitud"
    },
    {
      icon: Trash2,
      variant: "danger",
      onClick: handleDelete,
      title: "Eliminar solicitud"
    }
  ];

  const pendingCount = requests.filter(r => r.request_status === "pending").length;

  const renderRow = (request) => {
    const status = statusConfig[request.request_status] || statusConfig.pending;
    const StatusIcon = status.icon;

    return (
      <tr key={request.id} className="border-t hover:bg-gray-50">
        <td className="px-3 py-2">
          <div>
            <div className="text-sm font-medium text-gray-900">{request.company_name || "-"}</div>
            <div className="text-xs text-gray-500">{request.company_rut_formatted} | {request.sap_code}</div>
          </div>
        </td>
        <td className="px-3 py-2">
          <div>
            <div className="text-sm font-medium text-gray-900">{request.name}</div>
            <div className="text-xs text-gray-500">{request.email}</div>
          </div>
        </td>
        <td className="px-3 py-2 text-sm text-gray-500">
          {request.position || "-"}
        </td>
        <td className="px-3 py-2 text-sm text-gray-500">
          {request.created_at}
        </td>
        <td className="px-3 py-2">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </span>
        </td>
        <td className="px-3 py-2">
          <TableActions
            actions={getRowActions()}
            item={request}
            className="space-x-1"
          />
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <ClipboardList className="w-8 h-8" />
          Solicitudes de Registro
        </h2>
        <p className="text-gray-500">
          Gestiona las solicitudes de acceso al portal
          {pendingCount > 0 && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              {pendingCount} pendientes
            </span>
          )}
        </p>
      </div>

      {/* Filtros por estado */}
      <div className="flex gap-2 flex-wrap">
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

      {/* Filtros de busqueda */}
      <GenericFilters
        searchPlaceholder="Buscar por empresa, nombre, email, RUT..."
        searchValue={q}
        onSearchChange={setQ}
        resultsCount={filteredData.length}
        showAddButton={false}
      />

      {/* Tabla */}
      <GenericTable
        title="Solicitudes registradas"
        loading={loading}
        columns={columns}
        data={filteredData}
        pageData={pageData}
        emptyMessage="No hay solicitudes de registro"
        emptyIcon={ClipboardList}
        searchQuery={q}
        onClearSearch={() => setQ("")}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={handleSort}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalResults={filteredData.length}
        renderRow={renderRow}
        perPage={tableConfig.pageSize}
      />

      {/* Modal de confirmacion */}
      <Modal
        open={!!modals.confirm}
        onClose={() => closeModal('confirm')}
        title={modals.confirm?.title}
        variant="warn"
        isHtml={true}
        actions={[
          {
            label: "Cancelar",
            variant: "outline",
            onClick: () => closeModal('confirm')
          },
          {
            label: modals.confirm?.actionLabel || "Confirmar",
            variant: modals.confirm?.variant || "danger",
            onClick: modals.confirm?.onConfirm,
          },
        ]}
      >
        {modals.confirm?.msg}
      </Modal>
    </div>
  );
}
