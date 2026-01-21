import api, { returnResponse } from "./api";

/**
 * Obtiene los reportes asignados a una empresa
 * @param {number} companyId - ID de la empresa
 */
export const getCompanyReports = async (companyId) => {
  try {
    const response = await api.get(`/api/company-reports/company/${companyId}`);
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
 * Obtiene todos los reportes de empresa
 */
export const getAllCompanyReports = async () => {
  try {
    const response = await api.get("/api/company-reports");
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
 * Asigna un reporte a una empresa
 * @param {object} data - Datos de asignación
 * @param {number} data.company_id - ID de la empresa
 * @param {number} data.report_template_id - ID del reporte
 */
export const assignReportToCompany = async (data) => {
  try {
    const response = await api.post("/api/company-reports", data);
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
 * Elimina una asignación de reporte
 * @param {number} id - ID de la asignación
 */
export const removeCompanyReport = async (id) => {
  try {
    const response = await api.delete(`/api/company-reports/${id}`);
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
