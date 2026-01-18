import React from "react";
import { Save } from "lucide-react";
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
        <Input
          id="address"
          label="Dirección"
          value={formData.address || ""}
          onChange={(e) => onFormChange("address", e.target.value)}
          disabled
        />
        <Input
          id="created_at"
          label="Fecha de Registro"
          value={formData.created_at || ""}
          disabled
        />
        <div>
          <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1.5">Estado</label>
          <select
            value={formData.status ? "1" : "0"}
            onChange={(e) => onFormChange("status", e.target.value === "1")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="1">Activa</option>
            <option value="0">Inactiva</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end pt-4 border-t">
        <Button onClick={onSave} icon={Save} disabled={saving} loading={saving}>
          {saving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
    </div>
  );
}
