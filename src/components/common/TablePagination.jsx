import React from "react";
import { Button } from "../ui/Button.jsx";

export default function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
  totalResults,
  searchQuery = "",
  perPage = 10,
  onPerPageChange,
}) {
  const maxVisiblePages = 5;

  // Función para generar las páginas visibles (como 1 2 3 ... 10)
  const getPageNumbers = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const end = Math.min(totalPages, start + maxVisiblePages - 1);
    const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

    if (start > 1) pages.unshift("...");
    if (end < totalPages) pages.push("...");

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mt-4 text-sm gap-3">
      {/* Información */}
      <span className="opacity-70 text-center sm:text-left">
        Página {currentPage} de {totalPages} • {totalResults} resultado
        {totalResults !== 1 ? "s" : ""}
        {searchQuery.trim() && ` • Filtrado por "${searchQuery}"`}
      </span>

      <div className="flex items-center gap-2">
        {/* Selector de registros por página */}
        {onPerPageChange && (
          <select
            value={perPage}
            onChange={(e) => onPerPageChange(Number(e.target.value))}
            className="border rounded-lg text-xs px-2 py-1 focus:ring-1"
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n} / pág.
              </option>
            ))}
          </select>
        )}

        {/* Navegación */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            ‹
          </Button>

          {pages.map((p, idx) =>
            p === "..." ? (
              <span key={idx} className="px-2 text-gray-400 select-none">
                ...
              </span>
            ) : (
              <Button
                key={idx}
                size="sm"
                variant={p === currentPage ? "primary" : "outline"}
                onClick={() => onPageChange(p)}
              >
                {p}
              </Button>
            )
          )}

          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            ›
          </Button>
        </div>
      </div>
    </div>
  );
}
