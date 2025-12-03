// File: src/components/dashboard/PeriodoCard.jsx
import React from "react";
import { Card } from "../../../../components/ui/Card";
import { CalendarDays, Calendar, AlertCircle, Clock } from "lucide-react";

export const PeriodoCard = ({ currentPeriod }) => {
  const isActive = currentPeriod?.status === 1;
  const hasSegments = currentPeriod?.segments && currentPeriod.segments.length > 0;

  // Función para parsear fechas correctamente (evita problemas de timezone)
  const parseDate = (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Función para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = parseDate(dateString);
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Verificar si un segmento está activo actualmente
  const isSegmentActive = (segment) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas
    
    const start = parseDate(segment.start_date);
    const end = parseDate(segment.end_date);
    
    return now >= start && now <= end;
  };

  // Verificar si un segmento ya pasó
  const isSegmentPast = (segment) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const end = parseDate(segment.end_date);
    return now > end;
  };

  // Calcular días restantes para un segmento activo
  const getDaysRemaining = (segment) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const end = parseDate(segment.end_date);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Card title="Periodo Activo" icon={CalendarDays} variant="premium">
      <div className="space-y-4">
        {isActive ? (
          <>
            {/* Información del período */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm mb-2">
                  Postulaciones habilitadas para{" "}
                  <b className="text-green-800 text-lg">{currentPeriod.period_year}</b>
                </p>
                {currentPeriod.start_date && currentPeriod.end_date && (
                  <p className="text-xs  flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {formatDate(currentPeriod.start_date)} → {formatDate(currentPeriod.end_date)}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2 bg-emerald-50 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-emerald-700">Activo</span>
              </div>
            </div>

            {/* Segmentos de matrícula */}
            {hasSegments && (
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  SEGMENTOS DE MATRÍCULA
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 md:gap-5 gap-3">
                  {currentPeriod.segments.map((segment, idx) => {
                    const isCurrentSegment = isSegmentActive(segment);
                    const isPast = isSegmentPast(segment);
                    const daysRemaining = isCurrentSegment ? getDaysRemaining(segment) : 0;

                    return (
                      <div
                        key={segment.id || idx}
                        className={`p-4 rounded-lg border-2 transition-all relative overflow-hidden ${
                          isCurrentSegment
                            ? "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-400 shadow-lg ring-2 ring-blue-200"
                            : isPast
                            ? "bg-gray-50 border-gray-200 opacity-60"
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {/* Indicador visual para segmento activo */}
                        {isCurrentSegment && (
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 animate-pulse" />
                        )}

                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h5 className={`text-xs font-bold ${
                                isCurrentSegment 
                                  ? "text-blue-800" 
                                  : isPast 
                                    ? "text-gray-500" 
                                    : "text-gray-700"
                              }`}>
                                {segment.description}
                              </h5>
                            </div>

                            {/* Badge de estado */}
                            <div className="mb-2">
                              {isCurrentSegment && (
                                <div className="block items-center gap-1.5">
                                  <span className="px-2 py-1 bg-blue-600 text-white text-[9px] font-bold rounded-full flex items-center gap-1">
                                    <Clock className="w-2 h-2" />
                                    EN CURSO
                                  </span>
                                  <span className="px-2 py-1 bg-orange-500 text-white text-[9px] font-bold rounded-full">
                                    {daysRemaining} {daysRemaining === 1 ? 'día' : 'días'} restantes
                                  </span>
                                </div>
                              )}
                              {isPast && (
                                <span className="px-2 py-1 bg-gray-400 text-white text-[9px] font-bold rounded-full">
                                  FINALIZADO
                                </span>
                              )}
                              {!isCurrentSegment && !isPast && (
                                <span className="px-2 py-1 bg-green-500 text-white text-[9px] font-bold rounded-full">
                                  PRÓXIMO
                                </span>
                              )}
                            </div>

                            <p className={`text-[11px] ${
                              isCurrentSegment ? "text-blue-700 font-semibold" : "text-gray-500"
                            } flex items-center gap-1.5 mb-2`}>
                              <Calendar className="w-3 h-3" />
                             {formatDate(segment.start_date)} al  {formatDate(segment.end_date)}
                            </p>

                            {segment.observacion && (
                              <p className={`text-xs mt-2 p-2 rounded ${
                                isCurrentSegment 
                                  ? "bg-blue-50 text-blue-700 border border-blue-200" 
                                  : "text-gray-600 bg-gray-50"
                              }`}>
                                {segment.observacion}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Información adicional si no hay segmentos */}
            {!hasSegments && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-800">
                  No hay segmentos de matrícula configurados para este período.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-amber-600 font-semibold mb-2">Periodo cerrado</p>
            <p className="text-xs text-gray-500">
              {currentPeriod?.period_year 
                ? `El período ${currentPeriod.period_year} no está activo`
                : "No hay un período activo en este momento"
              }
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

// ==========================================
// DATOS DUMMY PARA PRUEBAS
// ==========================================
/*
const DUMMY_PERIOD = {
  period_year: 2025,
  period: "Período Académico 2025",
  start_date: "2025-01-01",
  end_date: "2025-12-31",
  status: 1,
  segments: [
    {
      id: 1,
      description: "Matrícula Regular",
      start_date: "2025-01-05", // Ya pasó
      end_date: "2025-01-20",
      observacion: "Pago de colegiatura anticipada con 2% de descuento si paga en 1 cuota",
      status: 1
    },
    {
      id: 2,
      description: "Matrícula Excepcional",
      start_date: "2025-10-01", // ACTIVO (ajusta estas fechas a hoy)
      end_date: "2025-10-10",
      observacion: "Recargo de tarifa. Pago de colegiatura excepcional con recargo (%)",
      status: 1
    },
    {
      id: 3,
      description: "Condición Académica Especial (CAE)",
      start_date: "2025-11-01", // Próximo
      end_date: "2025-11-15",
      observacion: "Proceso CAE, sin recargo por colegiatura excepcional",
      status: 1
    }
  ]
};

// Uso:
<PeriodoCard currentPeriod={DUMMY_PERIOD} />
*/
