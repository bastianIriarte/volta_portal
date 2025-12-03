import api, { returnResponse } from "../api";

/**
 * Obtiene las personas de contacto desde SAP Business One
 * @param {Object} params - Parámetros de búsqueda
 * @param {string} params.search - Término de búsqueda
 * @param {string} params.supplier_id - ID del proveedor (opcional)
 * @param {number} params.page - Número de página
 * @param {number} params.per_page - Registros por página
 * @returns {Promise<Object>} - Respuesta con datos de personas de contacto
 */
export const getContactPersons = async (code='') => {
    try {
        const response = await api.get(`/api/sap/contacts/${code}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener personas de contacto:', error);
        throw error;
    }
};

/**
 * Obtiene una persona de contacto específica por ID
 * @param {string} contactId - ID de la persona de contacto
 * @returns {Promise<Object>} - Datos de la persona de contacto
 */
export const getContactPersonById = async (contactId) => {
    try {
        const response = await api.get(`/api/sap/contact-persons/${contactId}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener persona de contacto:', error);
        throw error;
    }
};
