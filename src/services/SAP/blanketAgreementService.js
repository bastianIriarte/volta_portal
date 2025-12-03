import api, { returnResponse } from "../api";
/**
 * Obtiene los acuerdos globales (Blanket Agreements) desde SAP Business One
 * @param {Object} params - Parámetros de búsqueda
 * @param {string} params.search - Término de búsqueda
 * @param {number} params.page - Número de página
 * @param {number} params.per_page - Registros por página
 * @returns {Promise<Object>} - Respuesta con datos de acuerdos
 */
export const getBlanketAgreements = async (params = {}) => {
    try {
        const response = await api.get('/api/sap/blanket-agreements', { params });
        return response.data;
    } catch (error) {
        console.error('Error al obtener acuerdos globales:', error);
        throw error;
    }
};

/**
 * Obtiene un acuerdo global específico por número
 * @param {string} agreementNum - Número del acuerdo
 * @returns {Promise<Object>} - Datos del acuerdo
 */
export const getBlanketAgreementByNum = async (agreementNum) => {
    try {
        const response = await api.get(`/api/sap/blanket-agreements/${agreementNum}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener acuerdo global:', error);
        throw error;
    }
};
