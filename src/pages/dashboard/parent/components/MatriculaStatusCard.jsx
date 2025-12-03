import React from "react";
import { FileSignature, CheckCircle2 } from "lucide-react";
import { Card } from "../../../../components/ui/Card";

export const MatriculaStatusCard = ({ currentContract, currentPeriod }) => {
  return (
    <Card variant="default" className="border-l-4 border-blue-600">
      <div className="flex items-start space-x-4">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <FileSignature className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-green-800 mb-2">
            Proceso de Matrícula {currentPeriod?.year}
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-600 font-medium">
                {/* Pago confirmado - ${currentContract?.total_amount?.toLocaleString('es-CL')} */}
                Pago confirmado
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-600 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
              </div>
              <span className="text-blue-600 font-medium">
                Firma de contrato pendiente
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
