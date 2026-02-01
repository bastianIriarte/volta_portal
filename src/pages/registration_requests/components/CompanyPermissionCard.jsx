import React, { useState, useEffect } from "react";
import { Building2, Shield, ExternalLink, X, BarChart3, Award, FileText, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import {
  getCompanyReports,
  getCompanyCertificates,
  getDocumentTypes,
} from "../../../services/companyService";

export default function CompanyPermissionCard({
  company,
  companyKey,
  isPrimary = false,
  permissions = [],
  permissionLabels = {},
  onManagePermissions,
  onEditCompany,
  onRemove,
  isReadOnly = false,
  // Acordeón controlado desde el padre
  expandedKey,
  onToggleExpand,
}) {
  // Si el padre controla el acordeón, usar props; sino estado interno
  const isControlled = expandedKey !== undefined && onToggleExpand;
  const [internalExpanded, setInternalExpanded] = useState(false);
  const expanded = isControlled ? expandedKey === companyKey : internalExpanded;

  const [loadingNames, setLoadingNames] = useState(false);
  const [resolvedNames, setResolvedNames] = useState(null);

  const reports = permissions.filter(p => p.startsWith("report_"));
  const certs = permissions.filter(p => p.startsWith("cert_"));
  const docs = permissions.filter(p => p.startsWith("doc_"));
  const totalCount = permissions.length;

  // Cargar nombres al expandir por primera vez (solo si no los tenemos ya del backend)
  useEffect(() => {
    if (expanded && !resolvedNames && company?.id && totalCount > 0) {
      // Si todas las permissions ya tienen label del backend, no hacer queries extra
      const allHaveLabels = permissions.every(p => permissionLabels[p]);
      if (!allHaveLabels) {
        loadResourceNames();
      }
    }
  }, [expanded]);

  const loadResourceNames = async () => {
    setLoadingNames(true);
    const names = {};
    try {
      const [reportsRes, certsRes, docsRes] = await Promise.all([
        reports.length > 0 ? getCompanyReports(company.id) : { success: false },
        certs.length > 0 ? getCompanyCertificates(company.id) : { success: false },
        docs.length > 0 ? getDocumentTypes(company.id) : { success: false },
      ]);

      if (reportsRes.success && reportsRes.data) {
        reportsRes.data.forEach(r => {
          names[`report_${r.report_id || r.id}`] = r.report_name || r.name || "";
        });
      }
      if (certsRes.success && certsRes.data) {
        certsRes.data.forEach(c => {
          names[`cert_${c.certificate_id || c.id}`] = c.certificate_name || c.name || "";
        });
      }
      if (docsRes.success && docsRes.data) {
        (docsRes.data.map ? docsRes.data : []).forEach(d => {
          names[`doc_${d.id}`] = d.name || "";
        });
      }
    } catch (error) {
      console.error("Error loading resource names:", error);
    }
    setResolvedNames(names);
    setLoadingNames(false);
  };

  const getName = (permId) => {
    // Primero intentar labels del padre (wizard), luego nombres cargados del API
    return permissionLabels[permId] || resolvedNames?.[permId] || permId;
  };

  const handleToggle = () => {
    if (totalCount === 0) return;
    if (isControlled) {
      onToggleExpand(companyKey);
    } else {
      setInternalExpanded(prev => !prev);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-4 p-4">
        {/* Info empresa */}
        <div
          className={`flex items-start gap-3 flex-1 min-w-0 ${totalCount > 0 ? "cursor-pointer" : ""}`}
          onClick={handleToggle}
        >
          <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
            {totalCount > 0 ? (
              expanded
                ? <ChevronDown className="w-5 h-5 text-gray-600" />
                : <ChevronRight className="w-5 h-5 text-gray-600" />
            ) : (
              <Building2 className="w-5 h-5 text-gray-600" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-gray-900 truncate">
                {company.business_name}
              </h4>
              {isPrimary && (
                <span className="text-[10px] font-medium bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                  Principal
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
              {company.rut && <span>RUT: {company.rut}</span>}
              {company.sap_code && <span>SAP: {company.sap_code}</span>}
            </div>

            {/* Resumen de permisos */}
            {totalCount > 0 ? (
              <div className="flex flex-wrap gap-2 mt-3">
                {reports.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs bg-cyan-50 text-cyan-700 px-2 py-1 rounded-full">
                    <BarChart3 className="w-3 h-3" />
                    {reports.length} reporte{reports.length !== 1 ? "s" : ""}
                  </span>
                )}
                {certs.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full">
                    <Award className="w-3 h-3" />
                    {certs.length} certificado{certs.length !== 1 ? "s" : ""}
                  </span>
                )}
                {docs.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">
                    <FileText className="w-3 h-3" />
                    {docs.length} documento{docs.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-400 mt-2">Sin permisos asignados</p>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {!isReadOnly && (
            <Button
              size="sm"
              variant="secondary"
              icon={Shield}
              onClick={() => onManagePermissions(companyKey, company)}
            >
              Permisos
            </Button>
          )}
          {company.id && onEditCompany && (
            <Button
              size="sm"
              variant="outline"
              icon={ExternalLink}
              onClick={() => onEditCompany(company.id)}
              title="Editar empresa en nueva pestaña"
            >
              Editar
            </Button>
          )}
          {!isReadOnly && !isPrimary && onRemove && (
            <button
              type="button"
              onClick={() => onRemove(companyKey)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Quitar empresa"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Detalle expandido */}
      {expanded && totalCount > 0 && (
        <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
          {loadingNames ? (
            <div className="flex items-center gap-2 justify-center py-2 text-gray-400 text-xs">
              <Loader2 className="w-3 h-3 animate-spin" /> Cargando detalles...
            </div>
          ) : (
            <div className="space-y-3">
              {reports.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-cyan-700 flex items-center gap-1 mb-1">
                    <BarChart3 className="w-3 h-3" /> Reportes
                  </p>
                  <ul className="space-y-0.5 ml-4">
                    {reports.map(p => (
                      <li key={p} className="text-xs text-gray-600">• {getName(p)}</li>
                    ))}
                  </ul>
                </div>
              )}
              {certs.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-amber-700 flex items-center gap-1 mb-1">
                    <Award className="w-3 h-3" /> Certificados
                  </p>
                  <ul className="space-y-0.5 ml-4">
                    {certs.map(p => (
                      <li key={p} className="text-xs text-gray-600">• {getName(p)}</li>
                    ))}
                  </ul>
                </div>
              )}
              {docs.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-emerald-700 flex items-center gap-1 mb-1">
                    <FileText className="w-3 h-3" /> Documentos
                  </p>
                  <ul className="space-y-0.5 ml-4">
                    {docs.map(p => (
                      <li key={p} className="text-xs text-gray-600">• {getName(p)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
