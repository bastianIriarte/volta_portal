import React from "react";
import { BarChart3, CheckCircle, CheckSquare, Square, Loader2, Settings, Database } from "lucide-react";

export default function CompanyReportsTab({
  templates,
  companyReports,
  assignedReports,
  loading,
  toggling,
  onToggle,
  onOpenConfig
}) {
  const assignedCount = Object.values(assignedReports).filter(Boolean).length;

  // Helper para verificar si un reporte tiene URL personalizada
  const hasCustomReportUrl = (templateId) => {
    const companyReport = companyReports.find(r => r.report_id === templateId && !['revoked'].includes(r.assignment_status));
    return companyReport?.report_url ? true : false;
  };

  // Helper para verificar si el reporte necesita configuración (Iframe, SharePoint, o Mixto con Iframe/SharePoint)
  const needsConfiguration = (template) => {
    if (template.origin_type === 'iframe' || template.origin_type === 'sharepoint') {
      return true;
    }
    if (template.origin_type === 'mixed' && Array.isArray(template.origins)) {
      return template.origins.some(origin => origin.type === 'iframe' || origin.type === 'sharepoint');
    }
    return false;
  };

  // Handler para abrir configuracion
  const handleOpenConfig = (e, templateId) => {
    e.stopPropagation();
    const companyReport = companyReports.find(r => r.report_id === templateId && !['revoked'].includes(r.assignment_status));
    if (companyReport) {
      onOpenConfig(companyReport);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Asignar Reportes</h3>
          <p className="text-sm text-gray-500 mt-1">
            Selecciona los reportes disponibles para esta empresa.
          </p>
        </div>
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reporte</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-24">Configurar</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {templates.map((template) => (
                <tr
                  key={template.id}
                  className={`hover:bg-gray-50 ${toggling === template.id ? 'opacity-50' : ''} ${assignedReports[template.id] ? 'bg-cyan-50' : ''}`}
                >
                  <td className="px-4 py-3">
                    <button
                      className={`p-1 ${toggling === template.id ? 'pointer-events-none' : 'cursor-pointer'}`}
                      disabled={toggling === template.id}
                      onClick={() => onToggle(template.id)}
                    >
                      {toggling === template.id
                        ? <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                        : assignedReports[template.id]
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
                    {assignedReports[template.id] ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3" />
                        Asignado
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">No asignado</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {assignedReports[template.id] && needsConfiguration(template) && (
                      <button
                        onClick={(e) => handleOpenConfig(e, template.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          hasCustomReportUrl(template.id)
                            ? 'text-indigo-600 bg-indigo-100 hover:bg-indigo-200'
                            : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'
                        }`}
                        title={hasCustomReportUrl(template.id) ? "URL personalizada configurada" : "Configurar URL"}
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No hay plantillas de reportes disponibles</p>
          <p className="text-sm text-gray-400 mt-1">Crea plantillas de reportes primero</p>
        </div>
      )}

      {templates.length > 0 && (
        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-sm text-gray-500">
            <span className="font-medium text-indigo-600">{assignedCount}</span> de <span className="font-medium">{templates.length}</span> reportes asignados
          </p>
        </div>
      )}
    </div>
  );
}
