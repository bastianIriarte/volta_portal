import { AlertCircle } from "lucide-react";

// Componente de validación visual
export const ValidationMessage = ({ errors, touched }) => {
  if (!touched || errors.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle size={20} className="text-red-600" />
        <h3 className="font-semibold text-red-800">Por favor, completa los siguientes campos:</h3>
      </div>
      <ul className="list-disc list-inside space-y-1">
        {errors.map((error, index) => (
          <li key={index} className="text-sm text-red-700">{error}</li>
        ))}
      </ul>
    </div>
  );
};