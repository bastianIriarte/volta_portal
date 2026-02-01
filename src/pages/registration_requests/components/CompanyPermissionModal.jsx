import React, { useState, useEffect } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Shield, Loader2, BarChart3, Award, FileText } from "lucide-react";
import {
  getCompanyReports,
  getCompanyCertificates,
  getDocumentTypes,
  getReportTemplates,
  getCertificateTemplates
} from "../../../services/companyService";
import PermissionSection from "./PermissionSection";

export default function CompanyPermissionModal({
  open,
  company,
  companyKey,
  currentPermissions = [],
  onSave,
  onClose,
}) {
  const [loading, setLoading] = useState(true);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  const [certificates, setCertificates] = useState([]);
  const [loadingCertificates, setLoadingCertificates] = useState(false);

  const [documents, setDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  useEffect(() => {
    if (open && company) {
      setSelectedPermissions([...currentPermissions]);
      loadResources();
    }
  }, [open, company]);

  const loadResources = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadReports(),
        loadCertificates(),
        loadDocuments(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    setLoadingReports(true);
    try {
      // Si la empresa tiene ID, cargar reportes de esa empresa; sino cargar templates globales
      let response;
      if (company?.id) {
        response = await getCompanyReports(company.id);
        if (response.success && response.data) {
          setReports(response.data.map(r => ({
            id: `report_${r.report_id || r.id}`,
            reportId: r.report_id || r.id,
            name: r.report_name || r.name || "",
            description: r.report_description || r.description || "",
          })));
          return;
        }
      }
      // Fallback: templates globales
      response = await getReportTemplates();
      if (response.success && response.data) {
        setReports(response.data.map(report => ({
          id: `report_${report.id}`,
          reportId: report.id,
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
      let response;
      if (company?.id) {
        response = await getCompanyCertificates(company.id);
        if (response.success && response.data) {
          setCertificates(response.data.map(c => ({
            id: `cert_${c.certificate_id || c.id}`,
            certificateId: c.certificate_id || c.id,
            name: c.certificate_name || c.name || "",
            description: c.certificate_description || c.description || "",
          })));
          return;
        }
      }
      // Fallback: templates globales
      response = await getCertificateTemplates();
      if (response.success && response.data) {
        setCertificates(response.data.map(cert => ({
          id: `cert_${cert.id}`,
          certificateId: cert.id,
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
      const companyId = company?.id || null;
      const response = await getDocumentTypes(companyId);
      if (response.success && response.data) {
        setDocuments(response.data.map ? response.data.map(doc => ({
          id: `doc_${doc.id}`,
          documentId: doc.id,
          name: doc.name,
          description: doc.description || `Acceso a ${doc.name}`,
        })) : []);
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

  const handleSave = () => {
    // Construir mapa de labels para que el padre pueda mostrar nombres
    const labels = {};
    [...reports, ...certificates, ...documents].forEach(item => {
      if (selectedPermissions.includes(item.id)) {
        labels[item.id] = item.name;
      }
    });
    onSave(companyKey, selectedPermissions, labels);
  };

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-600" />
          <span>Permisos — {company?.business_name || ""}</span>
        </div>
      }
      size="xl"
      actions={[
        {
          label: "Cancelar",
          variant: "outline",
          onClick: onClose,
        },
        {
          label: "Guardar Permisos",
          variant: "primary",
          onClick: handleSave,
        },
      ]}
    >
      <div className="space-y-4">
        {/* Info empresa */}
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <p className="font-medium text-gray-900">{company?.business_name}</p>
          <div className="flex gap-4 text-sm text-gray-500 mt-1">
            {company?.rut && <span>RUT: {company.rut}</span>}
            {company?.sap_code && <span>SAP: {company.sap_code}</span>}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
          </div>
        ) : (
          <>
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
              emptyMessage="No hay reportes disponibles para esta empresa"
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
              emptyMessage="No hay certificados disponibles para esta empresa"
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
              emptyMessage="No hay documentos disponibles para esta empresa"
            />
          </>
        )}
      </div>
    </Modal>
  );
}
