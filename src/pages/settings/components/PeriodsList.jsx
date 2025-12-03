import React, { useState, useEffect } from "react";
import { Calendar, Edit2 } from "lucide-react";

export default function PeriodsList({ periods, onEdit, onToggleStatus, isLoading }) {
  const [newPeriod, setNewPeriod] = useState(new Date().getFullYear() + 1);

  // 🔹 Siempre toma el mayor año disponible en periods
  useEffect(() => {
    if (periods.length > 0) {
      const maxYear = Math.max(...periods.map((p) => p.period_year || 0));
      setNewPeriod(maxYear);
    } else {
      // Si no hay períodos registrados, por defecto el siguiente año
      setNewPeriod(new Date().getFullYear() + 1);
    }
  }, [periods]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-bold text-black">
          Períodos Registrados
        </h3>
        <div className="text-sm text-gray-600">
          Último período:{" "}
          <span className="font-semibold text-indigo-700">{newPeriod}</span>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {periods.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">
              No hay períodos académicos configurados
            </p>
            <p className="text-sm mb-4">
              Haz clic en "Nuevo Período" para crear uno.
            </p>
          </div>
        ) : (
          periods.map((period) => (
            <div
              key={period.id || period.period_year}
              className="px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-900">
                      {period.period}
                    </h4>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        period.status === 1
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {period.status === 1 ? "Activo" : "Inactivo"}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <strong>Período:</strong> {period.start_date} al{" "}
                      {period.end_date}
                    </p>

                    {period.segments?.length > 0 && (
                      <div className="mt-2">
                        <strong>Segmentos:</strong>
                        <ul className="ml-4 mt-1 space-y-0.5">
                          {period.segments.map((seg, idx) => (
                            <li key={idx} className="text-xs">
                              • {seg.description}: {seg.start_date} -{" "}
                              {seg.end_date}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(period)}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium px-3 py-1.5 rounded hover:bg-indigo-50 transition-colors flex items-center gap-1"
                    disabled={isLoading}
                  >
                    <Edit2 size={14} />
                    Editar
                  </button>

                  <button
                    onClick={() => onToggleStatus(period)}
                    className={`text-sm font-medium px-3 py-1.5 rounded transition-colors ${
                      period.status === 1
                        ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                        : "text-green-600 hover:text-green-700 hover:bg-green-50"
                    }`}
                    disabled={isLoading}
                  >
                    {period.status === 1 ? "Desactivar" : "Activar"}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
