import api, { returnResponse } from "./api";

// Obtener todas las solicitudes de registro
export const getRegistrationRequests = async (status = null, companyId = null) => {
  try {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (companyId) params.append("company_id", companyId);

    const url = `/api/registration-requests${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await api.get(url);
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

// Obtener solicitudes pendientes
export const getPendingRequests = async () => {
  try {
    const response = await api.get("/api/registration-requests/pending");
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

// Obtener solicitud por ID
export const getRegistrationRequestById = async (id) => {
  try {
    const response = await api.get(`/api/registration-requests/${id}`);
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

// Aprobar solicitud con permisos y empresas asignadas
export const approveRequest = async (id, permissions = [], assignedCompanies = []) => {
  try {
    const response = await api.post(`/api/registration-requests/${id}/approve`, {
      permissions,
      assigned_companies: assignedCompanies,
    });
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

// Rechazar solicitud
export const rejectRequest = async (id, reason) => {
  try {
    const response = await api.post(`/api/registration-requests/${id}/reject`, {
      rejection_reason: reason,
    });
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

// Eliminar solicitud
export const deleteRequest = async (id) => {
  try {
    const response = await api.delete(`/api/registration-requests/${id}`);
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

// Guardar permisos del usuario
export const saveUserPermissions = async (id, permissions) => {
  try {
    const response = await api.post(`/api/registration-requests/${id}/permissions`, {
      permissions,
    });
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

// Obtener empresas asignadas al usuario de una solicitud
export const getRequestCompanies = async (id) => {
  try {
    const response = await api.get(`/api/registration-requests/${id}/companies`);
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

// Obtener permisos del usuario
export const getUserPermissions = async (id) => {
  try {
    const response = await api.get(`/api/registration-requests/${id}/permissions`);
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
