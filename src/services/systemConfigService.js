import api, { returnResponse } from "./api";

// =====================================
// CONFIGURACIÓN DEL SISTEMA
// =====================================

/**
 * Obtiene toda la configuración del sistema
 * Incluye variables de sistema y parámetros sugeridos
 */
export const getSystemConfig = async () => {
  try {
    const response = await api.get("/api/system-config");
    let success = response.status === 200 && response.data.status !== false;
    return returnResponse(
      success,
      success ? response.data.message : response.data.message,
      response.status,
      success ? response.data.data : null
    );
  } catch (error) {
    return error;
  }
};

/**
 * Obtiene las variables de sistema (para certificados/reportes)
 * Organizadas por categorías: sistema, empresa, certificado, filtros
 */
export const getSystemVariables = async () => {
  try {
    const response = await api.get("/api/system-config/variables");
    let success = response.status === 200 && response.data.status !== false;
    return returnResponse(
      success,
      success ? response.data.message : response.data.message,
      response.status,
      success ? response.data.data : null
    );
  } catch (error) {
    return error;
  }
};

/**
 * Obtiene los parámetros sugeridos para queries SQL
 * Organizados por categorías: empresa, fechas, documentos, otros
 */
export const getSuggestedQueryParams = async () => {
  try {
    const response = await api.get("/api/system-config/query-params");
    let success = response.status === 200 && response.data.status !== false;
    return returnResponse(
      success,
      success ? response.data.message : response.data.message,
      response.status,
      success ? response.data.data : null
    );
  } catch (error) {
    return error;
  }
};

/**
 * Obtiene los parámetros sugeridos como lista plana (sin categorías)
 * Útil para selectores simples
 */
export const getSuggestedQueryParamsFlat = async () => {
  try {
    const response = await api.get("/api/system-config/query-params/flat");
    let success = response.status === 200 && response.data.status !== false;
    return returnResponse(
      success,
      success ? response.data.message : response.data.message,
      response.status,
      success ? response.data.data : null
    );
  } catch (error) {
    return error;
  }
};
