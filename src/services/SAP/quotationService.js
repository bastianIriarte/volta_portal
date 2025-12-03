import api, { returnResponse } from "../api";

// Obtener todas las cotizaciones con paginación, búsqueda y ordenamiento
export const getQuotations = async (params = {}) => {
  try {
    // Construir query params
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page);
    if (params.per_page) queryParams.append('per_page', params.per_page);
    if (params.search) queryParams.append('search', params.search);
    if (params.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params.sort_dir) queryParams.append('sort_dir', params.sort_dir);

    const queryString = queryParams.toString();
    const url = `/api/sap/quotations${queryString ? `?${queryString}` : ''}`;

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

// Obtener una cotización por ID
export const getQuotationById = async (id) => {
  try {
    const response = await api.get(`/api/sap/quotations/${id}`);
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

// Crear cotización (HABILITADO)
export const createQuotation = async (registerData) => {
  try {
    const response = await api.post(`/api/sap/quotations/store`, registerData);
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

// Actualizar cotización
export const updateQuotation = async (id, registerData) => {
  try {
    const response = await api.put(`/api/sap/quotations/${id}`, registerData);
    let success = response.status != 204 || response.error ? false : true;
    return returnResponse(
      success,
      success ? "Cotización modificada correctamente" : response.error,
      response.status
    );
  } catch (error) {
    return error;
  }
};

// Eliminar cotización
export const deleteQuotation = async (id) => {
  try {
    const response = await api.delete(`/api/sap/quotations/${id}`);
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

// Generar PDF de cotización
export const generateQuotationPDF = async (id) => {
  try {
    const response = await api.get(`/api/sap/quotations/${id}/pdf`, {
      responseType: 'blob'
    });
    let success = response.status != 200 || response.error ? false : true;
    return returnResponse(
      success,
      success ? "PDF generado correctamente" : response.error,
      response.status,
      success ? response.data : null
    );
  } catch (error) {
    return error;
  }
};
