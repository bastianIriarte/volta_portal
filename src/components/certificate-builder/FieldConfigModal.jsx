import React, { useState } from "react";
import { X, Plus, Trash2, GripVertical } from "lucide-react";

/**
 * Modal para configurar las propiedades de un campo
 */
export default function FieldConfigModal({ field, config, onSave, onClose }) {
  const [editedField, setEditedField] = useState({ ...field });

  const handleChange = (key, value) => {
    setEditedField((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleStyleChange = (key, value) => {
    setEditedField((prev) => ({
      ...prev,
      styles: {
        ...(prev.styles || {}),
        [key]: value,
      },
    }));
  };

  const handleTableColumnChange = (index, key, value) => {
    const columns = [...(editedField.table_columns || [])];
    columns[index] = { ...columns[index], [key]: value };
    setEditedField((prev) => ({
      ...prev,
      table_columns: columns,
    }));
  };

  const addTableColumn = () => {
    const columns = [...(editedField.table_columns || [])];
    columns.push({
      key: `column_${columns.length + 1}`,
      label: `Columna ${columns.length + 1}`,
      width: "auto",
    });
    setEditedField((prev) => ({
      ...prev,
      table_columns: columns,
    }));
  };

  const removeTableColumn = (index) => {
    const columns = [...(editedField.table_columns || [])];
    columns.splice(index, 1);
    setEditedField((prev) => ({
      ...prev,
      table_columns: columns,
    }));
  };

  const handleSave = () => {
    onSave(editedField);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Configurar Campo
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-5">
          {/* Información básica */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 border-b pb-2">
              Información Básica
            </h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Etiqueta
              </label>
              <input
                type="text"
                value={editedField.field_label || ""}
                onChange={(e) => handleChange("field_label", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clave del Campo
              </label>
              <input
                type="text"
                value={editedField.field_key || ""}
                onChange={(e) => handleChange("field_key", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fuente de Datos
              </label>
              <input
                type="text"
                value={editedField.data_source || ""}
                onChange={(e) => handleChange("data_source", e.target.value)}
                placeholder="ej: client.name, certificate.date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500 font-mono text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Ruta para obtener el valor desde los datos del certificado
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor por Defecto
              </label>
              <textarea
                value={editedField.default_value || ""}
                onChange={(e) => handleChange("default_value", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editedField.is_required || false}
                  onChange={(e) => handleChange("is_required", e.target.checked)}
                  className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                />
                <span className="text-sm text-gray-700">Requerido</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editedField.is_visible !== false}
                  onChange={(e) => handleChange("is_visible", e.target.checked)}
                  className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                />
                <span className="text-sm text-gray-700">Visible</span>
              </label>
            </div>
          </div>

          {/* Estilos */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 border-b pb-2">
              Estilos
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tamaño de Fuente
                </label>
                <select
                  value={editedField.styles?.fontSize || "14px"}
                  onChange={(e) => handleStyleChange("fontSize", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                >
                  <option value="11px">Pequeño (11px)</option>
                  <option value="13px">Normal (13px)</option>
                  <option value="14px">Mediano (14px)</option>
                  <option value="16px">Grande (16px)</option>
                  <option value="18px">Título (18px)</option>
                  <option value="24px">Encabezado (24px)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Peso de Fuente
                </label>
                <select
                  value={editedField.styles?.fontWeight || "normal"}
                  onChange={(e) => handleStyleChange("fontWeight", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                >
                  <option value="normal">Normal</option>
                  <option value="medium">Medio</option>
                  <option value="semibold">Seminegrita</option>
                  <option value="bold">Negrita</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alineación
                </label>
                <select
                  value={editedField.styles?.alignment || "left"}
                  onChange={(e) => handleStyleChange("alignment", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                >
                  <option value="left">Izquierda</option>
                  <option value="center">Centro</option>
                  <option value="right">Derecha</option>
                  <option value="justify">Justificado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  value={editedField.styles?.color || "#333333"}
                  onChange={(e) => handleStyleChange("color", e.target.value)}
                  className="w-full h-10 px-1 py-1 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editedField.styles?.showLabel === true}
                onChange={(e) => handleStyleChange("showLabel", e.target.checked)}
                className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
              />
              <span className="text-sm text-gray-700">Mostrar etiqueta</span>
            </label>

            {/* Color de etiqueta - solo cuando showLabel está habilitado */}
            {editedField.styles?.showLabel && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">Color etiqueta</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={editedField.styles?.labelColor || "#6b7280"}
                    onChange={(e) => handleStyleChange("labelColor", e.target.value)}
                    className="w-10 h-10 px-1 py-1 border border-gray-300 rounded-md cursor-pointer"
                  />
                  <input
                    type="text"
                    value={editedField.styles?.labelColor || "#6b7280"}
                    onChange={(e) => handleStyleChange("labelColor", e.target.value)}
                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Configuración de tabla (solo para campos tipo tabla) */}
          {editedField.field_type === "table" && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 border-b pb-2">
                Columnas de la Tabla
              </h4>

              <div className="space-y-2">
                {(editedField.table_columns || []).map((col, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded-md"
                  >
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={col.key || ""}
                      onChange={(e) =>
                        handleTableColumnChange(index, "key", e.target.value)
                      }
                      placeholder="Clave"
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={col.label || ""}
                      onChange={(e) =>
                        handleTableColumnChange(index, "label", e.target.value)
                      }
                      placeholder="Etiqueta"
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={col.width || ""}
                      onChange={(e) =>
                        handleTableColumnChange(index, "width", e.target.value)
                      }
                      placeholder="Ancho"
                      className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                    <button
                      onClick={() => removeTableColumn(index)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={addTableColumn}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-sky-600 hover:bg-sky-50 rounded-md"
              >
                <Plus className="h-4 w-4" />
                Agregar Columna
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm text-white bg-sky-600 rounded-md hover:bg-sky-700"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}
