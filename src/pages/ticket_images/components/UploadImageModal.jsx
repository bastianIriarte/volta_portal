import { useState, useRef } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Upload, Image, AlertTriangle, X } from "lucide-react";

export default function UploadImageModal({
  open,
  record,
  onUpload,
  onClose,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Crear preview si es imagen
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !record) return;

    setUploading(true);
    try {
      await onUpload(record.id, selectedFile);
      handleClose();
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Modal
      open={open && !!record}
      onClose={handleClose}
      title={`Subir Imagen - Doc. ${record?.doc_num || ""}`}
      size="default"
      actions={[
        { label: "Cancelar", variant: "outline", onClick: handleClose },
        {
          label: uploading ? "Subiendo..." : "Subir Imagen",
          variant: "primary",
          onClick: handleSubmit,
          disabled: !selectedFile || uploading,
          loading: uploading,
          icon: Upload,
        },
      ]}
    >
      <div className="space-y-4">
        {record?.is_public && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <strong>Nota:</strong> Este registro proviene de SAP. Al subir una imagen local,
              el registro pasará a ser "Manual" y no será actualizado automáticamente por SAP.
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar archivo
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
          <p className="mt-1 text-xs text-gray-500">
            Formatos permitidos: JPG, PNG, GIF, WEBP o PDF
          </p>
        </div>

        {selectedFile && (
          <div className="relative p-3 bg-gray-50 rounded-lg border border-gray-200">
            <button
              onClick={clearFile}
              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded border"
                />
              ) : (
                <div className="w-16 h-16 flex items-center justify-center bg-gray-200 rounded">
                  <Image className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          </div>
        )}

        {record?.url && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Imagen actual:</strong> Este registro ya tiene una imagen local.
              Subir una nueva imagen reemplazará la existente.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
