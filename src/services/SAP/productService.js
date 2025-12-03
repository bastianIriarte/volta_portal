import api, { returnResponse } from "../api";

// Obtener todos los productos con paginación, búsqueda y ordenamiento
export const getProducts = async (params = {}) => {
  try {
    // Construir query params
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page);
    if (params.per_page) queryParams.append('per_page', params.per_page);
    if (params.search) queryParams.append('search', params.search);
    if (params.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params.sort_dir) queryParams.append('sort_dir', params.sort_dir);

    const queryString = queryParams.toString();
    const url = `/api/sap/products${queryString ? `?${queryString}` : ''}`;

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

// Obtener un producto por ID
export const getProductById = async (id) => {
  try {
    const response = await api.get(`/api/sap/products/${id}`);
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

// Crear producto (deshabilitado desde portal)
export const createProduct = async (registerData) => {
  try {
    const response = await api.post(`/api/sap/products/store`, registerData);
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

// Actualizar producto (deshabilitado desde portal)
export const updateProduct = async (id, registerData) => {
  try {
    const response = await api.put(`/api/sap/products/${id}`, registerData);
    let success = response.status != 204 || response.error ? false : true;
    return returnResponse(
      success,
      success ? "Producto modificado correctamente" : response.error,
      response.status
    );
  } catch (error) {
    return error;
  }
};

// Eliminar producto (deshabilitado desde portal)
export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`/api/sap/products/${id}`);
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
