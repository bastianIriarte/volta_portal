// File: src/pages/companies/components/CompanyCreateModal.jsx
import { useState } from "react";
import { Loader2, X, SaveIcon, Search } from "lucide-react";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { createCompany, searchCompanyInSap } from "../../../services/companyService";
import { handleSnackbar } from "../../../utils/messageHelpers";
import { validateField } from "../../../utils/validators";

export default function CompanyCreateModal({ open, onClose }) {
  const [creating, setCreating] = useState(false);

  // Flujo de búsqueda SAP
  const [searchRut, setSearchRut] = useState("");
  const [searchSapCode, setSearchSapCode] = useState("");
  const [searching, setSearching] = useState(false);
  const [sapDataLoaded, setSapDataLoaded] = useState(false);
  const [sapNotFound, setSapNotFound] = useState(false);

  // Errores de validación
  const [errors, setErrors] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    rut: "",
    business_name: "",
    sap_code: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "CL",
  });

  // ==================== VALIDACIONES ====================
  const validateSingleField = (field, value) => {
    let validationType = "text";
    let isRequired = true;
    let customMessage = "Campo requerido";

    switch (field) {
      case "rut":
        validationType = "rut";
        customMessage = "Ingresa el RUT de la empresa";
        break;
      case "sapCode":
        validationType = "text_min";
        customMessage = "Ingresa el código SAP";
        break;
      default:
        validationType = "text";
        break;
    }

    const result = validateField(value, validationType, isRequired, customMessage);
    return {
      isValid: result.validate,
      message: result.msg,
      cleanValue: result.value_data !== undefined ? result.value_data : value
    };
  };

  const validateAll = () => {
    const newErrors = {};

    const rutValidation = validateSingleField("rut", searchRut);
    if (!rutValidation.isValid) {
      newErrors.rut = rutValidation.message;
    }

    const sapCodeValidation = validateSingleField("sapCode", searchSapCode);
    if (!sapCodeValidation.isValid) {
      newErrors.sapCode = sapCodeValidation.message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ==================== HANDLERS ====================
  const handleChange = (field, value) => {
    const validation = validateSingleField(field, value);
    const cleanValue = validation.cleanValue;

    if (field === "rut") {
      setSearchRut(cleanValue);
    } else if (field === "sapCode") {
      setSearchSapCode(cleanValue);
    }

    setErrors(prev => ({
      ...prev,
      [field]: validation.isValid ? null : validation.message
    }));
  };

  const resetForm = () => {
    setSearchRut("");
    setSearchSapCode("");
    setSapDataLoaded(false);
    setSapNotFound(false);
    setSearching(false);
    setCreating(false);
    setErrors({});
    setFormData({
      rut: "",
      business_name: "",
      sap_code: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "CL",
    });
  };

  const handleClose = (shouldRefresh = false) => {
    resetForm();
    onClose(shouldRefresh);
  };

  const handleSearchSap = async () => {
    if (!validateAll()) return;

    setSearching(true);
    setSapNotFound(false);
    setErrors({});

    try {
      // El RUT ya viene formateado del validator, extraer solo números y K
      const rutNormalizado = searchRut.replace(/\./g, "").replace(/-/g, "");
      const response = await searchCompanyInSap(rutNormalizado, searchSapCode);

      if (response.success && response.data) {
        if (response.data.found) {
          setFormData({
            rut: response.data.data.rut || searchRut,
            business_name: response.data.data.business_name || "",
            sap_code: response.data.data.sap_code || searchSapCode,
            email: response.data.data.email || "",
            phone: response.data.data.phone || "",
            address: response.data.data.address || "",
            city: response.data.data.city || "",
            country: response.data.data.country || "CL",
          });
          setSapDataLoaded(true);
          handleSnackbar("Datos cargados desde SAP", "success");
        } else {
          setSapNotFound(true);
          handleSnackbar(response.data.message || "No se encontró en SAP", "warning");
        }
      } else {
        setSapNotFound(true);
        setErrors({ form: response.message || "No se encontró la empresa con los datos ingresados" });
      }
    } catch (error) {
      setErrors({ form: "Error al buscar en SAP. Verifique el RUT y código SAP." });
      handleSnackbar(error.message || "Error al buscar en SAP", "error");
    } finally {
      setSearching(false);
    }
  };

  const handleCreateCompany = async () => {
    if (!formData.rut || !formData.business_name || !formData.email) {
      handleSnackbar("RUT, Razón Social y Email son requeridos", "error");
      return;
    }

    setCreating(true);
    try {
      const response = await createCompany(formData);
      if (response.success) {
        handleSnackbar("Empresa creada correctamente", "success");
        handleClose(true);
      } else {
        handleSnackbar(response.message || "Error al crear empresa", "error");
      }
    } catch (error) {
      handleSnackbar("Error al crear empresa", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      open={open}
      onClose={() => handleClose(false)}
      title="Nueva Empresa"
      actions={
        sapDataLoaded
          ? [
            {
              label: "Cancelar",
              variant: "outline",
              onClick: () => handleClose(false),
              icon: X
            },
            {
              label: creating ? "Creando..." : "Crear Empresa",
              variant: "primary",
              onClick: handleCreateCompany,
              disabled: creating,
              loading: creating,
              icon: creating ? Loader2 : SaveIcon
            },
          ]
          : [
            {
              label: "Cancelar",
              variant: "outline",
              onClick: () => handleClose(false),
              icon: X
            },
            {
              label: searching ? "Validando..." : "Validar Empresa",
              variant: "primary",
              onClick: handleSearchSap,
              disabled: searching || !searchRut || !searchSapCode,
              loading: searching,
              icon: searching ? Loader2 : Search
            },
          ]
      }
    >
      {!sapDataLoaded ? (
        <div className="space-y-4">
          {errors.form && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{errors.form}</p>
            </div>
          )}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-900 leading-relaxed">
              <strong>ℹ️ Información:</strong> Ingresa el RUT de la empresa y
              el código SAP que tiene asignado. Si no conoces estos datos,
              contacta al administrador de SAP.
            </p>
          </div>
          {/* RUT Empresa */}
          <Input
            required
            label="RUT de la Empresa"
            placeholder="76.123.456-7"
            value={searchRut}
            onChange={(e) => handleChange("rut", e.target.value)}
            disabled={searching}
            error={errors.rut}
            maxLength={12}
          />

          {/* Código SAP */}
          <Input
            required
            label="Código SAP"
            placeholder="SAP001"
            value={searchSapCode}
            onChange={(e) => handleChange("sapCode", e.target.value)}
            disabled={searching}
            error={errors.sapCode}
          />

          {sapNotFound && !errors.form && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                No se encontró este socio de negocios en SAP. Verifique el RUT y código SAP e intente nuevamente.
              </p>
            </div>
          )}


        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-green-800 text-center">
              Datos del socio de negocio cargados desde SAP.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="RUT"
              value={formData.rut}
              onChange={(e) => handleFormChange("rut", e.target.value)}
              disabled
            />
            <Input
              label="Código SAP"
              value={formData.sap_code}
              onChange={(e) => handleFormChange("sap_code", e.target.value)}
              disabled
            />
          </div>
          <Input
            label="Razón Social"
            value={formData.business_name}
            onChange={(e) => handleFormChange("business_name", e.target.value)}
            disabled
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Correo Electrónico"
              type="email"
              value={formData.email}
              onChange={(e) => handleFormChange("email", e.target.value)}
              disabled
            />
            <Input
              label="Teléfono"
              value={formData.phone}
              onChange={(e) => handleFormChange("phone", e.target.value)}
              disabled
            />
          </div>
          <Input
            label="Dirección"
            value={formData.address}
            onChange={(e) => handleFormChange("address", e.target.value)}
            disabled
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ciudad"
              value={formData.city}
              onChange={(e) => handleFormChange("city", e.target.value)}
              disabled
            />
            <Input
              label="País"
              value={formData.country}
              onChange={(e) => handleFormChange("country", e.target.value)}
              disabled
            />
          </div>
        </div>
      )}
    </Modal>
  );
}
