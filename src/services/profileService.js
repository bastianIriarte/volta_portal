import api, { returnResponse } from "./api";

// Función para obtener todos los registros
export const getProfilesList = async () => {
  try {
    const response = await api.get("/api/profiles-list");
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

export const getProfiles = async () => {
  try {
    const response = await api.get("/api/profiles");
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


export const createProfile = async (registerData) => {
  try {
    // Enviar solicitud POST para crear un nuevo registro
    const response = await api.post(`/api/profiles/store`, registerData);
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
export const updateProfile = async (id, registerData) => {
  try {

    const response = await api.put(`/api/profiles/${id}`, registerData);
    let success = response.status != 204 || response.error ? false : true;
    return returnResponse(
      success,
      success ? "Perfil Modificado Corretamente" : response.error,
      response.status
    );
  } catch (error) {
    return error;
  }
};

// Función para obtener un registro por su ID
export const getProfileById = async (id) => {
  try {
    const response = await api.get(`/api/profiles/${id}`);
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
export const deleteProfile = async (id) => {
  try {
    const response = await api.delete(`/api/profiles/${id}`);
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
