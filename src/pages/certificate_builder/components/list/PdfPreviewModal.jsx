import { FileText, X, Download, RefreshCw } from "lucide-react";

export default function PdfPreviewModal({
  show,
  url,
  loading,
  template,
  onRefresh,
  onDownload,
  onClose,
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 top-[-30px]">
      <div className="bg-white rounded-lg shadow-2xl w-[90vw] h-[90vh] max-w-6xl flex flex-col">
        {/* Header del modal */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">
            Vista Previa - {template?.name || "Certificado"}
          </h3>
          <div className="flex items-center gap-2">
            {/* Botón de refrescar */}
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50"
              title="Refrescar"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            {/* Botón de descargar */}
            <button
              onClick={onDownload}
              disabled={loading || !url}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50"
              title="Descargar PDF"
            >
              <Download className="h-4 w-4" />
            </button>
            {/* Botón de cerrar */}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
              title="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Contenido del PDF */}
        <div className="flex-1 p-4 bg-gray-100 overflow-hidden">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
                <span className="text-gray-600">Generando PDF...</span>
              </div>
            </div>
          ) : url ? (
            <iframe
              src={url}
              className="w-full h-full rounded border border-gray-300"
              title="Vista previa del certificado"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No se pudo cargar el preview</p>
                <button
                  onClick={onRefresh}
                  className="mt-3 px-4 py-2 text-sm text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded"
                >
                  Reintentar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
