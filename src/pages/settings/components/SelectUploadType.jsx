// components/SelectUploadType.jsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { handleSnackbar } from '../../../utils/messageHelpers';
import * as LucideIcons from 'lucide-react';
import { getUploadTypes } from '../../../services/excelUploadService';

export default function SelectUploadType({ onSelect, onBack }) {
  const [uploadTypes, setUploadTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUploadTypes();
  }, []);

  const fetchUploadTypes = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getUploadTypes();

      if (!response.success) {
        throw new Error(response.message || 'Error al cargar tipos de carga');
      }

      setUploadTypes(response.data || []);
    } catch (err) {
      console.error('❌ Error al obtener tipos de carga:', err);
      setError(err.message || 'Error al cargar los tipos de carga');
      handleSnackbar('Error al cargar tipos de carga', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener el icono dinámicamente desde lucide-react
  const getIcon = (iconName) => {
    if (!iconName) return LucideIcons.FileSpreadsheet;
    
    // Convertir el nombre del icono a PascalCase si viene en snake_case o kebab-case
    const iconKey = iconName
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
    
    return LucideIcons[iconKey] || LucideIcons.FileSpreadsheet;
  };

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2   hover: transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al listado
      </button>

      <Card className="p-6">
        <h3 className="text-xl font-semibold   mb-6">
          Selecciona el tipo de carga
        </h3>

        {/* Estado de carga */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8   animate-spin mb-3" />
            <p className="text-sm text-gray-600">Cargando tipos de carga...</p>
          </div>
        )}

        {/* Estado de error */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-700 mb-4">⚠️ {error}</p>
              <button
                onClick={fetchUploadTypes}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Grid de tipos de carga */}
        {!loading && !error && uploadTypes.length > 0 && (
          <div className="grid md:grid-cols-3 gap-4">
            {uploadTypes.map(type => {
              const Icon = getIcon(type.icon);
              
              return (
                <button
                  key={type.code}
                  onClick={() => onSelect(type)}
                  disabled={!type.active}
                  className={`p-6 border-2 border-gray-200 rounded-xl transition-all group relative ${
                    type.active 
                      ? ' hover:shadow-lg cursor-pointer' 
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  {/* Badge si está deshabilitado */}
                  {!type.active && (
                    <span className="absolute top-2 right-2 bg-gray-500 text-white text-xs px-2 py-1 rounded">
                      No disponible
                    </span>
                  )}

                  {/* Icono con color dinámico desde la BD */}
                  <div className={`w-16 h-16 rounded-xl ${type.color_class || 'bg-gray-100 text-gray-600'} flex items-center justify-center mx-auto mb-4 ${
                    type.active ? 'group-hover:scale-110' : ''
                  } transition-transform`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  
                  {/* Nombre del tipo */}
                  <h4 className="font-semibold   mb-2">
                    {type.name}
                  </h4>
                  
                  {/* Descripción */}
                  {type.description && (
                    <p className="text-sm text-gray-600">
                      {type.description}
                    </p>
                  )}

                  {/* Información de columnas requeridas */}
                  {type.required_columns && type.required_columns.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        {type.required_columns.length} columnas requeridas
                      </p>
                    </div>
                  )}

                  {/* Indicador de plantilla disponible */}
                  {type.template_file && (
                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        <LucideIcons.FileDown className="w-3 h-3" />
                        Plantilla disponible
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Estado vacío */}
        {!loading && !error && uploadTypes.length === 0 && (
          <div className="text-center py-12">
            <LucideIcons.FileSpreadsheet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No hay tipos de carga disponibles</p>
            <p className="text-sm text-gray-500">
              Contacta al administrador para configurar los tipos de carga
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}