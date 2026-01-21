import { useState, useEffect } from "react";
import { Modal } from "../../../components/ui/Modal.jsx";
import { Input } from "../../../components/ui/Input.jsx";
import { Select } from "../../../components/ui/Select.jsx";
import { Textarea } from "../../../components/ui/Textarea.jsx";
import {
  XCircle,
  X,
  Save,
  Loader2,
  Globe,
  Database,
  Cloud,
  Layers,
  AlertCircle,
  CheckCircle,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ORIGIN_TYPES = [
  { value: "iframe", label: "Iframe (URL externa)", icon: Globe, color: "blue" },
  { value: "sql", label: "SQL (Fuente de datos)", icon: Database, color: "indigo" },
  { value: "sharepoint", label: "SharePoint", icon: Cloud, color: "green" },
  { value: "mixed", label: "Mixto (Múltiples orígenes)", icon: Layers, color: "purple" },
];

export default function ReportTemplateFormModal({
  open,
  mode,
  formData,
  setFormData,
  dataSources = [],
  msGraphConfig,
  saving,
  onSave,
  onClose,
  apiError,
  onClearApiError,
}) {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const msGraphConfigured = msGraphConfig?.status === 1 && msGraphConfig?.site_id;

  // Limpiar errores cuando se abre el modal o cambia el modo
  useEffect(() => {
    if (open) {
      setErrors({});
    }
  }, [open, mode]);

  // Función para validar URL
  const isValidUrl = (url) => {
    if (!url?.trim()) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Validar un campo específico
  const validateField = (field, value) => {
    switch (field) {
      case "name":
        if (!value || !value.trim()) {
          return "El nombre es requerido";
        }
        if (value.trim().length < 3) {
          return "El nombre debe tener al menos 3 caracteres";
        }
        if (value.trim().length > 100) {
          return "El nombre no puede exceder 100 caracteres";
        }
        return null;
      case "report_url":
        // Solo validar si hay valor y es tipo iframe
        if (formData.origin_type === "iframe" && value?.trim() && !isValidUrl(value)) {
          return "La URL no es válida. Debe incluir http:// o https://";
        }
        return null;
      case "data_source_id":
        if (formData.origin_type === "sql" && !value) {
          return "Debe seleccionar una fuente de datos";
        }
        return null;
      case "sharepoint_list_id":
        if (formData.origin_type === "sharepoint" && !value?.trim()) {
          return "El List ID es requerido";
        }
        return null;
      default:
        return null;
    }
  };

  // Función para validar un origen individual
  // isMixedIframe: si es true, no validar URL porque se configura por empresa
  const validateOrigin = (origin, index, isMixedIframe = false) => {
    if (!origin.type) {
      return `Origen #${index + 1}: Debe seleccionar un tipo`;
    }

    if (origin.type === "iframe" && !isMixedIframe) {
      // Solo validar URL si NO es el iframe de configuración mixta
      if (!origin.report_url?.trim()) {
        return `Origen #${index + 1}: La URL es obligatoria`;
      }
      if (!isValidUrl(origin.report_url)) {
        return `Origen #${index + 1}: La URL no es válida`;
      }
    }

    if (origin.type === "sql") {
      if (!origin.data_source_id) {
        return `Origen #${index + 1}: Debe seleccionar una fuente de datos`;
      }
    }

    if (origin.type === "sharepoint") {
      if (!msGraphConfigured) {
        return `Origen #${index + 1}: Microsoft Graph no está configurado`;
      }
      if (!origin.sharepoint_list_id?.trim()) {
        return `Origen #${index + 1}: El List ID es obligatorio`;
      }
    }

    return null;
  };

  // Validar todo el formulario
  const validateForm = () => {
    const newErrors = {};

    // Validar nombre
    const nameError = validateField("name", formData.name);
    if (nameError) newErrors.name = nameError;

    // Validaciones según tipo de origen
    if (formData.origin_type === "iframe") {
      const urlError = validateField("report_url", formData.report_url);
      if (urlError) newErrors.report_url = urlError;
    }

    if (formData.origin_type === "sql") {
      const dsError = validateField("data_source_id", formData.data_source_id);
      if (dsError) newErrors.data_source_id = dsError;
    }

    if (formData.origin_type === "sharepoint") {
      if (!msGraphConfigured) {
        newErrors.sharepoint = "Debe configurar Microsoft Graph antes de usar SharePoint";
      } else {
        const listError = validateField("sharepoint_list_id", formData.sharepoint_list_id);
        if (listError) newErrors.sharepoint_list_id = listError;
      }
    }

    if (formData.origin_type === "mixed") {
      if (!formData.origins || formData.origins.length !== 2) {
        newErrors.origins = "La configuración mixta requiere exactamente 2 orígenes";
      } else {
        // Validar Origen #1 (SQL o SharePoint)
        const origin1 = formData.origins[0];
        if (!origin1.type || !["sql", "sharepoint"].includes(origin1.type)) {
          newErrors.origins = "Origen #1: Debe seleccionar SQL o SharePoint";
        } else {
          const origin1Error = validateOrigin(origin1, 0);
          if (origin1Error) {
            newErrors.origins = origin1Error;
          }
        }

        // Validar Origen #2 (Iframe) - URL NO requerida, se configura por empresa
        if (!newErrors.origins) {
          const origin2 = formData.origins[1];
          if (origin2.type !== "iframe") {
            newErrors.origins = "Origen #2: Debe ser tipo Iframe";
          }
          // No validamos URL del iframe porque se configura desde asignación a empresa
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambio de campo con validación en tiempo real
  const handleFieldChange = (field, value) => {
    setFormData({ ...formData, [field]: value });

    // Validar el campo si ya tiene error
    if (errors[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({
        ...prev,
        [field]: error,
      }));
    }
  };

  // Manejar el guardado con validación
  const handleSave = () => {
    if (validateForm()) {
      onSave();
    }
  };

  // Inicializar orígenes mixtos cuando se selecciona el tipo "mixed"
  useEffect(() => {
    if (formData.origin_type === "mixed") {
      // Si no hay orígenes o no tiene la estructura correcta, inicializar con 2 orígenes
      if (!formData.origins || formData.origins.length !== 2) {
        setFormData({
          ...formData,
          origins: [
            { type: "", data_source_id: "", sharepoint_site_id: "", sharepoint_list_id: "" }, // Solo SQL o SharePoint
            { type: "iframe", report_url: "" } // Solo Iframe (fijo)
          ]
        });
      }
    }
  }, [formData.origin_type]);

  const updateOrigin = (index, field, value) => {
    const newOrigins = [...formData.origins];
    newOrigins[index] = { ...newOrigins[index], [field]: value };
    setFormData({ ...formData, origins: newOrigins });

    // Limpiar error de origins si existe
    if (errors.origins) {
      setErrors((prev) => ({ ...prev, origins: null }));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "edit" ? "Editar Plantilla" : "Nueva Plantilla de Reporte"}
      showIcon={false}
      size="lg"
      actions={[
        {
          label: "Cancelar",
          variant: "outline",
          onClick: onClose,
          icon: X
        },
        {
          label: saving ? "Guardando..." : "Guardar",
          variant: "primary",
          onClick: handleSave,
          disabled: saving,
          loading: saving,
          icon: saving ? Loader2 : Save
        }
      ]}
    >
      <div className="space-y-4">
        {/* Error de API persistente */}
        {apiError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Error al guardar</p>
                <p className="text-sm text-red-700 mt-1">{apiError}</p>
              </div>
              {onClearApiError && (
                <button
                  onClick={onClearApiError}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Nombre y Código */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nombre"
            required
            placeholder="Ej: Reporte de Ventas Mensual"
            value={formData.name}
            onChange={(e) => handleFieldChange("name", e.target.value)}
            error={errors.name}
          />
          <Input
            label="Código"
            placeholder="RPT-001"
            value={formData.code}
            onChange={(e) => handleFieldChange("code", e.target.value)}
            className="font-mono"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1.5">
            Descripción
          </label>
          <Textarea
            placeholder="Descripción del reporte..."
            value={formData.description}
            onChange={(e) => handleFieldChange("description", e.target.value)}
            rows={2}
          />
        </div>

        {/* Selector de Tipo de Origen */}
        <div>
          <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-2">
            Tipo de Origen de Datos <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ORIGIN_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = formData.origin_type === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleFieldChange("origin_type", type.value)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    isSelected
                      ? `border-${type.color}-500 bg-${type.color}-50 text-${type.color}-700`
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isSelected ? `text-${type.color}-600` : ""}`} />
                  <span className="text-xs font-medium text-center">{type.label.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Campos condicionales según tipo de origen */}
        {formData.origin_type === "iframe" && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-800 font-medium text-sm">
              <Globe className="w-4 h-4" />
              Configuración de Iframe
            </div>
            <p className="mt-2 text-sm text-blue-700">
              La URL del reporte se configurará desde la asignación de reportes a cada empresa.
            </p>
          </div>
        )}

        {formData.origin_type === "sql" && (
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200 space-y-3">
            <div className="flex items-center gap-2 text-indigo-800 font-medium text-sm">
              <Database className="w-4 h-4" />
              Configuración de Fuente de Datos SQL
            </div>
            <Select
              label="Fuente de Datos"
              required
              value={formData.data_source_id}
              onChange={(e) => handleFieldChange("data_source_id", e.target.value)}
              error={errors.data_source_id}
            >
              <option value="">Seleccionar fuente de datos...</option>
              {dataSources.map((ds) => (
                <option key={ds.id} value={ds.id}>
                  {ds.name} {ds.description ? `- ${ds.description}` : ""}
                </option>
              ))}
            </Select>
            {dataSources.length === 0 && (
              <p className="text-xs text-amber-600">
                No hay fuentes de datos disponibles. Crea una primero.
              </p>
            )}
          </div>
        )}

        {formData.origin_type === "sharepoint" && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200 space-y-3">
            <div className="flex items-center gap-2 text-green-800 font-medium text-sm">
              <Cloud className="w-4 h-4" />
              Configuración de SharePoint
            </div>

            {/* Alerta si no está configurado Microsoft Graph */}
            {!msGraphConfigured ? (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-800">
                      Microsoft Graph no está configurado
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      Para usar SharePoint, primero debes configurar la conexión a Microsoft Graph con un Site ID válido.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate("/dashboard/settings/connection-microsoft-graph")}
                      className="mt-2 flex items-center gap-1 text-xs font-medium text-amber-800 hover:text-amber-900 underline"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      Ir a configuración
                    </button>
                  </div>
                </div>
                {errors.sharepoint && (
                  <p className="text-xs text-red-600 mt-2">{errors.sharepoint}</p>
                )}
              </div>
            ) : (
              <>
                {/* Site ID desde configuración global (solo lectura) */}
                <div className="p-3 bg-green-100 border border-green-300 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-medium text-green-800">Conexión configurada</span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-green-700 uppercase mb-1">
                      Site ID (desde configuración global)
                    </label>
                    <input
                      type="text"
                      value={msGraphConfig?.site_id || ""}
                      disabled
                      className="w-full rounded border px-3 py-2 bg-green-50 text-[13px] border-green-300 h-[37px] font-mono text-green-800 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* List ID editable */}
                <Input
                  label="List ID"
                  required
                  placeholder="xxx-xxx-xxx"
                  value={formData.sharepoint_list_id}
                  onChange={(e) => handleFieldChange("sharepoint_list_id", e.target.value)}
                  error={errors.sharepoint_list_id}
                  className="font-mono"
                />

                {/* Ruta del archivo */}
                <Input
                  label="Ruta del archivo/carpeta"
                  placeholder="/Documentos/Reportes/archivo.xlsx"
                  value={formData.sharepoint_path}
                  onChange={(e) => handleFieldChange("sharepoint_path", e.target.value)}
                />
              </>
            )}
          </div>
        )}

        {formData.origin_type === "mixed" && (
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 space-y-3">
            <div className="flex items-center gap-2 text-purple-800 font-medium text-sm">
              <Layers className="w-4 h-4" />
              Configuración Mixta
            </div>
            <p className="text-xs text-purple-700">
              Combina una fuente de datos (SQL o SharePoint) con una visualización Iframe (ej: Power BI).
            </p>

            {errors.origins && (
              <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">{errors.origins}</p>
            )}

            {formData.origins?.length === 2 && (
              <div className="space-y-3">
                {/* Origen #1: SQL o SharePoint */}
                <div className="bg-white p-3 rounded-lg border border-purple-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-gray-600 uppercase">
                      Origen #1 - Datos
                    </span>
                    <span className="text-[10px] text-gray-400">(SQL o SharePoint)</span>
                  </div>

                  {/* Selector de tipo: solo SQL o SharePoint */}
                  <div>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1">
                      Tipo de origen *
                    </label>
                    <select
                      value={formData.origins[0].type || ""}
                      onChange={(e) => updateOrigin(0, "type", e.target.value)}
                      className="w-full rounded border px-2 py-1.5 text-[12px] border-gray-300 focus:ring-2 focus:ring-purple-200"
                    >
                      <option value="">Seleccionar tipo...</option>
                      <option value="sql">SQL (Fuente de datos)</option>
                      <option value="sharepoint">SharePoint</option>
                    </select>
                  </div>

                  {/* Campos para SQL */}
                  {formData.origins[0].type === "sql" && (
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 mb-1">
                        Fuente de Datos *
                      </label>
                      <select
                        value={formData.origins[0].data_source_id || ""}
                        onChange={(e) => updateOrigin(0, "data_source_id", e.target.value)}
                        className="w-full rounded border px-2 py-1.5 text-[12px] border-gray-300 focus:ring-2 focus:ring-purple-200"
                      >
                        <option value="">Seleccionar...</option>
                        {dataSources.map((ds) => (
                          <option key={ds.id} value={ds.id}>{ds.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Campos para SharePoint */}
                  {formData.origins[0].type === "sharepoint" && (
                    <>
                      {!msGraphConfigured ? (
                        <div className="p-2 bg-amber-50 border border-amber-200 rounded">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                            <div className="flex-1">
                              <p className="text-[11px] font-medium text-amber-800">
                                Microsoft Graph no configurado
                              </p>
                              <button
                                type="button"
                                onClick={() => navigate("/dashboard/settings/connection-microsoft-graph")}
                                className="text-[10px] text-amber-700 underline"
                              >
                                Configurar
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="p-2 bg-green-50 border border-green-200 rounded">
                            <div className="flex items-center gap-1 mb-1">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              <span className="text-[10px] text-green-700 font-medium">Site ID (config global)</span>
                            </div>
                            <input
                              type="text"
                              value={msGraphConfig?.site_id || ""}
                              disabled
                              className="w-full rounded border px-2 py-1 text-[11px] bg-green-50 border-green-200 font-mono text-green-800 cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-medium text-gray-500 mb-1">
                              List ID *
                            </label>
                            <input
                              type="text"
                              placeholder="xxx-xxx"
                              value={formData.origins[0].sharepoint_list_id || ""}
                              onChange={(e) => updateOrigin(0, "sharepoint_list_id", e.target.value)}
                              className="w-full rounded border px-2 py-1.5 text-[12px] border-gray-300 focus:ring-2 focus:ring-purple-200 font-mono"
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Origen #2: Iframe (fijo) */}
                <div className="bg-white p-3 rounded-lg border border-blue-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-gray-600 uppercase">
                      Origen #2 - Visualización
                    </span>
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Iframe</span>
                  </div>

                  <p className="text-[11px] text-gray-500">
                    La URL del iframe se configurará desde la asignación de reportes a cada empresa.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Opciones adicionales */}
        <div className="space-y-3 pt-3 border-t border-gray-200">
          {/* Consulta sucursales - Checkbox */}
          <label className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={formData.query_branches || false}
              onChange={(e) => handleFieldChange("query_branches", e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <Database className="h-4 w-4 text-gray-400" />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700">Consulta sucursales</span>
              <p className="text-xs text-gray-500">Permite filtrar por sucursal al consultar el reporte</p>
            </div>
          </label>

          {/* Estado - Select */}
          <Select
            label="Estado"
            value={formData.status ? "1" : "0"}
            onChange={(e) => handleFieldChange("status", e.target.value === "1")}
          >
            <option value="1">Activo</option>
            <option value="0">Inactivo</option>
          </Select>
        </div>
      </div>
    </Modal>
  );
}
