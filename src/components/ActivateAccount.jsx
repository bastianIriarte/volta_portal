// File: src/components/ActivateAccount.jsx
import React, { useState } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import {
  ArrowLeft,
  Building2,
  Send,
  CheckCircle,
  User,
  Mail,
  Phone,
  Briefcase,
  FileText,
  Search,
  AlertCircle,
  Barcode,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { formatearRut, normalizarRut, validarRut } from "../utils/rut";
import { handleSnackbar } from "../utils/messageHelpers";
import { validateSapCompany, submitRegistrationRequest } from "../services/authService";
import FooterNoLogin from "./common/FooterNoLogin";

export default function ActivateAccount() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Validar empresa, 2: Datos solicitante, 3: Éxito

  // Step 1: Datos de empresa
  const [companyRut, setCompanyRut] = useState("");
  const [sapCode, setSapCode] = useState("");
  const [companyData, setCompanyData] = useState(null);

  // Step 2: Datos del solicitante
  const [requesterRut, setRequesterRut] = useState("");
  const [requesterName, setRequesterName] = useState("");
  const [requesterEmail, setRequesterEmail] = useState("");
  const [requesterPhone, setRequesterPhone] = useState("");
  const [position, setPosition] = useState("");

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // ==================== VALIDACIONES ====================
  const validateCompanyRut = (val) => {
    if (!val) return "Ingresa el RUT de la empresa";
    if (!validarRut(val)) return "RUT de empresa inválido";
    return "";
  };

  const validateSapCode = (val) => {
    if (!val) return "Ingresa el código SAP";
    if (val.length < 3) return "El código SAP debe tener al menos 3 caracteres";
    return "";
  };

  const validateRequesterRut = (val) => {
    if (!val) return "Ingresa tu RUT";
    if (!validarRut(val)) return "RUT inválido";
    return "";
  };

  const validateRequesterName = (val) => {
    if (!val) return "Ingresa tu nombre completo";
    if (val.length < 3) return "El nombre debe tener al menos 3 caracteres";
    return "";
  };

  const validateRequesterEmail = (val) => {
    if (!val) return "Ingresa tu correo electrónico";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) return "Correo electrónico inválido";
    return "";
  };

  // ==================== HANDLERS STEP 1 ====================
  const onCompanyRutChange = (e) => {
    let v = e.target.value;
    v = v.replace(/[^0-9kK.-]/g, "");

    const normalized = normalizarRut(v);
    if (normalized && normalized.length >= 2) {
      v = formatearRut(normalized);
    }

    setCompanyRut(v);
    if (touched.companyRut) {
      const msg = validateCompanyRut(v);
      setErrors((p) => ({ ...p, companyRut: msg || undefined }));
    }
  };

  const onSapCodeChange = (e) => {
    const v = e.target.value;
    setSapCode(v);
    if (touched.sapCode) {
      const msg = validateSapCode(v);
      setErrors((p) => ({ ...p, sapCode: msg || undefined }));
    }
  };

  const handleValidarEmpresa = async () => {
    const companyRutMsg = validateCompanyRut(companyRut);
    const sapCodeMsg = validateSapCode(sapCode);

    setErrors({
      companyRut: companyRutMsg || undefined,
      sapCode: sapCodeMsg || undefined,
    });
    setTouched({ companyRut: true, sapCode: true });

    if (companyRutMsg || sapCodeMsg) return;

    try {
      setSubmitting(true);
      const rutNormalizado = normalizarRut(companyRut);

      const response = await validateSapCompany({
        company_rut: rutNormalizado,
        sap_code: sapCode,
      });

      if (response.success) {
        setCompanyData(response.data);
        setStep(2);
        setErrors({});
        setTouched({});
        handleSnackbar("Empresa validada correctamente", "success");
        return;
      }

      setErrors({ form: response.message || "No se pudo validar la empresa" });
    } catch (err) {
      console.error(err);
      handleSnackbar("Error al validar la empresa", "error");
      setErrors({
        form: "No se encontró la empresa con los datos ingresados. Verifica el RUT y código SAP.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ==================== HANDLERS STEP 2 ====================
  const onRequesterRutChange = (e) => {
    let v = e.target.value;
    v = v.replace(/[^0-9kK.-]/g, "");

    const normalized = normalizarRut(v);
    if (normalized && normalized.length >= 2) {
      v = formatearRut(normalized);
    }

    setRequesterRut(v);
    if (touched.requesterRut) {
      const msg = validateRequesterRut(v);
      setErrors((p) => ({ ...p, requesterRut: msg || undefined }));
    }
  };

  const onRequesterNameChange = (e) => {
    const v = e.target.value;
    setRequesterName(v);
    if (touched.requesterName) {
      const msg = validateRequesterName(v);
      setErrors((p) => ({ ...p, requesterName: msg || undefined }));
    }
  };

  const onRequesterEmailChange = (e) => {
    const v = e.target.value;
    setRequesterEmail(v);
    if (touched.requesterEmail) {
      const msg = validateRequesterEmail(v);
      setErrors((p) => ({ ...p, requesterEmail: msg || undefined }));
    }
  };

  const handleEnviarSolicitud = async () => {
    const requesterRutMsg = validateRequesterRut(requesterRut);
    const requesterNameMsg = validateRequesterName(requesterName);
    const requesterEmailMsg = validateRequesterEmail(requesterEmail);

    setErrors({
      requesterRut: requesterRutMsg || undefined,
      requesterName: requesterNameMsg || undefined,
      requesterEmail: requesterEmailMsg || undefined,
    });
    setTouched({
      requesterRut: true,
      requesterName: true,
      requesterEmail: true,
    });

    if (requesterRutMsg || requesterNameMsg || requesterEmailMsg) return;

    try {
      setSubmitting(true);

      const response = await submitRegistrationRequest({
        company_rut: normalizarRut(companyRut),
        sap_code: sapCode,
        rut: normalizarRut(requesterRut),
        name: requesterName,
        email: requesterEmail,
        phone: requesterPhone || null,
        position: position || null,
      });

      if (response.success) {
        setStep(3);
        handleSnackbar("Solicitud enviada correctamente", "success");
        return;
      }

      setErrors({ form: response.message || "Error al enviar la solicitud" });
    } catch (err) {
      console.error(err);
      handleSnackbar("Error al enviar la solicitud", "error");
      setErrors({
        form: "No se pudo enviar la solicitud. Intenta nuevamente.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ==================== STEP 3: ÉXITO ====================
  if (step === 3) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-blue-100 p-6">
        <div className="w-full max-w-md">
          <div className="card rounded-2xl p-8 shadow-xl text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>

            <h2 className="text-xl font-bold text-[var(--brand-primary)] mb-3">
              SOLICITUD ENVIADA
            </h2>

            <p className="text-gray-700 mb-4">
              Tu solicitud de registro ha sido enviada correctamente.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-blue-900 mb-2">
                <strong>¿Qué sigue?</strong>
              </p>
              <ul className="text-sm text-blue-800">
                <li>• Un administrador revisará tu solicitud</li>
                <li>• Recibirás un correo con la respuesta</li>
                <li>• Si es aprobada, podrás activar tu cuenta</li>
              </ul>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-6 text-left">
              <p className="text-[13px] text-gray-600">
                <strong className="text-xs">EMPRESA:</strong> {companyData?.business_name || companyRut}
              </p>
              <p className="text-[13px] text-gray-600">
                <strong className="text-xs">SOLICITANTE:</strong> {requesterName}
              </p>
              <p className="text-[13px] text-gray-600">
                <strong className="text-xs">CORREO:</strong> {requesterEmail}
              </p>
            </div>

            <Button
              variant="primary"
              icon={ArrowLeft}
              onClick={() => navigate("/login")}
              className="w-full"
            >
              Volver al Inicio de Sesión
            </Button>
          </div>
          <FooterNoLogin />
        </div>
      </div>
    );
  }

  // ==================== STEP 2: DATOS DEL SOLICITANTE ====================
  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-blue-100 p-6">
        <div className="w-full max-w-md">
          <div className="card rounded-2xl p-8 shadow-xl">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-[var(--brand-primary)] rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-[var(--brand-primary)] mb-1">
                DATOS DEL SOLICITANTE
              </h2>
              <p className="text-sm text-gray-600">
                Completa tus datos para enviar la solicitud de acceso
              </p>
            </div>

            {/* Info de empresa validada */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-1 mb-1">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-800 uppercase">
                  Empresa Validada
                </span>
              </div>
              <p className="text-xs font-bold text-emerald-700">
                {companyData?.business_name || "Empresa"}
              </p>
              <p className="text-xs text-emerald-600">
                RUT: {companyData?.rut_formatted || companyRut}
              </p>
            </div>

            {errors.form && (
              <div className="mb-4 rounded-lg border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span>{errors.form}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* RUT Solicitante */}
              <div>
                <div className="relative">
                  <User className="absolute z-10 left-3 top-10 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    required
                    label={'TU RUT'}
                    type="text"
                    placeholder="12.345.678-9"
                    value={requesterRut}
                    onChange={onRequesterRutChange}
                    onBlur={() =>
                      setTouched((p) => ({ ...p, requesterRut: true }))
                    }
                    className={`pl-10 ${errors.requesterRut
                      ? "border-red-400 focus:ring-red-200"
                      : ""
                      }`}
                  />
                </div>
                {errors.requesterRut && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    {errors.requesterRut}
                  </p>
                )}
              </div>

              {/* Nombre Completo */}
              <div>
                <div className="relative">
                  <FileText className="absolute z-10 left-3 top-10 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    required
                    label={'Nombre Completo'}
                    type="text"
                    placeholder="Juan Pérez González"
                    value={requesterName}
                    onChange={onRequesterNameChange}
                    onBlur={() =>
                      setTouched((p) => ({ ...p, requesterName: true }))
                    }
                    className={`pl-10 ${errors.requesterName
                      ? "border-red-400 focus:ring-red-200"
                      : ""
                      }`}
                  />
                </div>
                {errors.requesterName && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    {errors.requesterName}
                  </p>
                )}
              </div>

              {/* Correo Electrónico */}
              <div>
                <div className="relative">
                  <Mail className="absolute z-10 left-3 top-10 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    required
                    label={'Correo Electrónico'}
                    type="email"
                    placeholder="correo@empresa.cl"
                    value={requesterEmail}
                    onChange={onRequesterEmailChange}
                    onBlur={() =>
                      setTouched((p) => ({ ...p, requesterEmail: true }))
                    }
                    className={`pl-10 ${errors.requesterEmail
                      ? "border-red-400 focus:ring-red-200"
                      : ""
                      }`}
                  />
                </div>
                {errors.requesterEmail && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    {errors.requesterEmail}
                  </p>
                )}
              </div>

              {/* Teléfono (opcional) */}
              <div>
                <div className="relative">
                  <Phone className="absolute z-10 left-3 top-10 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    label={'Teléfono'}
                    type="tel"
                    placeholder="+56 9 1234 5678"
                    value={requesterPhone}
                    onChange={(e) => setRequesterPhone(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Cargo (opcional) */}
              <div>
                <div className="relative">
                  <Briefcase className="absolute z-10 left-3 top-10 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    label={'Cargo'}
                    type="text"
                    placeholder="Ej: Gerente de Compras"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Button
                icon={Send}
                onClick={handleEnviarSolicitud}
                disabled={submitting}
                loading={submitting}
                className="w-full"
              >
                Enviar Solicitud de Registro
              </Button>

              <Button
                variant="ghost"
                icon={ArrowLeft}
                type="button"
                onClick={() => {
                  setStep(1);
                  setErrors({});
                  setTouched({});
                }}
                disabled={submitting}
                className="w-full"
              >
                Volver a validar empresa
              </Button>
            </div>
          </div>
          <FooterNoLogin />
        </div>
      </div>
    );
  }

  // ==================== STEP 1: VALIDAR EMPRESA ====================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-blue-100 p-6">
      <div className="w-full max-w-md">
        <div className="card rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-6">
            <div className="text-center mb-5 border-b-2 border-gray-100">
              <img
                src="/volta_logo.png"
                alt="Logo"
                className="h-[40px] w-[150px] object-contain mx-auto mb-4"
              />
            </div>
            <h2 className="text-xl font-bold text-[var(--brand-primary)] mb-2">
              SOLICITUD DE ACCESO
            </h2>
            <p className="text-sm text-gray-600">
              Ingresa los datos de tu empresa para iniciar el proceso de registro
            </p>
          </div>

          {errors.form && (
            <div className="mb-4 rounded-lg border-2 justify-center border-red-200 bg-red-50 px-4 py-2 text-[13px] text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span>{errors.form}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* RUT Empresa */}
            <div>

              <div className="relative">
                <Building2 className="absolute left-3 z-10 top-10 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  required
                  label={'RUT de la Empresa '}
                  type="text"
                  placeholder="76.123.456-7"
                  value={companyRut}
                  onChange={onCompanyRutChange}
                  onBlur={() =>
                    setTouched((p) => ({ ...p, companyRut: true }))
                  }
                  className={`pl-10 ${errors.companyRut
                    ? "border-red-400 focus:ring-red-200"
                    : ""
                    }`}
                />
              </div>
              {errors.companyRut && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  {errors.companyRut}
                </p>
              )}
            </div>

            {/* Código SAP */}
            <div>
              <div className="relative">
                <Barcode className="absolute left-3 z-10 top-10 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  required
                  label={'Código SAP'}
                  type="text"
                  placeholder="SAP001"
                  value={sapCode}
                  onChange={onSapCodeChange}
                  onBlur={() => setTouched((p) => ({ ...p, sapCode: true }))}
                  className={`pl-10 ${errors.sapCode ? "border-red-400 focus:ring-red-200" : ""
                    }`}
                />
              </div>
              {errors.sapCode && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  {errors.sapCode}
                </p>
              )}
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-900 leading-relaxed">
                <strong>ℹ️ Información:</strong> Ingresa el RUT de tu empresa y
                el código SAP que te fue asignado. Si no conoces estos datos,
                contacta a tu administrador.
              </p>
            </div>

            <Button
              icon={Search}
              onClick={handleValidarEmpresa}
              disabled={submitting}
              loading={submitting}
              className="w-full"
            >
              Validar Empresa
            </Button>

            <div>
              <Link to="/login">
                <Button variant="ghost" icon={ArrowLeft} className="w-full">
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
