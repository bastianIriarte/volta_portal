import React from "react";
import { User, UserCheck } from "lucide-react";

export default function ApplicantInfoSection({ request }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
        <User className="w-5 h-5 text-gray-600" />
        Datos del Solicitante
        {request.is_existing_user && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            <UserCheck className="w-3.5 h-3.5" />
            Usuario existente
          </span>
        )}
      </h3>
      {request.is_existing_user && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
          <UserCheck className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-700">
            Este RUT ya tiene una cuenta en el sistema. Al aprobar, se le asignarán las empresas y permisos sin crear un nuevo usuario.
          </p>
        </div>
      )}
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
