import React, { useState, useEffect } from "react";
import GenericFilters from "../../components/common/GenericFilters.jsx";
import GenericTable from "../../components/common/GenericTable.jsx";
import TableActions from "../../components/common/TableActions.jsx";
import { useTableLogic } from "../../hooks/useTableLogic.js";
import { getCustomers, toggleCustomerStatus, deleteCustomerUser } from "../../services/customerService.js";
import { getCompaniesList } from "../../services/companyService.js";
import CustomerPermissionsModal from "./components/CustomerPermissionsModal.jsx";
import { handleSnackbar } from "../../utils/messageHelpers.js";
import ConfirmModal from "../../components/common/ConfirmModal.jsx";
import {
  Search,
  CheckCircle,
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
  const [confirmModal, setConfirmModal] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");

  // Configuración de la tabla
  const tableConfig = {
    defaultSort: "name",
    defaultSortDir: "asc",
    pageSize: 8,
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
    { key: "name", label: "Nombre" },
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
    setConfirmModal({
      type: "status",
      customer,
      title: `${newStatus ? "Habilitar" : "Deshabilitar"} Cliente`,
      message: `¿Estás seguro de que deseas ${action} al cliente "${customer.name}"?`,
      confirmText: newStatus ? "Habilitar" : "Deshabilitar",
      variant: newStatus ? "primary" : "warning",
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
        setConfirmModal(null);
      }
    });
  };

  // Manejar eliminación
  const handleDelete = (customer) => {
    setConfirmModal({
      type: "delete",
      customer,
      title: "Eliminar Cliente",
      message: `¿Estás seguro de que deseas eliminar al cliente "${customer.name}"? Esta acción no se puede deshacer.`,
      confirmText: "Eliminar",
      variant: "danger",
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
        setConfirmModal(null);
      }
    });
  };

  // Configuración de acciones por fila
  const getRowActions = (customer) => [
    {
      label: "Permisos",
      icon: Shield,
      variant: "outline",
      onClick: (c) => setPermissionsModal(c),
      title: "Gestionar permisos"
    },
    {
      label: customer.status ? "Deshabilitar" : "Habilitar",
      icon: Power,
      variant: customer.status ? "warning" : "success",
      onClick: handleToggleStatus,
      title: customer.status ? "Deshabilitar usuario" : "Habilitar usuario"
    },
    {
      label: "Eliminar",
      icon: Trash2,
      variant: "danger",
      onClick: handleDelete,
      title: "Eliminar usuario"
    }
  ];

  // Renderizado de filas
  const renderRow = (customer, index) => {
    return (
      <tr key={customer.id} className="border-t hover:bg-gray-50">
        <td className="px-3 py-2 text-nowrap">{customer.name}</td>
        <td className="px-3 py-2 text-nowrap">{customer.rut}</td>
        <td className="px-3 py-2">{customer.email}</td>
        <td className="px-3 py-2">{customer.company || "-"}</td>
        <td className="px-3 py-2 text-center">
          {customer.status ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Activo
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
              Inactivo
            </span>
          )}
        </td>
        <td className="px-3 py-2 text-center">
          <TableActions
            actions={getRowActions(customer)}
            item={customer}
            className="space-x-2"
          />
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
        <h2 className="text-3xl font-bold mb-2">
          Gestión de Clientes
        </h2>
        <p className="text-gray-600">
          Usuarios con perfil de cliente. Gestiona sus permisos de acceso a reportes, certificados y documentos.
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <GenericFilters
            searchPlaceholder="Buscar clientes..."
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
        emptyMessage="Aún no hay clientes registrados"
        emptyIcon={Search}
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
      {confirmModal && (
        <ConfirmModal
          open={true}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          variant={confirmModal.variant}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  );
}