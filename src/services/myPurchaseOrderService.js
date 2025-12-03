import api, {
  returnResponse
} from "./api";

// Función para obtener todos los registros
export const getPurchaseOrders = async (parentId = null) => {
  try {
    const parameter = parentId > 0 ? `?parentId=${parentId}` : "";
    const response = await api.get("/api/purchase-orders" + parameter);
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


export const createPurchaseOrder = async (registerData) => {
  try {
    // Enviar solicitud POST para crear un nuevo registro
    const response = await api.post(`/api/purchase-orders/store`, registerData);
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
export const updatePurchaseOrder = async (id, registerData) => {
  try {

    const response = await api.put(`/api/purchase-orders/${id}`, registerData);
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
export const syncPurchaseOrder = async (id) => {
  try {

    const response = await api.post(`/api/purchase-orders/${id}/retry-integration`);
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
export const getPurchaseOrderById = async (id) => {
  try {
    const response = await api.get(`/api/purchase-orders/${id}`);
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