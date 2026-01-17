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

// Ejecutar reporte por código con parámetros de empresa
// GET /api/reports/data/{code}?company_id=X&date_from=YYYY-MM-DD&date_to=YYYY-MM-DD
export const executeReportByCode = async (code, params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.company_id) queryParams.append("company_id", params.company_id);
    if (params.date_from) queryParams.append("date_from", params.date_from);
    if (params.date_to) queryParams.append("date_to", params.date_to);

    const url = `/api/reports/data/${code}?${queryParams.toString()}`;
    const response = await api.get(url);
    let success = response.status === 200 && !response.error;

    // response.data.data contiene: { data: [], total, template, company, params }
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
