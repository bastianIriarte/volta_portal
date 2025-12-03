import { Modal } from "../../components/ui/Modal.jsx";
import GenericFilters from "../../components/common/GenericFilters.jsx";
import GenericTable from "../../components/common/GenericTable.jsx";
import TableActions from "../../components/common/TableActions.jsx";
import { useServerPagination } from "../../hooks/useServerPagination.js";
import { useModals } from "../../hooks/useModals.js";
import { getQuotations, deleteQuotation, generateQuotationPDF } from "../../services/SAP/quotationService.js";
import { handleSnackbar } from "../../utils/messageHelpers.js";
import { FileText, Trash2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function QuotationsView() {
  const navigate = useNavigate();
  const { modals, closeModal, openConfirm } = useModals();

  // Hook de paginación del servidor
  const {
    data: quotations,
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
  } = useServerPagination(getQuotations, {
    defaultSort: "created_at",
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

  // Configuración de columnas
  const columns = [
    { key: "number", label: "Número" },
    { key: "client", label: "Cliente", sortable: false },
    { key: "date", label: "Fecha" },
    { key: "valid_until", label: "Válido Hasta" },
    { key: "total", label: "Total", sortable: false },
    { key: "status", label: "Estado", sortable: false },
    { key: "actions", label: "Acciones", sortable: false, headerClassName: "text-right" }
  ];

  // Eliminar cotización
  const handleDelete = async (quotation) => {
    openConfirm({
      title: "Eliminar Cotización",
      msg: `¿Seguro que deseas eliminar la cotización <b>${quotation.number}</b>?`,
      actionLabel: "Eliminar",
      variant: "danger",
      onConfirm: async () => {
        const response = await deleteQuotation(quotation.id);
        handleSnackbar(response.message, response.success ? 'success' : 'error');
        closeModal('confirm');
        if (response.success) {
          refresh();
        }
      },
    });
  };

  // Generar PDF
  const handleGeneratePDF = async (quotation) => {
    try {
      const response = await generateQuotationPDF(quotation.id);
      if (response.success) {
        // Crear un blob y descargarlo
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Cotizacion-${quotation.number}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        handleSnackbar("PDF generado correctamente", "success");
      } else {
        handleSnackbar(response.message, "error");
      }
    } catch (error) {
      handleSnackbar("Error al generar PDF", "error");
    }
  };

  // Configuración de acciones por fila
  const getRowActions = () => [
    {
      label: "PDF",
      icon: FileText,
      variant: "primary",
      onClick: handleGeneratePDF,
      title: "Generar PDF"
    },
    {
      label: "Eliminar",
      icon: Trash2,
      variant: "danger",
      onClick: handleDelete,
      title: "Eliminar cotización"
    }
  ];

  // Renderizado de filas
  const renderRow = (quotation, index) => {
    return (
      <tr key={quotation.id} className="border-t hover:bg-gray-50">
        <td className="px-3 py-2 text-xs font-medium">{quotation.number || "-"}</td>
        <td className="px-3 py-2 text-sm">
          {quotation.client ? (
            <div>
              <div className="font-medium">{quotation.client.name}</div>
              <div className="text-xs text-gray-500">{quotation.client.rut}</div>
            </div>
          ) : "-"}
        </td>
        <td className="px-3 py-2 text-sm">{quotation.date || "-"}</td>
        <td className="px-3 py-2 text-sm">{quotation.valid_until || "-"}</td>
        <td className="px-3 py-2 text-sm font-medium">
          {quotation.total ? `$${Number(quotation.total).toLocaleString('es-CL')}` : "-"}
        </td>
        <td className="px-3 py-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
            ${quotation.status === 'approved' ? 'bg-green-100 text-green-800' :
              quotation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              quotation.status === 'rejected' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'}`}>
            {quotation.status === 'approved' ? 'Aprobada' :
             quotation.status === 'pending' ? 'Pendiente' :
             quotation.status === 'rejected' ? 'Rechazada' : 'N/A'}
          </span>
        </td>
        <td className="px-3 py-2">
          <TableActions
            actions={getRowActions()}
            item={quotation}
            className="space-x-2"
          />
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold   mb-2">
          Cotizaciones
        </h2>
        <p className=" /70">
          Gestión de cotizaciones y notas de venta
        </p>
      </div>

      {/* Filtros */}
      <GenericFilters
        searchPlaceholder="Buscar cotizaciones..."
        searchValue={search}
        onSearchChange={setSearch}
        onSearch={executeSearch}
        showSearchButton={true}
        searchButtonLabel="Buscar"
        minSearchLength={3}
        searchLoading={loading}
        resultsCount={totalItems}
        showAddButton={true}
        addButtonLabel="Nueva Cotización"
        onAdd={() => navigate('/dashboard/quotations/create')}
        addButtonIcon={Plus}
      />

      {/* Tabla */}
      <GenericTable
        title="Cotizaciones"
        loading={loading}
        columns={columns}
        data={quotations}
        pageData={quotations}
        emptyMessage="No hay cotizaciones registradas"
        emptyIcon={FileText}
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
            variant: modals.confirm?.variant || "danger",
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
