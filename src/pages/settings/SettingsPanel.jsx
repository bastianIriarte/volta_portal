// src/pages/settings/SettingsPanel.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Settings, Globe, CreditCard, Mail, Database, Shield, Palette, ArrowRight, ClipboardEdit, Calendar, File, Cog, Server, Network } from "lucide-react";

export default function SettingsPanel() {
  const navigate = useNavigate();
  const location = useLocation();

  // Configuraciones disponibles
  const settingsOptions = [
    {
      id: 'connection_service_layer',
      title: 'Conexión Service Layer',
      description: 'Configuración de conexión a SAP Service Layer',
      icon: Server,
      color: 'blue',
      path: '/dashboard/settings/connection-service-layer',
      details: ['Estado', 'Endpoint', 'Base de datos', 'Usuario', 'Contraseña']
    },
    {
      id: 'connection_agent',
      title: 'Conexión Agent',
      description: 'Configuración de conexión al agente de base de datos',
      icon: Network,
      color: 'green',
      path: '/dashboard/settings/connection-agent',
      details: ['Nombre', 'Endpoint', 'Driver (sqlsrv/hana)', 'Host', 'Puerto', 'Base de datos', 'Usuario']
    },

  ];

  // Obtener clases de color para cada opción
  const getColorClasses = (color, disabled = false) => {
    if (disabled) {
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-400',
        border: 'border-gray-200',
        hover: 'hover:bg-gray-50'
      };
    }

    const colorMap = {
      gray: {
        bg: 'bg-gray-50',
        text: 'text-gray-600',
        border: 'border-gray-200',
        hover: 'hover:bg-gray-100'
      },
      yellow: {
        bg: 'bg-yellow-50',
        text: 'text-yellow-600',
        border: 'border-yellow-200',
        hover: 'hover:bg-yellow-100'
      },
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-200',
        hover: 'hover:bg-blue-100'
      },
      green: {
        bg: 'bg-green-50',
        text: 'text-green-600',
        border: 'border-green-200',
        hover: 'hover:bg-green-100'
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        border: 'border-purple-200',
        hover: 'hover:bg-purple-100'
      },
      orange: {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        border: 'border-orange-200',
        hover: 'hover:bg-orange-100'
      },
      red: {
        bg: 'bg-red-50',
        text: 'text-red-600',
        border: 'border-red-200',
        hover: 'hover:bg-red-100'
      },
      pink: {
        bg: 'bg-pink-50',
        text: 'text-pink-600',
        border: 'border-pink-200',
        hover: 'hover:bg-pink-100'
      }
    };

    return colorMap[color] || colorMap.blue;
  };

  const handleSettingClick = (setting) => {
    if (setting.disabled) {
      return;
    }
    navigate(setting.path);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Settings size={32} className="text-black" />
        <div>
          <h2 className="text-2xl font-bold text-black">Configuraciones</h2>
          <p className="text-gray-600">Gestiona todas las configuraciones del sistema</p>
        </div>
      </div>

      {/* Grid de configuraciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsOptions.map((setting) => {
          const colors = getColorClasses(setting.color, setting.disabled);
          const IconComponent = setting.icon;

          return (
            <div
              key={setting.id}
              onClick={() => handleSettingClick(setting)}
              className={`
                relative p-6 rounded-lg border-2 transition-all duration-200
                ${colors.bg} ${colors.border} ${setting.disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${colors.hover}
                ${!setting.disabled ? 'transform hover:scale-105 hover:shadow-lg' : ''}
              `}
            >
              {/* Indicador de disponibilidad */}
              {setting.disabled && (
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
                    Próximamente
                  </span>
                </div>
              )}

              {/* Icono */}
              <div className={`mb-4 ${colors.text}`}>
                <IconComponent size={40} />
              </div>

              {/* Contenido */}
              <div className="space-y-3">
                <h3 className={`text-lg font-semibold ${setting.disabled ? 'text-gray-500' : 'text-gray-900'}`}>
                  {setting.title}
                </h3>

                <p className={`text-sm ${setting.disabled ? 'text-gray-400' : 'text-gray-600'}`}>
                  {setting.description}
                </p>

                {/* Detalles */}
                {setting.details && (
                  <ul className="space-y-1">
                    {setting.details.slice(0, 3).map((detail, index) => (
                      <li
                        key={index}
                        className={`text-xs flex items-center gap-2 ${setting.disabled ? 'text-gray-400' : 'text-gray-500'}`}
                      >
                        <span className="w-1 h-1 bg-current rounded-full"></span>
                        {detail}
                      </li>
                    ))}
                    {setting.details.length > 3 && (
                      <li className={`text-xs ${setting.disabled ? 'text-gray-400' : 'text-gray-500'}`}>
                        + {setting.details.length - 3} más...
                      </li>
                    )}
                  </ul>
                )}

                {/* Botón de acción */}
                {!setting.disabled && (
                  <div className="flex items-center justify-between pt-2 border-t border-current border-opacity-20">
                    <span className={`text-sm font-medium ${colors.text}`}>
                      Configurar
                    </span>
                    <ArrowRight size={16} className={colors.text} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Settings size={20} className="text-blue-600 mt-1" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Información Importante</h4>
            <div className="text-sm text-blue-800 space-y-2">
              <p>
                • Las configuraciones marcadas como "Próximamente" estarán disponibles en futuras actualizaciones.
              </p>
              <p>
                • Los cambios en la configuración general y de Webpay se aplican inmediatamente.
              </p>
              <p>
                • Se recomienda realizar un respaldo antes de modificar configuraciones críticas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}