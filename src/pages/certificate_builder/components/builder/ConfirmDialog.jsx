import { AlertTriangle, X } from "lucide-react";
import { Modal } from "../../../../components/ui/Modal";

export default function ConfirmDialog({
  open = true,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Eliminar",
  confirmColor = "red",
}) {
  // Mapeo de colores a variantes del Modal
  const variantMap = {
    red: "error",
    sky: "info",
    amber: "warn",
  };

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      variant={variantMap[confirmColor] || "error"}
      actions={[
        {
          label: "Cancelar",
          variant: "outline",
          onClick: onCancel,
          icon: X
        },
        {
          label: confirmText,
          variant: "primary",
          onClick: onConfirm,
          icon: AlertTriangle
        }
      ]}
    >
      <p className="text-sm text-gray-600">{message}</p>
    </Modal>
  );
}
