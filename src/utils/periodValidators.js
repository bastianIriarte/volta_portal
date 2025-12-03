// Utilidades para validar fechas de períodos académicos

/**
 * Valida que las fechas del segmento estén dentro del rango del período académico
 * @param {Object} segment - Segmento con start_date y end_date
 * @param {Object} periodRange - Rango del período con start y end
 * @returns {Object} - { isValid: boolean, startError?: string, endError?: string }
 */
export const validatePeriodDates = (segment, periodRange) => {
  const result = { isValid: true };

  if (!segment.start_date || !segment.end_date || !periodRange.start || !periodRange.end) {
    return result;
  }

  const segmentStart = new Date(segment.start_date);
  const segmentEnd = new Date(segment.end_date);
  const periodStart = new Date(periodRange.start);
  const periodEnd = new Date(periodRange.end);

  // Validar que la fecha de inicio del segmento esté dentro del período
  if (segmentStart < periodStart || segmentStart > periodEnd) {
    result.isValid = false;
    result.startError = `La fecha debe estar entre ${periodRange.start} y ${periodRange.end}`;
  }

  // Validar que la fecha de fin del segmento esté dentro del período
  if (segmentEnd < periodStart || segmentEnd > periodEnd) {
    result.isValid = false;
    result.endError = `La fecha debe estar entre ${periodRange.start} y ${periodRange.end}`;
  }

  return result;
};

/**
 * Valida que una fecha sea válida y esté en formato correcto
 * @param {string} date - Fecha en formato YYYY-MM-DD
 * @returns {Object} - { isValid: boolean, message?: string }
 */
export const validateDate = (date) => {
  if (!date) {
    return { isValid: false, message: "Fecha requerida" };
  }

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, message: "Fecha inválida" };
  }

  return { isValid: true };
};

/**
 * Valida que la fecha de fin sea posterior a la fecha de inicio
 * @param {string} startDate - Fecha de inicio en formato YYYY-MM-DD
 * @param {string} endDate - Fecha de fin en formato YYYY-MM-DD
 * @returns {boolean}
 */
export const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return true;
  return new Date(startDate) < new Date(endDate);
};

/**
 * Valida que un año esté en el rango permitido
 * @param {number} year - Año a validar
 * @param {number} minYear - Año mínimo permitido (default: 2024)
 * @param {number} maxYear - Año máximo permitido (default: 2050)
 * @returns {Object} - { isValid: boolean, message?: string }
 */
export const validateYear = (year, minYear = 2024, maxYear = 2050) => {
  if (!year) {
    return { isValid: false, message: "El año es requerido" };
  }

  if (year < minYear || year > maxYear) {
    return { isValid: false, message: `Año debe estar entre ${minYear} y ${maxYear}` };
  }

  return { isValid: true };
};

/**
 * Formatea una fecha para mostrar en formato legible
 * @param {string} date - Fecha en formato YYYY-MM-DD
 * @returns {string} - Fecha formateada
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return date;
  }
};

/**
 * Verifica si una fecha está dentro de un rango
 * @param {string} date - Fecha a verificar
 * @param {string} rangeStart - Fecha de inicio del rango
 * @param {string} rangeEnd - Fecha de fin del rango
 * @returns {boolean}
 */
export const isDateInRange = (date, rangeStart, rangeEnd) => {
  if (!date || !rangeStart || !rangeEnd) return false;
  
  const dateObj = new Date(date);
  const startObj = new Date(rangeStart);
  const endObj = new Date(rangeEnd);
  
  return dateObj >= startObj && dateObj <= endObj;
};

/**
 * Valida todos los segmentos de un período
 * @param {Array} segments - Array de segmentos con start_date y end_date
 * @param {Object} periodRange - Rango del período con start y end
 * @returns {Object} - Objeto con errores por segmento
 */
export const validateAllSegments = (segments, periodRange) => {
  const errors = {};
  
  segments.forEach((segment, idx) => {
    // Validar fechas requeridas
    const startValidation = validateDate(segment.start_date);
    if (!startValidation.isValid) {
      errors[`segment_${idx}_start`] = startValidation.message;
    }

    const endValidation = validateDate(segment.end_date);
    if (!endValidation.isValid) {
      errors[`segment_${idx}_end`] = endValidation.message;
    }

    // Validar rango del segmento
    if (segment.start_date && segment.end_date) {
      if (!validateDateRange(segment.start_date, segment.end_date)) {
        errors[`segment_${idx}_end`] = "Fecha fin debe ser posterior al inicio";
      }

      // Validar que esté dentro del período
      if (periodRange.start && periodRange.end) {
        const dateValidation = validatePeriodDates(segment, periodRange);
        if (!dateValidation.isValid) {
          if (dateValidation.startError) {
            errors[`segment_${idx}_start`] = dateValidation.startError;
          }
          if (dateValidation.endError) {
            errors[`segment_${idx}_end`] = dateValidation.endError;
          }
        }
      }
    }
  });

  return errors;
};

/**
 * Genera fechas por defecto para un período académico
 * @param {number} year - Año del período
 * @returns {Object} - Objeto con fechas por defecto
 */
export const generateDefaultPeriodDates = (year) => {
  return {
    period_start: `${year}-03-01`,
    period_end: `${year}-12-31`,
    segments: [
      {
        description: 'Matrícula Regular',
        start_date: `${year}-01-15`,
        end_date: `${year}-02-28`,
        observacion: 'Pago de colegiatura anticipada con 2% de descuento si paga en 1 cuota',
      },
      {
        description: 'Matrícula Excepcional',
        start_date: `${year}-03-01`,
        end_date: `${year}-03-31`,
        observacion: 'Recargo de tarifa. Pago de colegiatura excepcional con recargo (%)',
      },
      {
        description: 'Condición Académica Especial (CAE)',
        start_date: `${year}-04-01`,
        end_date: `${year}-04-30`,
        observacion: 'Proceso CAE, sin recargo por colegiatura excepcional',
      },
    ]
  };
};