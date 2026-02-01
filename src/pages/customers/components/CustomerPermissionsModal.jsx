import React, { useState, useEffect } from "react";
import { Modal } from "../../../components/ui/Modal";
import {
  Loader2, Shield, Building2, AlertTriangle
} from "lucide-react";
import { getSapCompaniesList } from "../../../services/companyService";
import {
  getCustomerPermissions,
  saveCustomerPermissions,
  getCustomerCompanies,
  saveCustomerCompanies
} from "../../../services/customerService";
import { handleSnackbar } from "../../../utils/messageHelpers";
import CompanyAssignmentSection from "../../registration_requests/components/CompanyAssignmentSection";
import CompanyPermissionCard from "../../registration_requests/components/CompanyPermissionCard";
import CompanyPermissionModal from "../../registration_requests/components/CompanyPermissionModal";

export default function CustomerPermissionsModal({ customer, onClose }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Permisos por empresa: { companyId: ['report_1', 'cert_2', ...] }
  const [companyPermissions, setCompanyPermissions] = useState({});

  // Empresas
  const [userCompanies, setUserCompanies] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [sapCompanies, setSapCompanies] = useState([]);
  const [loadingSap, setLoadingSap] = useState(false);

  // Modal de permisos por empresa
  const [permissionModal, setPermissionModal] = useState({ open: false, companyKey: null, company: null });

  useEffect(() => {
    if (customer?.id) {
      loadData();
    }
  }, [customer]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadCurrentPermissions(),
        loadUserCompanies()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentPermissions = async () => {
    try {
      const response = await getCustomerPermissions(customer.id);
      if (response.success && response.data) {
        // response.data es un mapa { companyId: ['report_1', ...], ... }
        if (typeof response.data === 'object' && !Array.isArray(response.data)) {
          setCompanyPermissions(response.data);
        } else {
          // Backward compat: si viene como array plano, asignar a empresa principal
          setCompanyPermissions(
            Array.isArray(response.data) && response.data.length > 0
              ? { [String(customer.company_id)]: response.data }
              : {}
          );
        }
      }
    } catch (error) {
      console.error("Error loading permissions:", error);
    }
  };

  const loadUserCompanies = async () => {
    try {
      const response = await getCustomerCompanies(customer.id);
      if (response.success && response.data) {
        // Filtrar la empresa principal
        const filtered = response.data.filter(c => c.id !== customer.company_id);
        setUserCompanies(filtered);
      }
    } catch (error) {
      console.error("Error loading user companies:", error);
    }
  };

  const loadSapCompanies = async () => {
    setLoadingSap(true);
    try {
      const response = await getSapCompaniesList();
      if (response.success && response.data) {
        setSapCompanies(response.data);
      }
    } catch (error) {
      console.error("Error loading SAP companies:", error);
    } finally {
      setLoadingSap(false);
    }
  };

  const handleAddCompanies = (companies) => {
    setSelectedCompanies(prev => [...prev, ...companies]);
  };

  const handleRemoveCompany = (idx) => {
    const removed = selectedCompanies[idx];
    setSelectedCompanies(prev => prev.filter((_, i) => i !== idx));
    if (removed) {
      const key = `sap_${removed.sap_code}`;
      setCompanyPermissions(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleRemoveUserCompany = (idx) => {
    const removed = userCompanies[idx];
    setUserCompanies(prev => prev.filter((_, i) => i !== idx));
    if (removed) {
      const key = String(removed.id);
      setCompanyPermissions(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  // Permisos por empresa
  const handleOpenPermissionModal = (companyKey, company) => {
    setPermissionModal({ open: true, companyKey, company });
  };

  const handleSavePermissionModal = (companyKey, permissions) => {
    setCompanyPermissions(prev => ({
      ...prev,
      [companyKey]: permissions,
    }));
    setPermissionModal({ open: false, companyKey: null, company: null });
  };

  const handleEditCompany = (companyId) => {
    window.open(`/dashboard/empresas/${companyId}/gestionar`, "_blank");
  };

  const handleRemoveCompanyCard = (companyKey) => {
    if (companyKey.startsWith("sap_")) {
      const sapCode = companyKey.replace("sap_", "");
      setSelectedCompanies(prev => prev.filter(c => c.sap_code !== sapCode));
    } else {
      setUserCompanies(prev => prev.filter(c => String(c.id) !== companyKey));
    }
    setCompanyPermissions(prev => {
      const next = { ...prev };
      delete next[companyKey];
      return next;
    });
  };

  // Construir lista de empresas
  const getAllCompanies = () => {
    const companies = [];

    if (customer?.company_id) {
      companies.push({
        key: String(customer.company_id),
        company: {
          id: customer.company_id,
          business_name: customer.company || "",
          rut: "",
        },
        isPrimary: true,
      });
    }

    userCompanies.forEach(c => {
      companies.push({
        key: String(c.id),
        company: c,
        isPrimary: false,
      });
    });

    selectedCompanies.forEach(c => {
      companies.push({
        key: `sap_${c.sap_code}`,
        company: c,
        isPrimary: false,
      });
    });

    return companies;
  };

  const getTotalPermissionsCount = () => {
    return Object.values(companyPermissions).reduce((sum, perms) => sum + perms.length, 0);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Construir mapa final: company_id real → permisos
      const permsByCompany = {};

      // Empresa principal
      const primaryKey = String(customer.company_id);
      if (companyPermissions[primaryKey]?.length > 0) {
        permsByCompany[primaryKey] = companyPermissions[primaryKey];
      }

      // Empresas existentes
      userCompanies.forEach(c => {
        const key = String(c.id);
        if (companyPermissions[key]?.length > 0) {
          permsByCompany[key] = companyPermissions[key];
        }
      });

      // Empresas nuevas SAP — se guardarán primero via sync, luego permisos
      // Para SAP companies, no podemos enviar permisos hasta que tengan ID
      // Primero guardamos empresas, luego permisos

      // 1. Guardar empresas
      const sapCompaniesToSave = selectedCompanies.map(c => ({
        rut: c.rut,
        sap_code: c.sap_code,
        business_name: c.business_name,
      }));
      const existingIds = [customer.company_id, ...userCompanies.map(c => c.id)];

      const compResponse = await saveCustomerCompanies(customer.id, sapCompaniesToSave, existingIds);

      // 2. Guardar permisos por empresa
      const permResponse = await saveCustomerPermissions(customer.id, permsByCompany);

      if (permResponse.success && compResponse.success) {
        handleSnackbar("Permisos y empresas guardados correctamente", "success");
        onClose(true);
      } else if (permResponse.success) {
        handleSnackbar(compResponse.message || "Permisos guardados, pero hubo un error con las empresas", "warning");
      } else {
        handleSnackbar(permResponse.message || "Error al guardar permisos", "error");
      }
    } catch (error) {
      console.error("Error saving:", error);
      handleSnackbar("Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  };

  const primaryCompany = customer?.company_id ? {
    id: customer.company_id,
    business_name: customer.company || "",
    rut: "",
  } : null;

  const fullName = customer?.name || "";

  return (
    <>
      <Modal
        open={true}
        onClose={() => onClose(false)}
        title={
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-600" />
            Gestionar Permisos y Empresas
          </div>
        }
        size="xl"
        actions={[
          {
            label: "Cancelar",
            variant: "outline",
            onClick: () => onClose(false)
          },
          {
            label: saving ? "Guardando..." : "Guardar",
            variant: "primary",
            onClick: handleSave,
            disabled: saving,
            autofocus: true
          }
        ]}
      >
        <div className="space-y-4">
          {/* Info del cliente */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600">Cliente:</p>
            <p className="font-semibold text-gray-900">{fullName}</p>
            <p className="text-sm text-gray-500">{customer?.email}</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
            </div>
          ) : (
            <>
              {/* Sección de Empresas Asignadas */}
              <CompanyAssignmentSection
                requestCompany={primaryCompany}
                userCompanies={userCompanies}
                selectedCompanies={selectedCompanies}
                onAddCompanies={handleAddCompanies}
                onRemoveCompany={handleRemoveCompany}
                onRemoveUserCompany={handleRemoveUserCompany}
                isReadOnly={false}
                sapCompanies={sapCompanies}
                loadingSap={loadingSap}
                onOpenModal={loadSapCompanies}
              />

              {/* Advertencia */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Permisos por empresa
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    Haga clic en "Permisos" en cada empresa para configurar acceso a reportes, certificados y documentos.
                  </p>
                </div>
              </div>

              {/* Cards de empresas con permisos */}
              <div className="space-y-3">
                {getAllCompanies().map(({ key, company, isPrimary }) => (
                  <CompanyPermissionCard
                    key={key}
                    company={company}
                    companyKey={key}
                    isPrimary={isPrimary}
                    permissions={companyPermissions[key] || []}
                    onManagePermissions={handleOpenPermissionModal}
                    onEditCompany={company.id ? handleEditCompany : null}
                    onRemove={!isPrimary ? handleRemoveCompanyCard : null}
                    isReadOnly={false}
                  />
                ))}
              </div>

              {/* Resumen */}
              <div className="text-sm text-gray-500 text-right">
                {getTotalPermissionsCount()} permiso{getTotalPermissionsCount() !== 1 ? "s" : ""} configurado{getTotalPermissionsCount() !== 1 ? "s" : ""} en {getAllCompanies().length} empresa{getAllCompanies().length !== 1 ? "s" : ""}
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Modal de permisos por empresa */}
      <CompanyPermissionModal
        open={permissionModal.open}
        company={permissionModal.company}
        companyKey={permissionModal.companyKey}
        currentPermissions={companyPermissions[permissionModal.companyKey] || []}
        onSave={handleSavePermissionModal}
        onClose={() => setPermissionModal({ open: false, companyKey: null, company: null })}
      />
    </>
  );
}
