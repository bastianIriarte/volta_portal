import React from "react";
import { CheckCheck, AlertCircle } from "lucide-react";

export const AlertBanner = ({ type, title, message, icon: CustomIcon, children = null, }) => {
  const types = {
    success: {
      bg: "bg-gradient-to-br from-emerald-700 to-emerald-600",
      icon: CheckCheck,
      textColor: "text-white",
      subtextColor: "text-emerald-100"
    },
    error: {
      bg: "bg-gradient-to-br from-red-500 to-red-500",
      icon: AlertCircle,
      textColor: "text-white",
      subtextColor: "text-red-100"
    },
    warning: {
      bg: "bg-gradient-to-br from-amber-500 to-amber-600",
      icon: AlertCircle,
      textColor: "text-white",
      subtextColor: "text-amber-100"
    },
    info: {
      bg: "bg-gradient-to-br from-blue-500 to-blue-600",
      icon: AlertCircle,
      textColor: "text-white",
      subtextColor: "text-blue-100"
    }
  };

  const config = types[type] || types.info;
  const Icon = CustomIcon || config.icon;

  return (
    <div className={`flex items-center space-x-3 ${config.bg} text-white rounded-xl px-6 py-3 shadow-lg`}>
      <Icon className="w-6 h-6" />
      <div>
        <p className={`font-bold text-lg ${config.textColor}`}>{title}</p>
        <p className={`text-sm ${config.subtextColor}`}>{message}</p>
              {/* 👇 Aquí se renderizan los hijos (lista de alumnos, botones, etc.) */}
      {children && (
        <div className="w-full sm:ml-6 mt-3 sm:mt-0">
          {children}
        </div>
      )}

      </div>
    </div>
  );
};