import api, { returnResponse } from "./api";

// Obtener todas las plantillas de reportes
export const getReportTemplates = async () => {
  try {
    const response = await api.get("/api/report-templates");
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

// Obtener plantilla de reporte por ID
export const getReportTemplateById = async (id) => {
  try {
    const response = await api.get(`/api/report-templates/${id}`);
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

// Crear plantilla de reporte
export const createReportTemplate = async (data) => {
  try {
    const response = await api.post("/api/report-templates/store", data);
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

// Actualizar plantilla de reporte
export const updateReportTemplate = async (id, data) => {
  try {
    const response = await api.put(`/api/report-templates/${id}`, data);
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

// Eliminar plantilla de reporte
export const deleteReportTemplate = async (id) => {
  try {
    const response = await api.delete(`/api/report-templates/${id}`);
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
