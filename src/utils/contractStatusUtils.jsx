// utils/contractStatusUtils.js
import React from "react";
import { Clock, FileCheck, FileSignature, CheckCircle2, AlertTriangle } from "lucide-react";

export const getStatusIcon = (status) => {
  switch (status) {
    case "draft":
      return <Clock className="w-4 h-4 text-yellow-600" />;
    case "generated":
      return <FileCheck className="w-4 h-4 text-blue-600" />;
    case "sent":
      return <FileSignature className="w-4 h-4 text-purple-600" />;
    case "signed":
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    default:
      return <AlertTriangle className="w-4 h-4 text-gray-400" />;
  }
};

export const getStatusLabel = (status) => {
  const labels = {
    draft: "Borrador",
    generated: "Generado",
    sent: "Enviado",
    signed: "Firmado",
    rejected: "Rechazado"
  };
  return labels[status] || status;
};

export const getStatusColor = (status) => {
  const colors = {
    draft: "bg-yellow-100 text-yellow-800",
    generated: "bg-blue-100 text-blue-800",
    sent: "bg-purple-100 text-purple-800",
    signed: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800"
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};