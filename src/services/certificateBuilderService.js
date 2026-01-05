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

/**
 * Obtiene el historial de cambios de una plantilla de certificado
 * @param {number} templateId - ID de la plantilla
 * @param {number} limit - Límite de registros a obtener
 */
export const getTemplateLogs = async (templateId, limit = 50) => {
  try {
    const response = await api.get(`/api/certificate-templates/${templateId}/logs?limit=${limit}`);
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

// =====================================
// DATA SOURCES - Fuentes de datos dinámicas
// =====================================

/**
 * Obtiene las variables disponibles para un template
 * (desde fuentes configuradas o por defecto)
 */
export const getAvailableVariables = async (templateId) => {
  try {
    const response = await api.get(`/api/certificate-builder/templates/${templateId}/available-variables`);
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
 * Obtiene las fuentes de datos de un template
 */
export const getDataSources = async (templateId) => {
  try {
    const response = await api.get(`/api/certificate-builder/templates/${templateId}/data-sources`);
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
 * Crea una nueva fuente de datos
 */
export const createDataSource = async (data) => {
  try {
    const response = await api.post("/api/certificate-builder/data-sources", data);
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

/**
 * Actualiza una fuente de datos
 */
export const updateDataSource = async (id, data) => {
  try {
    const response = await api.put(`/api/certificate-builder/data-sources/${id}`, data);
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
 * Elimina una fuente de datos
 */
export const deleteDataSource = async (id) => {
  try {
    const response = await api.delete(`/api/certificate-builder/data-sources/${id}`);
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
 * Prueba una fuente de datos con parámetros de prueba
 */
export const testDataSource = async (id, params = {}) => {
  try {
    const response = await api.post(`/api/certificate-builder/data-sources/${id}/test`, { params });
    let success = response.status === 200 && response.data.status !== false;
    return returnResponse(
      success,
      success ? "Prueba exitosa" : response.data.error,
      response.status,
      success ? response.data.data : null
    );
  } catch (error) {
    return error;
  }
};

/**
 * Ejecuta todas las fuentes de datos de un template
 */
export const executeDataSources = async (templateId, params = {}) => {
  try {
    const response = await api.post(`/api/certificate-builder/templates/${templateId}/execute-sources`, { params });
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
 * Genera HTML de tabla desde una fuente de datos
 */
export const buildTableFromSource = async (sourceId, params = {}, options = {}) => {
  try {
    const response = await api.post(`/api/certificate-builder/data-sources/${sourceId}/build-table`, {
      params,
      options,
    });
    let success = response.status === 200 && !response.error;
    return returnResponse(
      success,
      success ? "Tabla generada" : response.error,
      response.status,
      success ? response.data.html : null
    );
  } catch (error) {
    return error;
  }
};
