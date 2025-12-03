import React, { useState, useEffect } from "react";
import { Save, X, Info } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { validatePeriodDates, validateDate, validateDateRange } from "../../../utils/periodValidators";

export default function EditPeriodForm({ period, onSave, onCancel, isLoading }) {
  const [formData, setFormData] = useState({ segments: [] });
  const [errors, setErrors] = useState({});

  // Inicializar formulario con datos del período
  useEffect(() => {
    if (period) {
      setFormData({
        segments: period.segments?.map(seg => ({
          id: seg.id,
          description: seg.description,
          start_date: seg.start_date,
          end_date: seg.end_date,
          observacion: seg.observacion || '',
        })) || []
      });
    }
  }, [period]);

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};
    
    // Rango del período académico
    const periodRange = {
      start: period.start_date,
      end: period.end_date
    };

    formData.segments.forEach((segment, idx) => {
      // Validar fechas requeridas
      const startValidation = validateDate(segment.start_date);
      if (!startValidation.isValid) {
        newErrors[`segment_${idx}_start`] = startValidation.message;
      }

      const endValidation = validateDate(segment.end_date);
      if (!endValidation.isValid) {
        newErrors[`segment_${idx}_end`] = endValidation.message;
      }

      if (segment.start_date && segment.end_date) {
        // Validar que fecha fin sea posterior a fecha inicio del segmento
        if (!validateDateRange(segment.start_date, segment.end_date)) {
          newErrors[`segment_${idx}_end`] = "Fecha fin debe ser posterior al inicio";
        }

        // Validar que las fechas del segmento estén dentro del período
        const dateValidation = validatePeriodDates(segment, periodRange);
        if (!dateValidation.isValid) {
          if (dateValidation.startError) {
            newErrors[`segment_${idx}_start`] = dateValidation.startError;
          }
          if (dateValidation.endError) {
            newErrors[`segment_${idx}_end`] = dateValidation.endError;
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Actualizar segmento
  const updateSegment = (segmentIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      segments: prev.segments.map((seg, idx) =>
        idx === segmentIndex ? { ...seg, [field]: value } : seg
      ),
    }));
    
    // Limpiar errores del segmento al editarlo
    const errorKey = `segment_${segmentIndex}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: undefined }));
    }
  };

  // Manejar envío del formulario
  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-black">
            Editar {period.period}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="px-6 py-5">
        {/* Información del período (no editable) */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-bold text-gray-700 mb-3">INFORMACIÓN DEL PERÍODO (No Editable)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Período:</span> {period.period}
            </div>
            <div>
              <span className="font-medium">Año:</span> {period.period_year}
            </div>
            <div>
              <span className="font-medium">Rango:</span> {period.start_date} al {period.end_date}
            </div>
            <div>
              <span className="font-medium">Estado:</span>{" "}
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                period.status === 1 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {period.status === 1 ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info size={16} className="text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm text-amber-800">
                <strong>Nota:</strong> Solo puedes editar las fechas de los segmentos. Las fechas deben estar dentro del rango del período académico ({period.start_date} - {period.end_date}).
              </p>
            </div>
          </div>
        </div>

        <h4 className="text-sm font-bold text-gray-700 mb-4">SEGMENTOS DE MATRÍCULA</h4>
        
        <div className="space-y-4">
          {formData.segments.map((segment, segIdx) => (
            <div key={segIdx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h5 className="text-sm font-semibold text-gray-700 mb-3">
                {segment.description}
              </h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Fecha Inicio"
                    type="date"
                    value={segment.start_date}
                    onChange={(e) => updateSegment(segIdx, 'start_date', e.target.value)}
                    error={errors[`segment_${segIdx}_start`]}
                    disabled={isLoading}
                    required
                  />
                </div>
                
                <div>
                  <Input
                    label="Fecha Fin"
                    type="date"
                    value={segment.end_date}
                    onChange={(e) => updateSegment(segIdx, 'end_date', e.target.value)}
                    error={errors[`segment_${segIdx}_end`]}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
              
              <div className="mt-3">
                <label className="block text-xs font-bold  /70 uppercase mb-1.5">
                  Observación (No Editable)
                </label>
                <textarea
                  value={segment.observacion}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 bg-gray-100 text-gray-600 text-sm"
                  rows={2}
                  disabled
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Acciones del formulario */}
      <div className="px-6 py-4 border-t border-gray-200 flex gap-4 justify-end">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="border border-gray-300 text-sm text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          icon={Save}
        >
          {isLoading ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
    </div>
  );
}