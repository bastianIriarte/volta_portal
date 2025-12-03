import api, {
  returnResponse
} from "./api";

// Función para obtener todos los registros
export const getCustomersList = async () => {
  try {
    const response = await api.get("/api/customers-list");
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

// Obtener todos los clientes con paginación, búsqueda y ordenamiento
export const getCustomers = async (params = {}) => {
  try {
    // Construir query params
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page);
    if (params.per_page) queryParams.append('per_page', params.per_page);
    if (params.search) queryParams.append('search', params.search);
    if (params.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params.sort_dir) queryParams.append('sort_dir', params.sort_dir);

    const queryString = queryParams.toString();
    const url = `/api/customers${queryString ? `?${queryString}` : ''}`;

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