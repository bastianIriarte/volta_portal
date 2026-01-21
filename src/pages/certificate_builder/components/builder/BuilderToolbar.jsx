import {
  Save,
  X,
  Maximize2,
  Minimize2,
  Undo2,
  Redo2,
  FileDown,
  Printer,
  Layers,
  Settings,
} from "lucide-react";

export default function BuilderToolbar({
  template,
  scale,
  setScale,
  saving,
  canUndo,
  canRedo,
  selectedField,
  pdfLoading,
  onUndo,
  onRedo,
  onSave,
  onClose,
  onOpenPdfPreview,
  onDownloadPdf,
  onShowMobileFields,
  onShowMobileConfig,
}) {
  return (
    <div className="bg-white border-b border-gray-200 px-2 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between flex-shrink-0">
      {/* Lado izquierdo */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
        {/* Botón campos en mobile */}
        <button
          onClick={onShowMobileFields}
          className="p-1.5 text-gray-600 hover:text-sky-600 hover:bg-sky-50 rounded lg:hidden flex-shrink-0"
          title="Campos"
        >
          <Layers className="h-4 w-4" />
        </button>
        {/* Nombre plantilla */}
        <h2 className="font-semibold text-gray-900 text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[200px] md:max-w-none">
          {template?.name || "Plantilla"}
        </h2>
      </div>

      {/* Centro - Controles de zoom */}
      <div className="flex items-center gap-0.5 bg-gray-100 rounded-full px-1.5 py-0.5">
        <button
          onClick={() => setScale(Math.max(0.3, scale - 0.1))}
          className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-200"
        >
          <Minimize2 className="h-3.5 w-3.5" />
        </button>
        <span className="text-[10px] sm:text-xs text-gray-600 w-8 text-center font-medium">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => setScale(Math.min(1.2, scale + 0.1))}
          className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-200"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Lado derecho */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Undo/Redo - oculto en mobile */}
        <div className="hidden sm:flex items-center gap-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded transition-colors ${
              canUndo
                ? "text-gray-600 hover:text-sky-600 hover:bg-sky-50"
                : "text-gray-300 cursor-not-allowed"
            }`}
            title="Deshacer (Ctrl+Z)"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded transition-colors ${
              canRedo
                ? "text-gray-600 hover:text-sky-600 hover:bg-sky-50"
                : "text-gray-300 cursor-not-allowed"
            }`}
            title="Rehacer (Ctrl+Y)"
          >
            <Redo2 className="h-4 w-4" />
          </button>
          <div className="h-4 w-px bg-gray-200 mx-1" />
        </div>

        {/* Preview PDF */}
        <button
          onClick={onOpenPdfPreview}
          disabled={pdfLoading}
          className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 flex items-center gap-1"
          title="Vista previa PDF"
        >
          <Printer className={`h-4 w-4 ${pdfLoading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">PDF</span>
        </button>

        {/* Descargar - solo desktop */}
        <button
          onClick={onDownloadPdf}
          className="hidden md:flex items-center gap-1 px-2 py-1.5 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
          title="Descargar PDF"
        >
          <FileDown className="h-3.5 w-3.5" />
        </button>

        {/* Botón config en mobile cuando hay campo seleccionado */}
        {selectedField && (
          <button
            onClick={onShowMobileConfig}
            className="p-1.5 text-sky-600 bg-sky-50 rounded lg:hidden"
            title="Configurar campo"
          >
            <Settings className="h-4 w-4" />
          </button>
        )}

        {/* Guardar */}
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-sky-600 text-white rounded hover:bg-sky-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span className="hidden sm:inline">{saving ? "..." : "Guardar"}</span>
        </button>

        {/* Cerrar */}
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
