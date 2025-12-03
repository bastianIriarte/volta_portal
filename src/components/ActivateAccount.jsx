// File: src/components/RecoveryPassword.jsx
import React, { useState, useRef, useEffect } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { ArrowLeft, Mail, Send, CheckCircle, Key, Eye, EyeOff, Lock, LogInIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { formatearRut, normalizarRut, validarRut } from "../utils/rut";
import { handleSnackbar } from "../utils/messageHelpers";
import { activateAccount, validateCodeActivation, activatePasswordWithCode } from "../services/authService";
import FooterNoLogin from "./common/FooterNoLogin";

// 🔹 Componente de Input de Código de Verificación
const CodigoVerificacionInput = ({ value, onChange, length = 6, error }) => {
  const [digits, setDigits] = useState(Array(length).fill(""));
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  useEffect(() => {
    if (value) {
      const newDigits = value.split("").slice(0, length);
      while (newDigits.length < length) {
        newDigits.push("");
      }
      setDigits(newDigits);
    } else {
      setDigits(Array(length).fill(""));
    }
  }, [value, length]);

  const handleChange = (index, val) => {
    const sanitizedValue = val.replace(/[^0-9]/g, "");

    if (sanitizedValue.length > 1) {
      const pastedDigits = sanitizedValue.split("").slice(0, length);
      const newDigits = [...digits];

      pastedDigits.forEach((digit, i) => {
        if (index + i < length) {
          newDigits[index + i] = digit;
        }
      });

      setDigits(newDigits);
      onChange(newDigits.join(""));

      const nextEmptyIndex = newDigits.findIndex(d => !d);
      const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex;
      inputRefs.current[focusIndex]?.focus();
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = sanitizedValue;
    setDigits(newDigits);
    onChange(newDigits.join(""));

    if (sanitizedValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newDigits = [...digits];

      if (digits[index]) {
        newDigits[index] = "";
        setDigits(newDigits);
        onChange(newDigits.join(""));
      } else if (index > 0) {
        newDigits[index - 1] = "";
        setDigits(newDigits);
        onChange(newDigits.join(""));
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
    const pastedDigits = pastedData.split("").slice(0, length);

    const newDigits = [...digits];
    pastedDigits.forEach((digit, i) => {
      newDigits[i] = digit;
    });

    setDigits(newDigits);
    onChange(newDigits.join(""));

    const focusIndex = Math.min(pastedDigits.length, length - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={el => inputRefs.current[index] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={`
            w-12 h-14 text-center text-2xl font-bold rounded-xl
            border-2 transition-all duration-200
            focus:outline-none focus:ring-2
            ${error
              ? "border-red-400 focus:border-red-500 focus:ring-red-200"
              : digit
                ? "border-green-400 bg-green-50 focus:border-green-500 focus:ring-green-200"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
            }
            ${digit ? "text-green-700" : "text-gray-700"}
          `}
          aria-label={`Dígito ${index + 1} del código`}
        />
      ))}
    </div>
  );
};

export default function RecoveryPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: RUT, 2: Validar código, 3: Nueva contraseña, 4: Éxito

  const [rut, setRut] = useState("");
  const [passwordTemporal, setPasswordTemporal] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [emailEnviado, setEmailEnviado] = useState("");

  // 🔹 Validaciones
  const validateRut = (val) => {
    if (!val) return "Ingresa tu RUT";
    if (!validarRut(val)) return "RUT inválido";
    return "";
  };

  const validatePasswordTemporal = (val) => {
    if (!val) return "Ingresa la contraseña temporal";
    if (val.length !== 6) return "La contraseña temporal debe tener 6 dígitos";
    return "";
  };

  const validateNewPassword = (val) => {
    if (!val) return "Ingresa una contraseña";
    if (val.length < 8) return "Mínimo 8 caracteres";
    if (!/[A-Z]/.test(val)) return "Debe contener al menos una mayúscula";
    if (!/[a-z]/.test(val)) return "Debe contener al menos una minúscula";
    if (!/[0-9]/.test(val)) return "Debe contener al menos un número";
    return "";
  };

  const validateConfirmPassword = (val) => {
    if (!val) return "Confirma tu contraseña";
    if (val !== newPassword) return "Las contraseñas no coinciden";
    return "";
  };

  // 🔹 Handlers Step 1
  const onRutChange = (e) => {
    let v = e.target.value;
    v = v.replace(/[^0-9kK.-]/g, '');

    const normalized = normalizarRut(v);
    if (normalized && normalized.length >= 2) {
      v = formatearRut(normalized);
    }

    setRut(v);
    if (touched.rut) {
      const msg = validateRut(v);
      setErrors((p) => ({ ...p, rut: msg || undefined }));
    }
  };

  const handleEnviarTemporal = async () => {
    const rutMsg = validateRut(rut);

    setErrors({ rut: rutMsg || undefined });
    setTouched({ rut: true });

    if (rutMsg) return;

    try {
      setSubmitting(true);
      const rutNormalizado = normalizarRut(rut);

      const response = await activateAccount({ rut: rutNormalizado });
      setEmailEnviado("");
      if (response.success) {
        const correo = response.data?.email || "";
        setEmailEnviado(correo);
        setStep(2);
        handleSnackbar(`Código enviado a ${correo}`, "success");
        return;
      }

      if (response.message && response.message.includes("Ya existe una solicitud")) {
        const correo = response.data?.email || "";
        setEmailEnviado(correo);
        setStep(2);
        handleSnackbar("Ya tienes una solicitud activa. Ingresa el código que recibiste.", "info");
        return;
      }
      setErrors({ form: response.message });
    } catch (err) {
      console.error(err);
      handleSnackbar("Error al enviar contraseña temporal", "error");
      setErrors({ form: "No se pudo procesar tu solicitud. Verifica que el RUT esté registrado." });
    } finally {
      setSubmitting(false);
    }
  };

  // 🔹 Handlers Step 2
  const onPasswordTemporalChange = (val) => {
    setPasswordTemporal(val);
    if (touched.passwordTemporal) {
      const msg = validatePasswordTemporal(val);
      setErrors((p) => ({ ...p, passwordTemporal: msg || undefined }));
    }
  };

  const handleValidarTemporal = async () => {
    const tempMsg = validatePasswordTemporal(passwordTemporal);

    setErrors({ passwordTemporal: tempMsg || undefined });
    setTouched({ passwordTemporal: true });

    if (tempMsg) return;

    try {
      setSubmitting(true);
      const rutNormalizado = normalizarRut(rut);

      const response = await validateCodeActivation({
        rut: rutNormalizado,
        code: passwordTemporal,
      });

      if (response.success) {
        setStep(3);
        setErrors({});
        setTouched({});
        handleSnackbar("Código validado correctamente", "success");
        return;
      }
      if (response.message && response.message.includes("solicitud ha expirado")) {
        setStep(1);
        setRut("");
        handleSnackbar("El código es incorrecto o ha expirado. Solicita uno nuevo.", "info");
        return;
      }

      setErrors({ form: response.message });

    } catch (err) {
      console.error(err);
      handleSnackbar("Contraseña temporal incorrecta", "error");
      setErrors({ form: "Contraseña temporal incorrecta. Verifica el código enviado a tu correo." });
    } finally {
      setSubmitting(false);
    }
  };

  // 🔹 Handlers Step 3
  const onNewPasswordChange = (e) => {
    const v = e.target.value;
    setNewPassword(v);
    if (touched.newPassword) {
      const msg = validateNewPassword(v);
      setErrors((p) => ({ ...p, newPassword: msg || undefined }));
    }
    if (touched.confirmPassword && confirmPassword) {
      const confirmMsg = v === confirmPassword ? "" : "Las contraseñas no coinciden";
      setErrors((p) => ({ ...p, confirmPassword: confirmMsg || undefined }));
    }
  };

  const onConfirmPasswordChange = (e) => {
    const v = e.target.value;
    setConfirmPassword(v);
    if (touched.confirmPassword) {
      const msg = validateConfirmPassword(v);
      setErrors((p) => ({ ...p, confirmPassword: msg || undefined }));
    }
  };

  const handleCrearPassword = async () => {
    const newPassMsg = validateNewPassword(newPassword);
    const confirmMsg = validateConfirmPassword(confirmPassword);

    setErrors({
      newPassword: newPassMsg || undefined,
      confirmPassword: confirmMsg || undefined
    });
    setTouched({ newPassword: true, confirmPassword: true });

    if (newPassMsg || confirmMsg) return;

    try {
      setSubmitting(true);

      // TODO: Llamar servicio
      // import { restablecerPassword } from "../services/authService";
      const rutNormalizado = normalizarRut(rut);
      const response = await activatePasswordWithCode({
        rut: rutNormalizado,
        code: passwordTemporal,
        password: newPassword,
        password_confirm: confirmPassword,
      });

      if (response.success) {
        setStep(4);
        handleSnackbar("¡Contraseña restablecida exitosamente!", "success");
        return;
      }
      if (response.message && response.message.includes("solicitud ha expirado")) {
        setStep(1);
        setRut("");
        handleSnackbar("El código es incorrecto o ha expirado. Solicita uno nuevo.", "info");
        return;
      }
      setErrors({ form: response.message });

    } catch (err) {
      console.error(err);
      handleSnackbar("Error al restablecer la contraseña", "error");
      setErrors({ form: "Error al restablecer la contraseña. Intenta nuevamente." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReenviar = async () => {
    setPasswordTemporal("");
    setErrors({});
    await handleEnviarTemporal();
  };

  // 🔹 STEP 4: Éxito
  if (step === 4) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-blue-100  p-6">
        <div className="w-full max-w-md">
          <div className="card rounded-2xl p-8 shadow-xl text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>

            <h2 className="text-2xl font-bold text-[var(--brand-primary)] mb-3">
              ¡CUENTA ACTIVADA!
            </h2>

            <p className="text-gray-700 mb-6">
              ¡Tu contraseña se ha creado correctamente! <br /> Hemos activado tu cuenta<br />
              Ya puedes iniciar sesión.
            </p>

            <Button
              variant="primary"
              icon={LogInIcon}
              onClick={() => navigate("/login")}
              className="w-full"
            >
              Ir a Iniciar Sesión
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 🔹 STEP 3: Crear nueva contraseña
  if (step === 3) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-blue-100 p-6">
        <div className="w-full max-w-md">
          <div className="card rounded-2xl p-8 shadow-xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[var(--brand-primary)] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Key className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--brand-primary)] mb-2">
                Nueva Contraseña
              </h2>
              <p className="text-sm text-gray-600">
                Crea una contraseña segura para tu cuenta
              </p>
            </div>

            {errors.form && (
              <div className="mb-4 rounded-lg border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
                <span className="text-red-500 text-lg flex-shrink-0"></span>
                <span>{errors.form}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nueva Contraseña <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={onNewPasswordChange}
                    onBlur={() => setTouched((p) => ({ ...p, newPassword: true }))}
                    className={errors.newPassword ? "border-red-400 focus:ring-red-200 pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:opacity-70 transition-opacity"
                    tabIndex={-1}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <span></span>
                    {errors.newPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmar Contraseña <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={onConfirmPasswordChange}
                    onBlur={() => setTouched((p) => ({ ...p, confirmPassword: true }))}
                    className={errors.confirmPassword ? "border-red-400 focus:ring-red-200 pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:opacity-70 transition-opacity"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <span></span>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1">
                <p className="text-xs font-semibold text-amber-900">Requisitos de contraseña:</p>
                <ul className="text-xs text-amber-800 space-y-1">
                  <li className={newPassword.length >= 8 ? "text-emerald-600 font-semibold" : ""}>
                    • Mínimo 8 caracteres
                  </li>
                  <li className={/[A-Z]/.test(newPassword) ? "text-emerald-600 font-semibold" : ""}>
                    • Al menos una mayúscula
                  </li>
                  <li className={/[a-z]/.test(newPassword) ? "text-emerald-600 font-semibold" : ""}>
                    • Al menos una minúscula
                  </li>
                  <li className={/[0-9]/.test(newPassword) ? "text-emerald-600 font-semibold" : ""}>
                    • Al menos un número
                  </li>
                </ul>
              </div>

              <Button
                icon={Key}
                onClick={handleCrearPassword}
                disabled={submitting}
                loading={submitting}
                className="w-full"
              >
                Restablecer Contraseña
              </Button>

              <button
                type="button"
                onClick={() => navigate("/login")}
                disabled={submitting}
                className="w-full text-sm text-gray-600 hover:text-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio de sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 🔹 STEP 2: Ingresar contraseña temporal con código de 6 dígitos
  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-blue-100 p-6">
        <div className="w-full max-w-md">
          <div className="card rounded-2xl p-8 shadow-xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[var(--brand-primary)] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--brand-primary)] mb-2 uppercase">
                Validación de Código
              </h2>
              <p className="text-sm text-gray-600 mb-3">
                Ingresa el código temporal que enviamos a tu correo para continuar con el proceso.
              </p>
              <div className="inline-flex items-center gap-2 bg-green-50 border-2 border-green-200 rounded-xl px-4 py-2">
                <Mail className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="font-bold text-green-900 break-all">
                  {(emailEnviado)}
                </span>
              </div>
            </div>

            {errors.form && (
              <div className="mb-4 rounded-lg border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
                <span className="text-red-500 text-lg flex-shrink-0"></span>
                <span>{errors.form}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 text-left">
                <p className="font-semibold mb-2 flex items-center gap-2">
                  <span>ℹ️</span> Revisa tu correo
                </p>
                <p className="text-xs">
                  Se ha enviado una contraseña temporal de <strong>6 dígitos</strong> a tu correo.
                  Si no la encuentras, revisa tu carpeta de <strong>spam</strong> o <strong>correo no deseado</strong>.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">
                  Contraseña Temporal
                </label>
                <CodigoVerificacionInput
                  value={passwordTemporal}
                  onChange={onPasswordTemporalChange}
                  length={6}
                  error={errors.passwordTemporal}
                />
                {errors.passwordTemporal && (
                  <p className="mt-2 text-xs text-red-600 text-center flex items-center justify-center gap-1">
                    <span></span>
                    {errors.passwordTemporal}
                  </p>
                )}
              </div>

              <Button
                icon={Key}
                onClick={handleValidarTemporal}
                disabled={submitting || passwordTemporal.length !== 6}
                loading={submitting}
                className="w-full"
              >
                Validar y Continuar
              </Button>

              <div className="text-center">
                <p className="text-xs text-gray-600 mb-2">
                  ¿No recibiste el código?
                </p>
                <button
                  onClick={handleReenviar}
                  disabled={submitting}
                  className="text-sm text-[var(--brand-primary)] hover:text-[var(--brand-primary-600)] font-semibold hover:underline disabled:opacity-50 transition-colors"
                >
                  Reenviar contraseña temporal
                </button>
              </div>

              <button
                type="button"
                onClick={() => navigate("/login")}
                disabled={submitting}
                className="w-full text-sm text-gray-600 hover:text-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio de sesión
              </button>
            </div>
          </div>


        </div>
      </div>
    );
  }

  // 🔹 STEP 1: Ingresar RUT
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-blue-100 p-6">
      <div className="w-full max-w-md">
        <div className="card rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[var(--brand-primary)] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--brand-primary)] mb-2">
              ACTIVACIÓN DE CUENTA
            </h2>
            <p className="text-sm text-gray-600">
              Ingresa tu RUT para iniciar proceso de activación
            </p>
          </div>

          {errors.form && (
            <div className="mb-4 rounded-lg border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
              <span className="text-red-500 text-lg flex-shrink-0"></span>
              <span dangerouslySetInnerHTML={{ __html: errors.form }}></span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                RUT <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="12.345.678-9"
                value={rut}
                onChange={onRutChange}
                onBlur={() => setTouched((p) => ({ ...p, rut: true }))}
                className={errors.rut ? "border-red-400 focus:ring-red-200" : ""}
              />
              {errors.rut && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <span></span>
                  {errors.rut}
                </p>
              )}
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-900 leading-relaxed">
                <strong>ℹ️ Información:</strong> Te enviaremos una contraseña temporal
                de 6 dígitos al correo electrónico asociado a tu RUT para que puedas activar tu cuenta.
              </p>
            </div>

            <Button
              icon={Send}
              onClick={handleEnviarTemporal}
              disabled={submitting}
              loading={submitting}
              className="w-full"
            >
              Enviar Contraseña Temporal
            </Button>

            <div>
              <Link to="/login">
                <Button
                  variant="ghost"
                  icon={ArrowLeft}
                  className="w-full"
                >
                  Volver al inicio de sesión
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <FooterNoLogin />
      </div>
    </div>
  );
}