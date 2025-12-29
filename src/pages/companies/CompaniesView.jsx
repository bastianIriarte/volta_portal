// File: src/pages/companies/CompaniesView.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Pencil, Trash2 } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import GenericFilters from "../../components/common/GenericFilters";
import GenericTable from "../../components/common/GenericTable";
import TableActions from "../../components/common/TableActions";
import { useTableLogic } from "../../hooks/useTableLogic";
import { useModals } from "../../hooks/useModals";
import { getCompanies, deleteCompany } from "../../services/companyService";
import { handleSnackbar } from "../../utils/messageHelpers";
import CompanyCreateModal from "./components/CompanyCreateModal";

export default function CompaniesView() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trigger, setTrigger] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Configuración de la tabla
  const tableConfig = {
    defaultSort: "business_name",
    defaultSortDir: "asc",
    pageSize: 10,
    searchFields: ["business_name", "rut", "rut_formatted", "sap_code", "email", "phone", "address", "city", "country"]
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
  } = useTableLogic(companies, tableConfig);

  const { modals, openConfirm, closeModal } = useModals();

  // Cargar empresas
  useEffect(() => {
    loadCompanies();
    setPage(1);
  }, [trigger]);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const response = await getCompanies();
      if (response.success) {
        setCompanies(response.data || []);
      } else {
        handleSnackbar(response.message || "Error al cargar empresas", "error");
      }
    } catch (error) {
      console.error("Error loading companies:", error);
      handleSnackbar("Error al cargar empresas", "error");
    } finally {
      setLoading(false);
    }
  };

  // Configuración de columnas
  const columns = [
    { key: "business_name", label: "Empresa" },
    { key: "sap_code", label: "Código SAP" },
    { key: "email", label: "Contacto" },
    { key: "status", label: "Estado", sortable: false },
    { key: "actions", label: "Acciones", sortable: false, headerClassName: "text-center" }
  ];

  // Handlers
  const handleEditCompany = (companyId) => {
    navigate(`/dashboard/empresas/${companyId}/editar`);
  };

  const handleCreateModalClose = (shouldRefresh = false) => {
    setShowCreateModal(false);
    if (shouldRefresh) {
      setTrigger(prev => prev + 1);
    }
  };

  const handleDelete = async (company) => {
    openConfirm({
      title: "Eliminar empresa",
      msg: `¿Seguro que deseas eliminar la empresa <b>${company.business_name}</b>?<br/><br/><span class="text-sm text-gray-500">Esta acción no se puede deshacer. Los usuarios y documentos asociados podrían verse afectados.</span>`,
      actionLabel: "Eliminar",
      variant: "danger",
      onConfirm: async () => {
        const response = await deleteCompany(company.id);
        handleSnackbar(response.message, response.success ? 'success' : 'error');
        closeModal('confirm');
        if (response.success) {
          setTrigger(prev => prev + 1);
        }
      },
    });
  };

  // Configuración de acciones por fila
  const getRowActions = () => [
    {
      icon: Pencil,
      variant: "outline",
      onClick: (company) => handleEditCompany(company.id),
      title: "Ver empresa"
    },
    {
      icon: Trash2,
      variant: "danger",
      onClick: handleDelete,
      title: "Eliminar empresa"
    }
  ];

  // Renderizado de filas
  const renderRow = (company) => (
    <tr key={company.id} className="border-t hover:bg-gray-50">
      <td className="px-3 py-2">
        <div>
          <div className="text-sm font-medium text-gray-900">{company.business_name}</div>
          <div className="text-xs text-gray-500">{company.rut_formatted || company.rut}</div>
        </div>
      </td>
      <td className="px-3 py-2 text-sm text-gray-500">
        {company.sap_code || "-"}
      </td>
      <td className="px-3 py-2">
        <div className="text-sm text-gray-900">{company.email || "-"}</div>
        <div className="text-xs text-gray-500">{company.phone || "-"}</div>
      </td>
      <td className="px-3 py-2">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          company.status
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}>
          {company.status ? "Activa" : "Inactiva"}
        </span>
      </td>
      <td className="px-3 py-2">
        <TableActions
          actions={getRowActions()}
          item={company}
          className="space-x-1"
        />
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold mb-2">Empresas</h2>
        <p className="text-gray-500">Gestión de empresas registradas en el sistema</p>
      </div>

      {/* Filtros */}
      <GenericFilters
        searchPlaceholder="Buscar por nombre, RUT, código SAP..."
        searchValue={q}
        onSearchChange={setQ}
        resultsCount={filteredData.length}
        showAddButton={true}
        addButtonLabel="Nueva Empresa"
        onAdd={() => setShowCreateModal(true)}
      />

      {/* Tabla */}
      <GenericTable
        title="Empresas registradas"
        loading={loading}
        columns={columns}
        data={filteredData}
        pageData={pageData}
        emptyMessage="No hay empresas registradas"
        emptyIcon={Building2}
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

      {/* Modal Crear Empresa */}
      <CompanyCreateModal
        open={showCreateModal}
        onClose={handleCreateModalClose}
      />

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
          },
        ]}
      >
        {modals.confirm?.msg}
      </Modal>
    </div>
  );
}
