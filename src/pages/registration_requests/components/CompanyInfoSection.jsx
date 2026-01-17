import React from "react";
import { Building2 } from "lucide-react";

export default function CompanyInfoSection({ request }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
        <Building2 className="w-5 h-5 text-gray-600" />
        Datos de la Empresa
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase">Razón Social</label>
          <p className="mt-1 text-sm font-medium text-gray-900">{request.company_name || "-"}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase">RUT Empresa</label>
          <p className="mt-1 text-sm font-medium text-gray-900">{request.company_rut_formatted || request.company_rut}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase">Código SAP</label>
          <p className="mt-1 text-sm font-mono text-gray-900">{request.sap_code}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg mt-2">
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase">Email de Contacto</label>
          <p className="mt-1 text-sm font-medium text-gray-900">{request.email || "-"}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase">Teléfono</label>
          <p className="mt-1 text-sm font-medium text-gray-900">{request.phone || "-"}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase">Dirección</label>
          <p className="mt-1 text-sm font-mono text-gray-900">{request.address || "-"}</p>
        </div>
      </div>
    </div>
  );
}
