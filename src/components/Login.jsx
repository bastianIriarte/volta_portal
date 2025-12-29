// File: src/components/Login.jsx
import React, { useState } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { useAuth } from "../context/auth";
import { LogIn, Eye, EyeOff, Key, Heart } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { formatearRut, normalizarRut, validarRut } from "../utils/rut";
import FooterNoLogin from "./common/FooterNoLogin";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [rut, setRut] = useState("");
  const [pass, setPass] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({ rut: false, pass: false });
  const [submitting, setSubmitting] = useState(false);

  const validateRut = (val) => {
    if (!val) return "Ingresa tu RUT";
    if (!validarRut(val)) return "RUT inválido";
    return "";
  };

  const validatePass = (val) => {
    if (!val) return "Ingresa tu contraseña";
    return "";
  };

  const onRutChange = (e) => {
    let v = e.target.value;

    // Permitir solo números, puntos, guión y K
    v = v.replace(/[^0-9kK.-]/g, '');

    // Formatear automáticamente mientras escribe
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

  const onPassChange = (e) => {
    const v = e.target.value;
    setPass(v);
    if (touched.pass) {
      const msg = validatePass(v);
      setErrors((p) => ({ ...p, pass: msg || undefined }));
    }
  };

  const onBlurField = (field) => {
    setTouched((p) => ({ ...p, [field]: true }));

    if (field === "rut") {
      const msg = validateRut(rut);
      setErrors((p) => ({ ...p, rut: msg || undefined }));
    } else {
      const msg = validatePass(pass);
      setErrors((p) => ({ ...p, pass: msg || undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const rutMsg = validateRut(rut);
    const passMsg = validatePass(pass);

    setErrors({
      rut: rutMsg || undefined,
      pass: passMsg || undefined
    });
    setTouched({ rut: true, pass: true });

    if (rutMsg || passMsg) return;

    try {
      setSubmitting(true);
      const rutNormalizado = normalizarRut(rut);
      const resp = await login(rutNormalizado, pass);
      if (resp) {
        const next = location.state?.from?.pathname || "/dashboard";
        navigate(next, { replace: true });
      }

    } catch (err) {
      console.error(err);
      setErrors((p) => ({
        ...p,
        form: "No fue posible iniciar sesión. Verifica tus credenciales."
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const showRutErr = !!errors.rut;
  const showPassErr = !!errors.pass;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-blue-100 p-6">
      <div className="w-full max-w-md">
        <div className="card rounded-2xl p-8 shadow-xl">
          {/* Logo */}
          <div className="text-center mb-5 border-b-2 border-gray-100">
            <img
              src="/volta_logo.png"
              alt="Logo"
              className="h-[40px] w-[150px] object-contain mx-auto mb-4"
            />
          </div>

           <h1 className="text-lg md:text-2xl font-bold text-[var(--brand-primary)] text-center">
            SUCURSAL VIRTUAL
          </h1> 
          <p className="text-sm text-black/60 text-center mb-6">
            Ingresa tus credenciales para acceder a tu cuenta
          </p> 

          {errors.form && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo RUT */}
            <div>
              <div className="relative">
                <Input
                  required
                  label="RUT"
                  type="text"
                  placeholder="12.345.678-9"
                  value={rut}
                  onChange={onRutChange}
                  onBlur={() => onBlurField("rut")}
                  aria-invalid={showRutErr}
                  aria-describedby={showRutErr ? "err-rut" : undefined}
                  className={showRutErr ? "border-red-400 focus:ring-red-200 pr-10" : "pr-10"}
                />
                <div className="absolute inset-y-0 right-0 top-4 pr-3 flex items-center pointer-events-none">
                  <Key className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              {showRutErr && (
                <p id="err-rut" className="mt-1 text-xs text-red-600">
                  {errors.rut}
                </p>
              )}
            </div>

            {/* Campo Contraseña */}
            <div>
              <div className="relative">
                <Input
                  required
                  label="CONTRASEÑA"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={pass}
                  onChange={onPassChange}
                  onBlur={() => onBlurField("pass")}
                  aria-invalid={showPassErr}
                  aria-describedby={showPassErr ? "err-pass" : undefined}
                  className={showPassErr ? "border-red-400 focus:ring-red-200 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 top-4 pr-3 flex items-center hover:opacity-70 transition-opacity"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {showPassErr && (
                <p id="err-pass" className="mt-1 text-xs text-red-600">
                  {errors.pass}
                </p>
              )}
            </div>

            {/* Botón siempre habilitado */}
            <Button
              type="submit"
              size="lg"
              icon={LogIn}
              className="w-full text-center justify-center"
              disabled={submitting}
            >
              {submitting ? "Entrando…" : "Entrar"}
            </Button>
          </form>

          <div className="space-y-2 pt-2">
            <div className="text-center">
              <Link
                to="/recuperar-password"
                className="text-sm text-[var(--brand-primary)] hover:text-[var(--brand-primary-600)] transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">o</span>
              </div>
            </div>

            <div className="text-center">
              <Link
                to="/primera-vez"
                className="text-sm text-[var(--brand-primary)] hover:text-[var(--brand-primary-600)] transition-colors"
              >
                ¿Primera vez? Registrate aquí
              </Link>
            </div>
          </div>
        </div>

        <FooterNoLogin />
      </div>
    </div>
  );
}