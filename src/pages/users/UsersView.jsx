// UsersView.jsx - Refactorizada
import React, { useState, useEffect } from "react";
import { Modal } from "../../components/ui/Modal.jsx";
import GenericFilters from "../../components/common/GenericFilters.jsx";
import GenericTable from "../../components/common/GenericTable.jsx";
import TableActions from "../../components/common/TableActions.jsx";
import { useTableLogic } from "../../hooks/useTableLogic.js";
import { useModals } from "../../hooks/useModals.js";
import { deleteUser, getUsers } from "../../services/userService.js";
import UserForm from "./components/UserForm.jsx";
import { handleSnackbar } from "../../utils/messageHelpers.js";
import {
  UserPlus,
  Pencil,
  Key,
  Trash2,
  Search
} from "lucide-react";

export default function UsersView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trigger, setTrigger] = useState(0);
  const [modalForm, setModalForm] = useState(null);

  // Configuración de la tabla
  const tableConfig = {
    defaultSort: "name",
    defaultSortDir: "asc",
    pageSize: 8,
    searchFields: [
      "name",
      "rut", 
      "email",
      "role_name",
      "company",
      "created_at"
    ]
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
  } = useTableLogic(users, tableConfig);

  const { modals, openConfirm, openNotify, closeModal } = useModals();

  // Cargar datos
  const fetchList = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      if (response.success) {
        setUsers(response.data || []);
      }
    } catch (error) {
      console.error("Error al obtener los usuarios:", error);
      handleSnackbar("Error al cargar los usuarios", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    setPage(1);
  }, [trigger]);

  // Configuración de columnas
  const columns = [
    { key: "name", label: "Nombre COMPLETO" },
    { key: "rut", label: "RUT" },
    { key: "email", label: "Correo" },
    { key: "role_name", label: "Perfil" },
    { key: "company", label: "Empresa" },
    { key: "created_at", label: "Fecha creación" },
    { key: "status", label: "Estado", sortable: false },
    { key: "actions", label: "Acciones", sortable: false, headerClassName: "text-center" }
  ];

  // Funciones de acciones
  const handleDelete = async (user) => {
    openConfirm({
      title: "Eliminar usuario",
      msg: `¿Seguro que deseas eliminar al usuario <b>${user.name}</b>?`,
      actionLabel: "Eliminar",
      variant: "danger",
      onConfirm: async () => {
        const response = await deleteUser(user.id);
        handleSnackbar(response.message, response.success ? 'success' : 'error');
        closeModal('confirm');
        if (response.success) {
          setTrigger(prev => prev + 1);
        }
      },
    });
  };

  const handleResetPassword = (user) => {
    openConfirm({
      title: "Restablecer contraseña",
      msg: `¿Seguro que deseas restablecer la contraseña de ${user.name}?`,
      actionLabel: "Restablecer",
      variant: "primary",
      onConfirm: () => {
        closeModal('confirm');
        openNotify({
          variant: "info",
          title: "Restablecer contraseña",
          msg: `Se envió un correo de restablecimiento a ${user.email}`,
        });
      },
    });
  };

  // Configuración de acciones por fila
  const getRowActions = () => [
    {
      label: "",
      icon: Pencil,
      variant: "outline",
      onClick: (user) => setModalForm({ mode: "edit", user }),
      title: "Editar usuario"
    },
    // {
    //   label: "Reset",
    //   icon: Key,
    //   variant: "outline",
    //   onClick: handleResetPassword,
    //   title: "Restablecer contraseña"
    // },
    {
      label: "",
      icon: Trash2,
      variant: "danger",
      onClick: handleDelete,
      title: "Eliminar usuario"
    }
  ];

  // Renderizado de filas
  const renderRow = (user, index) => {
    return (
      <tr key={user.id} className="border-t hover:bg-gray-50 text-[13px]">
        <td className="px-3 py-2">{user.name}</td>
        <td className="px-3 py-2">{user.rut}</td>
        <td className="px-3 py-2">{user.email}</td>
        <td className="px-3 py-2">{user.role_name}</td>
        <td className="px-3 py-2">{user.company}</td>
        <td className="px-3 py-2">{user.created_at}</td>
        <td className="px-3 py-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              user.status
                ? "bg-green-100 text-green-800 hover:bg-green-200"
                : "bg-red-100 text-red-800 hover:bg-red-200"
            }`}
          >
            {user.status ? 'Activo' : 'Inactivo'}
          </span>
        </td>
        <td className="px-3 py-2">
          <TableActions 
            actions={getRowActions()} 
            item={user}
            className="space-x-2" 
          />
        </td>
      </tr>
    );
  };

  // Función para manejar el cierre del modal con callback
  const handleModalClose = (shouldRefresh = false) => {
    setModalForm(null);
    if (shouldRefresh) {
      setTrigger(prev => prev + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold   mb-2">
          Usuarios
        </h2>
        <p className=" /70">
          Gestión de usuarios del sistema
        </p>
      </div>

      {/* Filtros */}
      <GenericFilters
        searchPlaceholder="Buscar usuarios..."
        searchValue={q}
        onSearchChange={setQ}
        resultsCount={filteredData.length}
        showAddButton={true}
        addButtonLabel="Agregar usuario"
        onAdd={() => setModalForm({ mode: "new" })}
      />

      {/* Tabla */}
      <GenericTable
        title="Usuarios registrados"
        loading={loading}
        columns={columns}
        data={filteredData}
        pageData={pageData}
        emptyMessage="Aún no hay usuarios registrados"
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

      {/* Modal formulario */}
      <Modal
        open={!!modalForm}
        onClose={() => handleModalClose(false)}
        title={
          modalForm?.mode === "edit" ? "Editar usuario" : "Agregar usuario"
        }
        actions={[]}
      >
        {modalForm && (
          <UserForm
            mode={modalForm.mode}
            register={modalForm.user}
            onClose={handleModalClose}
          />
        )}
      </Modal>

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