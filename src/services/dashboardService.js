import api, {
  returnResponse
} from "./api";


// Función para obtener todos los registros
export const getDataDashboard = async () => {
  try {
    const response = await api.get("/api/dashboard");
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

// ==================== CONTACTOS ====================

/**
 * Obtener lista pública de contactos (solo activos)
 */
export const getPublicContacts = async () => {
  try {
    const response = await api.get("/api/contacts/public");
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
 * Obtener todos los contactos (admin)
 */
export const getContacts = async () => {
  try {
    const response = await api.get("/api/contacts");
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
 * Crear contacto
 */
export const createContact = async (data) => {
  try {
    const response = await api.post("/api/contacts", data);
    let success = (response.status === 200 || response.status === 201) && !response.error;
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
 * Actualizar contacto
 */
export const updateContact = async (id, data) => {
  try {
    const response = await api.put(`/api/contacts/${id}`, data);
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
 * Eliminar contacto
 */
export const deleteContact = async (id) => {
  try {
    const response = await api.delete(`/api/contacts/${id}`);
    let success = response.status === 200 && !response.error;
    return returnResponse(
      success,
      success ? response.data.message : response.error,
      response.status,
      null
    );
  } catch (error) {
    return error;
  }
};

// ==================== CONCEPTOS ====================

/**
 * Obtener lista pública de conceptos (solo activos)
 */
export const getPublicConcepts = async () => {
  try {
    const response = await api.get("/api/concepts/public");
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
 * Obtener todos los conceptos (admin)
 */
export const getConcepts = async () => {
  try {
    const response = await api.get("/api/concepts");
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
 * Crear concepto
 */
export const createConcept = async (data) => {
  try {
    const response = await api.post("/api/concepts", data);
    let success = (response.status === 200 || response.status === 201) && !response.error;
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
 * Actualizar concepto
 */
export const updateConcept = async (id, data) => {
  try {
    const response = await api.put(`/api/concepts/${id}`, data);
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
 * Eliminar concepto
 */
export const deleteConcept = async (id) => {
  try {
    const response = await api.delete(`/api/concepts/${id}`);
    let success = response.status === 200 && !response.error;
    return returnResponse(
      success,
      success ? response.data.message : response.error,
      response.status,
      null
    );
  } catch (error) {
    return error;
  }
};