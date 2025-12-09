import api, { returnResponse } from "./api";

/**
 * Obtiene la configuración del builder (tipos de campo, campos predefinidos)
 */
export const getBuilderConfig = async () => {
  try {
    const response = await api.get("/api/certificate-builder/config");
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
 * Obtiene los tipos de datos simulados disponibles
 */
export const getDataTypes = async () => {
  try {
    const response = await api.get("/api/certificate-builder/data-types");
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
 * Obtiene datos simulados para preview
 */
export const getSimulatedData = async (type = "transporte_residuos") => {
  try {
    const response = await api.get(`/api/certificate-builder/simulated-data/${type}`);
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
 * Obtiene los campos de una plantilla
 */
export const getTemplateFields = async (templateId) => {
  try {
    const response = await api.get(`/api/certificate-builder/templates/${templateId}/fields`);
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
 * Guarda los campos de una plantilla
 */
export const saveTemplateFields = async (templateId, fields) => {
  try {
    const response = await api.post(`/api/certificate-builder/templates/${templateId}/fields`, {
      fields,
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

/**
 * Genera un preview del certificado
 */
export const generatePreview = async (templateId, dataType = "transporte_residuos") => {
  try {
    const response = await api.get(
      `/api/certificate-builder/templates/${templateId}/preview?data_type=${dataType}`
    );
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
 * Lista las imágenes subidas disponibles
 */
export const listBuilderImages = async (type = null) => {
  try {
    const url = type
      ? `/api/certificate-builder/images?type=${type}`
      : "/api/certificate-builder/images";
    const response = await api.get(url);
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
 * Sube una imagen para el builder de certificados
 */
export const uploadBuilderImage = async (file, type = "general") => {
  try {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("type", type);

    const response = await api.post("/api/certificate-builder/upload-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
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

/**
 * Elimina una imagen del builder
 */
export const deleteBuilderImage = async (path) => {
  try {
    const response = await api.delete("/api/certificate-builder/delete-image", {
      data: { path },
    });
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
 * Obtiene la URL para generar el PDF del certificado
 * @param {number} templateId - ID de la plantilla
 * @param {string} dataType - Tipo de datos simulados (transporte_residuos, gestion_residuos, lodos_grasos)
 * @param {boolean} download - Si es true, descarga el archivo. Si es false, lo muestra en el navegador
 * @returns {string} URL para acceder al PDF
 */
export const getCertificatePdfUrl = (templateId, dataType = "transporte_residuos", download = false) => {
  const baseUrl = api.defaults.baseURL || "";
  const downloadParam = download ? "&download=true" : "";
  return `${baseUrl}/api/certificate-builder/templates/${templateId}/pdf?data_type=${dataType}${downloadParam}`;
};

/**
 * Genera el PDF del certificado con datos personalizados
 * @param {number} templateId - ID de la plantilla
 * @param {object} data - Datos personalizados para el certificado
 * @param {boolean} download - Si es true, descarga el archivo
 */
export const generateCertificatePdf = async (templateId, data, download = false) => {
  try {
    const downloadParam = download ? "?download=true" : "";
    const response = await api.post(
      `/api/certificate-builder/templates/${templateId}/pdf${downloadParam}`,
      { data },
      { responseType: "blob" }
    );

    if (response.status === 200) {
      // Crear URL del blob y abrir/descargar
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      if (download) {
        const link = document.createElement("a");
        link.href = url;
        link.download = `certificado_${templateId}_${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        window.open(url, "_blank");
      }

      window.URL.revokeObjectURL(url);
      return returnResponse(true, "PDF generado correctamente", 200, null);
    }

    return returnResponse(false, "Error al generar el PDF", response.status, null);
  } catch (error) {
    return returnResponse(false, error.message || "Error al generar el PDF", 500, null);
  }
};
