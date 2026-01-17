import React from "react";
import { User } from "lucide-react";

export default function ApplicantInfoSection({ request }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
        <User className="w-5 h-5 text-gray-600" />
        Datos del Solicitante
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase">Nombre Completo</label>
          <p className="mt-1 text-sm font-medium text-gray-900">{request.name}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase">RUT</label>
          <p className="mt-1 text-sm font-medium text-gray-900">{request.rut_formatted || request.rut}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase">Email</label>
          <p className="mt-1 text-sm font-medium text-gray-900">{request.email}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase">Teléfono</label>
          <p className="mt-1 text-sm font-medium text-gray-900">{request.phone || "-"}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase">Cargo</label>
          <p className="mt-1 text-sm font-medium text-gray-900">{request.position || "-"}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase">Fecha Solicitud</label>
          <p className="mt-1 text-sm font-medium text-gray-900">{request.created_at}</p>
        </div>
      </div>
    </div>
  );
}
