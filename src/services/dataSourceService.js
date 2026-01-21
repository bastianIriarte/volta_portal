import api, { returnResponse } from "./api";

// =====================================
// FUENTES DE DATOS (Data Sources)
// =====================================

/**
 * Lista todas las fuentes de datos
 */
export const getDataSources = async (companyId = null) => {
  try {
    const params = companyId ? `?company_id=${companyId}` : "";
    const response = await api.get(`/api/data-sources${params}`);
    let success = response.status === 200 && response.data.status !== false;
    return returnResponse(
      success,
      success ? response.data.message : response.data.message,
      response.status,
      success ? response.data.data : null
    );
  } catch (error) {
    return error;
  }
};

/**
 * Obtiene una fuente de datos por ID
 */
export const getDataSource = async (id) => {
  try {
    const response = await api.get(`/api/data-sources/${id}`);
    let success = response.status === 200 && response.data.status !== false;
    return returnResponse(
      success,
      success ? response.data.message : response.data.message,
      response.status,
      success ? response.data.data : null
    );
  } catch (error) {
    return error;
  }
};

/**
 * Crea una nueva fuente de datos
 */
export const createDataSource = async (data) => {
  try {
    const response = await api.post("/api/data-sources", data);
    let success = response.status === 201 && response.data.status !== false;
    return returnResponse(
      success,
      success ? response.data.message : response.data.message,
      response.status,
      success ? response.data.data : null
    );
  } catch (error) {
    return error;
  }
};

/**
 * Actualiza una fuente de datos
 */
export const updateDataSource = async (id, data) => {
  try {
    const response = await api.put(`/api/data-sources/${id}`, data);
    let success = response.status === 204 && response.data.status !== false;
    return returnResponse(
      success,
      success ? response.data.message : response.data.message,
      response.status,
      success ? response.data.data : null
    );
  } catch (error) {
    return error;
  }
};

/**
 * Elimina una fuente de datos
 */
export const deleteDataSource = async (id) => {
  try {
    const response = await api.delete(`/api/data-sources/${id}`);
    let success = response.status === 200 && response.data.status !== false;
    return returnResponse(
      success,
      success ? response.data.message : response.data.message,
      response.status,
      null
    );
  } catch (error) {
    return error;
  }
};

/**
 * Probar una query sin guardar
 * @param {string} query - SQL query
 * @param {object} params - Parametros para reemplazar en la query
 * @param {string} connection - Tipo de conexion (agent)
 * @param {boolean} getSchema - Si obtener schema de columnas
 */
export const testQuery = async (query, params = {}, connection = "agent", getSchema = true) => {
  try {
    const response = await api.post("/api/data-sources/test-query", {
      query,
      params,
      connection,
      get_schema: getSchema,
    });
    let success = response.status === 200 && response.data.status !== false;
    return returnResponse(
      success,
      success ? "Query ejecutada exitosamente" : response.data.error || response.data.message,
      response.status,
      success ? {
        data: response.data.data,
        columns: response.data.columns,
        total: response.data.total,
        query_method: response.data.query_method
      } : null
    );
  } catch (error) {
    return error;
  }
};

/**
 * Obtener schema de una fuente de datos (solo columnas, sin ejecutar query)
 */
export const getDataSourceSchema = async (id) => {
  try {
    const response = await api.get(`/api/data-sources/${id}/schema`);
    let success = response.status === 200 && response.data.status !== false;
    return returnResponse(
      success,
      success ? "Schema obtenido exitosamente" : response.data.message,
      response.status,
      success ? response.data.data : null
    );
  } catch (error) {
    return error;
  }
};

/**
 * Ejecutar una fuente de datos
 */
export const executeDataSource = async (id, params = {}) => {
  try {
    const response = await api.post(`/api/data-sources/${id}/execute`, { params });
    let success = response.status === 200 && response.data.status !== false;
    return returnResponse(
      success,
      success ? "Ejecutada exitosamente" : response.data.message,
      response.status,
      success ? response.data.data : null
    );
  } catch (error) {
    return error;
  }
};

// =====================================
// PROCESADORES DE TABLAS (Table Processors)
// =====================================

/**
 * Lista todos los procesadores
 */
