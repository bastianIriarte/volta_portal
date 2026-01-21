import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Pencil, Trash2, CheckCircle, XCircle, Settings } from "lucide-react";
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

  const { modals, openConfirm, closeModal } = useModals();

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
    { key: "id", label: "ID" },
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
      setTrigger((prev) => prev + 1);
    }
  };

  const handleDelete = (company) => {
    openConfirm({
      title: "Eliminar Empresa",
      msg: (
        <div>
          <p>
            ¿Está seguro que desea eliminar la empresa <strong>{company.business_name}</strong>?
          </p>
          <p className="text-sm text-red-600 mt-2">
            Esta acción no se puede deshacer. Los usuarios y documentos asociados podrían verse afectados.
          </p>
        </div>
      ),
      actionLabel: "Eliminar",
      variant: "danger",
      onConfirm: async () => {
        const response = await deleteCompany(company.id);
        handleSnackbar(response.message, response.success ? "success" : "error");
        closeModal("confirm");
        if (response.success) {
          setTrigger((prev) => prev + 1);
        }
      },
    });
  };

  // Configuración de acciones por fila
  const getRowActions = () => [
    {
      label: "",
      icon: Settings,
      variant: "outline",
      onClick: (company) => handleEditCompany(company.id),
      title: "Configurar empresa",
      className: "text-blue-600 hover:text-blue-900 hover:bg-blue-50"
    },
    {
      icon: Trash2,
      variant: "danger",
      onClick: handleDelete,
      title: "Eliminar",
    }
  ];

  // Renderizado de filas
  const renderRow = (company) => (
    <tr key={company.id} className="border-t hover:bg-gray-50">
      <td className="px-3 py-2 text-sm text-gray-500">{company.id}</td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded flex items-center justify-center bg-amber-50">
            <Building2 className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{company.business_name}</div>
            <div className="text-xs text-gray-500 font-mono">
              {company.rut_formatted || company.rut || "-"}
            </div>
          </div>
        </div>
      </td>
      <td className="px-3 py-2">
        <span className="text-sm text-gray-500 font-mono">{company.sap_code || "-"}</span>
      </td>
      <td className="px-3 py-2">
        <div className="text-sm text-gray-600">{company.email || "-"}</div>
        {company.phone && (
          <div className="text-xs text-gray-500">{company.phone}</div>
        )}
      </td>
      <td className="px-3 py-2">
        {company.status ? (
          <span className="inline-flex items-center text-green-600 text-sm">
            <CheckCircle className="w-4 h-4 mr-1" />
            Activa
          </span>
        ) : (
          <span className="inline-flex items-center text-gray-400 text-sm">
            <XCircle className="w-4 h-4 mr-1" />
            Inactiva
          </span>
        )}
      </td>
      <td className="px-3 py-2">
        <TableActions actions={getRowActions()} item={company} className="justify-center" />
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-bradford-navy mb-2">Gestión de Empresas</h2>
        <p className="text-bradford-navy/70">Administra las empresas registradas en el sistema</p>
      </div>

      {/* Filtros */}
      <GenericFilters
        searchPlaceholder="Buscar por nombre, RUT o código SAP..."
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
      />

      {/* Modal Crear Empresa */}
      <CompanyCreateModal
        open={showCreateModal}
        onClose={handleCreateModalClose}
      />

      {/* Modal de confirmación */}
      <Modal
        open={!!modals.confirm}
        onClose={() => closeModal("confirm")}
        title={modals.confirm?.title}
        variant="warn"
        actions={[
          {
            label: "Cancelar",
            variant: "outline",
            onClick: () => closeModal("confirm")
          },
          {
            label: modals.confirm?.actionLabel || "Confirmar",
            variant: modals.confirm?.variant || "primary",
            onClick: modals.confirm?.onConfirm,
          },
        ]}
      >
        {modals.confirm?.msg}
      </Modal>
    </div>
  );
}
