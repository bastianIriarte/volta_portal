import { X, PanelTop, FileText, PenTool, PanelBottom } from "lucide-react";

export default function AddFieldModal({ show, field, onAddToSection, onClose }) {
  if (!show || !field) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 lg:hidden"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl w-full max-w-lg transform transition-transform duration-300"
        style={{ animation: "slideUp 0.3s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              Agregar "{field.field_label}"
            </h3>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">Selecciona dónde agregar el campo</p>
        </div>
        <div className="p-2 space-y-1">
          <button
            onClick={() => onAddToSection(field, "header")}
            className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-sky-50 transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center group-hover:bg-sky-200">
              <PanelTop className="h-5 w-5 text-sky-600" />
            </div>
            <div>
              <span className="font-medium text-gray-900">Encabezado</span>
              <p className="text-xs text-gray-500">Aparece en todas las páginas (arriba)</p>
            </div>
          </button>
          <button
            onClick={() => onAddToSection(field, "body")}
            className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-emerald-50 transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200">
              <FileText className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <span className="font-medium text-gray-900">Cuerpo</span>
              <p className="text-xs text-gray-500">Contenido principal del certificado</p>
            </div>
          </button>
          <button
            onClick={() => onAddToSection(field, "signature_area")}
            className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-violet-50 transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center group-hover:bg-violet-200">
              <PenTool className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <span className="font-medium text-gray-900">Área de Firma</span>
              <p className="text-xs text-gray-500">Zona fija para firmas (sobre el pie)</p>
            </div>
          </button>
          <button
            onClick={() => onAddToSection(field, "footer")}
            className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-amber-50 transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center group-hover:bg-amber-200">
              <PanelBottom className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <span className="font-medium text-gray-900">Pie de página</span>
              <p className="text-xs text-gray-500">Aparece en todas las páginas (abajo)</p>
            </div>
          </button>
        </div>
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
