import { Modal } from "../../../components/ui/Modal.jsx";
import {
  Play,
  Loader2,
  Code2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Table2,
  Shield,
  Unlock,
  Eye,
  Copy,
  Check,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { highlightSQL, formatSQL } from "../utils/sqlHighlighter";

/**
 * Componente para mostrar SQL con syntax highlighting
 */
const SqlPreview = ({ sql, testParams = {}, detectedParams = [] }) => {
  const [copied, setCopied] = useState(false);
  const [isFormatted, setIsFormatted] = useState(true);

  const displaySql = isFormatted ? formatSQL(sql) : sql;
  const highlightedSql = highlightSQL(displaySql, {
    theme: "light",
    paramValues: testParams,
    emptyText: "Sin query"
  });

  const handleCopy = () => {
    const textToCopy = sql || "";

    // Fallback para navegadores sin soporte de clipboard API o contextos no seguros
    const fallbackCopy = () => {
      const textarea = document.createElement("textarea");
      textarea.value = textToCopy;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Error al copiar:", err);
      }
      document.body.removeChild(textarea);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => fallbackCopy());
    } else {
      fallbackCopy();
    }
  };

  const hasParamValues = detectedParams.length > 0 && Object.values(testParams).some((v) => v);

  return (
    <div className="rounded-lg overflow-hidden border border-gray-300 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">
              SQL Query
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasParamValues && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-md">
              <Eye className="w-3 h-3" />
              <span>Preview</span>
            </div>
          )}

          {/* Toggle formato */}
          <button
            onClick={() => setIsFormatted(!isFormatted)}
            className={`text-xs px-2 py-1 rounded-md transition-colors ${
              isFormatted
                ? "bg-cyan-100 text-cyan-700"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
            title={isFormatted ? "Ver sin formato" : "Formatear SQL"}
          >
            {isFormatted ? "Formatted" : "Raw"}
          </button>

          {/* Botón copiar */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
            title="Copiar SQL"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-600" />
                <span className="text-green-600">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Código SQL */}
      <div className="relative bg-white">
        {/* Números de línea + Código */}
        <div className="flex">
          {/* Números de línea */}
          <div className="flex-shrink-0 py-4 px-3 bg-gray-50 border-r border-gray-200 select-none">
            {(displaySql || "").split("\n").map((_, i) => (
              <div
                key={i}
                className="text-right text-xs font-mono text-gray-400 leading-6 pr-2"
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Código */}
          <pre className="flex-1 p-4 text-sm font-mono leading-6 overflow-x-auto">
            <code dangerouslySetInnerHTML={{ __html: highlightedSql }} />
          </pre>
        </div>

        {/* Footer con info */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
          <span>
            {(displaySql || "").split("\n").length} líneas • {(sql || "").length} caracteres
          </span>
          {detectedParams.length > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              {detectedParams.length} {detectedParams.length === 1 ? "parámetro" : "parámetros"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Modal para probar/ejecutar una consulta SQL
 */
export default function DataSourceTestModal({
  open,
  source,
  onClose,
  testing,
  testResult,
  testParams,
  detectedParams,
  suggestedParams,
  onTestParamsChange,
  onRunTest,
}) {
  const resultsRef = useRef(null);

  // Scroll automático hacia los resultados cuando hay testResult
  useEffect(() => {
    if (testResult && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [testResult]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Play className="w-5 h-5 text-cyan-600" />
          <span>Probar consulta</span>
          <span className="text-gray-400 font-normal">|</span>
          <span className="text-cyan-600 font-normal">{source?.name || ""}</span>
        </div>
      }
      size="xl"
      actions={[
        {
          label: "Cerrar",
          variant: "outline",
          onClick: onClose,
        },
        {
          label: testing ? "Ejecutando..." : "Ejecutar",
          variant: "primary",
          icon: testing ? Loader2 : Play,
          onClick: onRunTest,
          disabled: testing,
        },
      ]}
    >
      <div className="space-y-4">
        {/* Parámetros de prueba */}
        {detectedParams.length > 0 && (
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                <span className="text-amber-600 text-xs font-bold">{detectedParams.length}</span>
              </div>
              <span className="text-sm font-medium text-slate-700">
                {detectedParams.length === 1 ? "Parametro requerido" : "Parametros requeridos"}
              </span>
            </div>
            <div className="grid gap-2">
              {detectedParams.map((param) => {
                const suggested = suggestedParams.find((p) => p.name === param);
                const placeholder = suggested ? `Ej: ${suggested.example}` : `Valor para ${param}`;
                const label = suggested ? suggested.label : param;

                return (
                  <div
                    key={param}
                    className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-2"
                  >
                    <div className="flex items-center gap-2 min-w-[130px]">
                      <code className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded font-mono">
                        :{param}
                      </code>
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder={placeholder}
                        value={testParams[param] || ""}
                        className="w-full rounded border px-3 py-1.5 bg-white outline-none transition text-sm border-slate-300 focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400"
                        onChange={(e) => onTestParamsChange({ ...testParams, [param]: e.target.value })}
                      />
                    </div>
                    {suggested && (
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">{label}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Mensaje cuando no hay parámetros */}
        {detectedParams.length === 0 && !testResult && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 text-sm px-4 py-3 rounded-lg border border-emerald-200">
            <CheckCircle className="w-4 h-4" />
            Esta consulta no requiere parametros
          </div>
        )}

        {/* Query - Vista previa con syntax highlighting */}
        <SqlPreview
          sql={source?.query_sql}
          testParams={testParams}
          detectedParams={detectedParams}
        />

        {/* Resultados */}
        {testResult && (
          <div ref={resultsRef} className="rounded-lg border overflow-hidden">
            <div
              className={`px-4 py-3 flex items-center justify-between ${
                testResult.success
                  ? "bg-emerald-50 border-b border-emerald-200"
                  : "bg-red-50 border-b border-red-200"
              }`}
            >
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="font-medium text-emerald-700">Ejecucion exitosa</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-500" />
                    <span className="font-medium text-red-700">Error en la consulta</span>
                  </>
                )}
              </div>
              {testResult.success && (
                <div className="flex items-center gap-3">
                  {testResult.data?.query_method && (
                    <div
                      className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded ${
                        testResult.data.query_method === "encrypted"
                          ? "bg-violet-100 text-violet-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {testResult.data.query_method === "encrypted" ? (
                        <Shield className="w-3 h-3" />
                      ) : (
                        <Unlock className="w-3 h-3" />
                      )}
                      {testResult.data.query_method === "encrypted" ? "Encriptado" : "Plano"}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                    <Table2 className="w-3 h-3" />
                    {testResult.data?.total || 0}{" "}
                    {(testResult.data?.total || 0) === 1 ? "registro" : "registros"}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white">
              {testResult.success ? (
                testResult.data?.data?.length > 0 ? (
                  <div className="overflow-auto max-h-64">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 sticky top-0">
                        <tr>
                          {testResult.data.columns?.map((col, i) => (
                            <th
                              key={i}
                              className="px-3 py-2 text-left text-xs font-medium text-slate-600 uppercase tracking-wider border-b border-slate-200"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {testResult.data.data.slice(0, 10).map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            {testResult.data.columns?.map((col, j) => (
                              <td
                                key={j}
                                className="px-3 py-2 text-slate-700 whitespace-nowrap max-w-xs truncate"
                              >
                                {row[col] !== null && row[col] !== undefined ? String(row[col]) : "-"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {testResult.data.data.length > 10 && (
                      <div className="px-4 py-2 bg-slate-50 text-xs text-slate-500 text-center border-t">
                        Mostrando 10 de {testResult.data.data.length} registros
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">La consulta no retorno resultados</p>
                    <p className="text-slate-400 text-xs mt-1">
                      Verifica los parametros e intenta nuevamente
                    </p>
                  </div>
                )
              ) : (
                <div className="p-4">
                  <pre className="text-sm text-red-600 bg-red-50 p-3 rounded-lg overflow-auto font-mono">
                    {testResult.error}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Estado de ejecución */}
        {testing && (
          <div className="flex items-center justify-center gap-3 py-6 bg-slate-50 rounded-lg">
            <Loader2 className="w-5 h-5 text-cyan-600 animate-spin" />
            <span className="text-sm text-slate-600">Ejecutando consulta...</span>
          </div>
        )}
      </div>
    </Modal>
  );
}
