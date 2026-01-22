import React, { useState } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Search, FileCheck, FileX, Hash, KeyRound, ArrowLeft, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import FooterNoLogin from "./common/FooterNoLogin";
import api from "../services/api";

export default function ValidateCertificate() {
  const [certificateNumber, setCertificateNumber] = useState("");
  const [validationCode, setValidationCode] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({ certificateNumber: false, validationCode: false });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const validateCertificateNumber = (val) => {
    if (!val) return "Ingresa el número del certificado";
    return "";
  };

  const validateValidationCode = (val) => {
    if (!val) return "Ingresa el código de validación";
    return "";
  };

  const onCertificateNumberChange = (e) => {
    const v = e.target.value;
    setCertificateNumber(v);
    setResult(null);
    if (touched.certificateNumber) {
      const msg = validateCertificateNumber(v);
      setErrors((p) => ({ ...p, certificateNumber: msg || undefined }));
    }
  };

  const onValidationCodeChange = (e) => {
    const v = e.target.value;
    setValidationCode(v);
    setResult(null);
    if (touched.validationCode) {
      const msg = validateValidationCode(v);
      setErrors((p) => ({ ...p, validationCode: msg || undefined }));
    }
  };

  const onBlurField = (field) => {
    setTouched((p) => ({ ...p, [field]: true }));
    if (field === "certificateNumber") {
      const msg = validateCertificateNumber(certificateNumber);
      setErrors((p) => ({ ...p, certificateNumber: msg || undefined }));
    } else {
      const msg = validateValidationCode(validationCode);
      setErrors((p) => ({ ...p, validationCode: msg || undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const certMsg = validateCertificateNumber(certificateNumber);
    const codeMsg = validateValidationCode(validationCode);

    setErrors({
      certificateNumber: certMsg || undefined,
      validationCode: codeMsg || undefined
    });
    setTouched({ certificateNumber: true, validationCode: true });

    if (certMsg || codeMsg) return;

    try {
      setSubmitting(true);
      setResult(null);

      const response = await api.post("/api/certificates/validate", {
        certificate_number: certificateNumber,
        validation_code: validationCode
      });

      if (response.data?.data) {
        setResult({
          valid: true,
          data: response.data.data
        });
      } else {
        setResult({
          valid: false,
          message: response.data?.message || "Certificado no encontrado"
        });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || "Error al validar el certificado";
      setResult({
        valid: false,
        message: errorMsg
      });
    } finally {
      setSubmitting(false);
    }
  };

  const showCertErr = !!errors.certificateNumber;
  const showCodeErr = !!errors.validationCode;

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

          <h1 className="text-xl font-bold text-[var(--brand-primary)] text-center uppercase">
            VALIDACIÓN DE AUTENTICIDAD <br />DE CERTIFICADOS
          </h1>
          <p className="text-sm text-black/60 text-center mb-6 mt-2">
            Ingresa los datos del certificado para verificar su autenticidad
          </p>

          {/* Resultado de validación */}
          {result && (
            <div className={`mb-4 rounded-lg border px-4 py-3 relative ${
              result.valid
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}>
              <div className="flex items-start gap-3">
                {result.valid ? (
                  <FileCheck className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <FileX className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                )}
                <button
                  onClick={() => setResult(null)}
                  className={`absolute top-2 right-2 transition-colors ${
                    result.valid
                      ? "text-green-400 hover:text-green-600"
                      : "text-red-400 hover:text-red-600"
                  }`}
                >
                  <XCircle className="w-5 h-5" />
                </button>
                <div className="flex-1">
                  {result.valid ? (
                    <>
                      <p className="font-semibold text-green-800">Certificado Válido</p>
                      <div className="mt-2 text-sm text-green-700 space-y-1">
                        <p><span className="font-medium">Empresa:</span> {result.data.company_name}</p>
                        <p><span className="font-medium">Certificado:</span> {result.data.certificate_name}</p>
                        <p><span className="font-medium">Fecha emisión:</span> {result.data.assigned_date}</p>
                        {result.data.expiration_date && (
                          <p><span className="font-medium">Fecha expiración:</span> {result.data.expiration_date}</p>
                        )}
                        <p><span className="font-medium">Estado:</span> {" "}
                          <span className={result.data.status === 'active' ? 'text-green-600 font-semibold' : 'text-amber-600 font-semibold'}>
                            {result.data.status_label}
                          </span>
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-red-800">Certificado No Válido</p>
                      <p className="text-sm text-red-700 mt-1">{result.message}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo Número de Certificado */}
            <div>
              <div className="relative">
                <Input
                  required
                  label="NÚMERO DEL CERTIFICADO"
                  type="text"
                  placeholder="Ej: 5522"
                  value={certificateNumber}
                  onChange={onCertificateNumberChange}
                  onBlur={() => onBlurField("certificateNumber")}
                  aria-invalid={showCertErr}
                  aria-describedby={showCertErr ? "err-cert" : undefined}
                  className={showCertErr ? "border-red-400 focus:ring-red-200 pr-10" : "pr-10"}
                />
                <div className="absolute inset-y-0 right-0 top-4 pr-3 flex items-center pointer-events-none">
                  <Hash className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              {showCertErr && (
                <p id="err-cert" className="mt-1 text-xs text-red-600">
                  {errors.certificateNumber}
                </p>
              )}
            </div>

            {/* Campo Código de Validación */}
            <div>
              <div className="relative">
                <Input
                  required
                  label="CÓDIGO DE VALIDACIÓN"
                  type="text"
                  placeholder="Ej: 8d30-c751-00e8"
                  value={validationCode}
                  onChange={onValidationCodeChange}
                  onBlur={() => onBlurField("validationCode")}
                  aria-invalid={showCodeErr}
                  aria-describedby={showCodeErr ? "err-code" : undefined}
                  className={showCodeErr ? "border-red-400 focus:ring-red-200 pr-10" : "pr-10"}
                />
                <div className="absolute inset-y-0 right-0 top-4 pr-3 flex items-center pointer-events-none">
                  <KeyRound className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              {showCodeErr && (
                <p id="err-code" className="mt-1 text-xs text-red-600">
                  {errors.validationCode}
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              icon={Search}
              className="w-full text-center justify-center"
              disabled={submitting}
            >
              {submitting ? "Validando…" : "Validar"}
            </Button>
          </form>

          <div className="pt-4 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-[var(--brand-primary)] hover:text-[var(--brand-primary-600)] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio de sesión
            </Link>
          </div>
        </div>

        <FooterNoLogin />
      </div>
    </div>
  );
}
