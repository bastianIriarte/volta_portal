import React from "react";
import { X, Save, Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";

export default function DocumentModal({
  open,
  mode,
  formData,
  saving,
  onFormChange,
  onSave,
  onClose
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === 'edit' ? 'Editar Acceso' : 'Nuevo Acceso'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <Input
            id="doc_name"
            label="Nombre"
            required
            placeholder="Ej: Reporte de Ventas"
            value={formData.name}
            onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
          />

          <Input
            id="doc_description"
            label="Descripcion"
            placeholder="Descripcion breve del documento"
            value={formData.description}
            onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
          />

          <Input
            id="doc_file_path"
            label="URL del documento"
            required
            placeholder="https://..."
            value={formData.file_path}
            onChange={(e) => onFormChange({ ...formData, file_path: e.target.value })}
          />

          <div className="flex items-center gap-3">
            <label className="text-[11px] font-bold text-neutral-600 uppercase">Estado:</label>
            <button
              type="button"
              onClick={() => onFormChange({ ...formData, status: !formData.status })}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                formData.status
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {formData.status ? (
                <>
                  <ToggleRight className="w-4 h-4" />
                  Activo
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4" />
                  Inactivo
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 rounded-b-lg">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            onClick={onSave}
            disabled={saving}
            icon={saving ? Loader2 : Save}
          >
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
