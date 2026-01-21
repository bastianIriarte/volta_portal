import api, { returnResponse } from "./api";

/**
 * Obtiene todas las listas de SharePoint disponibles
 */
export const getLists = async () => {
  try {
    const response = await api.get("/api/microsoft-graph/lists");
    let success = response.status === 200 && !response.error;
    return returnResponse(
      success,
      success ? response.data.message : response.error,
      response.status,
      success ? response.data.data : null
    );
  } catch (error) {
    return error;
  }
};

/**
 * Obtiene los items de una lista de SharePoint con paginación
 * @param {string} listId - ID de la lista
 * @param {object} options - Opciones de consulta
 * @param {number} options.top - Número de items a obtener
 * @param {number} options.skip - Número de items a saltar
 * @param {string} options.filter - Filtro OData
 * @param {boolean} options.expand - Si expandir campos (fields)
 * @param {string} options.skiptoken - Token para paginación
 * @param {boolean} options.all - Si obtener todos los items
 */
export const getListItems = async (listId, options = {}) => {
  try {
    const params = new URLSearchParams();
    if (options.expand) params.append("expand", "fields");
    if (options.top) params.append("top", options.top);
    if (options.skip) params.append("skip", options.skip);
    if (options.filter) params.append("filter", options.filter);
    if (options.skiptoken) params.append("skiptoken", options.skiptoken);
    if (options.all) params.append("all", "true");

    const queryString = params.toString();
    const url = `/api/microsoft-graph/lists/${listId}/items${queryString ? `?${queryString}` : ""}`;

    const response = await api.get(url);
    let success = response.status === 200 && !response.error;
    return returnResponse(
      success,
      success ? response.data.message : response.error,
      response.status,
      success ? response.data.data : null
    );
  } catch (error) {
    return error;
  }
};

/**
 * Obtiene la configuración de una lista de SharePoint
 * @param {string} listName - Nombre de la lista (URL encoded)
 */
export const getSharepointListConfig = async (listName) => {
  try {
    const response = await api.get(`/api/sharepoint/lists/${encodeURIComponent(listName)}/config`);
    let success = response.status === 200 && !response.error;
    return returnResponse(
      success,
      success ? response.data.message : response.error,
      response.status,
      success ? response.data.data : null
    );
  } catch (error) {
    return error;
  }
};

/**
 * Prueba la conexión con Microsoft Graph (usando credenciales guardadas)
 */
export const testConnection = async () => {
  try {
    const response = await api.post("/api/microsoft-graph/test-connection");
    let success = response.status === 200 && !response.error;
    return returnResponse(
      success,
      success ? response.data.message : response.error,
      response.status,
      success ? response.data.data : null
    );
  } catch (error) {
    return error;
  }
};

/**
 * Prueba la conexión con Microsoft Graph con credenciales específicas
 * @param {object} credentials - Credenciales de conexión
 * @param {string} credentials.tenant_id - ID del tenant
 * @param {string} credentials.client_id - ID del cliente
 * @param {string} credentials.client_secret - Secreto del cliente
 * @param {string} credentials.site_id - ID del sitio (opcional)
 */
export const testConnectionWithCredentials = async (credentials) => {
  try {
    const response = await api.post("/api/microsoft-graph/test-connection", credentials);
    let success = response.status === 200 && !response.error;
    return returnResponse(
      success,
      success ? response.data.message : response.error,
      response.status,
      success ? response.data.data : null
    );
  } catch (error) {
    return error;
  }
};

/**
 * Obtiene las listas de SharePoint disponibles (desde /api/sharepoint/lists)
 */
export const getSharepointLists = async () => {
  try {
    const response = await api.get("/api/sharepoint/lists");
    let success = response.status === 200 && !response.error;
    return returnResponse(
      success,
      success ? response.data.message : response.error,
      response.status,
      success ? response.data.data : null
    );
  } catch (error) {
    return error;
  }
};
