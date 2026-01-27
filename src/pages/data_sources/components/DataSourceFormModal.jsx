import { Modal } from "../../../components/ui/Modal.jsx";
import { Input } from "../../../components/ui/Input.jsx";
import { Textarea } from "../../../components/ui/Textarea.jsx";
import { XCircle, Code2 } from "lucide-react";
import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";

/**
 * Extrae los parametros de una query SQL (formato :param)
 * @param {string} query - Query SQL
 * @returns {string[]} - Array de nombres de parametros unicos
 */
export const extractQueryParams = (query) => {
  if (!query) return [];
  const matches = query.match(/:([a-zA-Z_][a-zA-Z0-9_]*)/g);
  if (!matches) return [];
  const params = matches.map((m) => m.slice(1));
  return [...new Set(params)];
};


/**
 * Editor SQL simplificado sin overlay (mejor selección de texto)
 */
const SqlEditor = forwardRef(({ value, onChange, error, placeholder }, ref) => {
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  const lines = (value || "").split("\n");
  const lineCount = lines.length || 1;

  // Exponer metodos al componente padre
  useImperativeHandle(ref, () => ({
    insertAtCursor: (text) => {
      const textarea = textareaRef.current;
      if (!textarea) return false;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentValue = textarea.value || "";
      const newValue = currentValue.substring(0, start) + text + currentValue.substring(end);

      // Actualizar el DOM directamente para evitar race condition en clics rapidos
      textarea.value = newValue;
      onChange(newValue);

      // Restaurar la posicion del cursor despues de la insercion
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = start + text.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);

      return true;
    },
    getCurrentValue: () => {
      return textareaRef.current?.value || "";
    },
    focus: () => {
      textareaRef.current?.focus();
    }
  }));

  // Sincronizar scroll de números de línea con textarea
  const handleScroll = () => {
    if (lineNumbersRef.current && textareaRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  return (
    <div className={`rounded-lg overflow-hidden border shadow-sm ${error ? "border-red-500" : "border-gray-300"}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <Code2 className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">
            SQL Query
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>{lineCount} {lineCount === 1 ? "línea" : "líneas"}</span>
          <span>{(value || "").length} caracteres</span>
        </div>
      </div>

      {/* Editor */}
      <div className="relative bg-white min-h-[200px] max-h-[300px]">
        <div className="flex h-full">
          {/* Números de línea - sincronizado con scroll del textarea */}
          <div
            ref={lineNumbersRef}
            className="flex-shrink-0 py-4 px-3 bg-gray-50 border-r border-gray-200 select-none overflow-hidden min-h-[200px] max-h-[300px]"
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <div
                key={i}
                className="text-right text-xs font-mono text-gray-400 pr-2"
                style={{ lineHeight: '1.5rem', height: '1.5rem' }}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Container del editor */}
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              onScroll={handleScroll}
              className="w-full h-full min-h-[200px] max-h-[300px] bg-transparent resize-none outline-none focus:outline-none focus:ring-0 border-0"
              style={{
                padding: '1rem',
                fontSize: '0.875rem',
                lineHeight: '1.5rem',
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                whiteSpace: 'pre',
                overflowWrap: 'normal',
                overflowX: 'auto',
                color: '#1e293b',
              }}
              placeholder={placeholder || "SELECT * FROM tabla WHERE ..."}
              spellCheck="false"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              data-gramm="false"
              data-gramm_editor="false"
              data-enable-grammarly="false"
            />
          </div>
        </div>
      </div>
    </div>
  );
});

/**
 * Modal para crear/editar DataSource
 */
export default function DataSourceFormModal({
  open,
  mode,
  onClose,
  formData,
  formErrors,
  formApiError,
  formTestParams,
  suggestedParams,
  saving,
  onFieldChange,
  onFormDataChange,
  onTestParamsChange,
  onClearApiError,
  onSave,
}) {
  const detectedParams = extractQueryParams(formData.query_sql);
  const sqlEditorRef = useRef(null);

  // Limpiar parámetros de prueba huérfanos cuando cambia la query
  useEffect(() => {
    if (!formTestParams || Object.keys(formTestParams).length === 0) return;

    // Filtrar solo los parámetros que aún existen en la query
    const cleanedParams = {};
    let hasOrphans = false;

    for (const key of Object.keys(formTestParams)) {
      if (detectedParams.includes(key)) {
        cleanedParams[key] = formTestParams[key];
      } else {
        hasOrphans = true;
      }
    }

    // Solo actualizar si hay parámetros huérfanos
    if (hasOrphans) {
      onTestParamsChange(cleanedParams);
    }
  }, [detectedParams.join(",")]); // Dependencia basada en los params detectados

  // Verificar si un parametro ya existe en la query (usando state)
  const paramExistsInQuery = (paramName) => {
    const regex = new RegExp(`:${paramName}\\b`, "g");
    return regex.test(formData.query_sql || "");
  };

  // Verificar si un parametro ya existe usando el valor actual del textarea
  const paramExistsInCurrentValue = (paramName) => {
    if (!sqlEditorRef.current) return paramExistsInQuery(paramName);
    const currentValue = sqlEditorRef.current.getCurrentValue();
    const regex = new RegExp(`:${paramName}\\b`, "g");
    return regex.test(currentValue);
  };

  // Insertar parametro en la posicion del cursor
  const handleInsertParam = (paramName) => {
    // Verificar usando el valor ACTUAL del textarea, no el state (evita race condition)
    if (paramExistsInCurrentValue(paramName)) return;

    const paramText = `:${paramName}`;
    if (sqlEditorRef.current) {
      sqlEditorRef.current.insertAtCursor(paramText);
    } else {
      // Fallback: agregar al final si no hay ref
      onFormDataChange({ ...formData, query_sql: (formData.query_sql || "") + paramText });
    }
  };

  // Eliminar parametro de la query
  const handleRemoveParam = (paramName) => {
    if (!paramExistsInQuery(paramName)) return;

    // Eliminar todas las ocurrencias del parámetro
    const regex = new RegExp(`:${paramName}\\b`, "g");
    const newQuery = (formData.query_sql || "").replace(regex, "");
    onFieldChange("query_sql", newQuery);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Nueva Consulta SQL" : "Editar Consulta SQL"}
      size="lg"
      actions={[
        {
          label: "Cancelar",
          variant: "outline",
          onClick: onClose,
        },
        {
          label: saving ? "Guardando..." : "Guardar",
          variant: "primary",
          onClick: onSave,
          disabled: saving,
        },
      ]}
    >
      <div className="space-y-4">
        {/* Error de API persistente */}
        {formApiError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Error al guardar</p>
                <p className="text-sm text-red-700 mt-1">{formApiError}</p>
              </div>
              <button
                onClick={onClearApiError}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Nombre */}
        <Input
          label="Nombre"
          required
          value={formData.name}
          onChange={(e) => onFieldChange("name", e.target.value)}
          placeholder="Ej: Productos del cliente"
          error={formErrors.name}
        />

        {/* Descripción */}
        <div>
          <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1.5">
            Descripción
          </label>
          <Textarea
            value={formData.description}
            onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
            className="w-full rounded border px-3 py-2 bg-white outline-none transition shadow-sm text-[13px] border-gray-300 focus:ring-2 focus:ring-indigo-200"
            rows={2}
            placeholder="Describe qué datos obtiene esta consulta..."
          />
        </div>

        {/* Query SQL */}
        <div>
          <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1.5">
            Query SQL <span className="text-red-500">*</span>
          </label>
          <SqlEditor
            ref={sqlEditorRef}
            value={formData.query_sql}
            onChange={(value) => onFieldChange("query_sql", value)}
            error={formErrors.query_sql}
            placeholder="SELECT * FROM productos WHERE company_id = :company_id"
          />
          {formErrors.query_sql && (
            <p className="text-xs text-red-500 mt-1">{formErrors.query_sql}</p>
          )}

          {/* Parametros sugeridos */}
          <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 mb-2">
              <strong>Parametros disponibles</strong> (click para insertar/eliminar):
            </p>
            <div className="flex flex-wrap gap-1.5">
              {suggestedParams.map((param) => {
                const isUsed = paramExistsInQuery(param.name);
                return (
                  <button
                    key={param.name}
                    type="button"
                    onClick={() => isUsed ? handleRemoveParam(param.name) : handleInsertParam(param.name)}
                    className={`text-xs font-mono px-2 py-1 rounded border transition-colors cursor-pointer ${isUsed
                        ? "bg-green-50 border-green-300 text-green-600 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                        : "bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600"
                      }`}
                    title={isUsed ? `Click para eliminar :${param.name}` : `${param.label} - Ej: ${param.example}`}
                  >
                    {isUsed && <span className="mr-1">✓</span>}
                    :{param.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Valores de prueba para parametros detectados */}
          {detectedParams.length > 0 && (
            <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-xs text-amber-700 font-medium mb-2">
                Valores de prueba (requeridos para validar la query):
              </p>
              <div className="space-y-2">
                {detectedParams.map((param) => {
                  const suggested = suggestedParams.find((p) => p.name === param);
                  const placeholder = suggested ? `Ej: ${suggested.example}` : `Valor para ${param}`;

                  return (
                    <div key={param} className="flex items-center gap-2">
                      <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded min-w-[120px]">
                        :{param}
                      </span>
                      <input
                        type="text"
                        placeholder={placeholder}
                        value={formTestParams[param] || ""}
                        className="flex-1 rounded border px-3 py-1.5 bg-white outline-none transition shadow-sm text-[13px] border-gray-300 focus:ring-2 focus:ring-amber-200 h-[32px]"
                        onChange={(e) =>
                          onTestParamsChange({ ...formTestParams, [param]: e.target.value })
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
