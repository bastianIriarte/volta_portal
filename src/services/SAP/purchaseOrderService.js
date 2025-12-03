import api, { returnResponse } from "../api";

// Obtener todas las órdenes de compra con paginación, búsqueda y ordenamiento
export const getPurchaseOrders = async (params = {}) => {
  try {
    // Construir query params
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page);
    if (params.per_page) queryParams.append('per_page', params.per_page);
    if (params.search) queryParams.append('search', params.search);
    if (params.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params.sort_dir) queryParams.append('sort_dir', params.sort_dir);

    const queryString = queryParams.toString();
    const url = `/api/sap/purchase-orders${queryString ? `?${queryString}` : ''}`;

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

// Obtener una orden de compra por ID
export const getPurchaseOrderById = async (id) => {
  try {
    const response = await api.get(`/api/sap/purchase-orders/${id}`);
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

// Crear orden de compra (HABILITADO - con artículos o servicios)
export const createPurchaseOrder = async (registerData) => {
  try {
    const response = await api.post(`/api/sap/purchase-orders/store`, registerData);
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

// Actualizar orden de compra
export const updatePurchaseOrder = async (id, registerData) => {
  try {
    const response = await api.put(`/api/sap/purchase-orders/${id}`, registerData);
    let success = response.status != 204 || response.error ? false : true;
    return returnResponse(
      success,
      success ? "Orden de compra modificada correctamente" : response.error,
      response.status
    );
  } catch (error) {
    return error;
  }
};

// Eliminar orden de compra
export const deletePurchaseOrder = async (id) => {
  try {
    const response = await api.delete(`/api/sap/purchase-orders/${id}`);
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

// Sincronizar orden de compra
export const syncPurchaseOrder = async (id) => {
  try {
    const response = await api.post(`/api/sap/purchase-orders/${id}/sync`);
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

// Generar PDF de orden de compra
export const generatePurchaseOrderPDF = async (id) => {
  try {
    const response = await api.get(`/api/sap/purchase-orders/${id}/pdf`, {
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
