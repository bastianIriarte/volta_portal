import { useState, useRef } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Plus, Image, X } from "lucide-react";

export default function CreateManualModal({
  open,
  companies,
  onCreate,
  onClose,
}) {
  const [companyId, setCompanyId] = useState("");
  const [docNum, setDocNum] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [creating, setCreating] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
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
    if (!companyId || !docNum) return;

    setCreating(true);
    try {
      await onCreate(companyId, docNum, selectedFile);
      handleClose();
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    setCompanyId("");
    setDocNum("");
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

  const isValid = companyId && docNum;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Crear Registro Manual"
      size="default"
      actions={[
        { label: "Cancelar", variant: "outline", onClick: handleClose },
        {
          label: creating ? "Creando..." : "Crear Registro",
          variant: "primary",
          onClick: handleSubmit,
          disabled: !isValid || creating,
          loading: creating,
          icon: Plus,
        },
      ]}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Empresa <span className="text-red-500">*</span>
          </label>
          <select
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Seleccione empresa</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.business_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de Documento <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={docNum}
            onChange={(e) => setDocNum(e.target.value)}
            placeholder="Ej: 123456"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imagen (opcional)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
          <p className="mt-1 text-xs text-gray-500">
            Puede agregar la imagen ahora o subirla más tarde
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
      </div>
    </Modal>
  );
}
