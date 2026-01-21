import { useState } from "react";
import { Save, X, Lock, Loader2, Eye, EyeOff, Shield } from "lucide-react";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { updateMyPassword } from "../../../services/myProfileService";
import { handleSnackbar } from "../../../utils/messageHelpers";
import { validatePasswordReact } from "../../../utils/validators";

export default function SecurityTab() {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [form, setForm] = useState({
    password_current: "",
    password: "",
    password_confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Validar un campo individual
  const validateSingleField = (field, value) => {
    let isRequired = true;
    let customMessage = "Campo requerido";

    switch (field) {
      case "password_current":
        if (!value || value.length === 0) {
          return { isValid: false, message: "La contraseña actual es requerida" };
        }
        return { isValid: true, message: null };

      case "password":
        const passwordValidation = validatePasswordReact(value);
        if (!passwordValidation.isValid) {
          return {
            isValid: false,
            message: passwordValidation.messages[0] || "Contraseña inválida",
          };
        }
        return { isValid: true, message: null };

      case "password_confirm":
        if (!value || value.length === 0) {
          return { isValid: false, message: "Confirme la nueva contraseña" };
        }
        if (value !== form.password) {
          return { isValid: false, message: "Las contraseñas no coinciden" };
        }
        return { isValid: true, message: null };

      default:
        return { isValid: true, message: null };
    }
  };

  // Validar todos los campos
  const validateAll = () => {
    const newErrors = {};
    const fields = ["password_current", "password", "password_confirm"];

    fields.forEach((field) => {
      const validation = validateSingleField(field, form[field]);
      if (!validation.isValid) {
        newErrors[field] = validation.message;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios
  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));

    // Validar el campo actual
    const validation = validateSingleField(field, value);
    setErrors((prev) => ({
      ...prev,
      [field]: validation.isValid ? null : validation.message,
    }));

    // Si cambia la contraseña nueva, revalidar confirmación
    if (field === "password" && form.password_confirm) {
      const confirmValidation = validateSingleField("password_confirm", form.password_confirm);
      setErrors((prev) => ({
        ...prev,
        password_confirm: confirmValidation.isValid ? null : confirmValidation.message,
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    setSaving(true);

    try {
      const response = await updateMyPassword(form);

      if (response.success) {
        handleSnackbar("Contraseña actualizada correctamente", "success");
        setForm({
          password_current: "",
          password: "",
          password_confirm: "",
        });
        setErrors({});
        setIsChangingPassword(false);
      } else {
        handleSnackbar(
          response.message || "Error al actualizar la contraseña",
          "error"
        );
      }
    } catch (error) {
      handleSnackbar("Error al actualizar la contraseña", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      password_current: "",
      password: "",
      password_confirm: "",
    });
    setErrors({});
    setIsChangingPassword(false);
  };

  // Indicadores de requisitos de contraseña
  const passwordRequirements = [
    { label: "Mínimo 8 caracteres", test: (p) => p.length >= 8 },
    { label: "Al menos una mayúscula", test: (p) => /[A-Z]/.test(p) },
    { label: "Al menos una minúscula", test: (p) => /[a-z]/.test(p) },
    { label: "Al menos un número", test: (p) => /[0-9]/.test(p) },
    { label: "Al menos un símbolo", test: (p) => /[\W_]/.test(p) },
  ];

  return (
    <div className="space-y-6">
      {/* Header de la sección */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Shield size={20} />
            Seguridad de la Cuenta
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Actualiza tu contraseña para mantener tu cuenta segura
          </p>
        </div>

        {!isChangingPassword && (
          <Button onClick={() => setIsChangingPassword(true)} icon={Lock}>
            Cambiar Contraseña
          </Button>
        )}
      </div>

      {isChangingPassword ? (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg">
          <div className="space-y-4">
            {/* Requisitos de contraseña */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1">
              <p className="text-xs font-semibold text-amber-900">
                Requisitos de contraseña:
              </p>
              <ul className="text-xs text-amber-800 space-y-1">
                {passwordRequirements.map((req, idx) => (
                  <li
                    key={idx}
                    className={
                      req.test(form.password)
                        ? "text-green-600 font-semibold"
                        : ""
                    }
                  >
                    • {req.label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Contraseña actual */}
              <div className="relative">
                <Input
                  label="Contraseña actual"
                  type={showPasswords.current ? "text" : "password"}
                  value={form.password_current}
                  onChange={(e) => handleChange("password_current", e.target.value)}
                  error={errors.password_current}
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  className="absolute right-3 top-[34px] text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Nueva contraseña */}
              <div className="relative">
                <Input
                  label="Nueva contraseña"
                  type={showPasswords.new ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  error={errors.password}
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  className="absolute right-3 top-[34px] text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Confirmar contraseña */}
              <div className="relative">
                <Input
                  label="Confirmar nueva contraseña"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={form.password_confirm}
                  onChange={(e) => handleChange("password_confirm", e.target.value)}
                  error={errors.password_confirm}
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute right-3 top-[34px] text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200">
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
              {saving ? "Actualizando..." : "Actualizar Contraseña"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <Lock size={16} className="text-gray-400" />
            Tu contraseña se encuentra protegida. Haz clic en "Cambiar
            Contraseña" para actualizarla.
          </p>
        </div>
      )}
    </div>
  );
}
