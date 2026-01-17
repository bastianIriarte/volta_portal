// ProfilesManagement.jsx - Refactorizada
import React, { useState, useEffect } from "react";
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
  Search,
  Grid3X3,
  Users
} from "lucide-react";
import { Button } from "../../components/ui/Button.jsx";

export default function ProfilesManagement() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trigger, setTrigger] = useState(0);
  const [modalForm, setModalForm] = useState(null);

  // Configuración de la tabla
  const tableConfig = {
    defaultSort: "profile",
    defaultSortDir: "asc",
    pageSize: 8,
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

  const { modals, openConfirm, closeModal } = useModals();

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
    { key: "profile", label: "Perfil" },
    { key: "description", label: "Descripción" },
    { key: "permissions_count", label: "Permisos", sortable: false },
    { key: "created_at", label: "Fecha creación" },
    { key: "status", label: "Estado", sortable: false },
    { key: "actions", label: "Acciones", sortable: false, headerClassName: "text-center" }
  ];

  // Funciones de acciones
  const handleDelete = async (profile) => {
    openConfirm({
      title: "Eliminar perfil",
      msg: `¿Seguro que deseas eliminar el perfil <b>${profile.profile}</b>?`,
      actionLabel: "Eliminar",
      variant: "danger",
      onConfirm: async () => {
        const response = await deleteProfile(profile.id);
        handleSnackbar(response.message, response.success ? 'success' : 'error');
        closeModal('confirm');
        if (response.success) {
          setTrigger(prev => prev + 1);
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
      title: "Editar perfil"
    },
    {
      label: "",
      icon: Trash2,
      variant: "danger",
      onClick: handleDelete,
      title: "Eliminar perfil"
    }
  ];

  // Renderizado de filas
  const renderRow = (profile) => {
    return (
      <tr key={profile.id} className="border-t hover:bg-gray-50 text-[13px]">
        <td className="px-3 py-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-purple-600" />
            </div>
            <span className="font-medium">{profile.profile}</span>
          </div>
        </td>
        <td className="px-3 py-2 text-gray-600 max-w-xs truncate">
          {profile.description || 'Sin descripción'}
        </td>
        <td className="px-3 py-2">
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs w-fit">
            <Users size={12} />
            {profile.permissions_count || 0} permisos
          </div>
        </td>
        <td className="px-3 py-2">{profile.created_at}</td>
        <td className="px-3 py-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              profile.status
                ? "bg-green-100 text-green-800 hover:bg-green-200"
                : "bg-red-100 text-red-800 hover:bg-red-200"
            }`}
          >
            {profile.status ? 'Activo' : 'Inactivo'}
          </span>
        </td>
        <td className="px-3 py-2">
          <TableActions
            actions={getRowActions()}
            item={profile}
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
        <h2 className="text-3xl font-bold mb-2">
          Perfiles
        </h2>
        <p className="/70">
          Gestión de perfiles y roles del sistema
        </p>
      </div>

      {/* Filtros */}
      <GenericFilters
        searchPlaceholder="Buscar perfiles..."
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
          Asignar Permisos
        </Button>
      </GenericFilters>

      {/* Tabla */}
      <GenericTable
        title="Perfiles registrados"
        loading={loading}
        columns={columns}
        data={filteredData}
        pageData={pageData}
        emptyMessage="Aún no hay perfiles registrados"
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
          modalForm?.mode === "edit" ? "Editar perfil" : "Nuevo perfil"
        }
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
