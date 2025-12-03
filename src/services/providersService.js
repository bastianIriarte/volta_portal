import api, { returnResponse } from "./api";

// Obtener todos los proveedores
export const getProviders = async () => {
  try {
    const response = await api.get("/api/providers");
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

// Obtener un proveedor por ID
export const getProviderById = async (id) => {
  try {
    const response = await api.get(`/api/providers/${id}`);
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

// Crear proveedor (deshabilitado desde portal)
export const createProvider = async (registerData) => {
  try {
    const response = await api.post(`/api/providers/store`, registerData);
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

// Actualizar proveedor (deshabilitado desde portal)
export const updateProvider = async (id, registerData) => {
  try {
    const response = await api.put(`/api/providers/${id}`, registerData);
    let success = response.status != 204 || response.error ? false : true;
    return returnResponse(
      success,
      success ? "Proveedor modificado correctamente" : response.error,
      response.status
    );
  } catch (error) {
    return error;
  }
};

// Eliminar proveedor (deshabilitado desde portal)
export const deleteProvider = async (id) => {
  try {
    const response = await api.delete(`/api/providers/${id}`);
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
