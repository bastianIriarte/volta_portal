import React, { useState } from "react";
import { X, Save, Loader2, Eye, EyeOff, ExternalLink } from "lucide-react";
import { Button } from "../../../components/ui/Button";

export default function ReportConfigModal({
  open,
  report,
  formData,
  saving,
  onFormChange,
  onSave,
  onClose
}) {
  const [showPreview, setShowPreview] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  if (!open || !report) return null;

  // Obtener URL efectiva del reporte (custom o template)
  const getEffectiveReportUrl = () => {
    return report?.report_url || report?.template_report_url || '';
  };

  const handleTogglePreview = () => {
    if (showPreview) {
      setShowPreview(false);
      setPreviewLoading(false);
    } else {
      setShowPreview(true);
      setPreviewLoading(true);
    }
  };

  const handlePreviewLoad = () => {
    setPreviewLoading(false);
  };

  const handleClose = () => {
    setShowPreview(false);
    setPreviewLoading(false);
    onClose();
  };

  const previewUrl = formData.report_url || getEffectiveReportUrl();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 top-[-30px]">
      <div className={`bg-white rounded-lg shadow-xl mx-4 transition-all duration-300 ${showPreview ? 'w-full max-w-5xl' : 'w-full max-w-lg'}`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Configurar Reporte
          </h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className={`flex ${showPreview ? 'flex-row' : 'flex-col'}`}>
          {/* Formulario */}
          <div className={`p-4 space-y-4 ${showPreview ? 'w-1/3 border-r' : 'w-full'}`}>
            <div className="bg-indigo-50 rounded-lg p-3">
              <p className="text-sm font-medium text-indigo-900">
                {report.report_name}
              </p>
              <p className="text-xs text-indigo-700 mt-1">
                {report.report_code}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL del Reporte
              </label>
              <input
                type="text"
                placeholder="https://app.powerbi.com/..."
                value={formData.report_url}
                onChange={(e) => onFormChange({ ...formData, report_url: e.target.value })}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                URL personalizada para esta empresa. Si esta vacio, se usara la URL de la plantilla.
              </p>
            </div>

            {report.template_report_url && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-600">URL de la plantilla:</p>
                <p className="text-xs text-gray-500 mt-1 break-all">
                  {report.template_report_url}
                </p>
              </div>
            )}

            {/* Boton de preview */}
            {previewUrl && (
              <button
                onClick={handleTogglePreview}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showPreview
                    ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPreview ? 'Ocultar Preview' : 'Ver Preview'}
              </button>
            )}
          </div>

          {/* Preview iframe */}
          {showPreview && (
            <div className="w-2/3 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500">Vista previa</span>
                <a
                  href={`/report-fullscreen?url=${btoa(previewUrl)}&title=${encodeURIComponent(report.report_name || 'Reporte')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Abrir en nueva pestaña
                </a>
              </div>
              <div
                className="relative border border-gray-200 rounded-lg overflow-hidden bg-white"
                style={{ height: '450px' }}
              >
                {previewLoading && (
                  <div className="absolute inset-0 bg-white flex flex-col items-center justify-center z-10">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="mt-3 text-sm text-gray-500">Cargando reporte...</p>
                  </div>
                )}
                <iframe
                  src={previewUrl}
                  title="Preview del reporte"
                  className="w-full border-0"
                  style={{ height: 'calc(100% + 56px)' }}
                  onLoad={handlePreviewLoad}
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 rounded-b-lg">
          <Button
            variant="secondary"
            onClick={handleClose}
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
