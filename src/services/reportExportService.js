import api, { returnResponse } from "./api";

// Listar exportaciones
export const getReportExports = async (params = {}) => {
  try {
    const response = await api.get("/api/report-exports", { params });
    let success = response.status === 200 && !response.error;
    // El backend devuelve { code, data: [...], pagination, message }
    const data = response.data?.data || [];
    const pagination = response.data?.pagination || null;
    return returnResponse(
      success,
      success ? response.data.message : response.error,
      response.status,
      success ? { data, pagination } : null
    );
  } catch (error) {
    return error;
  }
};

// Exportar reporte a Excel
export const exportReportToExcel = async (reportCode, companyId, dateFrom, dateTo) => {
  try {
    const response = await api.post("/api/report-exports/export", {
      report_code: reportCode,
      company_id: companyId,
      date_from: dateFrom,
      date_to: dateTo,
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

// Descargar archivo de exportación
export const downloadReportExport = async (exportId) => {
  try {
    const response = await api.get(`/api/report-exports/${exportId}/download`, {
      responseType: "blob",
    });
    return response;
  } catch (error) {
    return error;
  }
};

// Eliminar exportación
export const deleteReportExport = async (exportId) => {
  try {
    const response = await api.delete(`/api/report-exports/${exportId}`);
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
