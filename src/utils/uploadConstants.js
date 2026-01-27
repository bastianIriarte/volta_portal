// utils/uploadConstants.js

import { 
  Loader2,
  CheckCircle,
  AlertCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';


export const UPLOAD_STATUS = {
  PENDING: {
    code: 'PENDING',
    label: 'Pendiente',
    icon: Loader2,
    colorClass: 'bg-gray-100 text-gray-600'
  },
  PROCESSING: {
    code: 'PROCESSING',
    label: 'Procesando',
    icon: Loader2,
    colorClass: 'bg-blue-100 text-blue-600'
  },
  PENDING_CONFIRMATION: {
    code: 'PENDING_CONFIRMATION',
    label: 'Pendiente Confirmación',
    icon: AlertCircle,
    colorClass: 'bg-yellow-100 text-yellow-600'
  },
  COMPLETED: {
    code: 'COMPLETED',
    label: 'Completado',
    icon: CheckCircle,
    colorClass: 'bg-green-100 text-green-600'
  },
  ERROR: {
    code: 'ERROR',
    label: 'Error',
    icon: XCircle,
    colorClass: 'bg-red-100 text-red-600'
  },
  CANCELLED: {
    code: 'CANCELLED',
    label: 'Cancelado',
    icon: XCircle,
    colorClass: 'bg-gray-100 text-gray-600'
  }
};

export const LINE_STATUS = {
  SUCCESS: {
    code: 'SUCCESS',
    label: 'Éxito',
    icon: CheckCircle,
    colorClass: 'bg-green-100 text-green-600'
  },
  ERROR: {
    code: 'ERROR',
    label: 'Error',
    icon: XCircle,
    colorClass: 'bg-red-100 text-red-600'
  },
  WARNING: {
    code: 'WARNING',
    label: 'Advertencia',
    icon: AlertTriangle,
    colorClass: 'bg-yellow-100 text-yellow-600'
  },
  PENDING: {
    code: 'PENDING',
    label: 'Pendiente',
    icon: Loader2,
    colorClass: 'bg-gray-100 text-gray-600'
  }
};