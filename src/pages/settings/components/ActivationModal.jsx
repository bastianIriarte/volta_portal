import React from "react";
import { AlertTriangle, X, Loader2, CheckCircle } from "lucide-react";
import { Modal } from "../../../components/ui/Modal";

export default function ActivationModal({ isOpen, onClose, onConfirm, periodName, isLoading }) {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Confirmar Activación de Período"
      variant="warn"
      actions={[
        {
          label: "Cancelar",
          variant: "outline",
          onClick: onClose,
          disabled: isLoading,
          icon: X
        },
        {
          label: isLoading ? "Activando..." : "Confirmar Activación",
          variant: "primary",
          onClick: onConfirm,
          disabled: isLoading,
          loading: isLoading,
          icon: isLoading ? Loader2 : CheckCircle
        }
      ]}
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-700">
          ¿Estás seguro de activar el período <strong>{periodName}</strong>?
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            ADVERTENCIA IMPORTANTE
          </h4>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>• Se desactivarán todos los demás períodos automáticamente</li>
            <li>• Los estudiantes de otros períodos no estarán disponibles</li>
            <li>• Los apoderados de otros períodos no estarán disponibles</li>
            <li>• Los contratos de otros períodos no estarán disponibles</li>
            <li>• Las postulaciones de otros períodos no estarán disponibles</li>
            <li>• Solo el período activo será visible en el sistema</li>
          </ul>
        </div>

        <p className="text-xs text-gray-600">
          Esta acción es reversible, pero ten en cuenta las implicaciones operativas.
        </p>
      </div>
    </Modal>
  );
}
