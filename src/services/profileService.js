import api, { returnResponse } from "./api";

// Get all profiles with permissions
export const getProfiles = async () => {
    try {
        const response = await api.get("api/profiles");
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

// Get all permissions grouped by category
export const getPermissions = async () => {
    try {
        const response = await api.get("api/permissions");
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

// Create a new profile
export const createProfile = async (profileData) => {
    try {
        const response = await api.post(`api/profiles/store`, profileData);
        let success = response.status != 201 || response.error ? false : true;
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

// Update a profile by ID
export const updateProfile = async (id, profileData) => {
    try {
        const response = await api.put(`api/profiles/${id}/update`, profileData);
        let success = response.status != 204 || response.error ? false : true;
        return returnResponse(
            success,
            success ? "Perfil Modificado Correctamente" : response.error,
            response.status
        );
    } catch (error) {
        return error;
    }
};

// Get profile by ID
export const getProfileById = async (id) => {
    try {
        const response = await api.get(`api/profiles/${id}`);
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

// Delete a profile by ID
export const deleteProfile = async (id) => {
    try {
        const response = await api.delete(`api/profiles/${id}/delete`);
        let success = response.status != 200 || response.error ? false : true;
        return returnResponse(
            success,
            success ? response.data.message : response.error,
            response.status
        );
    } catch (error) {
        return error;
    }
};

// Update permissions matrix for all profiles
export const updatePermissionsMatrix = async (profilesWithPermissions) => {
    try {
        // profilesWithPermissions is an object: { profileId: [permissionId1, permissionId2, ...], ... }
        const response = await api.post(`api/profiles/permissions-matrix`, { profiles: profilesWithPermissions });
        let success = response.status === 200 || response.status === 201;
        return returnResponse(
            success,
            success ? response.data.message || "Permisos actualizados correctamente" : response.error,
            response.status,
            success ? response.data.data : null
        );
    } catch (error) {
        return error;
    }
};
