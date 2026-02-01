import React, { useState } from "react";
import { CheckCircle, X, Loader2, Building2, BarChart3, Award, FileText, ChevronDown, ChevronRight } from "lucide-react";
import { Modal } from "../../../components/ui/Modal";

export default function ApproveModal({
  open,
  request,
  companyPermissions = {},
  permissionLabels = {},
  companies = [],
  processing,
  onConfirm,
  onCancel
}) {
  const [expandedKey, setExpandedKey] = useState(null);

  if (!request) return null;

  const totalPermissions = Object.values(companyPermissions).reduce(
    (sum, perms) => sum + perms.length, 0
  );

  const toggleCompany = (key) => {
    setExpandedKey(prev => prev === key ? null : key);
  };

  const groupPermissions = (perms) => {
    const reports = perms.filter(p => p.startsWith("report_"));
    const certs = perms.filter(p => p.startsWith("cert_"));
    const docs = perms.filter(p => p.startsWith("doc_"));
    return { reports, certs, docs };
  };

  const getPermLabel = (permId) => {
    return permissionLabels[permId] || permId;
  };

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title="Confirmar Aprobación"
      variant="success"
      actions={[
        {
          label: "Cancelar",
          variant: "outline",
          onClick: onCancel,
          disabled: processing,
          icon: X
        },
        {
          label: processing ? "Procesando..." : "Confirmar Aprobación",
          variant: "primary",
          onClick: onConfirm,
          disabled: processing,
          loading: processing,
          icon: processing ? Loader2 : CheckCircle
        }
      ]}
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Estás a punto de aprobar la solicitud de <strong>{request.name}</strong> de la empresa <strong>{request.company_name}</strong>.
        </p>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            Se creará un usuario con las siguientes credenciales:
          </p>
          <ul className="text-sm text-green-700 mt-2 space-y-1">
            <li><strong>Usuario:</strong> {request.rut}</li>
            <li><strong>Email:</strong> {request.email}</li>
          </ul>
          <p className="text-xs text-green-600 mt-2">
            Se enviará un correo con la clave generada automáticamente.
          </p>
        </div>

        {/* Resumen de empresas y permisos */}
        {companies.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">
              Empresas asignadas ({companies.length}) — {totalPermissions} permiso{totalPermissions !== 1 ? "s" : ""} total{totalPermissions !== 1 ? "es" : ""}:
            </p>

            {companies.map(({ key, company, isPrimary }) => {
              const perms = companyPermissions[key] || [];
              const { reports, certs, docs } = groupPermissions(perms);
              const isExpanded = expandedKey === key;
              const hasPerms = perms.length > 0;

              return (
                <div key={key} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                  {/* Header — clickeable para expandir */}
                  <button
                    type="button"
                    onClick={() => hasPerms && toggleCompany(key)}
                    className={`w-full p-3 text-left ${hasPerms ? "cursor-pointer hover:bg-gray-100" : "cursor-default"} transition-colors`}
                  >
                    <div className="flex items-center gap-2">
                      {hasPerms && (
                        isExpanded
                          ? <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          : <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      )}
                      {!hasPerms && <div className="w-4" />}
                      <Building2 className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900">
                        {company.business_name}
                      </span>
                      {isPrimary && (
                        <span className="text-[10px] font-medium bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                          Principal
                        </span>
                      )}
                    </div>
                    {hasPerms ? (
                      <div className="flex flex-wrap gap-2 mt-2 ml-10">
                        {reports.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full">
                            <BarChart3 className="w-3 h-3" />
                            {reports.length} reporte{reports.length !== 1 ? "s" : ""}
                          </span>
                        )}
                        {certs.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                            <Award className="w-3 h-3" />
                            {certs.length} certificado{certs.length !== 1 ? "s" : ""}
                          </span>
                        )}
                        {docs.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                            <FileText className="w-3 h-3" />
                            {docs.length} documento{docs.length !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 mt-1 ml-10">Sin permisos</p>
                    )}
                  </button>

                  {/* Detalle expandido */}
                  {isExpanded && hasPerms && (
                    <div className="border-t border-gray-200 px-4 py-3 space-y-3 bg-white">
                      {reports.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-cyan-700 flex items-center gap-1 mb-1">
                            <BarChart3 className="w-3 h-3" /> Reportes
                          </p>
                          <ul className="space-y-0.5 ml-4">
                            {reports.map(p => (
                              <li key={p} className="text-xs text-gray-600">• {getPermLabel(p)}</li>
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
                              <li key={p} className="text-xs text-gray-600">• {getPermLabel(p)}</li>
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
                              <li key={p} className="text-xs text-gray-600">• {getPermLabel(p)}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {totalPermissions === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-700">
              <strong>Atención:</strong> No has seleccionado ningún permiso. El usuario será creado sin acceso a reportes, certificados ni documentos.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
