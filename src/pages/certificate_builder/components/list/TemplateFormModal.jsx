import { Modal } from "../../../../components/ui/Modal";
import { Input } from "../../../../components/ui/Input";
import { Select } from "../../../../components/ui/Select";
import { Building2, Calendar, XCircle } from "lucide-react";
import { useState, useEffect } from "react";

export default function TemplateFormModal({
  open,
  mode,
  formData,
  setFormData,
  dataSources = [],
  saving,
  onSave,
  onClose,
  apiError,
  onClearApiError,
}) {
  const [errors, setErrors] = useState({});

  // Limpiar errores cuando se abre el modal o cambia el modo
  useEffect(() => {
    if (open) {
      setErrors({});
    }
  }, [open, mode]);

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
      default:
        return null;
    }
  };

  // Validar todo el formulario
  const validateForm = () => {
    const newErrors = {};

    const nameError = validateField("name", formData.name);
    if (nameError) newErrors.name = nameError;

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
  // Componente compartido para configuración de búsqueda
  const SearchConfigFields = () => (
    <div className="space-y-2 pt-2 border-t border-gray-200">
      <p className="text-[11px] font-bold text-neutral-600 uppercase">
        Configuración de generación
      </p>

      {/* Checkbox: Filtrar por sucursal */}
      <label className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
        <input
          type="checkbox"
          checked={formData.query_branches || false}
          onChange={(e) => setFormData({ ...formData, query_branches: e.target.checked })}
          className="w-4 h-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
        />
        <Building2 className="h-4 w-4 text-gray-400" />
        <div className="flex-1">
          <span className="text-sm font-medium text-gray-700">Filtrar por sucursal</span>
          <p className="text-xs text-gray-500">Permite seleccionar una sucursal al generar el certificado</p>
        </div>
      </label>

      {/* Select: Tipo de búsqueda */}
      <div>
        <label className="block text-[11px] mt-3 font-bold text-neutral-600 uppercase mb-1">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Tipo de selección de período
          </div>
        </label>
        <select
          value={formData.search_type || "range"}
          onChange={(e) => setFormData({ ...formData, search_type: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
        >
          <option value="range">Rango de fechas (Desde - Hasta)</option>
          <option value="month">Mes específico (Mes + Año)</option>
        </select>
        <p className="mt-0.5 text-xs text-gray-500">
          {formData.search_type === "month"
            ? "El usuario seleccionará un mes y año específicos"
            : "El usuario podrá elegir un rango de fechas con accesos rápidos"}
        </p>
      </div>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Nuevo Certificado" : "Configurar Plantilla"}
      actions={[
        {
          label: "Cancelar",
          variant: "outline",
          onClick: onClose,
        },
        {
          label: saving
            ? mode === "create"
              ? "Creando..."
              : "Guardando..."
            : mode === "create"
              ? "Crear y Diseñar"
              : "Guardar Cambios",
          variant: "primary",
          onClick: handleSave,
          disabled: saving,
        },
      ]}
    >
      <div className="space-y-3">
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

        {mode === "create" ? (
          <>
            <Input
              label="Nombre certificado"
              required
              value={formData.name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              placeholder="Ej: Certificado de Transporte"
              error={errors.name}
            />
            <Input
              label="Descripción"
              value={formData.description}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              placeholder="Descripción de la plantilla..."
            />
            <Select
              label="Origen de Datos"
              value={formData.data_source_id || ""}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, data_source_id: value ? parseInt(value) : null });
              }}
            >
              <option value="">Sin origen de datos</option>
              {dataSources.map((ds) => (
                <option key={ds.id} value={ds.id}>
                  {ds.name}
                </option>
              ))}
            </Select>
            <SearchConfigFields />
          </>
        ) : (
          <>
            <Input
              label="Nombre"
              required
              value={formData.name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              placeholder="Ej: Certificado de Transporte"
              error={errors.name}
            />
            <Input
              label="Descripción"
              value={formData.description}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              placeholder="Descripción de la plantilla..."
            />
            <Select
              label="Origen de Datos"
              value={formData.data_source_id || ""}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, data_source_id: value ? parseInt(value) : null });
              }}
            >
              <option value="">Sin origen de datos</option>
              {dataSources.map((ds) => (
                <option key={ds.id} value={ds.id}>
                  {ds.name} ({ds.code})
                </option>
              ))}
            </Select>
            <SearchConfigFields />
            <Select
              label="Estado"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: parseInt(e.target.value) })}
            >
              <option value={1}>Activo</option>
              <option value={0}>Inactivo</option>
            </Select>
          </>
        )}
      </div>
    </Modal>
  );
}
