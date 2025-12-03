// hooks/useServerPagination.js
import { useState, useEffect, useCallback } from "react";

/**
 * Hook para manejar paginación del lado del servidor
 * @param {Function} fetchFunction - Función que llama al API (debe aceptar params)
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Estado y funciones para manejar la paginación
 */
export function useServerPagination(fetchFunction, options = {}) {
  const {
    defaultSort = "id",
    defaultSortDir = "asc",
    pageSize = 10,
    autoFetch = true,
  } = options;

  // Estados
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Parámetros de paginación
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);

  // Parámetros de búsqueda y ordenamiento
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState(""); // La búsqueda que se envía al servidor
  const [sortBy, setSortBy] = useState(defaultSort);
  const [sortDir, setSortDir] = useState(defaultSortDir);

  // Función para ejecutar búsqueda manualmente
  const executeSearch = () => {
    // Solo buscar si hay 3 o más caracteres, o si está vacío (para limpiar)
    if (search.trim().length >= 3 || search.trim().length === 0) {
      setActiveSearch(search.trim());
      setPage(1);
    }
  };

  // Función para cargar datos
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        per_page: currentPageSize,
        search: activeSearch,
        sort_by: sortBy,
        sort_dir: sortDir,
      };

      const response = await fetchFunction(params);

      if (response.success) {
        const responseData = response.data;

        setData(responseData.items || []);
        setTotalPages(responseData.total_pages || 1);
        setTotalItems(responseData.total_items || 0);
        setCurrentPageSize(responseData.per_page || pageSize);
      } else {
        setError(response.message || "Error al cargar los datos");
        setData([]);
      }
    } catch (err) {
      console.error("Error en fetchData:", err);
      setError("Error al cargar los datos");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [page, currentPageSize, activeSearch, sortBy, sortDir, fetchFunction, pageSize]);

  // Auto-fetch cuando cambian los parámetros
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch]);

  // Handler para ordenamiento
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
    setPage(1); // Resetear a página 1 cuando se ordena
  };

  // Handler para cambio de página
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Función para refrescar datos
  const refresh = () => {
    fetchData();
  };

  return {
    // Datos
    data,
    loading,
    error,

    // Paginación
    page,
    totalPages,
    totalItems,
    pageSize: currentPageSize,
    setPage: handlePageChange,

    // Búsqueda
    search,
    setSearch,
    activeSearch,
    executeSearch,

    // Ordenamiento
    sortBy,
    sortDir,
    handleSort,

    // Utilidades
    refresh,
    fetchData,
  };
}
