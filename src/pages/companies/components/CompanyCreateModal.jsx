// File: src/pages/companies/components/CompanyCreateModal.jsx
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { createCompany, searchCompanyInSap } from "../../../services/companyService";
import { handleSnackbar } from "../../../utils/messageHelpers";

export default function CompanyCreateModal({ open, onClose }) {
  const [creating, setCreating] = useState(false);

  // Flujo de búsqueda SAP
  const [searchRut, setSearchRut] = useState("");
  const [searching, setSearching] = useState(false);
  const [sapDataLoaded, setSapDataLoaded] = useState(false);
  const [sapNotFound, setSapNotFound] = useState(false);

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

  const resetForm = () => {
    setSearchRut("");
    setSapDataLoaded(false);
    setSapNotFound(false);
    setSearching(false);
    setCreating(false);
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
    if (!searchRut || searchRut.length < 8) {
      handleSnackbar("Ingrese un RUT válido", "error");
      return;
    }

    setSearching(true);
    setSapNotFound(false);
    try {
      const response = await searchCompanyInSap(searchRut);
      if (response.success && response.data) {
        if (response.data.found) {
          setFormData({
            rut: response.data.data.rut || searchRut,
            business_name: response.data.data.business_name || "",
            sap_code: response.data.data.sap_code || "",
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
        handleSnackbar(response.message || "Error al buscar en SAP", "error");
      }
    } catch (error) {
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
            },
            {
              label: creating ? "Creando..." : "Crear Empresa",
              variant: "primary",
              onClick: handleCreateCompany,
              disabled: creating,
            },
          ]
          : [
            {
              label: "Cancelar",
              variant: "outline",
              onClick: () => handleClose(false),
            },
            {
              label: searching ? "Buscando..." : "Validar RUT",
              variant: "primary",
              onClick: handleSearchSap,
              disabled: searching || !searchRut,
            },
          ]
      }
    >
      {!sapDataLoaded ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Ingrese el RUT del socio de negocios para buscar sus datos en SAP.
          </p>
          <div>
            <Input
              label="RUT"
              required
              value={searchRut}
              onChange={(e) => setSearchRut(e.target.value)}
              placeholder="12.345.678-9"
              disabled={searching}
            />
          </div>
          {sapNotFound && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                No se encontró este RUT en SAP. Verifique el RUT e intente nuevamente.
              </p>
            </div>
          )}
          {searching && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
              <span className="ml-2 text-gray-600">Consultando SAP...</span>
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
              label="CÓDIGO SAP"
              value={formData.sap_code}
              onChange={(e) => handleFormChange("sap_code", e.target.value)}
              disabled
            />
          </div>
          <Input
            label="RAZÓN SOCIAL"
            value={formData.business_name}
            onChange={(e) => handleFormChange("business_name", e.target.value)}
            disabled
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="CORREO ELECTRÓNICO"
              type="email"
              value={formData.email}
              onChange={(e) => handleFormChange("email", e.target.value)}
              disabled
            />
            <Input
              label="TELÉFONO"
              value={formData.phone}
              onChange={(e) => handleFormChange("phone", e.target.value)}
              disabled
            />
          </div>
          <Input
            label="DIRECCIÓN"
            value={formData.address}
            onChange={(e) => handleFormChange("address", e.target.value)}
            disabled
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="CIUDAD"
              value={formData.city}
              onChange={(e) => handleFormChange("city", e.target.value)}
              disabled
            />
            <Input
              label="PAÍS"
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
