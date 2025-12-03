import api, { returnResponse } from "../api";

// Obtener todas las facturas de venta
export const getSalesInvoices = async () => {
  try {
    const response = await api.get("/api/sap/sales-invoices");
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

// Obtener una factura de venta por ID
export const getSalesInvoiceById = async (id) => {
  try {
    const response = await api.get(`/api/sap/sales-invoices/${id}`);
    let success = response.status != 200 || response.error ? false : true;
    return returnResponse(
      success,
      success ? "OK" : response.error,
      response.status,
      success ? response.data.data : null
    );
  } catch (error) {
    return error;
  }
};
