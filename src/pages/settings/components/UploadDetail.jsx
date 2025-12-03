// components/UploadDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Pencil, Save, X, AlertCircle, CheckCircle, Loader2, Trash2,
  DownloadIcon
} from 'lucide-react';
import { UPLOAD_TYPES, UPLOAD_STATUS, LINE_STATUS } from '../../../utils/uploadConstants';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import GenericFilters from '../../../components/common/GenericFilters';
import GenericTable from '../../../components/common/GenericTable';
import TableActions from '../../../components/common/TableActions';
import { useTableLogic } from '../../../hooks/useTableLogic';
import { useModals } from '../../../hooks/useModals';
import { Modal } from '../../../components/ui/Modal';
import { getUploadById, deleteLine, bulkDeleteLines } from '../../../services/excelUploadService';
import { handleSnackbar } from '../../../utils/messageHelpers';
import * as LucideIcons from 'lucide-react';
export default function UploadDetail({ onUpdateLine, onConfirmUpload }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [upload, setUpload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingLine, setEditingLine] = useState(null);
  const [filterValue, setFilterValue] = useState('all');
  const [confirming, setConfirming] = useState(false);

  // Estados para eliminación
  const [selectedLines, setSelectedLines] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [deletingLine, setDeletingLine] = useState(null);
  const [processingDelete, setProcessingDelete] = useState(false);

  const { modals, openConfirm, closeModal } = useModals();

  // Cargar detalle del upload
  useEffect(() => {
    fetchUploadDetail();
  }, [id]);

  const fetchUploadDetail = async () => {
    setLoading(true);
    try {
      const response = await getUploadById(id);

      if (response.success) {
        setUpload(response.data);
      } else {
        handleSnackbar(response.message || 'Error al cargar el detalle', 'error');
        navigate('/dashboard/load-data');
      }
    } catch (error) {
      console.error('Error loading upload detail:', error);
      handleSnackbar('Error al cargar el detalle de la carga', 'error');
      navigate('/dashboard/load-data');
    } finally {
      setLoading(false);
    }
  };

  // Enriquecer líneas con campos buscables
  const enrichedLines = React.useMemo(() => {
    if (!upload?.lines) return [];

    return upload.lines.map(line => ({
      ...line,
      statusLabel: LINE_STATUS[line.status]?.label || '',
      dataSearchable: Object.values(line.data || {}).join(' '),
      errorWarning: [line.error_message, line.warning_message].filter(Boolean).join(' ')
    }));
  }, [upload]);

  // Configuración de la tabla
  const tableConfig = {
    defaultSort: "line_number",
    defaultSortDir: "asc",
    pageSize: 30,
    searchFields: [
      "dataSearchable",
      "statusLabel",
      "errorWarning"
    ],
    filterField: "status"
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
    handleSort,
    setFilterValue: setTableFilter
  } = useTableLogic(enrichedLines, tableConfig);

  // Sincronizar filtro externo con el hook
  useEffect(() => {
    setTableFilter(filterValue);
  }, [filterValue, setTableFilter]);

  const typeInfo = upload ? upload.upload_type : null;
  const statusInfo = upload ? UPLOAD_STATUS[upload.status] : null;

  const downloadExcel = async () => {
    try {
      if (!upload?.id) {
        handleSnackbar("No se encontró el ID de la carga.", "warning");
        return;
      }
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      const downloadUrl = `${baseURL}/api/excel-uploads/${upload.id}/download-all`;

      handleSnackbar("Generando Excel...", "info");

      // Abre la descarga en una nueva pestaña
      window.open(downloadUrl, "_blank");
    } catch (error) {
      console.error("Error al generar Excel:", error);
      handleSnackbar("Error al generar el Excel", "error");
    }
  };


  // Manejar selección de todas las líneas
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLines(pageData.map(line => line.line_number));
    } else {
      setSelectedLines([]);
    }
  };
  // Obtener columnas dinámicas
  const getColumns = () => {
    if (!upload?.lines?.[0]?.data) return [];

    const dataKeys = Object.keys(upload.lines[0].data);

    return [
      // Checkbox para selección múltiple
      {
        key: "select",
        label: (
          <input
            type="checkbox"
            checked={selectedLines.length === pageData.length && pageData.length > 0}
            onChange={handleSelectAll}
            className="rounded border-gray-300"
          />
        ),
        sortable: false,
        width: "40px"
      },
      { key: "line_number", label: "Línea", sortable: true },
      ...dataKeys.map(key => ({
        key: `data.${key}`,
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
        sortable: false
      })),
      { key: "status", label: "Estado", sortable: false },
      { key: "message", label: "Mensaje", sortable: false },
      { key: "actions", label: "Acciones", sortable: false, headerClassName: "text-right" }
    ];
  };

  const columns = getColumns();



  // Manejar selección individual
  const handleSelectLine = (lineNumber) => {
    setSelectedLines(prev => {
      if (prev.includes(lineNumber)) {
        return prev.filter(num => num !== lineNumber);
      } else {
        return [...prev, lineNumber];
      }
    });
  };

  // Manejar guardado de línea
  const handleSaveLine = async (lineNumber, newData) => {
    try {
      await onUpdateLine(upload.id, lineNumber, newData);
      setEditingLine(null);
      await fetchUploadDetail();
    } catch (error) {
      console.error('Error saving line:', error);
      handleSnackbar('Error al guardar la línea', 'error');
    }
  };

  // Abrir modal de eliminar línea individual
  const handleDeleteLine = (line) => {
    setDeletingLine(line);
    setShowDeleteModal(true);
  };

  // Confirmar eliminación de línea individual
  const confirmDeleteLine = async () => {
    if (!deletingLine) return;

    setProcessingDelete(true);
    try {
      const response = await deleteLine(upload.id, deletingLine.line_number);

      if (response.success) {
        handleSnackbar('Línea eliminada correctamente', 'success');
        setShowDeleteModal(false);
        setDeletingLine(null);
        await fetchUploadDetail();
      } else {
        handleSnackbar(response.message || 'Error al eliminar la línea', 'error');
      }
    } catch (error) {
      console.error('Error deleting line:', error);
      handleSnackbar('Error al eliminar la línea', 'error');
    } finally {
      setProcessingDelete(false);
    }
  };

  // Abrir modal de eliminación masiva
  const handleBulkDelete = () => {
    if (selectedLines.length === 0) {
      handleSnackbar('Selecciona al menos una línea para eliminar', 'warning');
      return;
    }
    setShowBulkDeleteModal(true);
  };

  // Confirmar eliminación masiva
  const confirmBulkDelete = async () => {
    setProcessingDelete(true);
    try {
      const response = await bulkDeleteLines(upload.id, selectedLines);

      if (response.success) {
        handleSnackbar(
          `${response.data?.deleted || selectedLines.length} líneas eliminadas correctamente`,
          'success'
        );
        setShowBulkDeleteModal(false);
        setSelectedLines([]);
        await fetchUploadDetail();
      } else {
        handleSnackbar(response.message || 'Error al eliminar las líneas', 'error');
      }
    } catch (error) {
      console.error('Error deleting lines:', error);
      handleSnackbar('Error al eliminar las líneas', 'error');
    } finally {
      setProcessingDelete(false);
    }
  };

  // Manejar confirmación de carga
  const handleConfirmUpload = async () => {
    setConfirming(true);
    try {
      await onConfirmUpload(upload.id);
      closeModal('confirm');
    } catch (error) {
      console.error('Error confirming upload:', error);
      setConfirming(false);
    }
  };

  // Abrir modal de confirmación
  const showConfirmModal = () => {
    openConfirm({
      title: "Confirmar carga de datos",
      msg: renderConfirmContent(),
      actionLabel: "Sí, confirmar carga",
      variant: "success",
      onConfirm: handleConfirmUpload,
      size: "lg"
    });
  };

  // Contenido del modal de confirmación
  const renderConfirmContent = () => {
    return `
      <div class="space-y-4">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p class="text-sm text-blue-800 mb-3">
            Al confirmar esta carga se realizarán las siguientes acciones:
          </p>
          <ul class="text-sm text-blue-700 space-y-2">
            <li class="flex items-start gap-2">
              <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Se crearán o actualizarán <strong>${upload.success_rows} registros</strong></span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Los cambios se aplicarán de forma permanente en el sistema</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>El estado de la carga cambiará a "Completado"</span>
            </li>
          </ul>
        </div>

        ${upload.warning_rows > 0 ? `
          <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div class="flex items-start gap-2">
              <svg class="w-4 h-4 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <div>
                <p class="text-sm font-medium text-amber-800">
                  Hay ${upload.warning_rows} registros con advertencias
                </p>
                <p class="text-xs text-amber-700 mt-1">
                  Estos registros se procesarán, pero revisa que la información sea correcta
                </p>
              </div>
            </div>
          </div>
        ` : ''}

        <div class="text-sm text-gray-600">
          ¿Estás seguro de que deseas confirmar esta carga?
        </div>
      </div>
    `;
  };

  // Acciones por fila
  const getRowActions = (line) => {
    const isEditing = editingLine?.line_number === line.line_number;

    const actions = [];

    // Solo mostrar editar/guardar/cancelar si es editable
    if (line.editable) {
      if (isEditing) {
        actions.push(
          {
            label: "Guardar",
            icon: Save,
            variant: "success",
            onClick: () => handleSaveLine(line.line_number, editingLine.data),
            title: "Guardar cambios"
          },
          {
            label: "Cancelar",
            icon: X,
            variant: "outline",
            onClick: () => setEditingLine(null),
            title: "Cancelar edición"
          }
        );
      } else {
        actions.push({
          label: "Editar",
          icon: Pencil,
          variant: "outline",
          onClick: () => setEditingLine({ ...line, data: { ...line.data } }),
          title: "Editar línea"
        });
      }
    }

    // Siempre mostrar eliminar si la carga está pendiente de confirmación
    if (upload.status === 'PENDING_CONFIRMATION' && !isEditing) {
      actions.push({
        label: "Eliminar",
        icon: Trash2,
        variant: "danger",
        onClick: () => handleDeleteLine(line),
        title: "Eliminar línea"
      });
    }

    return actions;
  };

  // Renderizar estado de línea
  const renderLineStatus = (line) => {
    const lineStatusInfo = LINE_STATUS[line.status];
    if (!lineStatusInfo) return null;

    const StatusIcon = lineStatusInfo.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${lineStatusInfo.colorClass}`}>
        <StatusIcon className="w-3 h-3" />
        {lineStatusInfo.label}
      </span>
    );
  };

  // Renderizar mensaje de error/warning
  const renderMessage = (line) => {
    if (line.error_message) {
      return <span className="text-red-600 text-xs">{line.error_message}</span>;
    }
    if (line.warning_message) {
      return <span className="text-amber-600 text-xs">{line.warning_message}</span>;
    }
    return <span className="text-gray-400 text-xs">-</span>;
  };

  // Renderizar fila
  const renderRow = (line) => {
    const isEditing = editingLine?.line_number === line.line_number;
    const dataKeys = Object.keys(line.data || {});
    const isSelected = selectedLines.includes(line.line_number);

    return (
      <tr
        key={line.line_number}
        className={`border-t transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
      >
        {/* Checkbox de selección */}
        <td className="px-3 py-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => handleSelectLine(line.line_number)}
            className="rounded border-gray-300"
            disabled={upload.status !== 'PENDING_CONFIRMATION'}
          />
        </td>

        {/* Número de línea */}
        <td className="px-3 py-2 text-sm font-medium">{line.line_number}</td>

        {/* Datos del Excel */}
        {dataKeys.map(key => (
          <td key={key} className="px-3 py-2 text-sm">
            {isEditing ? (
              <input
                type="text"
                defaultValue={line.data[key]}
                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none  text-sm"
                onChange={(e) => {
                  editingLine.data[key] = e.target.value;
                }}
              />
            ) : (
              <span className="block max-w-xs truncate" title={line.data[key]}>
                {line.data[key] || '-'}
              </span>
            )}
          </td>
        ))}

        {/* Estado */}
        <td className="px-3 py-2">{renderLineStatus(line)}</td>

        {/* Mensaje */}
        <td className="px-3 py-2 text-sm max-w-xs">
          <div title={line.error_message || line.warning_message}>
            {renderMessage(line)}
          </div>
        </td>

        {/* Acciones */}
        <td className="px-3 py-2">
          <TableActions
            actions={getRowActions(line)}
            item={line}
            className="space-x-2"
          />
        </td>
      </tr>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <Button
          onClick={() => navigate('/dashboard/load-data')}
          variant="ghost"
          icon={ArrowLeft}
        >
          Volver al listado
        </Button>
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12   animate-spin" />
            <p className="text-gray-600">Cargando detalle...</p>
          </div>
        </Card>
      </div>
    );
  }

  // Error state
  if (!upload || !statusInfo) {
    return (
      <div className="space-y-4">
        <Button
          onClick={() => navigate('/dashboard/load-data')}
          variant="ghost"
          icon={ArrowLeft}
        >
          Volver al listado
        </Button>
        <Card className="p-6">
          <div className="flex items-center gap-3 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <p>Error: Carga no encontrada</p>
          </div>
        </Card>
      </div>
    );
  }

  const getIcon = (iconName) => {
    if (!iconName) return LucideIcons.FileSpreadsheet;

    // Convertir el nombre del icono a PascalCase si viene en snake_case o kebab-case
    const iconKey = iconName
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

    return LucideIcons[iconKey] || LucideIcons.FileSpreadsheet;
  };

  const TypeIcon = getIcon(typeInfo.icon);
  const StatusIcon = statusInfo.icon;
  const canConfirm = upload.status === 'PENDING_CONFIRMATION' && upload.error_rows === 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        {/* Botón volver */}
        <Button
          onClick={() => navigate('/dashboard/load-data')}
          variant="ghost"
          icon={ArrowLeft}
        >
          Volver al listado
        </Button>
        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${statusInfo.colorClass}`}>
          <StatusIcon className="w-4 h-4" />
          {statusInfo.label}
        </span>
      </div>

      {/* Alerta de confirmación */}
      {upload.status === 'PENDING_CONFIRMATION' && (
        <Card className={`p-4 ${upload.error_rows > 0 ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>


          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className={`w-5 h-5 ${upload.error_rows > 0 ? 'text-red-600' : 'text-blue-600'}`} />
              <div>
                {upload.error_rows > 0 ? (
                  <>
                    <p className="font-medium text-red-800">
                      Hay {upload.error_rows} registros con errores
                    </p>
                    <p className="text-sm text-red-700">
                      Debes corregir todos los errores antes de confirmar la carga
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-blue-800">
                      Carga lista para confirmar
                    </p>
                    <p className="text-sm text-blue-700">
                      Al confirmar, se crearán o actualizarán {upload.success_rows} registros
                    </p>
                  </>
                )}
              </div>
            </div>
            {canConfirm && (
              <Button
                onClick={showConfirmModal}
                variant="success"
                icon={CheckCircle}
              >
                Confirmar carga
              </Button>
            )}


          </div>
        </Card>
      )}

      {/* Header con información de la carga */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl ${typeInfo.color_class} flex items-center justify-center`}>
              <TypeIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-1">
                {upload.original_name || upload.file_name}
              </h3>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span>{typeInfo.label}</span>
                <span>•</span>
                <span>{new Date(upload.created_at).toLocaleString('es-CL')}</span>
                <span>•</span>
                <span>{upload.uploaded_by?.name || upload.uploaded_by?.email || 'Usuario'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total</p>
            <p className="text-2xl font-bold  ">{upload.total_rows || 0}</p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <p className="text-sm text-emerald-600 mb-1">Exitosos</p>
            <p className="text-2xl font-bold text-emerald-600">{upload.success_rows || 0}</p>
          </div>
          {upload.error_rows >= 0 && (
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <p className="text-sm text-red-600 mb-1">Errores</p>
              <p className="text-2xl font-bold text-red-600">{upload.error_rows}</p>
            </div>
          )}
          {upload.warning_rows >= 0 && (
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <p className="text-sm text-amber-600 mb-1">Advertencias</p>
              <p className="text-2xl font-bold text-amber-600">{upload.warning_rows}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Filtros con botón de eliminación masiva */}
      <GenericFilters
        searchPlaceholder="Buscar en los datos, mensajes o estado..."
        searchValue={q}
        onSearchChange={setQ}
        resultsCount={filteredData.length}
        showAddButton={false}
        pageSize={tableConfig.pageSize}
      >
        {selectedLines.length > 0 && upload.status === 'PENDING_CONFIRMATION' && (
          <Button
            onClick={handleBulkDelete}
            variant="danger"
            icon={Trash2}
            size="sm"
          >
            Eliminar {selectedLines.length} seleccionadas
          </Button>
        )}

        <select
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none text-sm"
        >
          <option value="all">Todos los estados</option>
          {Object.entries(LINE_STATUS).map(([key, status]) => (
            <option key={key} value={key}>{status.label}</option>
          ))}
        </select>
      </GenericFilters>
      <div className="flex items-center justify-end mt-4">
        <Button
          onClick={downloadExcel}
          variant="success"
          icon={DownloadIcon}
        >
          Descargar Excel
        </Button>
      </div>
      {/* Tabla de líneas */}
      <GenericTable
        title="Detalle de registros"
        loading={false}
        columns={columns}
        data={filteredData}
        pageData={pageData}
        emptyMessage="No se encontraron resultados"
        emptyIcon={AlertCircle}
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

      {/* Modal de confirmación de carga */}
      <Modal
        open={!!modals.confirm}
        onClose={() => !confirming && closeModal('confirm')}
        title={modals.confirm?.title}
        variant="success"
        isHtml={true}
        size="lg"
        actions={[
          {
            label: "Cancelar",
            variant: "outline",
            onClick: () => closeModal('confirm'),
            disabled: confirming
          },
          {
            label: confirming ? "Confirmando..." : modals.confirm?.actionLabel || "Confirmar",
            variant: "success",
            onClick: modals.confirm?.onConfirm,
            loading: confirming,
            icon: confirming ? Loader2 : CheckCircle,
            autofocus: true,
            disabled: confirming
          }
        ]}
      >
        {modals.confirm?.msg}
      </Modal>

      {/* Modal de eliminar línea individual */}
      <Modal
        open={showDeleteModal}
        onClose={() => !processingDelete && setShowDeleteModal(false)}
        title="Eliminar línea"
        variant="danger"
        size="default"
        actions={[
          {
            label: "Cancelar",
            variant: "outline",
            onClick: () => setShowDeleteModal(false),
            disabled: processingDelete
          },
          {
            label: processingDelete ? "Eliminando..." : "Sí, eliminar línea",
            variant: "danger",
            onClick: confirmDeleteLine,
            disabled: processingDelete,
            loading: processingDelete
          }
        ]}
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            ¿Estás seguro de que deseas eliminar la línea{' '}
            <strong>#{deletingLine?.line_number}</strong>?
          </p>

          {/* Mostrar datos de la línea */}
          {deletingLine?.data && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-800 mb-2">Datos de la línea:</p>
              <div className="space-y-1 text-sm text-gray-700">
                {Object.entries(deletingLine.data).slice(0, 3).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="font-medium">{key}:</span>
                    <span className="truncate ml-2 max-w-xs">{value || '-'}</span>
                  </div>
                ))}
                {Object.keys(deletingLine.data).length > 3 && (
                  <p className="text-xs text-gray-500 pt-1">
                    ... y {Object.keys(deletingLine.data).length - 3} campos más
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-800">¡Advertencia!</p>
                <p className="text-sm text-red-700 mt-1">
                  Esta acción eliminará permanentemente esta línea del proceso de carga.
                  Los contadores se actualizarán automáticamente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal de eliminación masiva */}
      <Modal
        open={showBulkDeleteModal}
        onClose={() => !processingDelete && setShowBulkDeleteModal(false)}
        title="Eliminar líneas seleccionadas"
        variant="danger"
        size="default"
        actions={[
          {
            label: "Cancelar",
            variant: "outline",
            onClick: () => setShowBulkDeleteModal(false),
            disabled: processingDelete
          },
          {
            label: processingDelete ? "Eliminando..." : `Sí, eliminar ${selectedLines.length} líneas`,
            variant: "danger",
            onClick: confirmBulkDelete,
            disabled: processingDelete,
            loading: processingDelete
          }
        ]}
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            ¿Estás seguro de que deseas eliminar{' '}
            <strong>{selectedLines.length} líneas seleccionadas</strong>?
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-800 mb-2">
              Líneas que serán eliminadas:
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedLines.slice(0, 20).map(lineNum => (
                <span
                  key={lineNum}
                  className="inline-flex items-center px-2 py-1 rounded bg-gray-200 text-xs font-medium text-gray-700"
                >
                  #{lineNum}
                </span>
              ))}
              {selectedLines.length > 20 && (
                <span className="inline-flex items-center px-2 py-1 rounded bg-gray-300 text-xs font-medium text-gray-700">
                  +{selectedLines.length - 20} más
                </span>
              )}
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-800">¡Advertencia!</p>
                <p className="text-sm text-red-700 mt-1">
                  Esta acción eliminará permanentemente todas las líneas seleccionadas.
                  Los contadores y estadísticas se actualizarán automáticamente.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Si solo quieres corregir datos, usa la opción de editar
              en lugar de eliminar la línea completa.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}