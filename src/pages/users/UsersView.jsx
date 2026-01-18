import { useState, useEffect } from "react";
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
  Users,
  Pencil,
  Key,
  Trash2,
  CheckCircle,
  XCircle
} from "lucide-react";

export default function UsersView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trigger, setTrigger] = useState(0);
  const [modalForm, setModalForm] = useState(null);

  const { modals, openConfirm, openNotify, closeModal } = useModals();

  // Configuración de la tabla
  const tableConfig = {
    defaultSort: "name",
    defaultSortDir: "asc",
    pageSize: 10,
    searchFields: [
      "name",
      "rut",
      "email",
      "role_name",
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
    { key: "id", label: "ID" },
    { key: "name", label: "Usuario" },
    { key: "rut", label: "RUT" },
    { key: "email", label: "Correo" },
    { key: "role_name", label: "Perfil" },
    { key: "created_at", label: "Fecha creación" },
    { key: "status", label: "Estado", sortable: false },
    { key: "actions", label: "Acciones", sortable: false, headerClassName: "text-center" }
  ];

  // Funciones de acciones
  const handleDelete = (user) => {
    openConfirm({
      title: "Eliminar Usuario",
      msg: (
        <div>
          <p>
            ¿Está seguro que desea eliminar al usuario <strong>{user.name}</strong>?
          </p>
          <p className="text-sm text-red-600 mt-2">
            Esta acción no se puede deshacer.
          </p>
        </div>
      ),
      actionLabel: "Eliminar",
      variant: "danger",
      onConfirm: async () => {
        const response = await deleteUser(user.id);
        handleSnackbar(response.message, response.success ? "success" : "error");
        closeModal("confirm");
        if (response.success) {
          setTrigger((prev) => prev + 1);
        }
      },
    });
  };

  const handleResetPassword = (user) => {
    openConfirm({
      title: "Restablecer Contraseña",
      msg: (
        <div>
          <p>
            ¿Está seguro que desea restablecer la contraseña de <strong>{user.name}</strong>?
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Se enviará un correo con las instrucciones de restablecimiento.
          </p>
        </div>
      ),
      actionLabel: "Restablecer",
      variant: "primary",
      onConfirm: () => {
        closeModal("confirm");
        openNotify({
          variant: "info",
          title: "Correo Enviado",
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
      title: "Editar usuario",
      className: "text-emerald-600 hover:text-emerald-900 hover:bg-emerald-50"
    },
    // {
    //   label: "",
    //   icon: Key,
    //   variant: "outline",
    //   onClick: handleResetPassword,
    //   title: "Restablecer contraseña",
    //   className: "text-amber-600 hover:text-amber-900 hover:bg-amber-50"
    // },
    {
      icon: Trash2,
      variant: "danger",
      onClick: handleDelete,
      title: "Eliminar"
    }
  ];

  // Renderizado de filas
  const renderRow = (user) => {
    return (
      <tr key={user.id} className="border-t hover:bg-gray-50">
        <td className="px-3 py-2 text-sm text-gray-500">{user.id}</td>
        <td className="px-3 py-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded flex items-center justify-center bg-sky-50">
              <Users className="h-4 w-4 text-sky-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">{user.name}</div>
              {user.username && (
                <div className="text-xs text-gray-500">
                  @{user.username}
                </div>
              )}
            </div>
          </div>
        </td>
        <td className="px-3 py-2">
          <span className="text-sm text-gray-500 font-mono">{user.rut || "-"}</span>
        </td>
        <td className="px-3 py-2">
          <span className="text-sm text-gray-600">{user.email || "-"}</span>
        </td>
        <td className="px-3 py-2">
          <span className="text-sm text-gray-600">{user.role_name || "-"}</span>
        </td>
        <td className="px-3 py-2">
          <span className="text-sm text-gray-500">{user.created_at || "-"}</span>
        </td>
        <td className="px-3 py-2">
          {user.status ? (
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
          <TableActions actions={getRowActions()} item={user} className="justify-center" />
        </td>
      </tr>
    );
  };

  // Función para manejar el cierre del modal con callback
  const handleModalClose = (shouldRefresh = false) => {
    setModalForm(null);
    if (shouldRefresh) {
      setTrigger((prev) => prev + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-bradford-navy mb-2">
          Gestión de Usuarios
        </h2>
        <p className="text-bradford-navy/70">
          Administra los usuarios del sistema y sus permisos de acceso
        </p>
      </div>

      {/* Filtros */}
      <GenericFilters
        searchPlaceholder="Buscar por nombre, RUT o correo..."
        searchValue={q}
        onSearchChange={setQ}
        resultsCount={filteredData.length}
        showAddButton={true}
        addButtonLabel="Nuevo Usuario"
        onAdd={() => setModalForm({ mode: "new" })}
      />

      {/* Tabla */}
      <GenericTable
        title="Usuarios registrados"
        loading={loading}
        columns={columns}
        data={filteredData}
        pageData={pageData}
        emptyMessage="No hay usuarios registrados"
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

      {/* Modal formulario */}
      <Modal
        open={!!modalForm}
        onClose={() => handleModalClose(false)}
        title={modalForm?.mode === "edit" ? "Editar Usuario" : "Nuevo Usuario"}
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
        onClose={() => closeModal("notify")}
        title={modals.notify?.title}
        variant={modals.notify?.variant || "info"}
        actions={[
          {
            label: "Cerrar",
            variant: "primary",
            onClick: () => closeModal("notify"),
          },
        ]}
      >
        {modals.notify?.msg}
      </Modal>

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
