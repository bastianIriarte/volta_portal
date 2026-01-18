import { useState, useEffect } from "react";
import GenericFilters from "../../components/common/GenericFilters.jsx";
import GenericTable from "../../components/common/GenericTable.jsx";
import TableActions from "../../components/common/TableActions.jsx";
import { useTableLogic } from "../../hooks/useTableLogic.js";
import { useModals } from "../../hooks/useModals";
import { getCustomers, toggleCustomerStatus, deleteCustomerUser } from "../../services/customerService.js";
import { getCompaniesList } from "../../services/companyService.js";
import CustomerPermissionsModal from "./components/CustomerPermissionsModal.jsx";
import { handleSnackbar } from "../../utils/messageHelpers.js";
import { Modal } from "../../components/ui/Modal";
import {
  Users,
  CheckCircle,
  XCircle,
  Shield,
  Power,
  Trash2,
  Building2
} from "lucide-react";

export default function CustomersView() {
  const [registers, setRegisters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trigger, setTrigger] = useState(0);
  const [permissionsModal, setPermissionsModal] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");

  const { modals, openConfirm, closeModal } = useModals();

  // Configuración de la tabla
  const tableConfig = {
    defaultSort: "name",
    defaultSortDir: "asc",
    pageSize: 10,
    searchFields: [
      "name",
      "rut",
      "email",
      "username",
      "company"
    ]
  };

  // Filtrar por empresa seleccionada
  const companyFilteredRegisters = selectedCompany
    ? registers.filter(r => r.company_id === parseInt(selectedCompany))
    : registers;

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
  } = useTableLogic(companyFilteredRegisters, tableConfig);

  // Cargar datos
  const fetchList = async () => {
    try {
      setLoading(true);
      const response = await getCustomers();
      if (response.success) {
        setRegisters(response.data || []);
      }
    } catch (error) {
      console.error("Error al obtener los registros:", error);
      handleSnackbar("Error al cargar los registros", "error");
    } finally {
      setLoading(false);
    }
  };

  // Cargar lista de empresas
  const fetchCompanies = async () => {
    try {
      const response = await getCompaniesList();
      if (response.success) {
        setCompanies(response.data || []);
      }
    } catch (error) {
      console.error("Error al cargar empresas:", error);
    }
  };

  useEffect(() => {
    fetchList();
    fetchCompanies();
    setPage(1);
  }, [trigger]);

  // Configuración de columnas
  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Cliente" },
    { key: "rut", label: "RUT" },
    { key: "email", label: "Correo" },
    { key: "company", label: "Empresa" },
    { key: "status", label: "Estado", sortable: false },
    { key: "actions", label: "Acciones", sortable: false, headerClassName: "text-center" }
  ];

  // Manejar cambio de estado (habilitar/deshabilitar)
  const handleToggleStatus = (customer) => {
    const newStatus = !customer.status;
    const action = newStatus ? "habilitar" : "deshabilitar";

    openConfirm({
      title: `${newStatus ? "Habilitar" : "Deshabilitar"} Cliente`,
      msg: (
        <div>
          <p>
            ¿Está seguro que desea {action} al cliente <strong>{customer.name}</strong>?
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {newStatus
              ? "El cliente podrá acceder nuevamente al sistema."
              : "El cliente no podrá acceder al sistema mientras esté deshabilitado."
            }
          </p>
        </div>
      ),
      variant: newStatus ? "primary" : "warning",
      actionLabel: newStatus ? "Habilitar" : "Deshabilitar",
      onConfirm: async () => {
        try {
          const response = await toggleCustomerStatus(customer.id, newStatus);
          if (response.success) {
            handleSnackbar(response.message || `Cliente ${action}do correctamente`, "success");
            setTrigger(prev => prev + 1);
          } else {
            handleSnackbar(response.message || `Error al ${action} cliente`, "error");
          }
        } catch (error) {
          console.error("Error:", error);
          handleSnackbar(`Error al ${action} cliente`, "error");
        }
        closeModal("confirm");
      }
    });
  };

  // Manejar eliminación
  const handleDelete = (customer) => {
    openConfirm({
      title: "Eliminar Cliente",
      msg: (
        <div>
          <p>
            ¿Está seguro que desea eliminar al cliente <strong>{customer.name}</strong>?
          </p>
          <p className="text-sm text-red-600 mt-2">
            Esta acción no se puede deshacer. Se eliminarán todos los permisos y datos asociados.
          </p>
        </div>
      ),
      variant: "danger",
      actionLabel: "Eliminar",
      onConfirm: async () => {
        try {
          const response = await deleteCustomerUser(customer.id);
          if (response.success) {
            handleSnackbar(response.message || "Cliente eliminado correctamente", "success");
            setTrigger(prev => prev + 1);
          } else {
            handleSnackbar(response.message || "Error al eliminar cliente", "error");
          }
        } catch (error) {
          console.error("Error:", error);
          handleSnackbar("Error al eliminar cliente", "error");
        }
        closeModal("confirm");
      }
    });
  };

  // Configuración de acciones por fila
  const getRowActions = (customer) => [
    {
      label: "",
      icon: Shield,
      variant: "outline",
      onClick: (c) => setPermissionsModal(c),
      title: "Gestionar permisos",
      className: "text-violet-600 hover:text-violet-900 hover:bg-violet-50"
    },
    {
      label: "",
      icon: Power,
      variant: "outline",
      onClick: handleToggleStatus,
      title: customer.status ? "Deshabilitar usuario" : "Habilitar usuario",
      className: customer.status
        ? "text-amber-600 hover:text-amber-900 hover:bg-amber-50"
        : "text-emerald-600 hover:text-emerald-900 hover:bg-emerald-50"
    },
    {
      icon: Trash2,
      variant: "danger",
      onClick: handleDelete,
      title: "Eliminar"
    }
  ];

  // Renderizado de filas
  const renderRow = (customer) => {
    return (
      <tr key={customer.id} className="border-t hover:bg-gray-50">
        <td className="px-3 py-2 text-sm text-gray-500">{customer.id}</td>
        <td className="px-3 py-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded flex items-center justify-center bg-violet-50">
              <Users className="h-4 w-4 text-violet-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">{customer.name}</div>
              {customer.username && (
                <div className="text-xs text-gray-500">
                  @{customer.username}
                </div>
              )}
            </div>
          </div>
        </td>
        <td className="px-3 py-2">
          <span className="text-sm text-gray-500 font-mono">{customer.rut || "-"}</span>
        </td>
        <td className="px-3 py-2">
          <span className="text-sm text-gray-600">{customer.email || "-"}</span>
        </td>
        <td className="px-3 py-2">
          <span className="text-sm text-gray-600">{customer.company || "-"}</span>
        </td>
        <td className="px-3 py-2">
          {customer.status ? (
            <span className="inline-flex items-center text-green-600 text-sm">
              <CheckCircle className="w-4 h-4 mr-1" />
              Activo
            </span>
          ) : (
            <span className="inline-flex items-center text-gray-400 text-sm">
              <XCircle className="w-4 h-4 mr-1" />
              Inactivo
            </span>
          )}
        </td>
        <td className="px-3 py-2">
          <TableActions actions={getRowActions(customer)} item={customer} className="justify-center" />
        </td>
      </tr>
    );
  };

  // Manejar cierre del modal de permisos
  const handlePermissionsModalClose = (shouldRefresh = false) => {
    setPermissionsModal(null);
    if (shouldRefresh) {
      setTrigger(prev => prev + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-bradford-navy mb-2">
          Gestión de Clientes
        </h2>
        <p className="text-bradford-navy/70">
          Usuarios con perfil de cliente. Gestiona sus permisos de acceso a reportes, certificados y documentos.
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <GenericFilters
            searchPlaceholder="Buscar por nombre, RUT o correo..."
            searchValue={q}
            onSearchChange={setQ}
            resultsCount={filteredData.length}
            showAddButton={false}
          />
        </div>
        <div className="w-full sm:w-64">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Building2 className="w-4 h-4 inline mr-1" />
            Filtrar por Empresa
          </label>
          <select
            value={selectedCompany}
            onChange={(e) => {
              setSelectedCompany(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          >
            <option value="">Todas las empresas</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.business_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla */}
      <GenericTable
        title="Clientes registrados"
        loading={loading}
        columns={columns}
        data={filteredData}
        pageData={pageData}
        emptyMessage="No hay clientes registrados"
        emptyIcon={Users}
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

      {/* Modal de permisos */}
      {permissionsModal && (
        <CustomerPermissionsModal
          customer={permissionsModal}
          onClose={handlePermissionsModalClose}
        />
      )}

      {/* Modal de confirmación */}
      <Modal
        open={!!modals.confirm}
        onClose={() => closeModal("confirm")}
        title={modals.confirm?.title}
        variant="warn"
        actions={[
          { label: "Cancelar", variant: "outline", onClick: () => closeModal("confirm") },
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
