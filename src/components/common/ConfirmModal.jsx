import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { AlertTriangle, Trash2, Power, X, Loader2 } from "lucide-react";

const variantConfig = {
  danger: {
    icon: Trash2,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    buttonVariant: "danger"
  },
  warning: {
    icon: Power,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    buttonVariant: "warning"
  },
  primary: {
    icon: Power,
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
    buttonVariant: "primary"
  },
  default: {
    icon: AlertTriangle,
    iconBg: "bg-gray-100",
    iconColor: "text-gray-600",
    buttonVariant: "primary"
  }
};

export default function ConfirmModal({
  open,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default",
  onConfirm,
  onCancel
}) {
  const [loading, setLoading] = useState(false);
  const config = variantConfig[variant] || variantConfig.default;
  const Icon = config.icon;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      showIcon={false}
      size="sm"
      actions={[]}
    >
      <div className="text-center py-4">
        <div className={`mx-auto w-14 h-14 ${config.iconBg} rounded-full flex items-center justify-center mb-4`}>
          <Icon className={`w-7 h-7 ${config.iconColor}`} />
        </div>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            icon={X}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={config.buttonVariant}
            onClick={handleConfirm}
            icon={loading ? Loader2 : undefined}
            disabled={loading}
            loading={loading}
          >
            {loading ? "Procesando..." : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
