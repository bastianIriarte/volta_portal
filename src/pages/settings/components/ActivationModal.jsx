import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/Button";

export default function ActivationModal({ isOpen, onClose, onConfirm, periodName, isLoading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Confirmar Activación de Período
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                ¿Estás seguro de activar el período <strong>{periodName}</strong>?
              </p>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
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
          </div>
        </div>
        
        <div className="px-6 pb-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            variant="danger"
            className="px-4 py-2 text-sm"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Activando...
              </>
            ) : (
              "Confirmar Activación"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}