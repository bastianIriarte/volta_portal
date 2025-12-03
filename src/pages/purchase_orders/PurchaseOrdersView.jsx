import { useState } from "react";
import { Modal } from "../../components/ui/Modal.jsx";
import GenericFilters from "../../components/common/GenericFilters.jsx";
import GenericTable from "../../components/common/GenericTable.jsx";
import TableActions from "../../components/common/TableActions.jsx";
import { useServerPagination } from "../../hooks/useServerPagination.js";
import { useModals } from "../../hooks/useModals.js";
import { getPurchaseOrders, syncPurchaseOrder, generatePurchaseOrderPDF } from "../../services/SAP/purchaseOrderService.js";
import { handleSnackbar } from "../../utils/messageHelpers.js";
import { ShoppingCart, FileText, RefreshCw, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PurchaseOrdersView() {
  const navigate = useNavigate();

  // Hook de paginación del servidor
  const {
    data: purchaseOrders,
    loading,
    search,
    setSearch,
    activeSearch,
    executeSearch,
    sortBy,
    sortDir,
    handleSort,
    page,
    setPage,
    totalPages,
    totalItems,
    refresh,
  } = useServerPagination(getPurchaseOrders, {
    defaultSort: "DocDate",
    defaultSortDir: "desc",
    pageSize: 10,
    autoFetch: true,
  });

  // Función para limpiar búsqueda
  const handleClearSearch = () => {
    setSearch("");
    if (activeSearch) {
      setTimeout(() => executeSearch(), 0);
    }
  };

  // Configuración de columnas (estructura SAP)
  const columns = [
    { key: "DocNum", label: "Doc Num" },
    { key: "DocEntry", label: "Doc Entry" },
    { key: "NumAtCard", label: "N° Referencia" },
    { key: "CardName", label: "Proveedor", sortable: false },
    { key: "DocDate", label: "Fecha Contabilización" },
    { key: "DocDueDate", label: "Fecha Vencimiento" },
    { key: "DocTotal", label: "Total", sortable: false },
    { key: "DocumentStatus", label: "Estado", sortable: false },
  ];



  // Renderizado de filas
  const renderRow = (order, index) => {
    // Formatear fechas
    const formatDate = (dateStr) => {
      if (!dateStr) return "-";
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-CL');
    };


    // Determinar color del estado
    const getStatusStyle = (status) => {
      switch (status) {
        case 'open':
          return 'bg-yellow-100 text-yellow-800';
        case 'closed':
          return 'bg-green-100 text-green-800';
        case 'cancelled':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    const getStatusLabel = (status) => {
      switch (status) {
        case 'open':
          return 'Abierta';
        case 'closed':
          return 'Cerrada';
        case 'cancelled':
          return 'Cancelada';
        default:
          return status || 'N/A';
      }
    };

    return (
      <tr key={order.DocEntry || index} className="border-t hover:bg-gray-50">
        <td className="px-3 py-2 text-sm text-center font-medium">{order.DocNum || "-"}</td>
        <td className="px-3 py-2 text-sm text-center font-medium">{order.DocEntry || "-"}</td>
        <td className="px-3 py-2 text-sm text-center">{order.NumAtCard || "-"}</td>
        <td className="px-3 py-2 text-sm text-wrap">
          <div>
            <div className="text-xs font-medium">{order.CardName || "-"}</div>
            <div className="text-xs text-gray-500">{order.CardCode ?? "-"}</div>
            <div className="text-xs text-gray-500">{order.LicTracNum ?? "-"}</div>
          </div>
        </td>
        <td className="px-3 py-2 text-sm text-center">{formatDate(order.DocDate)}</td>
        <td className="px-3 py-2 text-sm text-center">{formatDate(order.DocDueDate)}</td>
        <td className="px-3 py-2 text-sm text-center font-medium text-wrap">{order.DocTotalSys > 0 ? order.DocTotalSys : order.DocTotal} {order.DocCurrency}</td>
        <td className="px-3 py-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusStyle(order.DocumentStatus)}`}>
            {getStatusLabel(order.DocumentStatus)}
          </span>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold   mb-2">
          Órdenes de Compra
        </h2>
        <p className=" /70">
          Gestión de órdenes de compra
        </p>
      </div>

      {/* Filtros */}
      <GenericFilters
        searchPlaceholder="Buscar órdenes de compra (DocNum, DocEntry, Proveedor, Referencia)..."
        searchValue={search}
        onSearchChange={setSearch}
        onSearch={executeSearch}
        showSearchButton={true}
        searchButtonLabel="Buscar"
        minSearchLength={3}
        searchLoading={loading}
        resultsCount={totalItems}
        showAddButton={false}
        addButtonIcon={Plus}
      />

      {/* Tabla */}
      <GenericTable
        title="Órdenes de compra"
        loading={loading}
        columns={columns}
        data={purchaseOrders}
        pageData={purchaseOrders}
        emptyMessage="No hay órdenes de compra registradas"
        emptyIcon={ShoppingCart}
        searchQuery={search}
        onClearSearch={handleClearSearch}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={handleSort}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalResults={totalItems}
        renderRow={renderRow}
      />


    </div>
  );
}
