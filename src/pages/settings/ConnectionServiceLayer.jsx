import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle,
  Loader2,
  Info,
  Eye,
  EyeOff,
} from "lucide-react";
import { handleSnackbar } from "../../utils/messageHelpers";
import { getConfigurations, storeOrUpdate } from "../../services/configurationService";
import { Button } from "../../components/ui/Button";

export default function ConnectionServiceLayer() {
  const navigate = useNavigate();
  const code = 'service_layer';

  // Estados de carga
  const [isLoading, setIsLoading] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);

  // Estado de validación
  const [touched, setTouched] = useState(false);
  const [errors, setErrors] = useState([]);

  // Estado para mostrar/ocultar contraseña
  const [showPassword, setShowPassword] = useState(false);

  // Formulario con los campos requeridos
  const [formData, setFormData] = useState({
    status: 0,
    endpoint: '',
    database: '',
    username: '',
    password: '',
  });

  // Cargar configuraciones existentes
  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await getConfigurations(code);
        if (res.success) {
          setFormData({
            status: res.data.status ? 1 : 0,
            endpoint: res.data.endpoint || "",
            database: res.data.database || "",
            username: res.data.username || "",
            password: res.data.password || "",
          });
        }
      } catch (e) {
        handleSnackbar("Error al cargar configuración: " + e.message, "error");
      } finally {
        setLoadingInit(false);
      }
    }
    fetchConfig();
  }, []);

  // Función de validación de URL
  const isValidUrl = (string) => {
    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
      return false;
    }
  };

  // Función de validación
  const validateForm = () => {
    const newErrors = [];

    if (!formData.endpoint.trim()) {
      newErrors.push("Endpoint es requerido");
    } else if (!isValidUrl(formData.endpoint)) {
      newErrors.push("Endpoint inválido");
    }

    if (!formData.database.trim()) {
      newErrors.push("Base de datos es requerida");
    }

    if (!formData.username.trim()) {
      newErrors.push("Usuario es requerido");
    }

    if (!formData.password.trim()) {
      newErrors.push("Contraseña es requerida");
    } else if (formData.password.length < 4) {
      newErrors.push("Contraseña debe tener al menos 4 caracteres");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSave = async () => {
    setTouched(true);
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Preparar datos para envío
    const cleanData = {
      status: formData.status,
      endpoint: formData.endpoint.trim(),
      database: formData.database.trim(),
      username: formData.username.trim(),
      password: formData.password.trim(),
    };

    setIsLoading(true);
    try {
      const res = await storeOrUpdate(code, cleanData);
      if (res.success) {
        handleSnackbar(res.message, "success");
        setErrors([]);
        setTouched(false);
      } else {
        // Mostrar error de la API en el alert de validación
        setErrors([res.message || "Error al guardar la configuración"]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      // Mostrar error de excepción en el alert de validación
      setErrors(["Error de conexión: " + err.message]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper para actualizar campos del formulario
  const updateFormField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touched && errors.length > 0) {
      setTimeout(() => validateForm(), 100);
    }
  };

  // Mostrar loading inicial
  if (loadingInit) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/dashboard/settings")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          disabled={isLoading}
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-black">Configuración Service Layer</h2>
          <p className="text-gray-600">Configuración de conexión a SAP Service Layer</p>
        </div>
        {isLoading && (
          <Loader2 size={20} className="animate-spin text-gray-400" />
        )}
      </div>

      {/* Mensajes de error */}
      {touched && errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-900 mb-2">Errores de validación:</h4>
              <ul className="space-y-1">
                {errors.map((error, idx) => (
                  <li key={idx} className="text-sm text-red-800">• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Estado de Integración */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
        <div className="px-6 py-5">
          <div className="grid gap-6">
            {/* Estado integración */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                ESTADO DE INTEGRACIÓN
                {formData.status === 1 && <CheckCircle size={14} className="inline text-green-500 ml-2" />}
              </label>
              <select
                value={formData.status}
                onChange={(e) => updateFormField('status', Number(e.target.value))}
                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                disabled={isLoading}
              >
                <option value={0}>Deshabilitado</option>
                <option value={1}>Habilitado</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Habilita o deshabilita la conexión al Service Layer
              </p>
            </div>
          </div>

          <div className="grid gap-6 my-5">
            {/* Endpoint */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                ENDPOINT *
                {formData.endpoint.trim() && isValidUrl(formData.endpoint) &&
                  <CheckCircle size={14} className="inline text-green-500 ml-2" />
                }
              </label>
              <input
                type="url"
                value={formData.endpoint}
                onChange={(e) => updateFormField('endpoint', e.target.value)}
                className={`w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none font-mono ${
                  touched && (!formData.endpoint.trim() || !isValidUrl(formData.endpoint))
                    ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="https://server:50000/b1s/v1"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                URL del endpoint del Service Layer de SAP Business One
              </p>
            </div>
          </div>

          <div className="grid gap-6 my-5">
            {/* Database */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                BASE DE DATOS *
                {formData.database.trim() &&
                  <CheckCircle size={14} className="inline text-green-500 ml-2" />
                }
              </label>
              <input
                type="text"
                value={formData.database}
                onChange={(e) => updateFormField('database', e.target.value)}
                className={`w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none ${
                  touched && !formData.database.trim()
                    ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="SBODemoUS"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Nombre de la base de datos de SAP Business One
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Info size={16} className="text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Información Importante</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Las credenciales deben corresponder a un usuario válido de SAP B1</li>
                  <li>• El usuario debe tener permisos suficientes para acceder al Service Layer</li>
                  <li>• Mantenga estas credenciales seguras y no las comparta</li>
                  <li>• Verifique que el certificado SSL sea válido si usa HTTPS</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid gap-6 my-5">
            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                USUARIO *
                {formData.username.trim() &&
                  <CheckCircle size={14} className="inline text-green-500 ml-2" />
                }
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => updateFormField('username', e.target.value)}
                className={`w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none ${
                  touched && !formData.username.trim()
                    ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="manager"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Usuario de SAP Business One con acceso al Service Layer
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                CONTRASEÑA *
                {formData.password.trim() && formData.password.length >= 4 &&
                  <CheckCircle size={14} className="inline text-green-500 ml-2" />
                }
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => updateFormField('password', e.target.value)}
                  className={`w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none ${
                    touched && (!formData.password.trim() || formData.password.length < 4)
                      ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                  disabled={isLoading}
                  title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <EyeOff size={18} className="text-gray-500" />
                  ) : (
                    <Eye size={18} className="text-gray-500" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Contraseña del usuario de SAP Business One
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ACCIONES */}
      <div className="flex gap-4 justify-end">
        <button
          onClick={() => navigate("/dashboard/settings")}
          disabled={isLoading}
          className="border border-gray-300 text-sm text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Volver
        </button>
        <Button
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Validando Configuración...
            </>
          ) : (
            <>
              <Save size={16} />
              Guardar Configuración
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
