import api, { returnResponse } from "./api";

// Función para obtener todos los registros
export const getUsers = async () => {
  try {
    const response = await api.get("/api/users");
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


export const createUser = async (registerData) => {
  try {
    // Enviar solicitud POST para crear un nuevo usuario
    const response = await api.post(`/api/users/store`, registerData);
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

// Función para actualizar un registro por su ID
export const updateUser = async (id, registerData) => {
  try {

    const response = await api.put(`/api/users/${id}`, registerData);
    let success = response.status != 204 || response.error ? false : true;
    return returnResponse(
      success,
      success ? "Usuario Modificado Corretamente" : response.error,
      response.status
    );
  } catch (error) {
    return error;
  }
};

// Función para obtener un registro por su ID
export const getUserById = async (id) => {
  try {
    const response = await api.get(`/api/users/${id}`);
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

// Función para eliminar un registro por su ID
export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/api/users/${id}`);
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

// Obtener empresas asignadas a un usuario comercial
export const getUserCompanies = async (userId) => {
  try {
    const response = await api.get(`/api/users/${userId}/companies`);
    let success = response.status === 200 && !response.error;
    return returnResponse(
      success,
      success ? response.data.message : response.error,
      response.status,
      success ? response.data.data : []
    );
  } catch (error) {
    return error;
  }
};

// Sincronizar empresas asignadas a un usuario comercial
export const syncUserCompanies = async (userId, companyIds) => {
  try {
    const response = await api.post(`/api/users/${userId}/companies`, {
      company_ids: companyIds,
    });
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
