// components/UploadList.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, MoreVertical, Eye, XCircle, Trash2, RotateCcw, Upload } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { UPLOAD_TYPES, UPLOAD_STATUS } from '../../../utils/uploadConstants';
import GenericFilters from '../../../components/common/GenericFilters';
import GenericTable from '../../../components/common/GenericTable';
import { useTableLogic } from '../../../hooks/useTableLogic';
import TableActions from '../../../components/common/TableActions';
import * as LucideIcons from 'lucide-react';
export default function UploadList({
    uploads,
    loading,
    onNewUpload,
    onRefresh,
    onCancel,
    onDelete,
    onReprocess
}) {
    const navigate = useNavigate();

    const tableConfig = {
        defaultSort: "uploaded_at",
        defaultSortDir: "desc",
        pageSize: 10,
        searchFields: ["file_name", "original_name", "type", "uploaded_by.name"]
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
    } = useTableLogic(uploads, tableConfig);

    const columns = [
        { key: "file_name", label: "Archivo", sortable: true },
        { key: "type", label: "Tipo", sortable: true },
        { key: "uploaded_at", label: "Fecha", sortable: true },
        { key: "status", label: "Estado", sortable: true },
        { key: "stats", label: "Estadísticas", sortable: false },
        { key: "actions", label: "Acciones", sortable: false, headerClassName: "text-right" }
    ];

    const getRowActions = (upload) => {
        const actions = [
            {
                label: "Ver detalle",
                icon: Eye,
                variant: "outline",
                onClick: () => navigate(`/dashboard/load-data/${upload.id}`)
            }
        ];

        // Solo mostrar cancelar si está pendiente o en proceso
        if (['PENDING', 'PROCESSING', 'PENDING_CONFIRMATION'].includes(upload.status)) {
            actions.push({
                label: "Cancelar",
                icon: XCircle,
                variant: "outline",
                onClick: () => onCancel(upload)
            });
        }

        // Solo mostrar reprocesar si está en error o cancelado
        if (['ERROR', 'CANCELLED'].includes(upload.status)) {
            actions.push({
                label: "Reprocesar",
                icon: RotateCcw,
                variant: "outline",
                onClick: () => onReprocess(upload)
            });
        }

        // Solo permitir eliminar si NO está completado
        if (upload.status !== 'COMPLETED') {
            actions.push({
                label: "Eliminar",
                icon: Trash2,
                variant: "danger",
                onClick: () => onDelete(upload)
            });
        }

        return actions;
    };

      const getIcon = (iconName) => {
        if (!iconName) return LucideIcons.FileSpreadsheet;
        
        // Convertir el nombre del icono a PascalCase si viene en snake_case o kebab-case
        const iconKey = iconName
          .split(/[-_]/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join('');
        
        return LucideIcons[iconKey] || LucideIcons.FileSpreadsheet;
      };

    const renderRow = (upload) => {
        const typeInfo = upload.upload_type;
        const statusInfo = UPLOAD_STATUS[upload.status];
        const TypeIcon = getIcon(typeInfo.icon);;
        const StatusIcon = statusInfo?.icon;

        return (
            <tr
                key={upload.id}
                className="border-t hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => navigate(`/dashboard/load-data/${upload.id}`)}
            >
                <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                        {TypeIcon && (
                            <div className={`w-10 h-10 rounded-lg ${typeInfo.color_class} flex items-center justify-center`}>
                                <TypeIcon className="w-5 h-5" />
                            </div>
                        )}
                        <div>
                            <p className="font-medium text-sm">{upload.original_name || upload.file_name}</p>
                            <p className="text-xs text-gray-500">
                                {upload.uploaded_by?.name || upload.uploaded_by?.email || 'Usuario'}
                            </p>
                        </div>
                    </div>
                </td>
                <td className="px-3 py-3">
                    <span className="text-sm">{typeInfo?.label || upload.type}</span>
                </td>
                <td className="px-3 py-3">
                    <span className="text-sm text-gray-600">
                        {new Date(upload.uploaded_at || upload.created_at).toLocaleString('es-CL')}
                    </span>
                </td>
                <td className="px-3 py-3">
                    {statusInfo && (
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.colorClass}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusInfo.label}
                        </span>
                    )}
                </td>
                <td className="px-3 py-3">
                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-600">Total: {upload.total_rows || 0}</span>
                        <span>•</span>
                        <span className="text-emerald-600">✓ {upload.success_rows || 0}</span>
                        {upload.error_rows > 0 && (
                            <>
                                <span>•</span>
                                <span className="text-red-600">✗ {upload.error_rows}</span>
                            </>
                        )}
                    </div>
                </td>
                <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                    <TableActions
                        actions={getRowActions(upload)}
                        item={upload}
                    />
                </td>
            </tr>
        );
    };

    return (
        <div className="space-y-4">
            <GenericFilters
                searchPlaceholder="Buscar por nombre de archivo o usuario..."
                searchValue={q}
                onSearchChange={setQ}
                resultsCount={filteredData.length}
                showAddButton={true}
                addButtonLabel="Nueva carga"
                addButtonIcon={Upload}
                onAdd={onNewUpload}
            >
                <Button
                    onClick={onRefresh}
                    variant="outline"
                    icon={RefreshCw}
                    size="sm"
                >
                    Actualizar
                </Button>
            </GenericFilters>

            <GenericTable
                title="Historial de cargas"
                loading={loading}
                columns={columns}
                data={filteredData}
                pageData={pageData}
                emptyMessage="No hay cargas registradas"
                emptyIcon={Plus}
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
        </div>
    );
}