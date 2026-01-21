import React, { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { validateField } from "../../../utils/validators";

export default function DocumentModal({
  open,
  mode,
  formData,
  saving,
  onFormChange,
  onSave,
  onClose
}) {
  const [errors, setErrors] = useState({
    name: null,
    file_path: null
  });

  // Reset errors when modal opens/closes or mode changes
  useEffect(() => {
    if (open) {
      setErrors({ name: null, file_path: null });
    }
  }, [open, mode]);

  // Validate a single field
  const validateSingleField = (field, value) => {
    let result;
    switch (field) {
      case "name":
        result = validateField(value, "text_min", true, "El nombre es obligatorio");
        break;
      case "file_path":
        result = validateField(value, "url", true, "La URL es obligatoria");
        break;
      default:
        result = { validate: true, msg: null };
    }
    return result;
  };

  // Validate all fields
  const validateForm = () => {
    const nameResult = validateSingleField("name", formData.name || "");
    const urlResult = validateSingleField("file_path", formData.file_path || "");

    const newErrors = {
      name: nameResult.msg,
      file_path: urlResult.msg
    };

    setErrors(newErrors);

    return nameResult.validate && urlResult.validate;
  };

  // Handle field change with validation
  const handleChange = (field, value) => {
    // Update the form data
    onFormChange({ ...formData, [field]: value });

    // Validate the field if it has a value (don't show errors while typing initially)
    if (value) {
      const result = validateSingleField(field, value);
      setErrors(prev => ({ ...prev, [field]: result.msg }));
    } else {
      // Clear error if field is empty (will show on submit)
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Handle save with validation
  const handleSave = () => {
    if (validateForm()) {
      onSave();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'edit' ? 'Editar Acceso' : 'Nuevo Acceso'}
      showIcon={false}
      actions={[
        {
          label: "Cancelar",
          variant: "outline",
          onClick: onClose,
          disabled: saving,
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
        <Input
          id="doc_name"
          label="Nombre"
          required
          placeholder="Ej: Reporte de Ventas"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          error={errors.name}
        />

        <Input
          id="doc_description"
          label="Descripción"
          placeholder="Descripción breve del documento"
          value={formData.description}
          onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
        />

        <Input
          id="doc_file_path"
          label="URL del documento"
          required
          placeholder="https://..."
          value={formData.file_path}
          onChange={(e) => handleChange("file_path", e.target.value)}
          error={errors.file_path}
        />

        <Select
          label="Estado"
          value={formData.status ? "1" : "0"}
          onChange={(e) => onFormChange({ ...formData, status: e.target.value === "1" })}
        >
          <option value="1">Activo</option>
          <option value="0">Inactivo</option>
        </Select>
      </div>
    </Modal>
  );
}
