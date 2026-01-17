import { useState } from "react";
import { Play, Loader2, X, Database } from "lucide-react";
import api from "../../services/api";

export default function SqlRunner({ onClose }) {
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
      const response = await api.post("/api/data-sources/run-raw", {
        query: query
      });

      if (response.data?.code === 200) {
        setResult({
          data: response.data.data || [],
          columns: response.data.columns || [],
          total: response.data.total || 0
        });
      } else {
        setError(response.data?.error || response.data?.message || "Error al ejecutar");
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2 text-white">
            <Database className="w-5 h-5 text-cyan-400" />
            <span className="font-semibold">SQL Runner</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Query Editor */}
        <div className="p-4 border-b border-gray-700">
          <label className="text-xs text-gray-400 mb-1 block">QUERY SQL</label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SELECT * FROM tabla WHERE ..."
            className="w-full h-32 bg-gray-800 text-green-400 font-mono text-sm p-3 rounded-lg border border-gray-600 focus:border-cyan-500 focus:outline-none resize-none"
            spellCheck={false}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={executeQuery}
              disabled={loading || !query.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Ejecutar
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-auto p-4">
          {error && (
            <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-300">
              {error}
            </div>
          )}

          {result && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-400 text-sm">Ejecución exitosa</span>
                <span className="text-gray-400 text-sm">{result.total} registros</span>
              </div>

              {result.data.length > 0 ? (
                <div className="overflow-auto max-h-[400px] rounded-lg border border-gray-700">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-800 sticky top-0">
                      <tr>
                        {result.columns.map((col, i) => (
                          <th key={i} className="px-3 py-2 text-left text-gray-300 font-medium whitespace-nowrap">
                            {typeof col === 'string' ? col : (col.label || col.key)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {result.data.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-800/50">
                          {result.columns.map((col, j) => {
                            const key = typeof col === 'string' ? col : col.key;
                            return (
                              <td key={j} className="px-3 py-2 text-gray-300 whitespace-nowrap">
                                {row[key] ?? "-"}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">Sin resultados</div>
              )}
            </div>
          )}

          {!error && !result && !loading && (
            <div className="text-gray-500 text-center py-8">
              Escribe una query y presiona Ejecutar
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
