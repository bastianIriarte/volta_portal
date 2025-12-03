import api, { returnResponse } from "../api";

// Obtener todas las boletas
export const getReceipts = async () => {
  try {
    const response = await api.get("/api/sap/receipts");
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

// Obtener una boleta por ID
export const getReceiptById = async (id) => {
  try {
    const response = await api.get(`/api/sap/receipts/${id}`);
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
