import React from "react";
import { CheckCircle, X, Loader2, BarChart3, Award, FileText } from "lucide-react";
import { Modal } from "../../../components/ui/Modal";

export default function ApproveModal({
  open,
  request,
  selectedPermissions,
  reports,
  certificates,
  documents,
  processing,
  onConfirm,
  onCancel
}) {
  if (!request) return null;

  const selectedReports = reports.filter(r => selectedPermissions.includes(r.id));
  const selectedCertificates = certificates.filter(c => selectedPermissions.includes(c.id));
  const selectedDocuments = documents.filter(d => selectedPermissions.includes(d.id));
  const totalPermissions = selectedPermissions.length;

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

        {totalPermissions > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">
              Permisos a asignar ({totalPermissions}):
            </p>

            {selectedReports.length > 0 && (
              <div className="bg-cyan-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-cyan-700 text-sm font-medium mb-2">
                  <BarChart3 className="w-4 h-4" />
                  Reportes ({selectedReports.length})
                </div>
                <ul className="text-xs text-cyan-600 space-y-1 ml-6">
                  {selectedReports.map(r => (
                    <li key={r.id}>• {r.name}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedCertificates.length > 0 && (
              <div className="bg-amber-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-amber-700 text-sm font-medium mb-2">
                  <Award className="w-4 h-4" />
                  Certificados ({selectedCertificates.length})
                </div>
                <ul className="text-xs text-amber-600 space-y-1 ml-6">
                  {selectedCertificates.map(c => (
                    <li key={c.id}>• {c.name}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedDocuments.length > 0 && (
              <div className="bg-emerald-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-emerald-700 text-sm font-medium mb-2">
                  <FileText className="w-4 h-4" />
                  Documentos ({selectedDocuments.length})
                </div>
                <ul className="text-xs text-emerald-600 space-y-1 ml-6">
                  {selectedDocuments.map(d => (
                    <li key={d.id}>• {d.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
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
