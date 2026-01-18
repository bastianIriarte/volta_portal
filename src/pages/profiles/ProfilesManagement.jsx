import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "../../components/ui/Modal.jsx";
import GenericFilters from "../../components/common/GenericFilters.jsx";
import GenericTable from "../../components/common/GenericTable.jsx";
import TableActions from "../../components/common/TableActions.jsx";
import { useTableLogic } from "../../hooks/useTableLogic.js";
import { useModals } from "../../hooks/useModals.js";
import { deleteProfile, getProfiles } from "../../services/profileService.js";
import ProfileForm from "./components/ProfileForm.jsx";
import { handleSnackbar } from "../../utils/messageHelpers.js";
import {
  Shield,
  Pencil,
  Trash2,
  Grid3X3,
  Lock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Button } from "../../components/ui/Button.jsx";

export default function ProfilesManagement() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trigger, setTrigger] = useState(0);
  const [modalForm, setModalForm] = useState(null);

  const { modals, openConfirm, closeModal } = useModals();

  // Configuración de la tabla
  const tableConfig = {
    defaultSort: "profile",
    defaultSortDir: "asc",
    pageSize: 10,
    searchFields: [
      "profile",
      "code",
      "description",
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
  } = useTableLogic(profiles, tableConfig);

  // Cargar datos
  const fetchList = async () => {
    try {
      setLoading(true);
      const response = await getProfiles();
      if (response.success) {
        setProfiles(response.data || []);
      }
    } catch (error) {
      console.error("Error al obtener los perfiles:", error);
      handleSnackbar("Error al cargar los perfiles", "error");
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
    { key: "profile", label: "Perfil" },
    { key: "description", label: "Descripción" },
    { key: "permissions_count", label: "Permisos", sortable: false },
    { key: "created_at", label: "Fecha creación" },
    { key: "status", label: "Estado", sortable: false },
    { key: "actions", label: "Acciones", sortable: false, headerClassName: "text-center" }
  ];

  // Funciones de acciones
  const handleDelete = (profile) => {
    openConfirm({
      title: "Eliminar Perfil",
      msg: (
        <div>
          <p>
            ¿Está seguro que desea eliminar el perfil <strong>{profile.profile}</strong>?
          </p>
          <p className="text-sm text-red-600 mt-2">
            Esta acción no se puede deshacer. Los usuarios con este perfil podrían verse afectados.
          </p>
        </div>
      ),
      actionLabel: "Eliminar",
      variant: "danger",
      onConfirm: async () => {
        const response = await deleteProfile(profile.id);
        handleSnackbar(response.message, response.success ? "success" : "error");
        closeModal("confirm");
        if (response.success) {
          setTrigger((prev) => prev + 1);
        }
      },
    });
  };

  const handlePermissionsMatrix = () => {
    navigate("/dashboard/profiles-managment/permissions-matrix");
  };

  // Configuración de acciones por fila
  const getRowActions = () => [
    {
      label: "",
      icon: Pencil,
      variant: "outline",
      onClick: (profile) => setModalForm({ mode: "edit", profile }),
      title: "Editar perfil",
      className: "text-emerald-600 hover:text-emerald-900 hover:bg-emerald-50"
    },
    {
      icon: Trash2,
      variant: "danger",
      onClick: handleDelete,
      title: "Eliminar"
    }
  ];

  // Renderizado de filas
  const renderRow = (profile) => {
    return (
      <tr key={profile.id} className="border-t hover:bg-gray-50">
        <td className="px-3 py-2 text-sm text-gray-500">{profile.id}</td>
        <td className="px-3 py-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded flex items-center justify-center bg-purple-50">
              <Shield className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">{profile.profile}</div>
              {profile.code && (
                <div className="text-xs text-gray-500 font-mono">
                  {profile.code}
                </div>
              )}
            </div>
          </div>
        </td>
        <td className="px-3 py-2">
          <span className="text-sm text-gray-600 truncate max-w-xs block">
            {profile.description || "Sin descripción"}
          </span>
        </td>
        <td className="px-3 py-2">
          <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
            <Lock className="w-3 h-3" />
            {profile.permissions_count || 0} permisos
          </div>
        </td>
        <td className="px-3 py-2">
          <span className="text-sm text-gray-500">{profile.created_at || "-"}</span>
        </td>
        <td className="px-3 py-2">
          {profile.status ? (
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
          <TableActions actions={getRowActions()} item={profile} className="justify-center" />
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
          Gestión de Perfiles
        </h2>
        <p className="text-bradford-navy/70">
          Administra los perfiles y roles del sistema
        </p>
      </div>

      {/* Filtros */}
      <GenericFilters
        searchPlaceholder="Buscar por nombre o descripción..."
        searchValue={q}
        onSearchChange={setQ}
        resultsCount={filteredData.length}
        showAddButton={true}
        addButtonLabel="Nuevo Perfil"
        onAdd={() => setModalForm({ mode: "new" })}
      >
        <Button
          variant="outline"
          onClick={handlePermissionsMatrix}
          className="flex items-center gap-2"
        >
          <Grid3X3 size={18} />
          Matriz de Permisos
        </Button>
      </GenericFilters>

      {/* Tabla */}
      <GenericTable
        title="Perfiles registrados"
        loading={loading}
        columns={columns}
        data={filteredData}
        pageData={pageData}
        emptyMessage="No hay perfiles registrados"
        emptyIcon={Shield}
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
        title={modalForm?.mode === "edit" ? "Editar Perfil" : "Nuevo Perfil"}
        actions={[]}
      >
        {modalForm && (
          <ProfileForm
            mode={modalForm.mode}
            register={modalForm.profile}
            onClose={handleModalClose}
          />
        )}
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
