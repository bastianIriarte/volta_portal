import React from "react";
import { ToggleLeft, ToggleRight, Save } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";

export default function CompanyInfoTab({
  formData,
  onFormChange,
  onSave,
  saving
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Informacion de la Empresa</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          id="rut"
          label="RUT"
          value={formData.rut_formatted || formData.rut || ""}
          onChange={(e) => onFormChange("rut", e.target.value)}
          disabled
        />
        <Input
          id="sap_code"
          label="Codigo SAP"
          value={formData.sap_code || ""}
          onChange={(e) => onFormChange("sap_code", e.target.value)}
          disabled
        />
        <div className="md:col-span-2">
          <Input
            id="business_name"
            label="Razon Social"
            value={formData.business_name || ""}
            onChange={(e) => onFormChange("business_name", e.target.value)}
            disabled
          />
        </div>
        <Input
          id="email"
          label="Email de Contacto"
          type="email"
          value={formData.email || ""}
          onChange={(e) => onFormChange("email", e.target.value)}
          disabled
        />
        <Input
          id="phone"
          label="Telefono"
          value={formData.phone || ""}
          onChange={(e) => onFormChange("phone", e.target.value)}
          disabled
        />
        <div>
          <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1.5">Estado</label>
          <button
            onClick={() => onFormChange("status", !formData.status)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              formData.status
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {formData.status ? (
              <>
                <ToggleRight className="w-5 h-5" />
                Activa
              </>
            ) : (
              <>
                <ToggleLeft className="w-5 h-5" />
                Inactiva
              </>
            )}
          </button>
        </div>
        <Input
          id="created_at"
          label="Fecha de Registro"
          value={formData.created_at || ""}
          disabled
        />
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={onSave} icon={Save} disabled={saving}>
          {saving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
    </div>
  );
}
