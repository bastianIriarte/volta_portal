import { Modal } from "../../components/ui/Modal.jsx";
import GenericFilters from "../../components/common/GenericFilters.jsx";
import GenericTable from "../../components/common/GenericTable.jsx";
import { useServerPagination } from "../../hooks/useServerPagination.js";
import { useModals } from "../../hooks/useModals.js";
import { getClients } from "../../services/SAP/clientService.js";
import { Users } from "lucide-react";

export default function ClientsView() {
  const { modals, closeModal } = useModals();

  // Hook de paginación del servidor
  const {
    data: clients,
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
  } = useServerPagination(getClients, {
    defaultSort: "CardName",
    defaultSortDir: "asc",
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
    { key: "CardCode", label: "Código" },
    { key: "CardName", label: "Nombre" },
    { key: "LicTradNum", label: "RUT" },
    { key: "E_Mail", label: "Correo" },
    { key: "Phone1", label: "Teléfono" },
    { key: "ShipTo", label: "Dirección Despacho", sortable: false },
    { key: "BillTo", label: "Dirección Facturación", sortable: false },
  ];

  // Renderizado de filas
  const renderRow = (customer, index) => {
    // Buscar direcciones específicas por tipo
    const shipToAddress = customer.BPAddresses?.find(addr => addr.AddressType === "bo_ShipTo");
    const billToAddress = customer.BPAddresses?.find(addr => addr.AddressType === "bo_BillTo");

    // Formatear dirección de despacho
    const shipToText = shipToAddress
      ? [
          shipToAddress.Street !== "." ? shipToAddress.Street : null,
          shipToAddress.County,
          shipToAddress.City !== "." ? shipToAddress.City : null,
        ].filter(Boolean).join(", ")
      : "-";

    // Formatear dirección de facturación
    const billToText = billToAddress
      ? [
          billToAddress.Street !== "." ? billToAddress.Street : null,
          billToAddress.County,
          billToAddress.City !== "." ? billToAddress.City : null,
        ].filter(Boolean).join(", ")
      : "-";

    return (
      <tr key={customer.CardCode || index} className="border-t hover:bg-gray-50">
        <td className="px-3 py-2 text-sm font-medium font-mono">{customer.CardCode || "-"}</td>
        <td className="px-3 py-2 text-sm">{customer.CardName || "-"}</td>
        <td className="px-3 py-2 text-sm">{customer.LicTradNum || "-"}</td>
        <td className="px-3 py-2 text-sm">{customer.E_Mail ?? "-"}</td>
        <td className="px-3 py-2 text-sm">{customer.Phone1 ?? "-"}</td>
        <td className="px-3 py-2 text-sm max-w-xs truncate" title={shipToText}>{shipToText}</td>
        <td className="px-3 py-2 text-sm max-w-xs truncate" title={billToText}>{billToText}</td>
      </tr>
    );
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold   mb-2">
          Clientes
        </h2>
        <p className=" /70">
          Listado de clientes registrados
        </p>
      </div>

      {/* Filtros */}
      <GenericFilters
        searchPlaceholder="Buscar clientes (Código, Nombre, Rut)"
        searchValue={search}
        onSearchChange={setSearch}
        onSearch={executeSearch}
        showSearchButton={true}
        searchButtonLabel="Buscar"
        minSearchLength={3}
        searchLoading={loading}
        resultsCount={totalItems}
        showAddButton={false}
      />

      {/* Tabla */}
      <GenericTable
        title="Clientes registrados"
        loading={loading}
        columns={columns}
        data={clients}
        pageData={clients}
        emptyMessage="No hay clientes registrados"
        emptyIcon={Users}
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
    </div>
  );
}
