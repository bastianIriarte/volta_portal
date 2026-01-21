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
  TestTube,
  ExternalLink,
} from "lucide-react";
import { handleSnackbar } from "../../utils/messageHelpers";
import { getConfigurations, storeOrUpdate } from "../../services/configurationService";
import { testConnectionWithCredentials } from "../../services/microsoftGraphService";
import { Button } from "../../components/ui/Button";

export default function ConnectionMicrosoftGraph() {
  const navigate = useNavigate();
  const code = "microsoft_graph";

  // Estados de carga
  const [isLoading, setIsLoading] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);
  const [testingConnection, setTestingConnection] = useState(false);

  // Estado de validación
  const [touched, setTouched] = useState(false);
  const [errors, setErrors] = useState([]);

  // Estado para mostrar/ocultar secreto
  const [showSecret, setShowSecret] = useState(false);

  // Resultado del test de conexión
  const [testResult, setTestResult] = useState(null);

  // Formulario con los campos requeridos
  const [formData, setFormData] = useState({
    status: 0,
    tenant_id: "",
    client_id: "",
    client_secret: "",
    site_id: "",
    scope: "https://graph.microsoft.com/.default",
  });

  // Cargar configuraciones existentes
  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await getConfigurations(code);
        if (res.success && res.data) {
          setFormData({
            status: res.data.status ? 1 : 0,
            tenant_id: res.data.tenant_id || "",
            client_id: res.data.client_id || "",
            client_secret: res.data.client_secret || "",
            site_id: res.data.site_id || "",
            scope: res.data.scope || "https://graph.microsoft.com/.default",
          });
        }
      } catch (e) {
        // Si no existe configuración, mantener valores por defecto
        console.log("No hay configuración previa de Microsoft Graph");
      } finally {
        setLoadingInit(false);
      }
    }
    fetchConfig();
  }, []);

  // Función de validación
  const validateForm = () => {
    const newErrors = [];

    if (!formData.tenant_id.trim()) {
      newErrors.push("Tenant ID es requerido");
    } else if (!/^[a-f0-9-]{36}$/i.test(formData.tenant_id.trim())) {
      newErrors.push("Tenant ID debe ser un GUID válido");
    }

    if (!formData.client_id.trim()) {
      newErrors.push("Client ID es requerido");
    } else if (!/^[a-f0-9-]{36}$/i.test(formData.client_id.trim())) {
      newErrors.push("Client ID debe ser un GUID válido");
    }

    if (!formData.client_secret.trim()) {
      newErrors.push("Client Secret es requerido");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Test de conexión
  const handleTestConnection = async () => {
    if (!validateForm()) {
      setTouched(true);
      return;
    }

    setTestingConnection(true);
    setTestResult(null);

    try {
      const response = await testConnectionWithCredentials({
        tenant_id: formData.tenant_id.trim(),
        client_id: formData.client_id.trim(),
        client_secret: formData.client_secret.trim(),
        site_id: formData.site_id.trim() || null,
      });

      if (response.success && response.data) {
        setTestResult(response.data);
        if (response.data.success) {
          handleSnackbar("Conexión exitosa a Microsoft Graph", "success");
        } else {
          handleSnackbar(response.data.message || "Error en la conexión", "error");
        }
      } else {
        setTestResult({
          success: false,
          message: response.message || "Error al probar conexión",
        });
        handleSnackbar(response.message || "Error al probar conexión", "error");
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: err.message || "Error al probar conexión",
      });
      handleSnackbar("Error al probar conexión", "error");
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSave = async () => {
    setTouched(true);
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Preparar datos para envío
    const cleanData = {
      status: formData.status,
      tenant_id: formData.tenant_id.trim(),
      client_id: formData.client_id.trim(),
      client_secret: formData.client_secret.trim(),
      site_id: formData.site_id.trim() || null,
      scope: formData.scope.trim(),
    };

    setIsLoading(true);
    try {
      const res = await storeOrUpdate(code, cleanData);
      if (res.success) {
        handleSnackbar(res.message || "Configuración guardada correctamente", "success");
        setErrors([]);
        setTouched(false);
      } else {
        setErrors([res.message || "Error al guardar la configuración"]);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      setErrors(["Error de conexión: " + err.message]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper para actualizar campos del formulario
  const updateFormField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
          <h2 className="text-2xl font-bold text-black">Configuración Microsoft Graph</h2>
          <p className="text-gray-600">Conexión a SharePoint via Microsoft Graph API</p>
        </div>
        {isLoading && <Loader2 size={20} className="animate-spin text-gray-400" />}
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
                  <li key={idx} className="text-sm text-red-800">
                    • {error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Test Result */}
      {testResult && (
        <div
          className={`border rounded-lg p-4 ${
            testResult.success
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-start gap-3">
            {testResult.success ? (
              <CheckCircle size={20} className="text-green-600 mt-0.5" />
            ) : (
              <AlertCircle size={20} className="text-red-600 mt-0.5" />
            )}
            <div>
              <h4
                className={`font-semibold ${
                  testResult.success ? "text-green-900" : "text-red-900"
                }`}
              >
                {testResult.success ? "Conexión Exitosa" : "Error de Conexión"}
              </h4>
              <p
                className={`text-sm ${
                  testResult.success ? "text-green-800" : "text-red-800"
                }`}
              >
                {testResult.message}
              </p>
              {testResult.site_name && (
                <p className="text-sm text-green-800 mt-1">
                  Sitio: {testResult.site_name}
                </p>
              )}
              {testResult.site_url && (
                <a
                  href={testResult.site_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-700 underline flex items-center gap-1 mt-1"
                >
                  {testResult.site_url}
                  <ExternalLink size={12} />
                </a>
              )}
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
                {formData.status === 1 && (
                  <CheckCircle size={14} className="inline text-green-500 ml-2" />
                )}
              </label>
              <select
                value={formData.status}
                onChange={(e) => updateFormField("status", Number(e.target.value))}
                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                disabled={isLoading}
              >
                <option value={0}>Deshabilitado</option>
                <option value={1}>Habilitado</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Habilita o deshabilita la conexión a Microsoft Graph
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-6">
            <div className="flex items-start gap-3">
              <Info size={16} className="text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">
                  Configuración de Azure AD
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Registre una aplicación en Azure Active Directory</li>
                  <li>• Otorgue permisos de API: Sites.Read.All, Sites.ReadWrite.All</li>
                  <li>• Cree un secreto de cliente y copie el valor</li>
                  <li>
                    • El Site ID se obtiene de:{" "}
                    <code className="bg-blue-100 px-1 rounded">
                      https://graph.microsoft.com/v1.0/sites/[hostname]:/sites/[sitename]
                    </code>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Tenant ID */}
          <div className="grid gap-6 my-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                TENANT ID (Directory ID) *
                {formData.tenant_id.trim() &&
                  /^[a-f0-9-]{36}$/i.test(formData.tenant_id) && (
                    <CheckCircle size={14} className="inline text-green-500 ml-2" />
                  )}
              </label>
              <input
                type="text"
                value={formData.tenant_id}
                onChange={(e) => updateFormField("tenant_id", e.target.value)}
                className={`w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none font-mono ${
                  touched &&
                  (!formData.tenant_id.trim() ||
                    !/^[a-f0-9-]{36}$/i.test(formData.tenant_id))
                    ? "border-red-300"
                    : "border-gray-300"
                }`}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                ID del directorio de Azure AD (Azure Portal → Azure AD → Overview)
              </p>
            </div>
          </div>

          {/* Client ID */}
          <div className="grid gap-6 my-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                CLIENT ID (Application ID) *
                {formData.client_id.trim() &&
                  /^[a-f0-9-]{36}$/i.test(formData.client_id) && (
                    <CheckCircle size={14} className="inline text-green-500 ml-2" />
                  )}
              </label>
              <input
                type="text"
                value={formData.client_id}
                onChange={(e) => updateFormField("client_id", e.target.value)}
                className={`w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none font-mono ${
                  touched &&
                  (!formData.client_id.trim() ||
                    !/^[a-f0-9-]{36}$/i.test(formData.client_id))
                    ? "border-red-300"
                    : "border-gray-300"
                }`}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                ID de la aplicación registrada en Azure AD
              </p>
            </div>
          </div>

          {/* Client Secret */}
          <div className="grid gap-6 my-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                CLIENT SECRET *
                {formData.client_secret.trim() && (
                  <CheckCircle size={14} className="inline text-green-500 ml-2" />
                )}
              </label>
              <div className="relative">
                <input
                  type={showSecret ? "text" : "password"}
                  value={formData.client_secret}
                  onChange={(e) => updateFormField("client_secret", e.target.value)}
                  className={`w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none font-mono ${
                    touched && !formData.client_secret.trim()
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  placeholder="••••••••••••••••••••••••••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                  disabled={isLoading}
                  title={showSecret ? "Ocultar secreto" : "Mostrar secreto"}
                >
                  {showSecret ? (
                    <EyeOff size={18} className="text-gray-500" />
                  ) : (
                    <Eye size={18} className="text-gray-500" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Secreto de cliente generado en Azure AD → Certificates & secrets
              </p>
            </div>
          </div>

          {/* Site ID */}
          <div className="grid gap-6 my-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                SITE ID (Opcional)
                {formData.site_id.trim() && (
                  <CheckCircle size={14} className="inline text-green-500 ml-2" />
                )}
              </label>
              <input
                type="text"
                value={formData.site_id}
                onChange={(e) => updateFormField("site_id", e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none font-mono"
                placeholder="contoso.sharepoint.com,guid1,guid2"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                ID del sitio de SharePoint (formato: hostname,site-collection-id,web-id)
              </p>
            </div>
          </div>

          {/* Scope */}
          <div className="grid gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">SCOPE</label>
              <input
                type="text"
                value={formData.scope}
                onChange={(e) => updateFormField("scope", e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none font-mono"
                placeholder="https://graph.microsoft.com/.default"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Scope para la autenticación OAuth2 (por defecto usa .default)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ACCIONES */}
      <div className="flex gap-4 justify-between">
        <button
          onClick={handleTestConnection}
          disabled={isLoading || testingConnection}
          className="flex items-center gap-2 border border-sky-600 text-sky-600 text-sm px-6 py-3 rounded-lg font-medium hover:bg-sky-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {testingConnection ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Probando...
            </>
          ) : (
            <>
              <TestTube size={16} />
              Probar Conexión
            </>
          )}
        </button>

        <div className="flex gap-4">
          <button
            onClick={() => navigate("/dashboard/settings")}
            disabled={isLoading}
            className="border border-gray-300 text-sm text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Volver
          </button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Guardando...
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
    </div>
  );
}
