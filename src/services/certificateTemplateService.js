import api, { returnResponse } from "./api";

/**
 * Obtiene todas las plantillas de certificados
 */
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

/**
 * Obtiene una plantilla de certificado por ID
 * @param {number} id - ID de la plantilla
 */
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

/**
 * Obtiene una plantilla de certificado por código
 * @param {string} code - Código único de la plantilla
 */
export const getCertificateTemplateByCode = async (code) => {
  try {
    const response = await api.get(`/api/certificate-templates/code/${code}`);
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
 * Crea una nueva plantilla de certificado
 * @param {object} data - Datos de la plantilla
 */
export const createCertificateTemplate = async (data) => {
  try {
    const response = await api.post("/api/certificate-templates/store", data);
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
 * Actualiza una plantilla de certificado
 * @param {number} id - ID de la plantilla
 * @param {object} data - Datos actualizados
 */
export const updateCertificateTemplate = async (id, data) => {
  try {
    const response = await api.put(`/api/certificate-templates/${id}`, data);
    let success = (response.status === 200 || response.status === 204) && !response.error;
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
 * Elimina una plantilla de certificado
 * @param {number} id - ID de la plantilla
 */
export const deleteCertificateTemplate = async (id) => {
  try {
    const response = await api.delete(`/api/certificate-templates/${id}`);
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

/**
 * Clona una plantilla de certificado
 * @param {number} id - ID de la plantilla a clonar
 */
export const cloneCertificateTemplate = async (id) => {
  try {
    const response = await api.post(`/api/certificate-templates/${id}/clone`);
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
 * Genera preview PDF de una plantilla (modo builder)
 * @param {number} templateId - ID de la plantilla
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export const generatePreviewPdf = async (templateId) => {
  try {
    const response = await api.get(
      `/api/certificate-builder/templates/${templateId}/pdf?preview=true`,
      { responseType: "blob" }
    );

    if (response.status === 200) {
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      return { success: true, url };
    }

    return { success: false, error: "Error al generar preview" };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message || "Error al generar preview",
    };
  }
};

/**
 * Descarga PDF de una plantilla (modo builder)
 * @param {number} templateId - ID de la plantilla
 * @param {string} templateName - Nombre para el archivo descargado
 */
export const downloadPreviewPdf = async (templateId, templateName = "certificado") => {
  try {
    const response = await api.get(
      `/api/certificate-builder/templates/${templateId}/pdf?preview=true&download=true`,
      { responseType: "blob" }
    );

    if (response.status === 200) {
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${templateName}_preview.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return { success: true };
    }

    return { success: false, error: "Error al descargar PDF" };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message || "Error al descargar PDF",
    };
  }
};
