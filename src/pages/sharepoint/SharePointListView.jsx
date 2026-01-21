import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Database,
  Search,
  RefreshCw,
  Settings,
  Download,
  Filter,
  X,
  Loader2,
  AlertCircle,
  ChevronDown,
  Calendar,
} from "lucide-react";
import { handleSnackbar } from "../../utils/messageHelpers";
import {
  getSharepointLists,
  getSharepointListConfig,
  getLists,
  getListItems,
} from "../../services/microsoftGraphService";

// Columnas por defecto (fallback si no hay configuración)
const DEFAULT_COLUMNS = [
  { key: "id", label: "ID", width: "60px", type: "text" },
  { key: "Title", label: "Título", width: "200px", type: "text" },
  { key: "Created", label: "Creado", width: "140px", type: "datetime" },
  { key: "Modified", label: "Modificado", width: "140px", type: "datetime" },
];

// Campos de fecha disponibles para filtrar
const DATE_FILTER_FIELDS = [
  { key: "FechaProgramada", label: "Fecha Programada" },
  { key: "FechaEjecucion", label: "Fecha Ejecución" },
  { key: "Created", label: "Fecha Creación" },
  { key: "Modified", label: "Fecha Modificación" },
];

export default function SharePointListView() {
  const navigate = useNavigate();
  const tableContainerRef = useRef(null);
  const scrollPositionRef = useRef(0);

  // Estados
  const [items, setItems] = useState([]);
  const [allowedLists, setAllowedLists] = useState([]);
  const [selectedListName, setSelectedListName] = useState("");
  const [selectedListId, setSelectedListId] = useState("");
  const [listConfig, setListConfig] = useState(null);

  // Columnas: array completo de objetos {key, label, width, type}
  const [allColumns, setAllColumns] = useState(DEFAULT_COLUMNS);
  // Keys de columnas visibles
  const [visibleColumnKeys, setVisibleColumnKeys] = useState(DEFAULT_COLUMNS.map(c => c.key));

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingLists, setLoadingLists] = useState(true);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showColumnFilter, setShowColumnFilter] = useState(false);

  // Filtros de fecha
  const [dateFilterField, setDateFilterField] = useState("FechaProgramada");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Filtro por NombreCliente (solo para admin/root)
  const [filterNombreCliente, setFilterNombreCliente] = useState("");

  // Paginación con nextLink (como SharePoint)
  const [nextLink, setNextLink] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalLoaded, setTotalLoaded] = useState(0);

  // Columnas visibles (objetos completos, calculado)
  const visibleColumns = allColumns.filter(col => visibleColumnKeys.includes(col.key));

  // Cargar listas permitidas desde el backend al iniciar
  useEffect(() => {
    loadAllowedLists();
  }, []);

  /**
   * Cargar listas permitidas desde la configuración del backend
   */
  const loadAllowedLists = async () => {
    setLoadingLists(true);
    try {
      const response = await getSharepointLists();
      if (response.success && response.data) {
        const lists = response.data;
        setAllowedLists(lists);

        if (lists.length > 0) {
          setSelectedListName(lists[0].name);
        }
      }
    } catch (err) {
      console.error("Error loading allowed lists:", err);
      setError("Error al cargar las listas configuradas. Verifique la configuración.");
    } finally {
      setLoadingLists(false);
    }
  };

  /**
   * Cuando cambia la lista seleccionada, cargar su configuración
   */
  useEffect(() => {
    if (selectedListName) {
      loadListConfig(selectedListName);
    }
  }, [selectedListName]);

  /**
   * Cargar configuración de columnas para la lista seleccionada
   */
  const loadListConfig = async (listName) => {
    setLoadingConfig(true);
    setError(null);
    try {
      // Obtener configuración de columnas desde el backend
      const configResponse = await getSharepointListConfig(listName);

      console.log("Config response:", configResponse); // Debug

      if (configResponse.success && configResponse.data) {
        const config = configResponse.data;
        setListConfig(config);

        // Establecer columnas del backend
        const columnsFromBackend = config.columns || DEFAULT_COLUMNS;
        setAllColumns(columnsFromBackend);

        // Establecer columnas visibles por defecto
        const defaultVisible = config.defaultVisibleColumns || columnsFromBackend.map(c => c.key);
        setVisibleColumnKeys(defaultVisible);

        console.log("Columns set:", columnsFromBackend); // Debug
        console.log("Visible keys:", defaultVisible); // Debug
      }

      // Buscar el ID de la lista en SharePoint
      const listsResponse = await getLists();
      if (listsResponse.success && listsResponse.data?.value) {
        const sharePointList = listsResponse.data.value.find(
          list => list.displayName === listName || list.name === listName
        );
        if (sharePointList) {
          setSelectedListId(sharePointList.id);
        } else {
          setError(`Lista "${listName}" no encontrada en SharePoint`);
          setSelectedListId("");
        }
      }
    } catch (err) {
      console.error("Error loading list config:", err);
      setAllColumns(DEFAULT_COLUMNS);
      setVisibleColumnKeys(DEFAULT_COLUMNS.map(c => c.key));
    } finally {
      setLoadingConfig(false);
    }
  };

  /**
   * Cargar items cuando tenemos el listId
   */
  useEffect(() => {
    if (selectedListId) {
      loadItems(true);
    }
  }, [selectedListId]);

  /**
   * Construir filtro OData completo (fechas + NombreCliente)
   */
  const buildODataFilter = () => {
    const filters = [];

    // Filtro de fechas
    if (dateFrom || dateTo) {
      const field = `fields/${dateFilterField}`;
      if (dateFrom) {
        filters.push(`${field} ge '${dateFrom}T00:00:00Z'`);
      }
      if (dateTo) {
        filters.push(`${field} le '${dateTo}T23:59:59Z'`);
      }
    }

    // Filtro por NombreCliente (usando startswith - mejor soportado por Graph API)
    if (filterNombreCliente.trim()) {
      // Escapar comillas simples
      const clientName = filterNombreCliente.trim().replace(/'/g, "''");
      filters.push(`startswith(fields/NombreCliente,'${clientName}')`);
    }

    return filters.length > 0 ? filters.join(' and ') : null;
  };

  /**
   * Cargar items de la lista
   * @returns {Promise} - Promesa que se resuelve cuando termina la carga
   */
  const loadItems = async (reset = false) => {
    if (!selectedListId) return Promise.resolve();

    if (reset) {
      setLoading(true);
      setItems([]);
      setNextLink(null);
      setTotalLoaded(0);
    } else {
      setLoadingMore(true);
      // Guardar posición de scroll antes de cargar más
      if (tableContainerRef.current) {
        scrollPositionRef.current = tableContainerRef.current.scrollTop;
      }
    }
    setError(null);

    try {
      // Construir filtro OData (fechas + NombreCliente)
      const odataFilter = buildODataFilter();

      // Extraer skiptoken del nextLink si existe
      let skipToken = null;
      if (!reset && nextLink) {
        try {
          const nextUrl = new URL(nextLink);
          skipToken = nextUrl.searchParams.get('$skiptoken');
        } catch (e) {
          console.warn("Error parsing nextLink:", e);
        }
      }

      const response = await getListItems(selectedListId, {
        expand: true,
        top: 100,
        filter: reset ? odataFilter : undefined, // Solo aplicar filtro en primera carga
        skiptoken: skipToken,
      });

      if (response.success && response.data) {
        const data = response.data;
        const newItems = (data.value || []).map(item => ({
          ...item.fields,
          _id: item.id,
          _webUrl: item.webUrl,
          _createdByName: item.createdBy?.user?.displayName,
          _modifiedByName: item.lastModifiedBy?.user?.displayName,
        }));

        if (reset) {
          setItems(newItems);
          setTotalLoaded(newItems.length);
        } else {
          setItems(prev => [...prev, ...newItems]);
          setTotalLoaded(prev => prev + newItems.length);
        }

        const newNextLink = data['@odata.nextLink'];
        setNextLink(newNextLink || null);
        setHasMore(!!newNextLink);
      }
    } catch (err) {
      console.error("Error loading items:", err);
      setError("Error al cargar los datos. Verifique la conexión a Microsoft Graph.");
      handleSnackbar("Error al cargar datos de SharePoint", "error");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  /**
   * Cargar más items (preservando posición de scroll)
   */
  const loadMoreItems = () => {
    if (!loadingMore && hasMore) {
      loadItems(false);
    }
  };

  /**
   * Detectar scroll para infinite scroll
   */
  const handleScroll = useCallback(() => {
    if (!tableContainerRef.current || loadingMore || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = tableContainerRef.current;
    // Cargar más cuando queden menos de 300px para llegar al final
    if (scrollHeight - scrollTop - clientHeight < 300) {
      loadItems(false);
    }
  }, [loadingMore, hasMore, selectedListId, nextLink]);

  useEffect(() => {
    const container = tableContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Restaurar posición de scroll después de cargar más items
  useEffect(() => {
    if (!loadingMore && scrollPositionRef.current > 0 && tableContainerRef.current) {
      // Usar requestAnimationFrame para asegurar que el DOM esté actualizado
      requestAnimationFrame(() => {
        if (tableContainerRef.current) {
          tableContainerRef.current.scrollTop = scrollPositionRef.current;
        }
      });
    }
  }, [loadingMore, items.length]);

  /**
   * Cargar todos los items
   */
  const loadAllItems = async () => {
    if (!selectedListId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await getListItems(selectedListId, { all: true, expand: true });

      if (response.success && response.data?.value) {
        const processedItems = response.data.value.map(item => ({
          ...item.fields,
          _id: item.id,
          _webUrl: item.webUrl,
          _createdByName: item.createdBy?.user?.displayName,
          _modifiedByName: item.lastModifiedBy?.user?.displayName,
        }));
        setItems(processedItems);
        setTotalLoaded(processedItems.length);
        setHasMore(false);
        setNextLink(null);
        handleSnackbar(`${processedItems.length} registros cargados`, "success");
      }
    } catch (err) {
      console.error("Error loading all items:", err);
      setError("Error al cargar todos los datos.");
      handleSnackbar("Error al cargar datos de SharePoint", "error");
    } finally {
      setLoading(false);
    }
  };

  // Formatear valores según tipo
  const formatValue = (value, type) => {
    if (value === null || value === undefined || value === "") return "-";

    switch (type) {
      case "date":
        try {
          return new Date(value).toLocaleDateString("es-CL");
        } catch {
          return value;
        }
      case "datetime":
        try {
          return new Date(value).toLocaleString("es-CL", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        } catch {
          return value;
        }
      case "number":
        if (typeof value === "number") {
          return value.toLocaleString("es-CL", { minimumFractionDigits: 0, maximumFractionDigits: 1 });
        }
        return value;
      default:
        return String(value);
    }
  };

  // Filtrar items por búsqueda
  const filteredItems = items.filter(item => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return Object.values(item).some(val =>
      String(val).toLowerCase().includes(search)
    );
  });

  // Exportar a CSV
  const exportToCSV = () => {
    const headers = visibleColumns.map(col => col.key);

    const rows = filteredItems.map(item =>
      visibleColumns.map(col => formatValue(item[col.key], col.type))
    );

    const csvContent = [
      headers.join(";"),
      ...rows.map(row => row.join(";"))
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sharepoint_${selectedListName}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    handleSnackbar("Archivo exportado correctamente", "success");
  };

  // Toggle columna visible
  const toggleColumn = (key) => {
    setVisibleColumnKeys(prev =>
      prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  if (loadingLists) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Cargando configuración de listas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Database className="w-7 h-7 text-sky-600" />
            {listConfig?.displayName || "SharePoint Data"}
          </h1>
          <p className="text-gray-500 mt-1">
            {listConfig?.description || "Consulta datos desde listas de SharePoint via Microsoft Graph"}
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/settings/connection-microsoft-graph")}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Settings className="w-4 h-4" />
          Configuración
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => navigate("/dashboard/settings/connection-microsoft-graph")}
              className="text-sm text-red-600 underline mt-1"
            >
              Ir a configuración
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        {/* Primera fila: Lista y búsqueda local */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Lista selector */}
          {/* <div className="w-full lg:w-64">
            <label className="block text-xs font-medium text-gray-500 mb-1">LISTA</label>
            <select
              value={selectedListName}
              onChange={(e) => {
                setSelectedListName(e.target.value);
                setSelectedListId("");
                setItems([]);
                setNextLink(null);
                setHasMore(false);
                setTotalLoaded(0);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
              disabled={loading || loadingConfig}
            >
              <option value="">Seleccione una lista...</option>
              {allowedLists.map(list => (
                <option key={list.name} value={list.name}>
                  {list.displayName}
                </option>
              ))}
            </select>
          </div> */}

          {/* Search local */}
          {/* <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">BUSCAR (en resultados)</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar en resultados cargados..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div> */}
        </div>

        {/* Segunda fila: Filtros de fecha y cliente */}
        <div className="flex flex-col lg:flex-row gap-4 items-end">
          {/* Filtro NombreCliente */}
          <div className="w-full lg:w-56">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              NOMBRE CLIENTE
            </label>
            <input
              type="text"
              value={filterNombreCliente}
              onChange={(e) => setFilterNombreCliente(e.target.value)}
              placeholder="Buscar por cliente..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
              disabled={loading}
            />
          </div>

          {/* Separador visual */}
          <div className="hidden lg:block w-px h-8 bg-gray-300" />

          {/* Campo de fecha */}
          <div className="w-full lg:w-44">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              <Calendar className="w-3 h-3 inline mr-1" />
              FILTRAR POR
            </label>
            <select
              value={dateFilterField}
              onChange={(e) => setDateFilterField(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
              disabled={loading}
            >
              {DATE_FILTER_FIELDS.map(field => (
                <option key={field.key} value={field.key}>
                  {field.label}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha Desde */}
          <div className="w-full lg:w-36">
            <label className="block text-xs font-medium text-gray-500 mb-1">DESDE</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
              disabled={loading}
            />
          </div>

          {/* Fecha Hasta */}
          <div className="w-full lg:w-36">
            <label className="block text-xs font-medium text-gray-500 mb-1">HASTA</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
              disabled={loading}
            />
          </div>

          {/* Limpiar filtros */}
          {(dateFrom || dateTo || filterNombreCliente) && (
            <button
              onClick={() => {
                setDateFrom("");
                setDateTo("");
                setFilterNombreCliente("");
              }}
              className="flex items-center gap-1 px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg text-sm"
              title="Limpiar todos los filtros"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Actions */}
          <div className="flex items-end gap-2">
            <button
              onClick={() => loadItems(true)}
              disabled={loading || !selectedListId}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              {(dateFrom || dateTo || filterNombreCliente) ? 'Aplicar Filtro' : 'Actualizar'}
            </button>
            {/* <button
              onClick={loadAllItems}
              disabled={loading || !selectedListId}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Cargar todos los registros"
            >
              <Database className="w-4 h-4" />
              Cargar Todo
            </button> */}
            <div className="relative">
              {/* <button
                onClick={() => setShowColumnFilter(!showColumnFilter)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-4 h-4" />
                Columnas
              </button> */}

              {/* Column Filter Dropdown */}
              {showColumnFilter && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  <div className="p-3 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                    <span className="font-medium text-sm">Columnas visibles</span>
                    <button onClick={() => setShowColumnFilter(false)}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-2">
                    {allColumns.map(col => (
                      <label key={col.key} className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={visibleColumnKeys.includes(col.key)}
                          onChange={() => toggleColumn(col.key)}
                          className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                        />
                        <span className="text-sm">{col.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => alert('En desarrollo')}
              disabled={filteredItems.length === 0}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Excel
            </button>
          </div>
        </div>
      </div>

      {/* Loading config indicator */}
      {loadingConfig && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span className="text-blue-800 text-sm">Cargando configuración de la lista...</span>
        </div>
      )}

      {/* Table Container with scroll */}
      <div className="bg-white rounded-lg shadow flex-1 flex flex-col min-h-0">
        {/* Status bar */}
        <div className="px-4 py-2 border-b border-gray-200 bg-gray-50 flex items-center justify-between text-sm text-gray-600">
          <span>
            {totalLoaded > 0
              ? `${filteredItems.length} registros ${searchTerm ? 'filtrados de ' + totalLoaded : 'cargados'}`
              : 'Sin registros'
            }
            {hasMore && !searchTerm && ' (hay más disponibles)'}
          </span>
          {loading && (
            <span className="flex items-center gap-2 text-sky-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              Cargando...
            </span>
          )}
        </div>

        {/* Table with horizontal scroll */}
        <div
          ref={tableContainerRef}
          className="flex-1 overflow-auto"
          style={{
            maxHeight: 'calc(100vh - 380px)',
            minHeight: '400px',
            overflowAnchor: 'none' // Evita que el navegador ajuste el scroll automáticamente
          }}
        >
          <table className="w-full border-collapse">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                {visibleColumns.map(col => (
                  <th
                    key={col.key}
                    className="px-3 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap border-b border-gray-200 bg-gray-50"
                    style={{ minWidth: col.width }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && items.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length || 1} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Cargando datos...</p>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length || 1} className="px-6 py-12 text-center">
                    <Database className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">
                      {selectedListId
                        ? (searchTerm ? "No se encontraron resultados" : "No hay datos disponibles")
                        : "Seleccione una lista"}
                    </p>
                  </td>
                </tr>
              ) : (
                <>
                  {filteredItems.map((item, idx) => (
                    <tr key={item._id || item.id || idx} className="hover:bg-gray-50">
                      {visibleColumns.map(col => (
                        <td
                          key={col.key}
                          className="px-3 py-2 whitespace-nowrap text-xs text-gray-900"
                        >
                          {formatValue(item[col.key], col.type)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {/* Loading more indicator */}
                  {loadingMore && (
                    <tr>
                      <td colSpan={visibleColumns.length} className="px-6 py-4 text-center">
                        <Loader2 className="w-6 h-6 animate-spin text-sky-500 mx-auto" />
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Load more button */}
        {hasMore && !loading && !searchTerm && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-center">
            <button
              onClick={loadMoreItems}
              disabled={loadingMore}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cargando...
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Cargar más registros
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
