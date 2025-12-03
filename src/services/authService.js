import api, {
  returnResponse
} from "./api";

export const login = async (rut, password) => {
  // 🔑 Paso 1: pedir CSRF cookie
  await api.get("/sanctum/csrf-cookie");

  // 🔑 Paso 2: ahora sí login
  try {
    const response = await api.post("/api/login", {
      rut,
      password
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

export const getUser = async () => {
  try {
    const response = await api.get("/api/me");
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

export const activateAccount = async (registerData) => {
  try {
    const response = await api.post(`/api/activate-account`, registerData);
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
export const validateCodeActivation = async (registerData) => {
  try {
    const response = await api.post(`/api/validate-code-account`, registerData);
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

export const activatePasswordWithCode = async (registerData) => {
  try {
    const response = await api.post(`/api/activate-password`, registerData);
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

export const recoveryPassword = async (registerData) => {
  try {
    const response = await api.post(`/api/recovery`, registerData);
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

export const validateRecoveryCode = async (registerData) => {
  try {
    const response = await api.post(`/api/validate-code`, registerData);
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

export const resetPasswordWithCode = async (registerData) => {
  try {
    const response = await api.post(`/api/reset-password`, registerData);
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



export const logout = async () => {
  try {
    const response = await api.post("/api/logout");
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