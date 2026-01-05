import api, { returnResponse } from "./api";

// Obtener todas las plantillas de facturas
export const getInvoiceTemplates = async () => {
  try {
    const response = await api.get("/api/invoice-templates");
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

// Obtener plantilla de factura por ID
export const getInvoiceTemplateById = async (id) => {
  try {
    const response = await api.get(`/api/invoice-templates/${id}`);
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

// Crear plantilla de factura
export const createInvoiceTemplate = async (data) => {
  try {
    const response = await api.post("/api/invoice-templates/store", data);
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

// Actualizar plantilla de factura
export const updateInvoiceTemplate = async (id, data) => {
  try {
    const response = await api.put(`/api/invoice-templates/${id}`, data);
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

// Eliminar plantilla de factura
export const deleteInvoiceTemplate = async (id) => {
  try {
    const response = await api.delete(`/api/invoice-templates/${id}`);
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
