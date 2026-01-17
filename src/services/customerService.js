import api, {
  returnResponse
} from "./api";

// Función para obtener todos los clientes (usuarios con perfil customer)
export const getCustomersList = async () => {
  try {
    const response = await api.get("/api/users/customers");
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

// Obtener todos los clientes (usuarios con perfil customer)
export const getCustomers = async (params = {}) => {
  try {
    const response = await api.get("/api/users/customers");
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


export const createCustomer = async (registerData) => {
  try {
    // Enviar solicitud POST para crear un nuevo registro
    const response = await api.post(`/api/customers/store`, registerData);
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
export const updateCustomer = async (id, registerData) => {
  try {

    const response = await api.put(`/api/customers/${id}`, registerData);
    let success = response.status != 204 || response.error ? false : true;
    return returnResponse(
      success,
      success ? "Cliente Modificado Corretamente" : response.error,
      response.status
    );
  } catch (error) {
    return error;
  }
};

// Función para obtener un registro por su ID
export const getCustomerById = async (id) => {
  try {
    const response = await api.get(`/api/customers/${id}`);
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
export const deleteCustomer = async (id) => {
  try {
    const response = await api.delete(`/api/customers/${id}`);
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


// Función para importar Clientes desde archivo Excel
export const storeByExcel = async (formData) => {
  try {
    const response = await api.post('/api/customers/import-excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
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

// Obtener permisos de un cliente/usuario (formato report_X, cert_X, doc_X)
export const getCustomerPermissions = async (userId) => {
  try {
    const response = await api.get(`/api/user-permissions/${userId}/all`);
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

// Asignar permisos masivamente a un cliente/usuario
export const saveCustomerPermissions = async (userId, permissions) => {
  try {
    const response = await api.post(`/api/user-permissions/bulk`, {
      user_id: userId,
      permissions: permissions
    });
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

// Cambiar estado de un cliente/usuario (habilitar/deshabilitar)
export const toggleCustomerStatus = async (userId, status) => {
  try {
    const response = await api.patch(`/api/users/${userId}/status`, { status });
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

// Eliminar un cliente/usuario
export const deleteCustomerUser = async (userId) => {
  try {
    const response = await api.delete(`/api/users/${userId}`);
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