export const getTableProcessors = async (companyId = null) => {
  try {
    const params = companyId ? `?company_id=${companyId}` : "";
    const response = await api.get(`/api/table-processors${params}`);
    let success = response.status === 200 && response.data.status !== false;
    return returnResponse(
      success,
      success ? response.data.message : response.data.message,
      response.status,
      success ? response.data.data : null
    );
  } catch (error) {
    return error;
  }
};

/**
 * Obtiene un procesador por ID
 */
export const getTableProcessor = async (id) => {
  try {
    const response = await api.get(`/api/table-processors/${id}`);
    let success = response.status === 200 && response.data.status !== false;
    return returnResponse(
      success,
      success ? response.data.message : response.data.message,
      response.status,
      success ? response.data.data : null
    );
  } catch (error) {
    return error;
  }
};

/**
 * Crea un nuevo procesador
 */
export const createTableProcessor = async (data) => {
  try {
    const response = await api.post("/api/table-processors", data);
    let success = response.status === 201 && response.data.status !== false;
    return returnResponse(
      success,
      success ? response.data.message : response.data.message,
      response.status,
      success ? response.data.data : null
    );
  } catch (error) {
    return error;
  }
};

/**
 * Actualiza un procesador
 */
export const updateTableProcessor = async (id, data) => {
  try {
    const response = await api.put(`/api/table-processors/${id}`, data);
    let success = response.status === 200 && response.data.status !== false;
    return returnResponse(
      success,
      success ? response.data.message : response.data.message,
      response.status,
      success ? response.data.data : null
    );
  } catch (error) {
    return error;
  }
};

/**
 * Elimina un procesador
 */
export const deleteTableProcessor = async (id) => {
  try {
    const response = await api.delete(`/api/table-processors/${id}`);
    let success = response.status === 200 && response.data.status !== false;
    return returnResponse(
      success,
      success ? response.data.message : response.data.message,
      response.status,
      null
    );
  } catch (error) {
    return error;
  }
};

/**
 * Ejecutar procesador y obtener datos procesados
 */
export const executeTableProcessor = async (id, params = {}) => {
  try {
    const response = await api.post(`/api/table-processors/${id}/execute`, { params });
    let success = response.status === 200 && response.data.status !== false;
    return returnResponse(
      success,
      success ? "Ejecutado exitosamente" : response.data.message,
      response.status,
      success
        ? { data: response.data.data, columns: response.data.columns, computed_rows: response.data.computed_rows }
        : null
    );
  } catch (error) {
    return error;
  }
};

/**
 * Generar HTML de tabla desde procesador
 */
export const buildTableHtml = async (id, params = {}) => {
  try {
    const response = await api.post(`/api/table-processors/${id}/build-html`, { params });
    let success = response.status === 200 && response.data.status !== false;
    return returnResponse(
      success,
      success ? "Tabla generada" : response.data.message,
      response.status,
      success ? response.data.html : null
    );
  } catch (error) {
    return error;
  }
};

/**
 * Preview completo de procesador (datos + HTML)
 */
export const previewTableProcessor = async (id, params = {}) => {
  try {
    const response = await api.post(`/api/table-processors/${id}/preview`, { params });
    let success = response.status === 200 && response.data.status !== false;
    return returnResponse(
      success,
      success ? "Preview generado" : response.data.message,
      response.status,
      success ? {
        data: response.data.data,
        columns: response.data.columns,
        html: response.data.html,
        total: response.data.total,
        limited: response.data.limited
      } : null
    );
  } catch (error) {
    return error;
  }
};

/**
 * Ejecutar query SQL raw (para SQL Runner)
 * @param {string} query - SQL query a ejecutar
 */
export const runRawQuery = async (query) => {
  try {
    const response = await api.post("/api/data-sources/run-raw", { query });
    let success = response.status === 200 && response.data?.code === 200;
    return returnResponse(
      success,
      success ? "Query ejecutada exitosamente" : response.data?.error || response.data?.message,
      response.status,
      success ? {
        data: response.data.data || [],
        columns: response.data.columns || [],
        total: response.data.total || 0
      } : null
    );
  } catch (error) {
    return error;
  }
};
