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

// Buscar empresa en SAP por RUT
export const searchCompanyInSap = async (rut) => {
  try {
    const response = await api.post("/api/companies/search-sap", { rut });
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
