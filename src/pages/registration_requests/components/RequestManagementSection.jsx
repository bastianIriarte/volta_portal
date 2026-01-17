import React from "react";
import { CheckCircle, XCircle, Check, X, Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/Button";

export default function RequestManagementSection({
  processing,
  onApprove,
  onReject
}) {
  return (
    <div className="space-y-4 pt-4 border-t">
      <h3 className="text-lg font-semibold text-gray-900">Gestión de Solicitud</h3>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <XCircle className="w-6 h-6 text-red-600" />
            <div>
              <h4 className="font-medium text-red-900">Rechazar Solicitud</h4>
              <p className="text-sm text-red-700 mt-1">
                Deberá indicar un motivo de rechazo.
              </p>
              <Button
                className="mt-3"
                variant="danger"
                onClick={onReject}
                icon={X}
                disabled={processing}
              >
                Rechazar Solicitud
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h4 className="font-medium text-green-900">Aprobar Solicitud</h4>
              <p className="text-sm text-green-700 mt-1">
                El usuario recibirá un email con sus credenciales de acceso.
              </p>
              <Button
                className="mt-3"
                onClick={onApprove}
                icon={processing ? Loader2 : Check}
                disabled={processing}
              >
                {processing ? "Procesando..." : "Aprobar y Crear Usuario"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
