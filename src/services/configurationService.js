import api, { returnResponse } from "./api";

export const getConfigurations = async (code) => {
  try {
    const response = await api.get(`/api/configuration`, {
      params: { code }
    });
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

export const storeOrUpdate = async (data) => {
  try {
    const response = await api.post(`/api/configuration`, data);
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
