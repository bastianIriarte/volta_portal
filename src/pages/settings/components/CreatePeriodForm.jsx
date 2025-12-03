import React, { useState } from "react";
import { Save, X, Info } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { validatePeriodDates, validateDate, validateDateRange, validateYear } from "../../../utils/periodValidators";

export default function CreatePeriodForm({ onSave, onCancel, isLoading }) {
    
  const [formData, setFormData] = useState({
    period_year: new Date().getFullYear() + 1,
    period: '',
    start_date: '',
    end_date: '',
    status: 0, // Siempre inactivo al crear
    segments: [
      {
        description: 'Matrícula Regular',
        start_date: '',
        end_date: '',
        observacion: 'Pago de colegiatura anticipada con 2% de descuento si paga en 1 cuota',
      },
      {
        description: 'Matrícula Excepcional',
        start_date: '',
        end_date: '',
        observacion: 'Recargo de tarifa. Pago de colegiatura excepcional con recargo (%)',
      },
      {
        description: 'Condición Académica Especial (CAE)',
        start_date: '',
        end_date: '',
        observacion: 'Proceso CAE, sin recargo por colegiatura excepcional',
      },
    ],
  });

  const [errors, setErrors] = useState({});

  // Validar formulario completo
  const validateForm = () => {
    const newErrors = {};

    // Validar año
    const yearValidation = validateYear(formData.period_year);
    if (!yearValidation.isValid) {
      newErrors.period_year = yearValidation.message;
    }

    // Validar descripción
    if (!formData.period.trim()) {
      newErrors.period = "La descripción del período es requerida";
    }

    // Validar fechas del período
    const startDateValidation = validateDate(formData.start_date);
    if (!startDateValidation.isValid) {
      newErrors.start_date = startDateValidation.message;
    }

    const endDateValidation = validateDate(formData.end_date);
    if (!endDateValidation.isValid) {
      newErrors.end_date = endDateValidation.message;
    }

    // Validar que fecha fin sea posterior a fecha inicio
    if (formData.start_date && formData.end_date) {
      if (!validateDateRange(formData.start_date, formData.end_date)) {
        newErrors.end_date = "La fecha de fin debe ser posterior al inicio";
      }
    }

    // Validar segmentos usando la función utilitaria
    const periodRange = {
      start: formData.start_date,
      end: formData.end_date
    };

    formData.segments.forEach((seg, idx) => {
      // Validar fechas requeridas
      const segStartValidation = validateDate(seg.start_date);
      if (!segStartValidation.isValid) {
        newErrors[`segment_${idx}_start`] = segStartValidation.message;
      }

      const segEndValidation = validateDate(seg.end_date);
      if (!segEndValidation.isValid) {
        newErrors[`segment_${idx}_end`] = segEndValidation.message;
      }

      if (seg.start_date && seg.end_date) {
        // Validar que fecha fin sea posterior a fecha inicio del segmento
        if (!validateDateRange(seg.start_date, seg.end_date)) {
          newErrors[`segment_${idx}_end`] = "Fecha fin debe ser posterior al inicio";
        }

        // Validar que las fechas del segmento estén dentro del período
        if (formData.start_date && formData.end_date) {
          const dateValidation = validatePeriodDates(seg, periodRange);
          if (!dateValidation.isValid) {
            if (dateValidation.startError) {
              newErrors[`segment_${idx}_start`] = dateValidation.startError;
            }
            if (dateValidation.endError) {
              newErrors[`segment_${idx}_end`] = dateValidation.endError;
            }
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Actualizar campos del formulario
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo al editarlo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Actualizar segmento
  const updateSegment = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      segments: prev.segments.map((seg, idx) =>
        idx === index ? { ...seg, [field]: value } : seg
      ),
    }));
    // Limpiar errores del segmento al editarlo
    const errorKey = `segment_${index}_${field}`;
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
            Nuevo Período Académico
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

      <div className="px-6 py-5 space-y-6">
        {/* Datos del Período */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Input
              label="Año Académico"
              type="number"
              value={formData.period_year}
              onChange={(e) => updateField('period_year', parseInt(e.target.value))}
              error={errors.period_year}
              min="2024"
              max="2050"
              disabled={isLoading}
              required
            />
          </div>
        </div>

        {/* Info de validación */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-3">
            <Info size={16} className="text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800">
                <strong>Importante:</strong> Las fechas de los segmentos de matrícula deben estar dentro del rango del período académico (inicio - fin).
              </p>
            </div>
          </div>
        </div>

        {/* Segmentos de Matrícula */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-sm font-bold text-gray-700 mb-4">SEGMENTOS DE MATRÍCULA</h4>
          
          <div className="space-y-4">
            {formData.segments.map((segment, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h5 className="text-sm font-semibold text-gray-700 mb-3">
                  {segment.description}
                </h5>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="Fecha Inicio"
                      type="date"
                      value={segment.start_date}
                      onChange={(e) => updateSegment(idx, 'start_date', e.target.value)}
                      error={errors[`segment_${idx}_start`]}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  
                  <div>
                    <Input
                      label="Fecha Fin"
                      type="date"
                      value={segment.end_date}
                      onChange={(e) => updateSegment(idx, 'end_date', e.target.value)}
                      error={errors[`segment_${idx}_end`]}
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>
                
                <div className="mt-3">
                  <label className="block text-xs font-bold  /70 uppercase mb-1.5">
                    Observación (Predefinida)
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
          {isLoading ? "Guardando..." : "Crear Período"}
        </Button>
      </div>
    </div>
  );
}