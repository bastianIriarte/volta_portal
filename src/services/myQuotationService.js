import api, {
  returnResponse
} from "./api";

// Función para obtener todos los registros
export const getQuotations = async (parentId = null) => {
  try {
    const parameter = parentId > 0 ? `?parentId=${parentId}` : "";
    const response = await api.get("/api/quotations" + parameter);
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


export const createQuotation = async (registerData) => {
  try {
    // Enviar solicitud POST para crear un nuevo registro
    const response = await api.post(`/api/quotations/store`, registerData);
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
export const updateQuotation = async (id, registerData) => {
  try {

    const response = await api.put(`/api/quotations/${id}`, registerData);
    let success = response.status != 204 || response.error ? false : true;
    return returnResponse(
      success,
      success ? "Orden de Compra Modificada Corretamente" : response.error,
      response.status
    );
  } catch (error) {
    return error;
  }
};

// Función para integrar un registro por su ID
export const syncQuotation = async (id) => {
  try {

    const response = await api.post(`/api/quotations/${id}/retry-integration`);
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

// Función para obtener un registro por su ID
export const getQuotationById = async (id) => {
  try {
    const response = await api.get(`/api/quotations/${id}`);
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