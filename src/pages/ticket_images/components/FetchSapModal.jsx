import { useState } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Download, AlertTriangle } from "lucide-react";

export default function FetchSapModal({
  open,
  companies,
  onFetch,
  onClose,
}) {
  const [companyId, setCompanyId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [rut, setRut] = useState("");
  const [fetching, setFetching] = useState(false);

  const handleSubmit = async () => {
    if (!dateFrom || !dateTo) return;

    setFetching(true);
    try {
      await onFetch(companyId, dateFrom, dateTo, rut);
      handleClose();
    } finally {
      setFetching(false);
    }
  };

  const handleClose = () => {
    setCompanyId("");
    setDateFrom("");
    setDateTo("");
    setRut("");
    onClose();
  };

  const isValid = dateFrom && dateTo;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Obtener Imágenes desde SAP"
      size="default"
      actions={[
        { label: "Cancelar", variant: "outline", onClick: handleClose },
        {
          label: fetching ? "Obteniendo..." : "Obtener",
          variant: "primary",
          onClick: handleSubmit,
          disabled: !isValid || fetching,
          loading: fetching,
          icon: Download,
        },
      ]}
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Consulta la información de retiros y registra las URLs de imágenes asociadas.
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Empresa
          </label>
          <select
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todas las empresas</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.business_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            RUT Cliente
          </label>
          <input
            type="text"
            value={rut}
            onChange={(e) => setRut(e.target.value)}
            placeholder="Ej: 12.345.678-9"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Opcional - Dejar vacío para obtener todos los clientes
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha desde <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha hasta <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <strong>Nota:</strong> Los registros existentes con imágenes manuales no serán
            modificados por esta operación.
          </div>
        </div>
      </div>
    </Modal>
  );
}
