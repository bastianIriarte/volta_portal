import React from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";

const statusConfig = {
  pending: {
    label: "Pendiente",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200"
  },
  approved: {
    label: "Aprobada",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  },
  rejected: {
    label: "Rechazada",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
    bgColor: "bg-red-50",
    borderColor: "border-red-200"
  },
};

export { statusConfig };

export default function RequestStatusBanner({ request }) {
  if (request.request_status === "pending") {
    return null;
  }

  const status = statusConfig[request.request_status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className={`${status.bgColor} border ${status.borderColor} rounded-lg p-4`}>
      <div className="flex items-start gap-3">
        <StatusIcon className={`w-5 h-5 mt-0.5 ${request.request_status === "approved" ? "text-green-600" : "text-red-600"}`} />
        <div>
          <h4 className="font-medium text-gray-900">
            Solicitud {status.label}
          </h4>
          {request.request_status === "approved" && (
            <p className="text-sm text-gray-600 mt-1">
              Aprobada el {request.approved_at} por {request.approved_by_name || "Sistema"}
            </p>
          )}
          {request.request_status === "rejected" && (
            <>
              <p className="text-sm text-gray-600 mt-1">
                Rechazada el {request.rejected_at} por {request.rejected_by_name || "Sistema"}
              </p>
              {request.rejection_reason && (
                <p className="text-sm text-red-700 mt-2">
                  <strong>Motivo:</strong> {request.rejection_reason}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
