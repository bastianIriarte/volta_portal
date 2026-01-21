import { useState } from "react";
import { Modal } from "../../../components/ui/Modal";
import { ExternalLink, Image, Loader2, AlertCircle } from "lucide-react";

export default function ImagePreviewModal({
  open,
  url,
  loading = false,
  onClose,
}) {
  const [imageError, setImageError] = useState(false);
  const isPdf = url?.toLowerCase().endsWith(".pdf");

  // Reset error state when URL changes
  const handleClose = () => {
    setImageError(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Vista Previa"
      size="lg"
      actions={[
        { label: "Cerrar", variant: "outline", onClick: handleClose },
        ...(url && !imageError ? [{
          label: "Abrir en nueva pestaña",
          variant: "primary",
          icon: ExternalLink,
          onClick: () => window.open(url, "_blank"),
        }] : []),
      ]}
    >
      <div className="flex items-center justify-center min-h-[300px] bg-gray-50 rounded-lg">
        {loading ? (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-12 h-12 mb-2 animate-spin text-blue-500" />
            <p>Cargando imagen...</p>
          </div>
        ) : imageError ? (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <AlertCircle className="w-16 h-16 mb-2 text-red-400" />
            <p>Error al cargar la imagen</p>
            <p className="text-xs mt-1 text-gray-500">{url}</p>
          </div>
        ) : url ? (
          isPdf ? (
            <iframe
              src={url}
              className="w-full h-[500px] border-0 rounded-lg"
              title="Vista previa PDF"
            />
          ) : (
            <img
              src={url}
              alt="Vista previa"
              className="max-w-full max-h-[500px] object-contain rounded-lg shadow-sm"
              onError={() => setImageError(true)}
            />
          )
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <Image className="w-16 h-16 mb-2" />
            <p>No hay imagen disponible</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
