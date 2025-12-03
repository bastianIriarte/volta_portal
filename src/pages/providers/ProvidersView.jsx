import React, { useState, useEffect } from "react";
import { Modal } from "../../components/ui/Modal.jsx";
import GenericFilters from "../../components/common/GenericFilters.jsx";
import GenericTable from "../../components/common/GenericTable.jsx";
import TableActions from "../../components/common/TableActions.jsx";
import { useTableLogic } from "../../hooks/useTableLogic.js";
import { useModals } from "../../hooks/useModals.js";
import { deleteProvider, getProviders } from "../../services/providersService.js";
import SupplierForm from "./components/ProviderForm.jsx";
import ExcelImport from "./components/ExcelImport.jsx";
import { handleSnackbar } from "../../utils/messageHelpers.js";
import {
  UserPlus,
  Pencil,
  Key,
  Trash2,
  Search,
  FileSpreadsheet,
  CheckCircle
} from "lucide-react";
import { Button } from "../../components/ui/Button.jsx";

export default function ProvidersView() {
  const [registers, setRegisters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trigger, setTrigger] = useState(0);
  const [modalForm, setModalForm] = useState(null);
  const [showExcelImport, setShowExcelImport] = useState(false);

  // Configuración de la tabla
  const tableConfig = {
    defaultSort: "first_name",
    defaultSortDir: "asc",
    pageSize: 8,
    searchFields: [
      "first_name",
      "second_name",
      "last_name",
      "second_last_name",
      "rut_formatted",
      "email",
      "mobile",
      "username"
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
  } = useTableLogic(registers, tableConfig);

  const { modals, openConfirm, openNotify, closeModal } = useModals();

  // Cargar datos
  const fetchList = async () => {
    try {
      setLoading(true);
      const response = await getProviders();
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

  useEffect(() => {
    fetchList();
    setPage(1);
  }, [trigger]);

  // Configuración de columnas
  const columns = [
    { key: "first_name", label: "Nombre completo" },
    { key: "rut_formatted", label: "RUT" },
    { key: "email", label: "Correo" },
    { key: "phones", label: "Celular", sortable: false },
    { key: "username", label: "Usuario", sortable: false },
    { key: "status", label: "Estado", sortable: false },
    { key: "actions", label: "Acciones", sortable: false, headerClassName: "text-center" }
  ];

  // Funciones de acciones
  const handleDelete = async (parent) => {
    const fullName = `${parent.first_name ?? ""} ${parent.second_name ?? ""} ${parent.last_name ?? ""} ${parent.second_last_name ?? ""}`.trim();

    openConfirm({
      title: "Eliminar proveedor",
      msg: `¿Seguro que deseas eliminar al proveedor <b>${fullName}</b>?`,
      actionLabel: "Eliminar",
      variant: "danger",
      onConfirm: async () => {
        const response = await deleteProvider(parent.id);
        handleSnackbar(response.message, response.success ? 'success' : 'error');
        closeModal('confirm');
        if (response.success) {
          setTrigger(prev => prev + 1);
        }
      },
    });
  };

  const handleResetPassword = (parent) => {
    const fullName = `${parent.first_name ?? ""} ${parent.second_name ?? ""} ${parent.last_name ?? ""} ${parent.second_last_name ?? ""}`.trim();

    openConfirm({
      title: "Restablecer contraseña",
      msg: `¿Seguro que deseas restablecer la contraseña de ${fullName}?`,
      actionLabel: "Restablecer",
      variant: "primary",
      onConfirm: () => {
        closeModal('confirm');
        openNotify({
          variant: "info",
          title: "Restablecer contraseña",
          msg: `Se envió un correo de restablecimiento a ${parent.email}`,
        });
      },
    });
  };

  // Configuración de acciones por fila
  const getRowActions = () => [
    {
      label: "Editar",
      icon: Pencil,
      variant: "outline",
      onClick: (parent) => setModalForm({ mode: "edit", register: parent }),
      title: "Editar proveedor"
    },
    // {
    //   label: "Reset",
    //   icon: Key,
    //   variant: "outline",
    //   onClick: handleResetPassword,
    //   title: "Restablecer contraseña"
    // },
    {
      label: "Eliminar",
      icon: Trash2,
      variant: "danger",
      onClick: handleDelete,
      title: "Eliminar proveedor"
    }
  ];

  // Renderizado de filas
  const renderRow = (parent, index) => {
    const fullName = `${parent.first_name ?? ""} ${parent.second_name ?? ""} ${parent.last_name ?? ""} ${parent.second_last_name ?? ""}`.trim();
    const phones = [parent.mobile, parent.home_phone, parent.work_phone].filter(Boolean).join(" / ");
    const location = [
      parent.commune?.commune,
      parent.region?.region,
      parent.country?.name,
    ].filter(Boolean).join(", ");

    return (
      <tr key={parent.id} className="border-t hover:bg-gray-50">
        <td className="px-3 py-2 text-nowrap">{fullName}</td>
        <td className="px-3 py-2 text-nowrap">{parent.rut_formatted}</td>
        <td className="px-3 py-2">{parent.email}</td>
        <td className="px-3 py-2">{phones || "-"}</td>
        <td className="px-3 py-2 text-nowrap">{parent.username}</td>
        <td className="px-3 py-2 text-center">
          {parent.status ? (
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
            actions={getRowActions()}
            item={parent}
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

  // Manejar éxito de importación Excel
  const handleExcelImportSuccess = () => {
    setTrigger(prev => prev + 1);
    setShowExcelImport(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold   mb-2">
          Gestión de Proveedores Portal
        </h2>
        <p className=" /70">
          Listado de proveedores registrados en portal
        </p>
      </div>

      {/* Importación masiva Excel */}
      {showExcelImport && (
        <ExcelImport
          showExcelImport={showExcelImport}
          setShowExcelImport={setShowExcelImport}
          onImportSuccess={handleExcelImportSuccess}
        />
      )}

      {/* Filtros con botones personalizados */}
      <GenericFilters
        searchPlaceholder="Buscar proveedores..."
        searchValue={q}
        onSearchChange={setQ}
        resultsCount={filteredData.length}
        showAddButton={!showExcelImport}
        addButtonLabel="Agregar proveedor"
        onAdd={() => setModalForm({ mode: "new" })}
      >
        {/* Botón de Excel como filtro personalizado */}
        {/* {!showExcelImport && (
          <Button
            onClick={() => setShowExcelImport(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg hover: transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Importar Excel
          </Button>
        )} */}
      </GenericFilters>

      {/* Tabla */}
      <GenericTable
        title="Proveedores registrados"
        loading={loading}
        columns={columns}
        data={filteredData}
        pageData={pageData}
        emptyMessage="Aún no hay proveedores registrados"
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
          modalForm?.mode === "edit" ? "Editar proveedor" : "Agregar proveedor"
        }
        size="lg"
        actions={[]}
      >
        {modalForm && (
          <SupplierForm
            mode={modalForm.mode}
            register={modalForm.register}
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