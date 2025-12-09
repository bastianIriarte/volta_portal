// File: src/components/dashboard/StatCard.jsx
import React from "react";
import { Card } from "../../../../components/ui/Card";
import { ArrowRightCircle } from "lucide-react";

export const StatCard = ({
  label,
  value,
  icon: Icon,
  actionLabel,
  onAction,
  description,
  variant,
  className
}) => {
  // Colores Volta: negro y celeste
  const getVariantStyles = () => {
    switch (variant) {
      case "warning":
        return {
          valueColor: "text-amber-600",
          iconBg: "bg-amber-500",
        };
      case "success":
        return {
          valueColor: "text-cyan-600",
          iconBg: "bg-gradient-to-br from-cyan-500 to-cyan-600",
        };
      case "danger":
        return {
          valueColor: "text-red-600",
          iconBg: "bg-red-500",
        };
      default:
        return {
          valueColor: "text-gray-900",
          iconBg: "bg-gradient-to-br from-gray-800 to-black",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Card
      className={`hover-lift transition-all duration-300 ${className || ""}`}
      variant="premium"
    >
      <div className="space-y-4">
        {/* Header con icono */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">
              {label}
            </p>
            <p className={`text-3xl font-bold ${styles.valueColor}`}>
              {value}
            </p>
            {description && (
              <p className="text-xs text-gray-400 mt-1">{description}</p>
            )}
          </div>
          {Icon && (
            <div className={`w-12 h-12 ${styles.iconBg} rounded-xl flex items-center justify-center shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          )}
        </div>

        {/* Boton de accion */}
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="w-full border border-gray-200 hover:border-cyan-500 hover:bg-cyan-50 rounded-lg px-3 py-2 flex items-center justify-between text-sm font-medium text-gray-700 hover:text-cyan-600 transition-all duration-200"
          >
            <span>{actionLabel}</span>
            <ArrowRightCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    </Card>
  );
};
