// components/common/GenericTable.jsx
import React from "react";
import { Card } from "../ui/Card.jsx";
import { Button } from "../ui/Button.jsx";
import SortableHeader from "./SortableHeader.jsx";
import TablePagination from "./TablePagination.jsx";

export default function GenericTable({
  title,
  loading = false,
  columns = [],
  data = [],
  pageData = [],
  emptyMessage = "No hay datos disponibles",
  emptyIcon: EmptyIcon,
  searchQuery = "",
  onClearSearch,
  // Ordenamiento
  sortBy,
  sortDir,
  onSort,
  // Paginación
  currentPage,
  totalPages,
  onPageChange,
  totalResults,
  // Acciones del header
  headerActions,
  // Renderizado personalizado de filas
  renderRow,
  // Clases personalizadas
  className = "",
  perPage=10
}) {
  const renderSkeletonRows = (count = 3) => {
    return [...Array(count)].map((_, i) => (
      <tr key={`skeleton-${i}`} className="border-t">
        <td colSpan={columns.length} className="py-3">
          <div className="h-4 bg-black/10 animate-pulse rounded w-full" />
        </td>
      </tr>
    ));
  };

  const renderEmptyState = () => (
    <tr>
      <td colSpan={columns.length} className="py-8 text-center">
        <div className="flex flex-col items-center gap-2 opacity-60">
          {EmptyIcon && <EmptyIcon className="w-8 h-8" />}
          <p>
            {searchQuery.trim()
              ? `No se encontraron resultados para "${searchQuery}"`
              : emptyMessage
            }
          </p>
          {searchQuery.trim() && onClearSearch && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearSearch}
            >
              Limpiar búsqueda
            </Button>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <Card title={title} className={className}>
      {/* Acciones del header */}
      {headerActions && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-4">
          {headerActions}
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-left text-xs uppercase tracking-wide text-gray-600">
            <tr>
              {columns.map((column) => (
                <SortableHeader
                  key={column.key}
                  field={column.key}
                  label={column.label}
                  sortBy={sortBy}
                  sortDir={sortDir}
                  onSort={onSort}
                  sortable={column.sortable !== false}
                  className={column.headerClassName}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && renderSkeletonRows()}
            
            {!loading && pageData.length > 0 && pageData.map((item, index) => 
              renderRow ? renderRow(item, index) : null
            )}
            
            {!loading && pageData.length === 0 && renderEmptyState()}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {!loading && data.length > 0 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          totalResults={totalResults}
          searchQuery={searchQuery}
          perPage={perPage}
        />
      )}
    </Card>
  );
}