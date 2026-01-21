import React from "react";
import { XCircle, X, Loader2 } from "lucide-react";
import { Modal } from "../../../components/ui/Modal";

export default function RejectModal({
  open,
  request,
  rejectionReason,
  setRejectionReason,
  processing,
  onConfirm,
  onCancel
}) {
  if (!request) return null;

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title="Rechazar Solicitud"
      variant="error"
      actions={[
        {
          label: "Cancelar",
          variant: "outline",
          onClick: onCancel,
          disabled: processing,
          icon: X
        },
        {
          label: processing ? "Procesando..." : "Confirmar Rechazo",
          variant: "primary",
          onClick: onConfirm,
          disabled: processing || !rejectionReason.trim(),
          loading: processing,
          icon: processing ? Loader2 : XCircle
        }
      ]}
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Estás a punto de rechazar la solicitud de <strong>{request.name}</strong> de la empresa <strong>{request.company_name}</strong>.
        </p>
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">
            Motivo del rechazo <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
            rows={4}
            placeholder="Ingrese el motivo del rechazo..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}
