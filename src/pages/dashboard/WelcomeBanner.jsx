import React from "react";
import { GraduationCap } from "lucide-react";

export const WelcomeBanner = () => {
  return (
    <div className="glass-effect rounded-2xl p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      <div className="relative z-10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div>
              <h2 className="text-3xl font-bold text-black">
                Dashboard
              </h2>
              <p className="text-gray-600 mt-1">
                Portal de clientes y proveedores
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
