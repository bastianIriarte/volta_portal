import api, {
  returnResponse,
  setToken,
  removeToken
} from "./api";

export const login = async (rut, password) => {
  try {
    const response = await api.post("/api/login", {
      rut,
      password
    });

    let success = response.status != 200 || response.error ? false : true;

    // Guardar token si el login fue exitoso
    if (success && response.data?.data?.token) {
      setToken(response.data.data.token);
    }

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
    // Siempre eliminar token local al hacer logout
    removeToken();
    let success = response.status != 200 || response.error ? false : true;
    return returnResponse(
      success,
      success ? response.data.message : response.error,
      response.status,
      success ? response.data.data : null
    );
  } catch (error) {
    // Eliminar token incluso si hay error
    removeToken();
    return error;
  }
};

// ==================== REGISTRO DE NUEVOS USUARIOS ====================

/**
 * Valida la empresa en SAP (RUT + código SAP)
 * @param {Object} data - { company_rut, sap_code }
 */
export const validateSapCompany = async (data) => {
  try {
    const response = await api.post(`/api/registration/validate-sap`, data);
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
 * Envía una solicitud de registro
 * @param {Object} data - Datos del solicitante y empresa
 */
export const submitRegistrationRequest = async (data) => {
  try {
    const response = await api.post(`/api/registration/request`, data);
    let success = response.status != 200 && response.status != 201 || response.error ? false : true;
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