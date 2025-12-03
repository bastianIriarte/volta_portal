import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GenericFilters from "../../components/common/GenericFilters.jsx";
import GenericTable from "../../components/common/GenericTable.jsx";
import TableActions from "../../components/common/TableActions.jsx";
import { useTableLogic } from "../../hooks/useTableLogic.js";
import { handleSnackbar } from "../../utils/messageHelpers.js";
import {
  FileText,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Loader2,
  RefreshCcw,
  RefreshCw,
} from "lucide-react";
import { getQuotations, syncQuotation } from "../../services/myQuotationService.js";
import { Modal } from "../../components/ui/Modal.jsx";
import { useModals } from "../../hooks/useModals.js";

export default function MyQuotationView() {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trigger, setTrigger] = useState(0);
  const { modals, closeModal, openConfirm } = useModals();

  // Configuración de tabla base
  const tableConfig = {
    defaultSort: "doc_date",
    defaultSortDir: "desc",
    pageSize: 10,
    searchFields: [
      "id",
      "supplier_name",
      "supplier_code",
      "currency",
      "status",
      "status_integration",
      "doc_num",
      "doc_entry",
    ],
    filterField: "status",
  };

  const {
    q,
    setQ,
    filterValue,
    setFilterValue,
    sortBy,
    sortDir,
    page,
    setPage,
    filteredData,
    pageData,
    totalPages,
    handleSort,
  } = useTableLogic(quotations, tableConfig);

  // Cargar órdenes
  const fetchList = async () => {
    try {
      setLoading(true);
      const response = await getQuotations();
      if (response.success) {
        setQuotations(response.data || []);
      }
    } catch (error) {
      console.error("Error al obtener Órdenes de Compra:", error);
      handleSnackbar("Error al cargar Órdenes de Compra", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    setPage(1);
  }, [trigger]);

  // Filtros
  const filterOptions = [
    { value: "open", label: "Abierta" },
    { value: "closed", label: "Cerrada" },
    { value: "cancelled", label: "Cancelada" },
  ];

  // Columnas
  const columns = [
    { key: "id", label: "ID", sortable: true, headerClassName: "text-center" },
    { key: "supplier_name", label: "Proveedor", sortable: true, headerClassName: "text-center" },
    { key: "currency", label: "Moneda", sortable: true, headerClassName: "text-center" },
    { key: "doc_date", label: "Fecha Documento", sortable: true, headerClassName: "text-center" },
    { key: "status_integration", label: "Integración", sortable: true, headerClassName: "text-center" },
    { key: "total", label: "Total", sortable: true, headerClassName: "text-center" },
    { key: "doc_num", label: "Doc Num", sortable: true, headerClassName: "text-center" },
    { key: "doc_entry", label: "Doc Entry", sortable: true, headerClassName: "text-center" },
    { key: "actions", label: "Acciones", sortable: false, headerClassName: "text-center" },
  ];


  // Iconos para estado de integración
  const getIntegrationIcon = (status) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4 text-yellow-600" />;
      case "processing": return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />;
      case "success": return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "error": return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  // Acción: ver detalle
  const viewPurchaseOrder = (po) => {
    navigate(`/dashboard/my-purchase-orders/${po.id}/detail`);
  };

  const getRowActions = (po) => [
    {
      label: "Ver Detalle",
      icon: Eye,
      variant: "primary",
      onClick: viewPurchaseOrder,
      title: "Ver detalle completo de la Cotización",
    },
    {
      label: "Re-integrar",
      icon: RefreshCw,
      variant: "outline",
      onClick: () => handleSync(po),
      title: "Sincronizar OC",
      disabled: () => po.status_integration == 'success'
    }
  ];

  // Renderizar filas
  const renderRow = (po) => {
    const supplier = po.supplier_name || "Proveedor desconocido";
    const currency = po.currency || "CLP";
    const formattedTotal = new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(po.total || 0);

    return (
      <tr key={po.id} className="border-t hover:bg-gray-50 transition-colors">
        <td className="px-3 py-3 text-center font-mono text-sm font-semibold  ">{po.id}</td>
        <td className="px-3 py-3 text-left">
          <div>
            <span className="font-medium">{supplier}</span>
            {po.supplier_code && <div className="text-xs text-gray-500">{po.supplier_code}</div>}
          </div>
        </td>
        <td className="px-3 py-3 text-center">{currency}</td>
        <td className="px-3 py-3 text-center">{po.doc_date || "-"}</td>

        {/* Estado integración */}
        <td className="px-3 py-3 text-center">
          <div className="flex items-center justify-center gap-2">
            {getIntegrationIcon(po.status_integration)}
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${po.status_integration === "success"
                ? "bg-green-100 text-green-800"
                : po.status_integration === "processing"
                  ? "bg-blue-100 text-blue-800"
                  : po.status_integration === "error"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
            >
              {po.status_integration || "N/A"}
            </span>
          </div>
        </td>

        <td className="px-3 py-3 text-center font-semibold text-gray-800">
          {formattedTotal}
        </td>

        <td className="px-3 py-3 text-center">{po.doc_num || "-"}</td>
        <td className="px-3 py-3 text-center">{po.doc_entry || "-"}</td>

        <td className="px-3 py-3 text-center">
          <TableActions actions={getRowActions(po)} item={po} />
        </td>
      </tr>
    );
  };


  // Sincronizar OC
  const handleSync = async (order) => {
    openConfirm({
      title: "Sincronizar Cotización",
      msg: `¿Deseas sincronizar la Cotización <b>${order.id}</b> con SAP?`,
      actionLabel: "Sincronizar",
      variant: "primary",
      onConfirm: async () => {
        const response = await syncQuotation(order.id);
        handleSnackbar(response.message, response.success ? 'success' : 'error');
        closeModal('confirm');
        if (response.success) {
          refresh();
        }
      },
    });
  };



  return (
    <div className="space-y-6 justify-center mx-auto lg:px-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold   mb-2 uppercase">
          Mis Cotizaciones
        </h2>
        <p className=" /70">
          Revisa el estado de tus cotizaciones y su integración con SAP.
        </p>
      </div>

      {/* Filtros */}
      <GenericFilters
        searchPlaceholder="Buscar por proveedor, documento o ID..."
        searchValue={q}
        onSearchChange={setQ}
        filterValue={filterValue}
        onFilterChange={setFilterValue}
        filterOptions={filterOptions}
        filterLabel="Estado de la Cotización"
        resultsCount={filteredData.length}
        showAddButton={true}
        addButtonLabel="Nueva Cotización"
        onAdd={() => navigate("/dashboard/my-quotations/create")}
      />

      {/* Tabla */}
      <GenericTable
        title="Cotizaciones registradas"
        loading={loading}
        columns={columns}
        data={filteredData}
        pageData={pageData}
        emptyMessage="No existen Cotizaciones registradas aún"
        emptyIcon={FileText}
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
      />

      {/* Modal de notificación */}
      <Modal
        open={!!modals.notify}
        onClose={() => closeModal('notify')}
        title={modals.notify?.title}
        variant={modals.notify?.variant || "info"}
        isHtml={true}
        actions={[
          {
            label: "Cerrar",
            variant: "primary",
            onClick: () => closeModal('notify'),
          },
        ]}
      >
        {modals.notify?.msg}
      </Modal>

      {/* Modal de confirmación */}
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
            variant: modals.confirm?.variant || "primary",
            onClick: modals.confirm?.onConfirm,
            autofocus: true,
          },
        ]}
      >
        {modals.confirm?.msg}
      </Modal>
    </div>

  );
}
