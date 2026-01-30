import axios from "axios";
import { encrypt, decrypt } from "../utils/encryption";

// ✅ Flag desde Vite (.env)
const ENCRYPTION_ENABLED = import.meta.env.VITE_API_ENCRYPTION_ENABLED === "true";
const DEBUG = import.meta.env.VITE_API_ENCRYPTION_LOG === "true";

// ✅ Key para localStorage
const TOKEN_KEY = "auth_token";

export const returnResponse = (success, message, status, data = null) => {
  return { success, message, status, data };
};

// ✅ Funciones para manejar el token
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

// ✅ Crear instancia axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  headers: { "X-Requested-With": "XMLHttpRequest" },
});

// ✅ Interceptor de request
api.interceptors.request.use(
  async (config) => {
    // Agregar token de autenticación si existe
    const token = getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

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
  async (error) => {
    console.error(
      `[RESPONSE] Error en la API (${error.response?.status || "Desconocido"}):`,
      error.response?.data
    );

    // Extraer mensaje de error (soporta mayúsculas y minúsculas del backend)
    let data = error.response?.data;

    // Si la respuesta es un Blob (ej: responseType: "blob"), parsearlo como JSON
    if (data instanceof Blob) {
      try {
        const text = await data.text();
        data = JSON.parse(text);
      } catch {
        // Si no se puede parsear, mantener data como está
      }
    }

    let errorMessage =
      data?.message ||
      data?.Message ||
      data?.error ||
      data?.Error ||
      "Error en la solicitud";

    return Promise.reject(
      returnResponse(false, errorMessage, error.response?.status ?? 500)
    );
  }
);

export default api;
