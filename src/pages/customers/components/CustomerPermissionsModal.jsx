import React, { useState, useEffect } from "react";
import { Modal } from "../../../components/ui/Modal";
import {
  BarChart3, Award, FileText, Loader2,
  AlertTriangle, Shield
} from "lucide-react";
import {
  getCertificateTemplates,
  getReportTemplates,
  getDocumentTypes
} from "../../../services/companyService";
import {
  getCustomerPermissions,
  saveCustomerPermissions
} from "../../../services/customerService";
import { handleSnackbar } from "../../../utils/messageHelpers";
import PermissionSection from "../../registration_requests/components/PermissionSection";

export default function CustomerPermissionsModal({ customer, onClose }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  const [certificates, setCertificates] = useState([]);
  const [loadingCertificates, setLoadingCertificates] = useState(false);

  const [documents, setDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

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
        loadReports(),
        loadCertificates(),
        loadDocuments()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentPermissions = async () => {
    try {
      const response = await getCustomerPermissions(customer.id);
      if (response.success && response.data) {
        // El endpoint devuelve un array de strings: ["report_1", "cert_2", "doc_3"]
        setSelectedPermissions(response.data);
      }
    } catch (error) {
      console.error("Error loading permissions:", error);
    }
  };

  const loadReports = async () => {
    setLoadingReports(true);
    try {
      const response = await getReportTemplates();
      if (response.success && response.data) {
        setReports(response.data.map(report => ({
          id: `report_${report.id}`,
          reportId: report.id,
          code: report.code,
          name: report.name,
          description: report.description || `Acceso a ${report.name}`,
        })));
      }
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoadingReports(false);
    }
  };

  const loadCertificates = async () => {
    setLoadingCertificates(true);
    try {
      const response = await getCertificateTemplates();
      if (response.success && response.data) {
        setCertificates(response.data.map(cert => ({
          id: `cert_${cert.id}`,
          certificateId: cert.id,
          code: cert.code,
          name: cert.name,
          description: cert.description || `Acceso a ${cert.name}`,
        })));
      }
    } catch (error) {
      console.error("Error loading certificates:", error);
    } finally {
      setLoadingCertificates(false);
    }
  };

  const loadDocuments = async () => {
    setLoadingDocuments(true);
    try {
      const companyId = customer?.company_id;
      if (companyId) {
        const response = await getDocumentTypes(companyId);
        if (response.success && response.data) {
          setDocuments(response.data.map(doc => ({
            id: `doc_${doc.id}`,
            documentId: doc.id,
            name: doc.name,
            description: doc.description || `Acceso a ${doc.name}`,
          })));
        }
      }
    } catch (error) {
      console.error("Error loading documents:", error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleTogglePermission = (permId) => {
    setSelectedPermissions(prev =>
      prev.includes(permId)
        ? prev.filter(p => p !== permId)
        : [...prev, permId]
    );
  };

  const handleSelectAll = (items) => {
    const ids = items.map(item => item.id);
    const allSelected = ids.every(itemId => selectedPermissions.includes(itemId));

    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(p => !ids.includes(p)));
    } else {
      setSelectedPermissions(prev => [...new Set([...prev, ...ids])]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await saveCustomerPermissions(customer.id, selectedPermissions);
      if (response.success) {
        handleSnackbar("Permisos guardados correctamente", "success");
        onClose(true);
      } else {
        handleSnackbar(response.message || "Error al guardar permisos", "error");
      }
    } catch (error) {
      console.error("Error saving permissions:", error);
      handleSnackbar("Error al guardar permisos", "error");
    } finally {
      setSaving(false);
    }
  };

  const fullName = customer?.name || "";

  return (
    <Modal
      open={true}
      onClose={() => onClose(false)}
      title={
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-600" />
          Gestionar Permisos
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
          label: saving ? "Guardando..." : "Guardar Permisos",
          variant: "primary",
          onClick: handleSave,
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
            {/* Advertencia */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Selecciona los permisos de acceso
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  El cliente tendrá acceso a los reportes, certificados y documentos seleccionados.
                </p>
              </div>
            </div>

            {/* Secciones de permisos */}
            <PermissionSection
              title="Reportes"
              icon={BarChart3}
              iconColor="text-cyan-600"
              colorScheme="cyan"
              items={reports}
              selectedPermissions={selectedPermissions}
              loading={loadingReports}
              isReadOnly={false}
              onToggle={handleTogglePermission}
              onSelectAll={() => handleSelectAll(reports)}
              emptyMessage="No hay reportes disponibles"
            />

            <PermissionSection
              title="Certificados"
              icon={Award}
              iconColor="text-amber-600"
              colorScheme="amber"
              items={certificates}
              selectedPermissions={selectedPermissions}
              loading={loadingCertificates}
              isReadOnly={false}
              onToggle={handleTogglePermission}
              onSelectAll={() => handleSelectAll(certificates)}
              emptyMessage="No hay certificados disponibles"
            />

            <PermissionSection
              title="Documentos"
              icon={FileText}
              iconColor="text-emerald-600"
              colorScheme="emerald"
              items={documents}
              selectedPermissions={selectedPermissions}
              loading={loadingDocuments}
              isReadOnly={false}
              onToggle={handleTogglePermission}
              onSelectAll={() => handleSelectAll(documents)}
              emptyMessage="No hay documentos disponibles"
            />
          </>
        )}
      </div>
    </Modal>
  );
}
