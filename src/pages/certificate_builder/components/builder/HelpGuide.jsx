import {
  Lightbulb,
  MousePointer2,
  Palette,
  Settings,
  Columns,
  Undo2,
} from "lucide-react";
import { Modal } from "../../../../components/ui/Modal";

export default function HelpGuide({ open = true, onClose }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Guía del Builder"
      variant="info"
      actions={[
        {
          label: "¡Entendido!",
          variant: "primary",
          onClick: onClose,
          icon: Lightbulb
        }
      ]}
    >
      <div className="space-y-3 text-sm">
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
    </Modal>
  );
}
