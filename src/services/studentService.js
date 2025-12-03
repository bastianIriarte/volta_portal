import api, {
  returnResponse
} from "./api";

// Función para obtener todos los registros
export const getStudents = async (parentId = null) => {
  try {
    const parameter = parentId > 0 ? `?parentId=${parentId}` : "";
    const response = await api.get("/api/students" + parameter);
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


export const createStudent = async (registerData) => {
  try {
    // Enviar solicitud POST para crear un nuevo registro
    const response = await api.post(`/api/students/store`, registerData);
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
export const updateStudent = async (id, registerData) => {
  try {

    const response = await api.put(`/api/students/${id}`, registerData);
    let success = response.status != 204 || response.error ? false : true;
    return returnResponse(
      success,
      success ? "Apoderado Modificado Corretamente" : response.error,
      response.status
    );
  } catch (error) {
    return error;
  }
};

// Función para obtener un registro por su ID
export const getStudentById = async (id) => {
  try {
    const response = await api.get(`/api/students/${id}`);
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
export const deleteStudent = async (id) => {
  try {
    const response = await api.delete(`/api/students/${id}`);
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


// Función para importar apoderados desde archivo Excel
export const storeByExcel = async (formData) => {
  try {
    const response = await api.post('/api/students/import-excel', formData, {
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