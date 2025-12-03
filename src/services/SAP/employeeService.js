import api, { returnResponse } from "../api";

/**
 * Obtiene los empleados desde SAP Business One
 * @param {Object} params - Parámetros de búsqueda
 * @param {string} params.search - Término de búsqueda
 * @param {string} params.department - Departamento (opcional)
 * @param {number} params.page - Número de página
 * @param {number} params.per_page - Registros por página
 * @returns {Promise<Object>} - Respuesta con datos de empleados
 */
export const getEmployees = async (params = {}) => {
    try {
        const response = await api.get('/sap/employees', { params });
        return response.data;
    } catch (error) {
        console.error('Error al obtener empleados:', error);
        throw error;
    }
};

/**
 * Obtiene empleados del departamento de ventas/compras
 * @param {Object} params - Parámetros de búsqueda
 * @returns {Promise<Object>} - Respuesta con datos de empleados
 */
export const getSalesEmployees = async (params = {}) => {
    try {
        const response = await api.get('/api/sap/sales-employees', { params });
        return response.data;
    } catch (error) {
        console.error('Error al obtener empleados de ventas:', error);
        throw error;
    }
};

/**
 * Obtiene un empleado específico por código
 * @param {string} employeeCode - Código del empleado
 * @returns {Promise<Object>} - Datos del empleado
 */
export const getEmployeeByCode = async (employeeCode) => {
    try {
        const response = await api.get(`/api/sap/employees/${employeeCode}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener empleado:', error);
        throw error;
    }
};
