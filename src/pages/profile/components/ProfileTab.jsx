import { useState, useEffect } from "react";
import { Edit2, Save, X, Loader2 } from "lucide-react";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { validateField } from "../../../utils/validators";

export default function ProfileTab({ profileData, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: "",
    email: "",
    rut: "",
    phone: "",
  });

  useEffect(() => {
    if (profileData) {
      setForm({
        name: profileData.name || "",
        email: profileData.email || "",
        rut: profileData.rut || "",
        phone: profileData.phone || "",
      });
    }
  }, [profileData]);

  // Validar un campo individual
  const validateSingleField = (field, value) => {
    let validationType = "text";
    let isRequired = false;
    let customMessage = "Campo requerido";

    const requiredFields = ["name", "email"];
    isRequired = requiredFields.includes(field);

    switch (field) {
      case "name":
        validationType = "names";
        customMessage = "El nombre debe tener al menos 3 caracteres";
        break;
      case "email":
        validationType = "email";
        customMessage = "Ingrese un email válido";
        break;
      case "rut":
        validationType = "rut";
        customMessage = "RUT inválido";
        isRequired = false;
        break;
      case "phone":
        validationType = "text";
        isRequired = false;
        break;
      default:
        validationType = "text";
        isRequired = false;
        break;
    }

    const result = validateField(value, validationType, isRequired, customMessage);

    return {
      isValid: result.validate,
      message: result.msg,
      cleanValue: result.value_data !== undefined ? result.value_data : value,
    };
  };

  // Validar todos los campos
  const validateAll = () => {
    const newErrors = {};
    const requiredFields = ["name", "email"];

    requiredFields.forEach((field) => {
      const value = form[field];
      const validation = validateSingleField(field, value || "");

      if (!validation.isValid) {
        newErrors[field] = validation.message;
      }
    });

    // Validar RUT si tiene valor
    if (form.rut) {
      const rutValidation = validateSingleField("rut", form.rut);
      if (!rutValidation.isValid) {
        newErrors.rut = rutValidation.message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios
  const handleChange = (field, value) => {
    const validation = validateSingleField(field, value);
    const cleanValue = validation.cleanValue;

    setForm((f) => ({ ...f, [field]: cleanValue }));

    setErrors((prev) => ({
      ...prev,
      [field]: validation.isValid ? null : validation.message,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    setSaving(true);

    const dataToSend = {
      name: form.name,
      email: form.email,
      rut: form.rut,
      phone: form.phone,
    };

    const success = await onUpdate(dataToSend);

    if (success) {
      setIsEditing(false);
    }

    setSaving(false);
  };

  const handleCancel = () => {
    setForm({
      name: profileData?.name || "",
      email: profileData?.email || "",
      rut: profileData?.rut || "",
      phone: profileData?.phone || "",
    });
    setErrors({});
    setIsEditing(false);
  };

  return (
    <div className="space-y-8">
      {/* Header de la sección */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Información Personal
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Actualiza tu información personal y datos de contacto
          </p>
        </div>

        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            icon={Edit2}
          >
            Editar Perfil
          </Button>
        )}
      </div>

      {/* Avatar y nombre */}
      <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white text-3xl font-bold">
          {profileData?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            {profileData?.name}
          </h3>
          <p className="text-gray-600">{profileData?.email}</p>
          {profileData?.role_name && (
            <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {profileData.role_name}
            </span>
          )}
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Nombre completo"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Ingrese nombre completo..."
              error={errors.name}
              maxLength={100}
              required
              disabled={!isEditing}
            />
          </div>

          <div>
            <Input
              label="Correo electrónico"
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="correo@ejemplo.com"
              error={errors.email}
              maxLength={254}
              required
              disabled={!isEditing}
            />
          </div>

          <div>
            <Input
              label="RUT"
              value={form.rut}
              onChange={(e) => handleChange("rut", e.target.value)}
              placeholder="12.345.678-9"
              error={errors.rut}
              maxLength={12}
              disabled={!isEditing}
            />
          </div>

          <div>
            <Input
              label="Teléfono"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="+56 9 1234 5678"
              maxLength={15}
              disabled={!isEditing}
            />
          </div>
        </div>

        {/* Botones de acción */}
        {isEditing && (
          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              icon={X}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              icon={saving ? Loader2 : Save}
              disabled={saving}
              loading={saving}
            >
              {saving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
