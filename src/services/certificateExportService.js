import api, { returnResponse } from "./api";

// Listar exportaciones de certificados
export const getCertificateExports = async (params = {}) => {
  try {
    const response = await api.get("/api/certificate-exports", { params });
    let success = response.status === 200 && !response.error;
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

// Obtener detalle de una exportación
export const getCertificateExport = async (exportId) => {
  try {
    const response = await api.get(`/api/certificate-exports/${exportId}`);
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

// Verificar certificado por código
export const verifyCertificate = async (code) => {
  try {
    const response = await api.get(`/api/certificate-exports/verify/${code}`);
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

// Obtener estadísticas de exportaciones
export const getCertificateExportStats = async (params = {}) => {
  try {
    const response = await api.get("/api/certificate-exports/stats", { params });
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

// Eliminar exportación
export const deleteCertificateExport = async (exportId) => {
  try {
    const response = await api.delete(`/api/certificate-exports/${exportId}`);
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

// Descargar certificado (regenerar PDF)
export const downloadCertificateExport = async (exportId) => {
  try {
    const response = await api.get(`/api/certificate-exports/${exportId}/download`, {
      responseType: "blob",
    });
    return response;
  } catch (error) {
    return error;
  }
};

// Obtener versiones de una exportación
export const getCertificateExportVersions = async (exportId, params = {}) => {
  try {
    const response = await api.get(`/api/certificate-exports/${exportId}/versions`, { params });
    let success = response.status === 200 && !response.error;
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

// Obtener exportación con todas sus versiones
export const getCertificateExportWithVersions = async (exportId) => {
  try {
    const response = await api.get(`/api/certificate-exports/${exportId}/with-versions`);
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

// Descargar versión específica de un certificado
export const downloadCertificateVersion = async (versionId) => {
  try {
    const response = await api.get(`/api/certificate-exports/versions/${versionId}/download`, {
      responseType: "blob",
    });
    return response;
  } catch (error) {
    return error;
  }
};
