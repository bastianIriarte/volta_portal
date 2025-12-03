import api, { returnResponse } from "../api";

// Obtener todos los clientes con paginación, búsqueda y ordenamiento
export const getClients = async (params = {}) => {
  try {
    // Construir query params
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page);
    if (params.per_page) queryParams.append('per_page', params.per_page);
    if (params.search) queryParams.append('search', params.search);
    if (params.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params.sort_dir) queryParams.append('sort_dir', params.sort_dir);

    const queryString = queryParams.toString();
    const url = `/api/sap/clients${queryString ? `?${queryString}` : ''}`;

    const response = await api.get(url);
    let success = response.status != 200 || response.error ? false : true;
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

// Obtener un cliente por ID
export const getClientById = async (id) => {
  try {
    const response = await api.get(`/api/sap/clients/${id}`);
    let success = response.status != 200 || response.error ? false : true;
    return returnResponse(
      success,
      success ? "OK" : response.error,
      response.status,
      success ? response.data.data : null
    );
  } catch (error) {
    return error;
  }
};

// Crear cliente (deshabilitado desde portal)
export const createClient = async (registerData) => {
  try {
    const response = await api.post(`/api/sap/clients/store`, registerData);
    let success = response.status != 201 || response.error ? false : true;
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

// Actualizar cliente (deshabilitado desde portal)
export const updateClient = async (id, registerData) => {
  try {
    const response = await api.put(`/api/sap/clients/${id}`, registerData);
    let success = response.status != 204 || response.error ? false : true;
    return returnResponse(
      success,
      success ? "Cliente modificado correctamente" : response.error,
      response.status
    );
  } catch (error) {
    return error;
  }
};

// Eliminar cliente (deshabilitado desde portal)
export const deleteClient = async (id) => {
  try {
    const response = await api.delete(`/api/sap/clients/${id}`);
    let success = response.status != 200 || response.error ? false : true;
    return returnResponse(
      success,
      success ? response.data.message : response.error,
      response.status
    );
  } catch (error) {
    return error;
  }
};
