// File: src/components/dashboard/StatCard.jsx
import React from "react";
import { Card } from "../../../../components/ui/Card";
import { ArrowRight, ArrowRightCircle } from "lucide-react";

export const StatCard = ({
  label,
  value,
  icon: Icon,
  actionLabel,
  onAction,
  className
}) => {
  return (
    <Card 
      className={`hover-lift transition-all duration-300 ${className || ""}`} 
      variant="premium"
    >
      <div className="space-y-4">
        {/* Header con icono */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className=" text-sm font-medium mb-1">
              {label}
            </p>
            <p className="text-4xl font-bold text-green-800">
              {value}
            </p>
          </div>
          {Icon && (
            <div className="w-14 h-14 bg-gradient-to-br from-neutral-700 to-neutral-700 rounded-full flex items-center justify-center shadow-lg">
              <Icon className="w-7 h-7 text-white" />
            </div>
          )}
        </div>

        {/* Botón de acción */}
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className=" border-2 rounded-md px-2 flex items-center justify-between text-sm font-semibold transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <span>{actionLabel}</span>
            <ArrowRightCircle className="w-4 h-4 ml-1 mt-1" />
          </button>
        )}
      </div>
    </Card>
  );
};