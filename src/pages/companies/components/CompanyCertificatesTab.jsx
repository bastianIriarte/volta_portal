import React from "react";
import { Award, CheckCircle, CheckSquare, Square, Loader2 } from "lucide-react";

export default function CompanyCertificatesTab({
  templates,
  assignedCertificates,
  loading,
  toggling,
  onToggle,
  onToggleAll
}) {
  const assignedCount = Object.values(assignedCertificates).filter(Boolean).length;
  const allAssigned = templates.length > 0 && assignedCount === templates.length;
  const isBulkToggling = toggling !== null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Asignar Certificados</h3>
          <p className="text-sm text-gray-500 mt-1">
            Selecciona los certificados que debe presentar esta empresa.
          </p>
        </div>
        {templates.length > 0 && (
          <button
            type="button"
            disabled={isBulkToggling}
            onClick={() => onToggleAll(!allAssigned)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              allAssigned
                ? "text-red-700 bg-red-50 hover:bg-red-100 border border-red-200"
                : "text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200"
            } ${isBulkToggling ? "opacity-50 pointer-events-none" : ""}`}
          >
            {isBulkToggling ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : allAssigned ? (
              <Square className="w-4 h-4" />
            ) : (
              <CheckSquare className="w-4 h-4" />
            )}
            {allAssigned ? "Quitar todos" : "Asignar todos"}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : templates.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12"></th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Certificado</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {templates.map((template) => (
                <tr
                  key={template.id}
                  className={`hover:bg-gray-50 ${toggling === template.id ? 'opacity-50' : ''} ${assignedCertificates[template.id] ? 'bg-cyan-50' : ''}`}
                >
                  <td className="px-4 py-3">
                    <button
                      className={`p-1 ${toggling === template.id ? 'pointer-events-none' : 'cursor-pointer'}`}
                      disabled={toggling === template.id}
                      onClick={() => onToggle(template.id)}
                    >
                      {toggling === template.id
                        ? <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                        : assignedCertificates[template.id]
                          ? <CheckSquare className="w-5 h-5 text-cyan-600" />
                          : <Square className="w-5 h-5 text-gray-400" />
                      }
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{template.name}</p>
                    {template.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{template.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {assignedCertificates[template.id] ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3" />
                        Asignado
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">No asignado</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No hay plantillas de certificados disponibles</p>
          <p className="text-sm text-gray-400 mt-1">Crea plantillas de certificados primero</p>
        </div>
      )}

      {templates.length > 0 && (
        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-sm text-gray-500">
            <span className="font-medium text-cyan-600">{assignedCount}</span> de <span className="font-medium">{templates.length}</span> certificados asignados
          </p>
        </div>
      )}
    </div>
  );
}
