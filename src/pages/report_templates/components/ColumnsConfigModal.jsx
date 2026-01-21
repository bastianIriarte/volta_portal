import { useState } from "react";
import {
  X,
  Save,
  Loader2,
  AlertCircle,
  Table2,
  GripVertical,
  Plus,
} from "lucide-react";
import { Modal } from "../../../components/ui/Modal";
import { COLUMN_FORMATS } from "../constants";

export default function ColumnsConfigModal({
  open,
  template,
  availableColumns,
  columnMapping,
  setColumnMapping,
  loading,
  saving,
  onSave,
  onClose,
}) {
  // Drag & Drop state
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Agregar columna a la selección
  const addColumn = (key) => {
    setColumnMapping(prev => prev.map(col =>
      col.key === key ? { ...col, visible: true } : col
    ));
  };

  // Quitar columna de la selección
  const removeColumn = (key) => {
    setColumnMapping(prev => prev.map(col =>
      col.key === key ? { ...col, visible: false } : col
    ));
  };

  const updateColumnLabel = (key, newLabel) => {
    setColumnMapping(prev => prev.map(col =>
      col.key === key ? { ...col, label: newLabel } : col
    ));
  };

  const updateColumnFormat = (key, newFormat) => {
    setColumnMapping(prev => prev.map(col =>
      col.key === key ? { ...col, format: newFormat } : col
    ));
  };

  const selectAllColumns = () => {
    setColumnMapping(prev => prev.map(col => ({ ...col, visible: true })));
  };

  const deselectAllColumns = () => {
    setColumnMapping(prev => prev.map(col => ({ ...col, visible: false })));
  };

  // Columnas disponibles (no seleccionadas) y seleccionadas
  const unselectedColumns = columnMapping.filter(col => !col.visible);
  const selectedColumns = columnMapping.filter(col => col.visible);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = draggedIndex;

    if (dragIndex === null || dragIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    setColumnMapping(prev => {
      const visible = prev.filter(c => c.visible);
      const hidden = prev.filter(c => !c.visible);

      const [draggedItem] = visible.splice(dragIndex, 1);
      visible.splice(dropIndex, 0, draggedItem);

      return [...visible, ...hidden];
    });

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <Modal
      open={open && !!template}
      onClose={onClose}
      title={`Configurar Columnas - ${template?.name || ''}`}
      showIcon={false}
      size="xl"
      actions={[
        {
          label: "Cancelar",
          variant: "outline",
          onClick: onClose,
          icon: X
        },
        {
          label: saving ? "Guardando..." : "Guardar Configuración",
          variant: "primary",
          onClick: onSave,
          disabled: saving || availableColumns.length === 0,
          loading: saving,
          icon: saving ? Loader2 : Save
        }
      ]}
    >
      <div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : availableColumns.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No hay columnas disponibles</p>
            <p className="text-sm text-gray-400 mt-1">
              La fuente de datos no tiene columnas configuradas
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Campos disponibles */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Campos disponibles</span>
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                    {unselectedColumns.length}
                  </span>
                </div>
                <button
                  onClick={selectAllColumns}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Agregar todos
                </button>
              </div>

              {unselectedColumns.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {unselectedColumns.map((col) => (
                    <button
                      key={col.key}
                      onClick={() => addColumn(col.key)}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 transition-all group"
                    >
                      <Plus className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-500" />
                      <span className="font-mono text-[12px]">{col.key}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-2">
                  Todos los campos están seleccionados
                </p>
              )}
            </div>

            {/* Campos seleccionados - tabla con drag & drop */}
            <div className="bg-white rounded-lg border border-emerald-200">
              <div className="flex items-center justify-between p-3 border-b border-emerald-100 bg-emerald-50 rounded-t-lg">
                <div className="flex items-center gap-2">
                  <Table2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-800">Columnas del reporte</span>
                  <span className="text-xs bg-emerald-200 text-emerald-700 px-2 py-0.5 rounded-full">
                    {selectedColumns.length}
                  </span>
                </div>
                {selectedColumns.length > 0 && (
                  <button
                    onClick={deselectAllColumns}
                    className="text-xs text-gray-500 hover:text-red-600 font-medium"
                  >
                    Quitar todos
                  </button>
                )}
              </div>

              {selectedColumns.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {/* Header de la tabla */}
                  <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-gray-50 text-[10px] font-bold text-gray-500 uppercase">
                    <div className="col-span-1"></div>
                    <div className="col-span-1 text-center">#</div>
                    <div className="col-span-3">Key (SQL)</div>
                    <div className="col-span-3">Label (Mostrar)</div>
                    <div className="col-span-3">Formato</div>
                    <div className="col-span-1"></div>
                  </div>

                  {/* Filas arrastrables */}
                  {selectedColumns.map((col, index) => (
                    <div
                      key={col.key}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                      className={`grid grid-cols-12 gap-2 px-3 py-2 items-center transition-all ${
                        dragOverIndex === index
                          ? "bg-emerald-100 border-l-4 border-emerald-500"
                          : "hover:bg-gray-50"
                      } ${draggedIndex === index ? "opacity-50" : ""}`}
                    >
                      {/* Handle de arrastre */}
                      <div className="col-span-1 cursor-grab active:cursor-grabbing text-gray-300 hover:text-emerald-500">
                        <GripVertical className="w-4 h-4" />
                      </div>

                      {/* Número de orden */}
                      <div className="col-span-1 text-center">
                        <span className="text-xs text-gray-400">{index + 1}</span>
                      </div>

                      {/* Key (solo lectura) */}
                      <div className="col-span-3">
                        <span className="text-xs text-gray-600 truncate block" title={col.key}>
                          {col.key}
                        </span>
                      </div>

                      {/* Label (editable) */}
                      <div className="col-span-3">
                        <input
                          type="text"
                          value={col.label}
                          onChange={(e) => updateColumnLabel(col.key, e.target.value)}
                          placeholder={col.key}
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          className="w-full text-xs px-2 py-1 rounded border border-gray-200 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 transition-colors"
                          draggable={false}
                        />
                      </div>

                      {/* Formato (selector) */}
                      <div className="col-span-3">
                        <select
                          value={col.format || "text"}
                          onChange={(e) => updateColumnFormat(col.key, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          className="w-full text-xs px-2 py-1 rounded border border-gray-200 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 transition-colors bg-white"
                          draggable={false}
                        >
                          {COLUMN_FORMATS.map((fmt) => (
                            <option key={fmt.value} value={fmt.value}>
                              {fmt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Botón quitar */}
                      <div className="col-span-1 text-right">
                        <button
                          onClick={() => removeColumn(col.key)}
                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Quitar columna"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Table2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Selecciona campos para agregar columnas</p>
                  <p className="text-xs mt-1">Haz clic en los campos disponibles arriba</p>
                </div>
              )}
            </div>

            {/* Tip */}
            <div className="flex items-center gap-2 text-xs text-gray-500 px-1">
              <GripVertical className="w-3 h-3" />
              <span>Arrastra las filas para cambiar el orden de las columnas</span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
