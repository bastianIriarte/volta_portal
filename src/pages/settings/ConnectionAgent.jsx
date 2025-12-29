import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle,
  Loader2,
  Info,
  Network,
  Database,
  Shield,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { handleSnackbar } from "../../utils/messageHelpers";
import { getConfigurations, storeOrUpdate } from "../../services/configurationService";
import { Button } from "../../components/ui/Button";

export default function ConnectionAgent() {
  const navigate = useNavigate();
  const code = 'agent';

  // Estados de carga
  const [isLoading, setIsLoading] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);

  // Estado de validacion
  const [touched, setTouched] = useState(false);
  const [errors, setErrors] = useState([]);

  // Formulario - solo necesitamos endpoint y status
  const [formData, setFormData] = useState({
    status: 0,
    endpoint: '',
  });

  // Datos obtenidos del agente (solo lectura)
  const [agentInfo, setAgentInfo] = useState(null);

  // Cargar configuraciones existentes
  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await getConfigurations(code);
        if (res.success && res.data) {
          setFormData({
            status: res.data.status ? 1 : 0,
            endpoint: res.data.endpoint || "",
          });

          // Info del agente obtenida
          if (res.data.query_mode || res.data.database_connected !== undefined || res.data.health) {
            setAgentInfo({
              auth_enabled: res.data.auth_enabled,
              query_mode: res.data.query_mode,
              endpoints: res.data.endpoints,
              health: res.data.health,
              database_connected: res.data.database_connected,
              database_info: res.data.database_info,
            });
          }
        }
      } catch (e) {
        handleSnackbar("Error al cargar configuracion: " + e.message, "error");
      } finally {
        setLoadingInit(false);
      }
    }
    fetchConfig();
  }, []);

  // Funcion de validacion de URL
  const isValidUrl = (string) => {
    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
      return false;
    }
  };

  // Funcion de validacion
  const validateForm = () => {
    const newErrors = [];

    if (!formData.endpoint.trim()) {
      newErrors.push("La URL del agente es requerida");
    } else if (!isValidUrl(formData.endpoint)) {
      newErrors.push("La URL del agente debe ser valida (http:// o https://)");
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

    // Preparar datos para envio
    const cleanData = {
      status: formData.status,
      endpoint: formData.endpoint.trim(),
    };

    setIsLoading(true);
    try {
      const res = await storeOrUpdate(code, cleanData);
      if (res.success) {
        handleSnackbar(res.message || "Configuracion guardada correctamente", "success");
        setErrors([]);
        setTouched(false);

        // Recargar para obtener la info del agente
        const configRes = await getConfigurations(code);
        if (configRes.success && configRes.data) {
          setAgentInfo({
            auth_enabled: configRes.data.auth_enabled,
            query_mode: configRes.data.query_mode,
            endpoints: configRes.data.endpoints,
            health: configRes.data.health,
            database_connected: configRes.data.database_connected,
            database_info: configRes.data.database_info,
          });
        }
      } else {
        setErrors([res.message || "Error al guardar la configuracion"]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      setErrors(["Error de conexion: " + err.message]);
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
          <p className="text-gray-600">Cargando configuracion...</p>
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
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-black">Conexion Agent</h2>
          <p className="text-gray-600">Configuracion de conexion al agente InsideOne</p>
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
              <h4 className="font-semibold text-red-900 mb-2">Errores de validacion:</h4>
              <ul className="space-y-1">
                {errors.map((error, idx) => (
                  <li key={idx} className="text-sm text-red-800">• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Estado del Agente (si ya esta configurado) */}
      {agentInfo && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Network size={18} className="text-green-600" />
              Estado del Agente
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Health Status */}
              {agentInfo.health && (
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle size={20} className="text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Health</p>
                    <p className="text-sm font-medium text-green-700">
                      {agentInfo.health.status || "OK"} - {agentInfo.health.message || "Agente disponible"}
                    </p>
                  </div>
                </div>
              )}

              {/* Autenticacion */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Shield size={20} className={agentInfo.auth_enabled ? "text-green-600" : "text-gray-400"} />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Autenticacion</p>
                  <p className="text-sm font-medium">
                    {agentInfo.auth_enabled ? "Habilitada (API Key)" : "Deshabilitada"}
                  </p>
                </div>
              </div>

              {/* Modo de Query */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <RefreshCw size={20} className="text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Modo Query</p>
                  <p className="text-sm font-medium">{agentInfo.query_mode || "No disponible"}</p>
                </div>
              </div>

              {/* Estado BD */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Database size={20} className={agentInfo.database_connected ? "text-green-600" : "text-red-500"} />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Base de Datos</p>
                  <p className="text-sm font-medium flex items-center gap-1">
                    {agentInfo.database_connected ? (
                      <>
                        <CheckCircle size={14} className="text-green-600" />
                        Conectada
                      </>
                    ) : (
                      <>
                        <XCircle size={14} className="text-red-500" />
                        No conectada
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Info de BD */}
              {agentInfo.database_info && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Info size={20} className="text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Driver / BD</p>
                    <p className="text-sm font-medium">
                      {agentInfo.database_info.driver} - {agentInfo.database_info.name}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Endpoints disponibles */}
            {agentInfo.endpoints && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 uppercase font-medium mb-2">Endpoints Disponibles</p>
                <div className="flex flex-wrap gap-2">
                  {agentInfo.endpoints.encrypted?.enabled && (
                    <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                      Encrypted: {agentInfo.endpoints.encrypted.url}
                    </span>
                  )}
                  {agentInfo.endpoints.plain?.enabled && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                      Plain: {agentInfo.endpoints.plain.url}
                    </span>
                  )}
                  {agentInfo.endpoints.dbTest?.enabled && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                      DB Test: {agentInfo.endpoints.dbTest.url}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Formulario de Configuracion */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
        <div className="px-6 py-5">
          <div className="grid gap-6">
            {/* Estado integracion */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                ESTADO DE INTEGRACION
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
                Habilita o deshabilita la conexion al agente
              </p>
            </div>
          </div>

          <div className="grid gap-6 my-5">
            {/* Endpoint */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                URL DEL AGENTE *
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
                placeholder="http://localhost:5000"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                URL donde esta ejecutandose el agente InsideOne
              </p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Info size={16} className="text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900 mb-1">Como funciona</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Solo necesitas ingresar la URL del agente</li>
                  <li>• Al guardar, se conectara automaticamente al agente para obtener su configuracion</li>
                  <li>• La API Key (si aplica) se obtiene y almacena automaticamente</li>
                  <li>• El modo de query disponible se detecta del agente</li>
                </ul>
              </div>
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
              Conectando con Agente...
            </>
          ) : (
            <>
              <Save size={16} />
              Guardar y Conectar
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
