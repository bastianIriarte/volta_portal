import { useState, useRef, useEffect } from "react";
import { Play, Loader2, Database, XCircle, AlertTriangle, Code2, CheckCircle } from "lucide-react";
import { Modal } from "../../../components/ui/Modal.jsx";
import { runRawQuery } from "../../../services/dataSourceService";
import { highlightSQL } from "../utils/sqlHighlighter";

/**
 * Editor SQL con syntax highlighting para SqlRunner
 */
const SqlEditor = ({ value, onChange, placeholder }) => {
  const textareaRef = useRef(null);
  const highlightRef = useRef(null);

  const lines = (value || "").split("\n");
  const lineCount = lines.length || 1;

  // Sincronizar scroll entre textarea y highlight
  const handleScroll = () => {
    if (highlightRef.current && textareaRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  useEffect(() => {
    handleScroll();
  }, [value]);

  return (
    <div className="rounded-lg overflow-hidden border border-gray-300 shadow-sm">
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
      <div className="relative bg-white min-h-[150px] max-h-[200px]">
        <div className="flex h-full">
          {/* Números de línea */}
          <div className="flex-shrink-0 py-3 px-3 bg-gray-50 border-r border-gray-200 select-none overflow-hidden">
            {Array.from({ length: lineCount }, (_, i) => (
              <div
                key={i}
                className="text-right text-xs font-mono text-gray-400 leading-6 pr-2"
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Container del editor */}
          <div className="relative flex-1 overflow-hidden">
            {/* Capa de highlighting (detrás) */}
            <div
              ref={highlightRef}
              className="absolute inset-0 overflow-auto pointer-events-none"
              aria-hidden="true"
            >
              <pre
                style={{
                  margin: 0,
                  padding: '0.75rem',
                  background: 'transparent',
                  fontSize: '0.875rem',
                  lineHeight: '1.5rem',
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  overflow: 'visible',
                }}
              >
                {value ? (
                  <code dangerouslySetInnerHTML={{ __html: highlightSQL(value, { theme: "light" }) }} />
                ) : (
                  <span className="text-gray-400">{placeholder || ""}</span>
                )}
              </pre>
            </div>

            {/* Textarea transparente (encima) */}
            <textarea
              ref={textareaRef}
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              onScroll={handleScroll}
              className="relative w-full h-full min-h-[150px] max-h-[200px] bg-transparent text-transparent caret-gray-800 resize-none outline-none focus:outline-none focus:ring-0 focus:border-0 border-0"
              style={{
                padding: '0.75rem',
                fontSize: '0.875rem',
                lineHeight: '1.5rem',
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
              placeholder=""
              spellCheck="false"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function SqlRunner({ open, onClose }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const executeQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await runRawQuery(query);

      if (response.success && response.data) {
        setResult(response.data);
      } else {
        setError(response.message || "Error al ejecutar");
      }
    } catch (err) {
      setError(err.message || "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  // Limpiar estado al cerrar
  const handleClose = () => {
    setQuery("");
    setResult(null);
    setError(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-cyan-600" />
          <span>SQL Runner</span>
        </div>
      }
      size="xl"
      actions={[
        {
          label: "Cerrar",
          variant: "outline",
          onClick: handleClose,
        },
        {
          label: loading ? "Ejecutando..." : "Ejecutar",
          variant: "primary",
          icon: loading ? Loader2 : Play,
          onClick: executeQuery,
          disabled: loading || !query.trim(),
        },
      ]}
    >
      <div className="space-y-4">
        {/* Query Editor con syntax highlighting */}
        <div>
          <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1.5">
            Query SQL
          </label>
          <SqlEditor
            value={query}
            onChange={setQuery}
            placeholder="SELECT * FROM tabla WHERE ..."
          />
        </div>

        {/* Error persistente */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Error en la consulta</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="rounded-lg border overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between bg-emerald-50 border-b border-emerald-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span className="font-medium text-emerald-700">Ejecución exitosa</span>
              </div>
              <span className="text-sm text-emerald-600">{result.total} registros</span>
            </div>

            <div className="bg-white">
              {result.data?.length > 0 ? (
                <div className="overflow-auto max-h-64">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        {result.columns?.map((col, i) => (
                          <th
                            key={i}
                            className="px-3 py-2 text-left text-xs font-medium text-slate-600 uppercase tracking-wider border-b border-slate-200"
                          >
                            {typeof col === "string" ? col : col.label || col.key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {result.data.slice(0, 50).map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          {result.columns?.map((col, j) => {
                            const key = typeof col === "string" ? col : col.key;
                            return (
                              <td
                                key={j}
                                className="px-3 py-2 text-slate-700 whitespace-nowrap max-w-xs truncate"
                              >
                                {row[key] !== null && row[key] !== undefined ? String(row[key]) : "-"}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {result.data.length > 50 && (
                    <div className="px-4 py-2 bg-slate-50 text-xs text-slate-500 text-center border-t">
                      Mostrando 50 de {result.data.length} registros
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-slate-500 text-sm">La consulta no retornó resultados</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Estado inicial */}
        {!error && !result && !loading && (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <Database className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Escribe una query y presiona Ejecutar</p>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center gap-3 py-6 bg-slate-50 rounded-lg">
            <Loader2 className="w-5 h-5 text-cyan-600 animate-spin" />
            <span className="text-sm text-slate-600">Ejecutando consulta...</span>
          </div>
        )}
      </div>
    </Modal>
  );
}
