import React, { useState } from "react";
import { X, Save, Loader2, Eye, EyeOff, ExternalLink } from "lucide-react";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";

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

  if (!report) return null;

  // Validar si una URL es válida
  const isValidUrl = (url) => {
    if (!url?.trim()) return false;
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Obtener URL efectiva del reporte (custom o template)
  const getEffectiveReportUrl = () => {
    return report?.report_url || report?.template_report_url || '';
  };

  // URL actual del formulario
  const currentUrl = formData.report_url?.trim() || '';

  // Validaciones
  const isCurrentUrlValid = isValidUrl(currentUrl);
  const isCurrentUrlEmpty = currentUrl === '';
  const canSave = isCurrentUrlEmpty || isCurrentUrlValid;
  const canPreview = isValidUrl(currentUrl || getEffectiveReportUrl());

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
    <Modal
      open={open}
      onClose={handleClose}
      title="Configurar Reporte"
      showIcon={false}
      size={showPreview ? "xl" : "default"}
      actions={[
        {
          label: "Cancelar",
          variant: "outline",
          onClick: handleClose,
          icon: X
        },
        {
          label: saving ? "Guardando..." : "Guardar",
          variant: "primary",
          onClick: onSave,
          disabled: saving || !canSave,
          loading: saving,
          icon: saving ? Loader2 : Save
        }
      ]}
    >
      <div className={`flex ${showPreview ? 'flex-row gap-4' : 'flex-col'}`}>
        {/* Formulario */}
        <div className={showPreview ? 'w-1/3' : 'w-full'}>
          <div className="space-y-4">
            {/* Info del reporte */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-900 leading-relaxed">
                <strong>Reporte:</strong> {report.report_name}
              </p>
            </div>

            {/* URL del reporte */}
            <Input
              label="URL del Reporte"
              placeholder="https://app.powerbi.com/..."
              value={formData.report_url}
              onChange={(e) => onFormChange({ ...formData, report_url: e.target.value })}
              error={!isCurrentUrlEmpty && !isCurrentUrlValid ? "La URL ingresada no es válida" : null}
            />
            <p className="text-xs text-gray-500 -mt-2">
              URL personalizada para esta empresa. Si está vacío, se usará la URL de la plantilla.
            </p>

            {/* URL de plantilla */}
            {report.template_report_url && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-600">URL de la plantilla:</p>
                <p className="text-xs text-gray-500 mt-1 break-all">
                  {report.template_report_url}
                </p>
              </div>
            )}

            {/* Botón de preview */}
            <button
              onClick={handleTogglePreview}
              disabled={!canPreview}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !canPreview
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : showPreview
                    ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPreview ? 'Ocultar Preview' : 'Ver Preview'}
            </button>
          </div>
        </div>

        {/* Preview iframe */}
        {showPreview && (
          <div className="w-2/3">
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
              style={{ height: '400px' }}
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
                className="w-full h-full border-0"
                onLoad={handlePreviewLoad}
                allowFullScreen
              />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
