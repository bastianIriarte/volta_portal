import api, { returnResponse } from "./api";

// Get my profile data
export const getMyProfile = async () => {
  try {
    const response = await api.get("/api/my-profile");
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

// Update my profile
export const updateMyProfile = async (profileData) => {
  try {
    const response = await api.put("/api/my-profile", profileData);
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

// Update my password
export const updateMyPassword = async (passwordData) => {
  try {
    const response = await api.put("/api/my-profile/password", passwordData);
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
