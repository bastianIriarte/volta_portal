import { Building2, ExternalLink, Info } from "lucide-react";
import { Button } from "../../../components/ui/Button";

export default function CompanyInfoSection({ request }) {
  const handleEditCompany = () => {
    if (request.company_id) {
      window.open(`/dashboard/empresas/${request.company_id}/gestionar`, '_blank');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-gray-600" />
          Datos de la Empresa
        </h3>
        {request.company_id && request.request_status === "pending" && (
          <Button
            variant="outline"
            size="sm"
            icon={ExternalLink}
            onClick={handleEditCompany}
          >
            Editar Empresa
          </Button>
        )}
      </div>

      {/* Alert informativo - solo cuando está pendiente */}
      {request.request_status === "pending" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 mb-4">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-800">
              Importante: Verifique la configuración de la empresa
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Si la empresa no tiene asociados reportes, certificados o documentos, el usuario <strong>no podrá visualizarlos</strong> aunque tenga los permisos asignados. Puede modificar esta configuración en cualquier momento desde el mantenedor de empresas.
            </p>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase">Razón Social</label>
          <p className="mt-1 text-sm font-medium text-gray-900">{request.company_name || "-"}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase">RUT Empresa</label>
          <p className="mt-1 text-sm font-medium text-gray-900">{request.company_rut_formatted || request.company_rut}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase">Código SAP</label>
          <p className="mt-1 text-sm font-mono text-gray-900">{request.sap_code}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg mt-2">
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase">Email de Contacto</label>
          <p className="mt-1 text-sm font-medium text-gray-900">{request.email || "-"}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase">Teléfono</label>
          <p className="mt-1 text-sm font-medium text-gray-900">{request.phone || "-"}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase">Dirección</label>
          <p className="mt-1 text-sm font-mono text-gray-900">{request.address || "-"}</p>
        </div>
      </div>
    </div>
  );
}
