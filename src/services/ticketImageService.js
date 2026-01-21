import api, { returnResponse } from "./api";

// Listar todas las imágenes con paginación y filtros
export const getTicketImages = async (params = {}) => {
  try {
    const response = await api.get("/api/ticket-images", { params });
    let success = response.status === 200 && !response.error;
    return returnResponse(
      success,
      success ? response.data.message : response.error,
      response.status,
      success ? { data: response.data.data, pagination: response.data.pagination } : null
    );
  } catch (error) {
    return error;
  }
};

// Obtener registros desde SharePoint por rango de fecha
export const fetchTicketImagesFromSap = async (companyId, dateFrom, dateTo, rut = null) => {
  try {
    const payload = {
      company_id: companyId,
      date_from: dateFrom,
      date_to: dateTo,
    };
    // Solo agregar rut si tiene valor
    if (rut) {
      payload.rut = rut;
    }
    const response = await api.post("/api/ticket-images/fetch-sap", payload);
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

// Subir imagen para un ticket existente
export const uploadTicketImage = async (id, file) => {
  try {
    const formData = new FormData();
    formData.append("image", file);
    const response = await api.post(`/api/ticket-images/${id}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
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

// Crear registro manual con imagen
export const createManualTicketImage = async (companyId, docNum, file) => {
  try {
    const formData = new FormData();
    formData.append("company_id", companyId);
    formData.append("doc_num", docNum);
    if (file) {
      formData.append("image", file);
    }
    const response = await api.post("/api/ticket-images/create-manual", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    let success = response.status === 201 && !response.error;
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

// Obtener imagen por empresa y número de documento
export const getTicketImage = async (companyId, docNum) => {
  try {
    const response = await api.get(`/api/ticket-images/company/${companyId}/doc/${docNum}`);
    let success = response.status === 200 && !response.error;
    return returnResponse(
      success,
      success ? response.data.message : response.error,
      response.status,
      success ? response.data : null
    );
  } catch (error) {
    return error;
  }
};

// Verificar múltiples doc_nums para saber cuáles tienen imagen
export const checkTicketImages = async (companyId, docNums) => {
  try {
    const response = await api.post("/api/ticket-images/check", {
      company_id: companyId,
      doc_nums: docNums,
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

// Listar todas las imágenes de una empresa
export const listTicketImages = async (companyId) => {
  try {
    const response = await api.get(`/api/ticket-images/company/${companyId}`);
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

// Crear o actualizar registro de imagen
export const storeTicketImage = async (data) => {
  try {
    const response = await api.post("/api/ticket-images/store", data);
    let success = response.status === 201 && !response.error;
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

// Registrar múltiples imágenes (bulk)
export const bulkRegisterTicketImages = async (companyId, items) => {
  try {
    const response = await api.post("/api/ticket-images/bulk", {
      company_id: companyId,
      items: items,
    });
    let success = response.status === 201 && !response.error;
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

// Actualizar registro existente
export const updateTicketImage = async (id, data) => {
  try {
    const response = await api.put(`/api/ticket-images/${id}`, data);
    let success = response.status === 200 && !response.error;
    return returnResponse(
      success,
      success ? response.data.message : response.error,
      response.status
    );
  } catch (error) {
    return error;
  }
};

// Eliminar registro
export const deleteTicketImage = async (id) => {
  try {
    const response = await api.delete(`/api/ticket-images/${id}`);
    let success = response.status === 200 && !response.error;
    return returnResponse(
      success,
      success ? response.data.message : response.error,
      response.status
    );
  } catch (error) {
    return error;
  }
};
