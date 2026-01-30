// File: src/components/ActivateAccount.jsx
import { useState } from "react";
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
import { normalizarRut } from "../utils/rut";
import { handleSnackbar } from "../utils/messageHelpers";
import { validateField } from "../utils/validators";
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
  const [submitting, setSubmitting] = useState(false);

  // ==================== VALIDACIONES ====================
  // Validar un campo individual usando el validador unificado
  const validateSingleField = (field, value) => {
    let validationType = "text";
    let isRequired = true;
    let customMessage = "Campo requerido";

    switch (field) {
      case "companyRut":
        validationType = "rut";
        customMessage = "RUT de empresa inválido";
        break;
      case "sapCode":
        validationType = "text_min";
        customMessage = "El código SAP debe tener al menos 3 caracteres";
        break;
      case "requesterRut":
        validationType = "rut";
        customMessage = "RUT inválido";
        break;
      case "requesterName":
        validationType = "names";
        customMessage = "El nombre debe tener al menos 3 caracteres";
        break;
      case "requesterEmail":
        validationType = "email";
        customMessage = "Correo electrónico inválido";
        break;
      case "requesterPhone":
        validationType = "mobile";
        customMessage = "N° Incorrecto. Ej: +56912345678";
        isRequired = false;
        break;
      case "position":
        isRequired = false;
        break;
      default:
        break;
    }

    const result = validateField(value, validationType, isRequired, customMessage);

    return {
      isValid: result.validate,
      message: result.msg,
      cleanValue: result.value_data !== undefined ? result.value_data : value
    };
  };

  // Manejar cambios en campos con validación y limpieza
  const handleFieldChange = (field, value, setter) => {
    const validation = validateSingleField(field, value);
    const cleanValue = validation.cleanValue;

    setter(cleanValue);

    // Actualizar errores solo si el campo tiene valor o ya fue validado
    if (value || errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: validation.isValid ? undefined : validation.message
      }));
    }
  };

  // ==================== HANDLERS STEP 1 ====================
  const onCompanyRutChange = (e) => {
    handleFieldChange("companyRut", e.target.value, setCompanyRut);
  };

  const onSapCodeChange = (e) => {
    handleFieldChange("sapCode", e.target.value, setSapCode);
  };

  const handleValidarEmpresa = async () => {
    const companyRutValidation = validateSingleField("companyRut", companyRut);
    const sapCodeValidation = validateSingleField("sapCode", sapCode);

    setErrors({
      companyRut: companyRutValidation.isValid ? undefined : companyRutValidation.message,
      sapCode: sapCodeValidation.isValid ? undefined : sapCodeValidation.message,
    });

    if (!companyRutValidation.isValid || !sapCodeValidation.isValid) return;

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
    handleFieldChange("requesterRut", e.target.value, setRequesterRut);
  };

  const onRequesterNameChange = (e) => {
    handleFieldChange("requesterName", e.target.value, setRequesterName);
  };

  const onRequesterEmailChange = (e) => {
    handleFieldChange("requesterEmail", e.target.value, setRequesterEmail);
  };

  const onRequesterPhoneChange = (e) => {
    handleFieldChange("requesterPhone", e.target.value, setRequesterPhone);
  };

  const handleEnviarSolicitud = async () => {
    const requesterRutValidation = validateSingleField("requesterRut", requesterRut);
    const requesterNameValidation = validateSingleField("requesterName", requesterName);
    const requesterEmailValidation = validateSingleField("requesterEmail", requesterEmail);

    setErrors({
      requesterRut: requesterRutValidation.isValid ? undefined : requesterRutValidation.message,
      requesterName: requesterNameValidation.isValid ? undefined : requesterNameValidation.message,
      requesterEmail: requesterEmailValidation.isValid ? undefined : requesterEmailValidation.message,
    });

    if (!requesterRutValidation.isValid || !requesterNameValidation.isValid || !requesterEmailValidation.isValid) return;

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
                    error={errors.requesterRut}
                    maxLength={12}
                    className="pl-10"
                  />
                </div>
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
                    error={errors.requesterName}
                    className="pl-10"
                  />
                </div>
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
                    error={errors.requesterEmail}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Teléfono (opcional) */}
              <div>
                <div className="relative">
                  <Phone className="absolute z-10 left-3 top-10 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    label={'Teléfono'}
                    type="tel"
                    placeholder="+56912345678"
                    value={requesterPhone}
                    onChange={onRequesterPhoneChange}
                    error={errors.requesterPhone}
                    maxLength={12}
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
                  label={'RUT de la Empresa'}
                  type="text"
                  placeholder="76.123.456-7"
                  value={companyRut}
                  onChange={onCompanyRutChange}
                  error={errors.companyRut}
                  maxLength={12}
                  className="pl-10"
                />
              </div>
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
                  error={errors.sapCode}
                  className="pl-10"
                />
              </div>
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
