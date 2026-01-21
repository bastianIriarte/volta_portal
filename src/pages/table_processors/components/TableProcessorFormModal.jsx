import { Modal } from "../../../components/ui/Modal.jsx";
import { Input } from "../../../components/ui/Input.jsx";
import { Select } from "../../../components/ui/Select.jsx";
import { Textarea } from "../../../components/ui/Textarea.jsx";
import { XCircle } from "lucide-react";
import { useState, useEffect } from "react";

export default function TableProcessorFormModal({
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
      case "code":
        if (!value || !value.trim()) {
          return "El código es requerido";
        }
        if (value.trim().length < 3) {
          return "El código debe tener al menos 3 caracteres";
        }
        if (value.trim().length > 50) {
          return "El código no puede exceder 50 caracteres";
        }
        // Solo permitir letras minúsculas, números y guiones bajos
        if (!/^[a-z][a-z0-9_]*$/.test(value.trim())) {
          return "El código debe iniciar con letra y solo contener minúsculas, números y guiones bajos";
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

    const codeError = validateField("code", formData.code);
    if (codeError) newErrors.code = codeError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambio de campo con validación en tiempo real
  const handleFieldChange = (field, value) => {
    // Para el campo code, formatear automáticamente
    if (field === "code") {
      value = value.toLowerCase().replace(/\s/g, "_");
    }

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

  // Generar nombre de función a partir del código
  const getFunctionName = () => {
    if (!formData.code) return "codigo";
    return formData.code.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Nuevo Procesador" : "Editar Procesador"}
      size="default"
      actions={[
        {
          label: "Cancelar",
          variant: "outline",
          onClick: onClose,
        },
        {
          label: saving ? "Guardando..." : "Guardar",
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

        <div className="grid grid-cols-1 gap-3">
          <Input
            label="Nombre"
            required
            value={formData.name}
            onChange={(e) => handleFieldChange("name", e.target.value)}
            placeholder="Tabla de Riles"
            error={errors.name}
          />

          <Input
            label="Código"
            required
            value={formData.code}
            onChange={(e) => handleFieldChange("code", e.target.value)}
            placeholder="tabla_riles"
            error={errors.code}
            helper="Este código se usará para invocar la función del backend"
            className="font-mono"
          />

          <Select
            label="Origen de Datos"
            value={formData.data_source_id || ""}
            onChange={(e) => handleFieldChange("data_source_id", e.target.value)}
            helper="Opcional: selecciona el origen de datos que usará este procesador"
          >
            <option value="">-- Sin origen de datos --</option>
            {dataSources.map((ds) => (
              <option key={ds.id} value={ds.id}>
                {ds.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1.5">
            Descripción
          </label>
          <Textarea
            value={formData.description}
            onChange={(e) => handleFieldChange("description", e.target.value)}
            rows={2}
            placeholder="Opcional: describe qué datos muestra esta tabla..."
          />
        </div>

        {/* Info sobre implementación */}
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded">
          <p className="text-xs text-amber-700">
            <span className="font-medium">Backend:</span> Crea la función correspondiente:
          </p>
          <code className="block mt-1.5 text-xs bg-amber-100 text-amber-900 px-2 py-1 rounded font-mono">
            TableProcessorHelpers::{getFunctionName()}()
          </code>
        </div>
      </div>
    </Modal>
  );
}
