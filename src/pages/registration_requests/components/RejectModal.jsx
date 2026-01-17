import React from "react";
import { XCircle, X, Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/Button";

export default function RejectModal({
  request,
  rejectionReason,
  setRejectionReason,
  processing,
  onConfirm,
  onCancel
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 top-[-30px]">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Rechazar Solicitud</h2>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Estás a punto de rechazar la solicitud de <strong>{request.name}</strong> de la empresa <strong>{request.company_name}</strong>.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo del rechazo *
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
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={processing}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            icon={processing ? Loader2 : X}
            disabled={processing}
          >
            {processing ? "Procesando..." : "Confirmar Rechazo"}
          </Button>
        </div>
      </div>
    </div>
  );
}
