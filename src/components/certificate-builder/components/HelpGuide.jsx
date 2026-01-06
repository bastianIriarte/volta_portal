import {
  Lightbulb,
  X,
  MousePointer2,
  Palette,
  Settings,
  Columns,
  Undo2,
} from "lucide-react";

export default function HelpGuide({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-sky-500 to-sky-600 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-white" />
            <h3 className="font-semibold text-white">Guía del Builder</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 space-y-3 text-sm">
          <div className="flex gap-3 p-2 bg-gray-50 rounded-lg">
            <MousePointer2 className="h-5 w-5 text-sky-600 flex-shrink-0" />
            <div>
              <p className="font-medium">Arrastra campos</p>
              <p className="text-xs text-gray-600">Desde la izquierda hacia el certificado</p>
            </div>
          </div>
          <div className="flex gap-3 p-2 bg-gray-50 rounded-lg">
            <Palette className="h-5 w-5 text-sky-600 flex-shrink-0" />
            <div>
              <p className="font-medium">Personaliza estilos</p>
              <p className="text-xs text-gray-600">Clic en el icono de paleta para estilos rápidos</p>
            </div>
          </div>
          <div className="flex gap-3 p-2 bg-gray-50 rounded-lg">
            <Settings className="h-5 w-5 text-sky-600 flex-shrink-0" />
            <div>
              <p className="font-medium">Configuración avanzada</p>
              <p className="text-xs text-gray-600">Clic en engranaje para todas las opciones</p>
            </div>
          </div>
          <div className="flex gap-3 p-2 bg-gray-50 rounded-lg">
            <Columns className="h-5 w-5 text-sky-600 flex-shrink-0" />
            <div>
              <p className="font-medium">Layouts flexibles</p>
              <p className="text-xs text-gray-600">Cambia el ancho de cada campo (50%, 33%, etc.)</p>
            </div>
          </div>
          <div className="flex gap-3 p-2 bg-gray-50 rounded-lg">
            <Undo2 className="h-5 w-5 text-sky-600 flex-shrink-0" />
            <div>
              <p className="font-medium">Deshacer / Rehacer</p>
              <p className="text-xs text-gray-600">Ctrl+Z para deshacer, Ctrl+Y para rehacer</p>
            </div>
          </div>
        </div>
        <div className="px-5 py-3 bg-gray-50 border-t">
          <button
            onClick={onClose}
            className="w-full py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 text-sm font-medium"
          >
            ¡Entendido!
          </button>
        </div>
      </div>
    </div>
  );
}
