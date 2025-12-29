/**
 * Configuración de listas de SharePoint
 *
 * Para agregar una nueva lista:
 * 1. Agregar el nombre exacto de la lista en ALLOWED_LISTS
 * 2. Crear la configuración de columnas en LIST_COLUMNS_CONFIG
 *
 * Estructura de columna:
 * {
 *   key: "nombreCampoGraph",     // Nombre del campo en Microsoft Graph (fields.xxx)
 *   label: "Etiqueta UI",        // Lo que se muestra en la tabla
 *   width: "100px",              // Ancho de la columna
 *   type: "text",                // Tipo: text, date, datetime, number
 *   path: "fields.Campo",        // Path completo si es diferente (opcional)
 * }
 */

// Listas permitidas (solo estas se mostrarán en el selector)
export const ALLOWED_LISTS = [
  "09_TBL_OnSite",
  // Agregar más listas aquí según se necesiten:
  // "10_TBL_OtraLista",
];

// Configuración de columnas por lista
export const LIST_COLUMNS_CONFIG = {
  // ============================================
  // 09_TBL_OnSite - Operaciones On-Site
  // ============================================
  "09_TBL_OnSite": {
    displayName: "Operaciones On-Site",
    description: "Registros de operaciones en sitio del cliente",
    columns: [
      { key: "id", label: "ID", width: "60px", type: "text" },
      { key: "FechaProgramada", label: "Fecha Prog.", width: "100px", type: "date" },
      { key: "DisposicionFinal", label: "Disposición Final", width: "130px", type: "text" },
      { key: "RutCliente", label: "RUT Cliente", width: "110px", type: "text" },
      { key: "NombreCliente", label: "Nombre Cliente", width: "220px", type: "text" },
      { key: "Sucursal", label: "Sucursal", width: "120px", type: "text" },
      { key: "Bodega", label: "Bodega", width: "120px", type: "text" },
      { key: "DireccionSucursal", label: "Dirección", width: "200px", type: "text" },
      { key: "Peso1", label: "P1", width: "55px", type: "number" },
      { key: "Peso2", label: "P2", width: "55px", type: "number" },
      { key: "Peso3", label: "P3", width: "55px", type: "number" },
      { key: "Peso4", label: "P4", width: "55px", type: "number" },
      { key: "Peso5", label: "P5", width: "55px", type: "number" },
      { key: "Peso6", label: "P6", width: "55px", type: "number" },
      { key: "Peso7", label: "P7", width: "55px", type: "number" },
      { key: "Peso8", label: "P8", width: "55px", type: "number" },
      { key: "Peso9", label: "P9", width: "55px", type: "number" },
      { key: "Peso10", label: "P10", width: "55px", type: "number" },
      { key: "PesoTotal", label: "Peso Total", width: "90px", type: "number" },
      { key: "Cantidad", label: "Cantidad", width: "80px", type: "number" },
      { key: "Formato", label: "Formato", width: "110px", type: "text" },
      { key: "Material", label: "Material", width: "140px", type: "text" },
      { key: "TipoRegistro", label: "Tipo Registro", width: "140px", type: "text" },
      { key: "FechaEjecucion", label: "Fecha Ejec.", width: "140px", type: "datetime" },
      { key: "UsuarioEjecuta", label: "Usuario Ejec.", width: "130px", type: "text" },
      { key: "Created", label: "Creado", width: "140px", type: "datetime" },
      { key: "Modified", label: "Modificado", width: "140px", type: "datetime" },
      // Campos especiales que vienen de la raíz del item, no de fields
      { key: "_createdByName", label: "Creado Por", width: "130px", type: "text", path: "createdBy.user.displayName" },
      { key: "_modifiedByName", label: "Modificado Por", width: "130px", type: "text", path: "lastModifiedBy.user.displayName" },
    ],
    // Columnas visibles por defecto (primeras N)
    defaultVisibleColumns: [
      "id", "FechaProgramada", "DisposicionFinal", "RutCliente", "NombreCliente",
      "Sucursal", "Bodega", "DireccionSucursal", "Peso1", "Peso2", "Peso3", "Peso4",
      "PesoTotal", "Cantidad", "Formato", "Material"
    ],
  },

  // ============================================
  // Plantilla para agregar nuevas listas
  // ============================================
  // "NOMBRE_LISTA": {
  //   displayName: "Nombre para mostrar",
  //   description: "Descripción de la lista",
  //   columns: [
  //     { key: "campo1", label: "Campo 1", width: "100px", type: "text" },
  //     { key: "campo2", label: "Campo 2", width: "100px", type: "date" },
  //   ],
  //   defaultVisibleColumns: ["campo1", "campo2"],
  // },
};

// Columnas genéricas para listas no configuradas
export const DEFAULT_COLUMNS = [
  { key: "id", label: "ID", width: "60px", type: "text" },
  { key: "Title", label: "Título", width: "200px", type: "text" },
  { key: "Created", label: "Creado", width: "140px", type: "datetime" },
  { key: "Modified", label: "Modificado", width: "140px", type: "datetime" },
];

/**
 * Obtener configuración de una lista
 * @param {string} listName - Nombre de la lista
 * @returns {Object} Configuración de la lista
 */
export const getListConfig = (listName) => {
  return LIST_COLUMNS_CONFIG[listName] || {
    displayName: listName,
    description: "Lista de SharePoint",
    columns: DEFAULT_COLUMNS,
    defaultVisibleColumns: DEFAULT_COLUMNS.map(c => c.key),
  };
};

/**
 * Verificar si una lista está configurada
 * @param {string} listName - Nombre de la lista
 * @returns {boolean}
 */
export const isListConfigured = (listName) => {
  return listName in LIST_COLUMNS_CONFIG;
};

/**
 * Filtrar listas para mostrar solo las permitidas
 * @param {Array} lists - Lista de listas de SharePoint
 * @returns {Array} Listas filtradas
 */
export const filterAllowedLists = (lists) => {
  return lists.filter(list =>
    ALLOWED_LISTS.includes(list.displayName) || ALLOWED_LISTS.includes(list.name)
  );
};
