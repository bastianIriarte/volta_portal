import api, { returnResponse } from "./api";

// Obtener todas las empresas
export const getCompanies = async () => {
  try {
    const response = await api.get("/api/companies");
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

// Obtener lista simplificada de empresas (para selects)
export const getCompaniesList = async () => {
  try {
    const response = await api.get("/api/companies-list");
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

// Buscar empresa en SAP por RUT y código SAP
export const searchCompanyInSap = async (rut, sapCode) => {
  try {
    const response = await api.post("/api/companies/search-sap", { rut, sap_code: sapCode });
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

// Crear nueva empresa
export const createCompany = async (registerData) => {
  try {
    const response = await api.post("/api/companies/store", registerData);
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

// Actualizar empresa por ID
export const updateCompany = async (id, registerData) => {
  try {
    const response = await api.put(`/api/companies/${id}`, registerData);
    let success = response.status === 204 && !response.error;
    return returnResponse(
      success,
      success ? "Empresa modificada correctamente" : response.error,
      response.status
    );
  } catch (error) {
    return error;
  }
};

// Obtener empresa por ID
export const getCompanyById = async (id) => {
  try {
    const response = await api.get(`/api/companies/${id}`);
    let success = response.status === 200 && !response.error;
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

// Eliminar empresa por ID
export const deleteCompany = async (id) => {
  try {
    const response = await api.delete(`/api/companies/${id}`);
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

// Obtener certificados de una empresa
export const getCompanyCertificates = async (companyId) => {
  try {
    const response = await api.get(`/api/company-certificates/company/${companyId}`);
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

// Obtener documentos de una empresa
export const getCompanyDocuments = async (companyId) => {
  try {
    const response = await api.get(`/api/company-documents/company/${companyId}`);
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

// Obtener tipos de documentos disponibles
export const getDocumentTypes = async (companyId = null) => {
  try {
    const params = companyId ? { company_id: companyId } : {};
    const response = await api.get("/api/company-documents/types", { params });
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

// Descargar documento de empresa
export const downloadCompanyDocument = async (documentId) => {
  try {
    const response = await api.get(`/api/company-documents/${documentId}/download`, {
      responseType: 'blob'
    });
    return response;
  } catch (error) {
    return error;
  }
};

// Crear documento de empresa
export const createCompanyDocument = async (data) => {
  try {
    const response = await api.post("/api/company-documents/store", data);
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

// Actualizar documento de empresa
export const updateCompanyDocument = async (id, data) => {
  try {
    const response = await api.put(`/api/company-documents/${id}`, data);
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

// Eliminar documento de empresa
export const deleteCompanyDocument = async (id) => {
  try {
    const response = await api.delete(`/api/company-documents/${id}`);
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

// Obtener documentos fijos de una empresa (los crea si no existen)
export const getFixedDocuments = async (companyId) => {
  try {
    const response = await api.get(`/api/company-documents/fixed/${companyId}`);
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

// Actualizar documento fijo (solo file_path y status)
export const updateFixedDocument = async (id, data) => {
  try {
    const response = await api.put(`/api/company-documents/fixed/${id}`, data);
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

// Asignar certificado a empresa
export const assignCertificateToCompany = async (data) => {
  try {
    const response = await api.post("/api/company-certificates/store", data);
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

// Revocar certificado de empresa
export const revokeCompanyCertificate = async (id) => {
  try {
    const response = await api.post(`/api/company-certificates/${id}/revoke`);
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

// Actualizar company_certificate (report_url, etc.)
export const updateCompanyCertificate = async (id, data) => {
  try {
    const response = await api.put(`/api/company-certificates/${id}`, data);
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

// Obtener plantillas de certificados disponibles
export const getCertificateTemplates = async () => {
  try {
    const response = await api.get("/api/certificate-templates");
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

// Obtener certificados asignados a una empresa específica
export const getCertificatesByCompany = async (companyId) => {
  try {
    const response = await api.get(`/api/certificate-templates/company/${companyId}`);
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

// Asignar multiples certificados a una empresa (bulk)
export const bulkAssignCertificates = async (companyId, certificateIds) => {
  try {
    const response = await api.post("/api/company-certificates/bulk", {
      company_id: companyId,
      certificate_ids: certificateIds,
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

// Obtener plantilla de certificado por ID
export const getCertificateTemplateById = async (id) => {
  try {
    const response = await api.get(`/api/certificate-templates/${id}`);
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

// Obtener documentos fijos de una empresa
export const getCompanyFixedDocuments = async (companyId) => {
  try {
    const response = await api.get(`/api/company-documents/fixed/${companyId}`);
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

// ==========================================
// PLANTILLAS DE REPORTES
// ==========================================

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

// ==========================================
// REPORTES DE EMPRESA (Asignaciones)
// ==========================================

// Obtener todos los reportes de una empresa
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

// Crear reporte de empresa
export const createCompanyReport = async (data) => {
  try {
    const response = await api.post("/api/company-reports/store", data);
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

// Actualizar reporte de empresa
export const updateCompanyReport = async (id, data) => {
  try {
    const response = await api.put(`/api/company-reports/${id}`, data);
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

// Eliminar reporte de empresa
export const deleteCompanyReport = async (id) => {
  try {
    const response = await api.delete(`/api/company-reports/${id}`);
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

// Revocar reporte de empresa
export const revokeCompanyReport = async (id) => {
  try {
    const response = await api.post(`/api/company-reports/${id}/revoke`);
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

// Ejecutar fuente de datos del reporte
export const executeReportDataSource = async (id, params = {}) => {
  try {
    const response = await api.post(`/api/company-reports/${id}/execute`, params);
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

// ==========================================
// PLANTILLAS DE FACTURAS
// ==========================================

// Obtener todas las plantillas de facturas
export const getInvoiceTemplates = async () => {
  try {
    const response = await api.get("/api/invoice-templates");
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

// ==========================================
// FACTURAS DE EMPRESA (Asignaciones)
// ==========================================

// Obtener todas las facturas de una empresa
export const getCompanyInvoices = async (companyId) => {
  try {
    const response = await api.get(`/api/company-invoices/company/${companyId}`);
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

// Crear factura de empresa
export const createCompanyInvoice = async (data) => {
  try {
    const response = await api.post("/api/company-invoices/store", data);
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

// Actualizar factura de empresa
export const updateCompanyInvoice = async (id, data) => {
  try {
    const response = await api.put(`/api/company-invoices/${id}`, data);
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

// Eliminar factura de empresa
export const deleteCompanyInvoice = async (id) => {
  try {
    const response = await api.delete(`/api/company-invoices/${id}`);
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

// Revocar factura de empresa
export const revokeCompanyInvoice = async (id) => {
  try {
    const response = await api.post(`/api/company-invoices/${id}/revoke`);
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

// Ejecutar fuente de datos de factura
export const executeInvoiceDataSource = async (id, params = {}) => {
  try {
    const response = await api.post(`/api/company-invoices/${id}/execute`, params);
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
