import api, {
    returnResponse
} from "../api";
/**
 * Obtiene las cuentas mayor (GL Accounts) desde SAP Business One
 * @param {Object} params - Parámetros de búsqueda
 * @param {string} params.search - Término de búsqueda
 * @param {number} params.page - Número de página
 * @param {number} params.per_page - Registros por página
 * @returns {Promise<Object>} - Respuesta con datos de cuentas
 */
export const getGLAccounts = async (params = {}) => {
    try {
        const response = await api.get('/api/sap/accounts', {
            params
        });
        // console.log(`response getTags ${JSON.stringify(response)}`);
        let success = response.status != 200 || response.error ? false : true;
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
 * Obtiene una cuenta mayor específica por código
 * @param {string} accountCode - Código de la cuenta
 * @returns {Promise<Object>} - Datos de la cuenta
 */
export const getGLAccountByCode = async (accountCode) => {
    try {
        const response = await api.get(`/api/sap/accounts/${accountCode}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener cuenta mayor:', error);
        throw error;
    }
};