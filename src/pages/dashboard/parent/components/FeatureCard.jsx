import React from "react";
import { Card } from "../../../../components/ui/Card";
export const FeatureCard = ({
  title,
  description,
  icon: Icon,
  action,
  variant = "default",
  className,
  badge
}) => {
  const variants = {
    default: "border-gray-200",
    gold: "bg-gradient-to-br to-white",
    success: "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white",
    info: "border-blue-200 bg-gradient-to-br from-blue-50 to-white",
    error:"border-red-200 bg-gradient-to-br from-red-50 to-white", 
  };

  return (
    <Card 
      className={`hover-lift group border-2 ${variants[variant]} ${className || ""} ${
        variant === "default" ? "cursor-not-allowed" : ""
      }`}
    >
      <div className="text-center relative">
        {badge && (
          <div className={`absolute -top-2 -right-2 px-3 py-1 ${variant == 'error' ? 'bg-red-500' :  'bg-emerald-500'}  text-white text-xs font-bold rounded-full shadow-lg`}>
            {badge}
          </div>
        )}
        
        {Icon && (
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform ${
            variant === "success"
              ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
              : variant === "gold"
                ? "bg-gradient-to-br from-yellow-800 to-yellow-500"
                : variant === "info"
                  ? "bg-gradient-to-br from-blue-500 to-blue-600"
                  : "bg-gradient-to-br from-gray-100 to-gray-100 border-2"
          }`}>
            <Icon className={`w-8 h-8 ${
              variant === "gold" 
                ? "text-green-800" 
                : variant === "default" 
                  ? "text-gray-400" 
                  : (variant === "error" ? "text-red-600" : "text-white") 
            }`} />
          </div>
        )}
        
        <h3 className={`text-xl font-bold ${
          variant === "default" ? "text-gray-400" : (variant === "error" ? "text-red-600" : "text-green-800")
        } mb-2`}>
          {title}
        </h3>
        
        {description && (
          <p className=" text-sm mb-4 leading-relaxed">
            {description}
          </p>
        )}
        
        {action && (
          <div className="mt-4">
            {action}
          </div>
        )}
      </div>
    </Card>
  );
};