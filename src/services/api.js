import axios from "axios";
import { encrypt, decrypt } from "../utils/encryption";

// ✅ Flag desde Vite (.env)
const ENCRYPTION_ENABLED = import.meta.env.VITE_API_ENCRYPTION_ENABLED === "true";
const DEBUG =import.meta.env.VITE_API_ENCRYPTION_LOG === "true";

export const returnResponse = (success, message, status, data = null) => {
  return { success, message, status, data };
};

// función para leer cookies (ej. XSRF)
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

// ✅ Crear instancia axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  withCredentials: true,
  headers: { "X-Requested-With": "XMLHttpRequest" },
});

// ✅ Interceptor de request
api.interceptors.request.use(
  async (config) => {
    const token = getCookie("XSRF-TOKEN");
    if (token) config.headers["X-XSRF-TOKEN"] = decodeURIComponent(token);

    if (ENCRYPTION_ENABLED && config.data) {
      if (DEBUG) console.log("[REQUEST] Body original:", config.data);

      try {
        const payload = await encrypt(
          typeof config.data === "string" ? config.data : JSON.stringify(config.data)
        );

        config.data = { payload };
        if (DEBUG) console.log("[REQUEST] Payload encriptado:", payload);
      } catch (e) {
        console.error("[REQUEST] Error encriptando:", e);
      }
    } else if (DEBUG) {
      console.log("[REQUEST] Envío sin encriptar:", config.data);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Interceptor de response
api.interceptors.response.use(
  async (response) => {
    try {
      if (ENCRYPTION_ENABLED && response.data?.response) {
        if (DEBUG) console.log("[RESPONSE] Response crudo:", response.data.response);

        const decrypted = await decrypt(response.data.response);
        if (DEBUG) console.log("[RESPONSE] JSON descifrado:", decrypted);

        response.data = JSON.parse(decrypted);
      } else if (DEBUG) {
        console.log("[RESPONSE] Respuesta sin encriptar:", response.data);
      }
    } catch (e) {
      console.error("[RESPONSE] Error desencriptando respuesta:", e);
    }
    return response;
  },
  (error) => {
    console.error(
      `[RESPONSE] Error en la API (${error.response?.status || "Desconocido"}):`,
      error.response?.data
    );
    let errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Error en la solicitud";

    return Promise.reject(
      returnResponse(false, errorMessage, error.response?.status ?? 500)
    );
  }
);

export default api;
