import api, { returnResponse } from "../api";

export const getBlanketAgreements = async (params = {}) => {
  try {
    const response = await api.get(`/api/sap/blanket-agreements`, { params });
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
