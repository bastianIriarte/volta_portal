import api, {
  returnResponse
} from "./api";


// Función para obtener todos los registros
export const getDataDashboard = async () => {
  try {
    const response = await api.get("/api/dashboard");
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