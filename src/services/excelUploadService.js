import api, {
  returnResponse
} from "./api";

// ========================================
// EXCEL UPLOADS - Gestión de cargas masivas
// ========================================

/**
 * Obtener lista de uploads con filtros opcionales
 * @param {Object} params - Parámetros de filtro (type, status, date_from, date_to, search, per_page)
 */
export const getUploads = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `/api/excel-uploads${queryString ? `?${queryString}` : ''}`;

    const response = await api.get(url);
    let success = response.status !== 200 || response.error ? false : true;

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
 * Obtener detalle de un upload específico
 * @param {number} id - ID del upload
 */
export const getUploadById = async (id) => {
  try {
    const response = await api.get(`/api/excel-uploads/${id}`);
    let success = response.status !== 200 || response.error ? false : true;

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
 * Subir archivo Excel
 * @param {File} file - Archivo Excel
 * @param {string} type - Tipo de carga (PARENTS, STUDENTS, TEACHERS, ENROLLMENTS, DEBTS)
 */
export const uploadFile = async (file, type) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await api.post('/api/excel-uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });

    let success = response.status !== 201 || response.error ? false : true;

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
 * Actualizar una línea del upload
 * @param {number} uploadId - ID del upload
 * @param {number} lineNumber - Número de línea
 * @param {Object} data - Nuevos datos de la línea
 */
export const updateLine = async (uploadId, lineNumber, data) => {
  try {
    const response = await api.put(
      `/api/excel-uploads/${uploadId}/lines/${lineNumber}`, {
        data
      }
    );

    let success = response.status !== 200 || response.error ? false : true;

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
 * Confirmar el upload y crear/actualizar registros
 * @param {number} id - ID del upload
 */
export const confirmUpload = async (id) => {
  try {
    const response = await api.post(`/api/excel-uploads/${id}/confirm`);
    let success = response.status !== 200 || response.error ? false : true;

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
 * Cancelar un upload
 * @param {number} id - ID del upload
 * @param {string} reason - Razón de cancelación (opcional)
 */
export const cancelUpload = async (id, reason = null) => {
  try {
    const response = await api.post(`/api/excel-uploads/${id}/cancel`, {
      reason: reason || 'Cancelado por el usuario'
    });

    let success = response.status !== 200 || response.error ? false : true;

    return returnResponse(
      success,
      success ? response.data.message : response.error,
      response.status
    );
  } catch (error) {
    return error;
  }
};

/**
 * Eliminar un upload
 * @param {number} id - ID del upload
 */
export const deleteUpload = async (id) => {
  try {
    const response = await api.delete(`/api/excel-uploads/${id}`);
    let success = response.status !== 200 || response.error ? false : true;

    return returnResponse(
      success,
      success ? response.data.message : response.error,
      response.status
    );
  } catch (error) {
    return error;
  }
};

/**
 * Reprocesar una carga que falló
 * @param {number} id - ID del upload
 */
export const reprocessUpload = async (id) => {
  try {
    const response = await api.post(`/api/excel-uploads/${id}/reprocess`);
    let success = response.status !== 200 || response.error ? false : true;

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
 * Obtener logs de una carga
 * @param {number} id - ID del upload
 */
export const getUploadLogs = async (id) => {
  try {
    const response = await api.get(`/api/excel-uploads/${id}/logs`);
    let success = response.status !== 200 || response.error ? false : true;

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
 * Obtener estadísticas generales
 * @param {Object} params - Parámetros (date_from, date_to)
 */
export const getUploadStats = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `/api/excel-uploads/stats${queryString ? `?${queryString}` : ''}`;

    const response = await api.get(url);
    let success = response.status !== 200 || response.error ? false : true;

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

// ========================================
// EXCEL UPLOAD TYPES - Tipos de carga
// ========================================

/**
 * Obtener tipos de carga disponibles
 */
export const getUploadTypes = async () => {
  try {
    const response = await api.get('/api/excel-upload-types');
    let success = response.status !== 200 || response.error ? false : true;

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
 * Obtener detalle de un tipo específico
 * @param {string} code - Código del tipo (PARENTS, STUDENTS, etc.)
 */
export const getUploadTypeDetail = async (code) => {
  try {
    const response = await api.get(`/api/excel-upload-types/${code}`);
    let success = response.status !== 200 || response.error ? false : true;

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
 * Descargar plantilla Excel de un tipo
 * @param {string} code - Código del tipo
 */
export const downloadTemplate = async (code) => {
  try {
    const response = await api.get(`/api/excel-upload-types/${code.toLowerCase()}/template`);
    const {
      url,
      file_name
    } = response.data.data;

    if (!url) throw new Error("No se encontró la plantilla.");

    // ✅ Abre la descarga directamente en una nueva pestaña
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", file_name);
    document.body.appendChild(link);
    link.click();
    link.remove();

    return {
      success: true,
      message: "Plantilla descargada correctamente"
    };

  } catch (error) {
    console.error("Error al descargar plantilla", error);
    return {
      success: false,
      message: "Error al descargar plantilla"
    };
  }
};

/**
 * Obtener estadísticas de un tipo específico
 * @param {string} code - Código del tipo
 * @param {Object} params - Parámetros (date_from, date_to)
 */
export const getTypeStats = async (code, params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `/api/excel-upload-types/${code}/stats${queryString ? `?${queryString}` : ''}`;

    const response = await api.get(url);
    let success = response.status !== 200 || response.error ? false : true;

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

// ========================================
// UPLOAD LINES - Gestión de líneas
// ========================================

/**
 * Obtener líneas con filtros
 * @param {Object} params - Parámetros (upload_id, status, editable, edited, per_page)
 */
export const getUploadLines = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `/api/upload-lines${queryString ? `?${queryString}` : ''}`;

    const response = await api.get(url);
    let success = response.status !== 200 || response.error ? false : true;

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
 * Obtener detalle de una línea
 * @param {number} id - ID de la línea
 */
export const getUploadLineById = async (id) => {
  try {
    const response = await api.get(`/api/upload-lines/${id}`);
    let success = response.status !== 200 || response.error ? false : true;

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
 * Actualizar múltiples líneas
 * @param {Array} lines - Array de objetos { id, data }
 */
export const bulkUpdateLines = async (lines) => {
  try {
    const response = await api.post('/api/upload-lines/bulk-update', {
      lines
    });
    let success = response.status !== 200 || response.error ? false : true;

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
 * Restaurar línea a datos originales
 * @param {number} id - ID de la línea
 */
export const restoreLine = async (id) => {
  try {
    const response = await api.post(`/api/upload-lines/${id}/restore`);
    let success = response.status !== 200 || response.error ? false : true;

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
 * Eliminar una línea específica
 * @param {number} uploadId - ID del upload
 * @param {number} lineNumber - Número de línea a eliminar
 */
export const deleteLine = async (uploadId, lineNumber) => {
  try {
    const response = await api.delete(`/api/upload-lines/${uploadId}/lines/${lineNumber}`);
    let success = response.status !== 200 || response.error ? false : true;
    
    return returnResponse(
      success,
      success ? response.data.message : response.error,
      response.status
    );
  } catch (error) {
    return error;
  }
};

/**
 * Eliminar múltiples líneas
 * @param {number} uploadId - ID del upload
 * @param {Array} lineNumbers - Array de números de línea a eliminar
 */
export const bulkDeleteLines = async (uploadId, lineNumbers) => {
  try {
    const response = await api.post(`/api/upload-lines/${uploadId}/lines/bulk-delete`, {
      line_numbers: lineNumbers
    });
    let success = response.status !== 200 || response.error ? false : true;
    
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