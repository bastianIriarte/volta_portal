import api, { returnResponse } from "./api";

const encodeBase64 = (text) => {
  const encoder = new TextEncoder(); // Crear un TextEncoder
  const bytes = encoder.encode(text); // Convertir el texto a bytes
  const binaryString = String.fromCharCode(...bytes); // Convertir los bytes a una cadena binaria
  return btoa(binaryString); // Codificar en Base64
};

// Función para obtener todos los registros
export const getConfigurations = async (code) => {
  try {
    const response = await api.get(`api/configuration?code=${code}`);
    // console.log(`response getTags ${JSON.stringify(response)}`);
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

export const storeOrUpdate = async (code, data) => {
  try {
    const encodedData = encodeBase64(JSON.stringify(data));
    console.log(data)
    // Enviar solicitud POST para ejecutar la query
    const response = await api.post("api/configuration", {
      code,
      data: encodedData,
    });
    // console.log(`response storeOrUpdate ${JSON.stringify(response)}`);
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
