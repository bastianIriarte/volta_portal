import { useState, useEffect } from "react";
import { X, RefreshCw, FileDown, FileText, Filter, ChevronRight, ChevronLeft } from "lucide-react";

export default function BuilderPdfPreviewModal({
  show,
  url,
  loading,
  onRefresh,
  onDownload,
  onClose,
  filters = {},
  onFiltersChange,
  template,
}) {
  const [showFilters, setShowFilters] = useState(true);
  const [localFilters, setLocalFilters] = useState({
    date_from: "",
    date_to: "",
    branch_code: "",
    month: "",
    year: new Date().getFullYear().toString(),
  });

  // Sincronizar filtros locales con los del padre
  useEffect(() => {
    if (filters) {
      setLocalFilters((prev) => ({ ...prev, ...filters }));
    }
  }, [filters]);

  // Determinar qué tipo de filtros mostrar según el template
  const searchType = template?.search_type || "range";
  const showBranchFilter = template?.query_branches || false;

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const handleApplyFilters = () => {
    onRefresh();
  };

  // Meses para el selector
  const months = [
    { value: "1", label: "Enero" },
    { value: "2", label: "Febrero" },
    { value: "3", label: "Marzo" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Mayo" },
    { value: "6", label: "Junio" },
    { value: "7", label: "Julio" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ];

  // Años para el selector (últimos 5 años)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-[95vw] h-[90vh] max-w-7xl flex flex-col">
        {/* Header del modal */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-gray-900">Vista Previa del Certificado</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded transition-colors ${
                showFilters
                  ? "bg-sky-100 text-sky-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title={showFilters ? "Ocultar filtros" : "Mostrar filtros"}
            >
              <Filter className="h-3.5 w-3.5" />
              Filtros
              {showFilters ? (
                <ChevronLeft className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          </div>
          <div className="flex items-center gap-2">
            {/* Botón de refrescar */}
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
              title="Refrescar preview"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refrescar
            </button>
            {/* Botón de descargar */}
            <button
              onClick={onDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-sky-600 rounded hover:bg-sky-700"
              title="Descargar PDF"
            >
              <FileDown className="h-4 w-4" />
              Descargar
            </button>
            {/* Botón de cerrar */}
            <button
              onClick={onClose}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
              title="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Contenido del modal */}
        <div className="flex-1 flex overflow-hidden">
          {/* Panel de filtros */}
          {showFilters && (
            <div className="w-72 border-r border-gray-200 bg-gray-50 p-4 overflow-y-auto">
              <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros de Preview
              </h4>

              <div className="space-y-4">
                {/* Filtros según tipo de búsqueda */}
                {searchType === "range" ? (
                  <>
                    {/* Fecha Desde */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Fecha Desde
                      </label>
                      <input
                        type="date"
                        value={localFilters.date_from || ""}
                        onChange={(e) => handleFilterChange("date_from", e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      />
                    </div>

                    {/* Fecha Hasta */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Fecha Hasta
                      </label>
                      <input
                        type="date"
                        value={localFilters.date_to || ""}
                        onChange={(e) => handleFilterChange("date_to", e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Selector de Mes */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Mes
                      </label>
                      <select
                        value={localFilters.month || ""}
                        onChange={(e) => handleFilterChange("month", e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      >
                        <option value="">Seleccionar mes</option>
                        {months.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Selector de Año */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Año
                      </label>
                      <select
                        value={localFilters.year || ""}
                        onChange={(e) => handleFilterChange("year", e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      >
                        {years.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {/* Filtro de Sucursal (si aplica) */}
                {showBranchFilter && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Sucursal
                    </label>
                    <input
                      type="text"
                      value={localFilters.branch_code || ""}
                      onChange={(e) => handleFilterChange("branch_code", e.target.value)}
                      placeholder="Código de sucursal"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                )}

                {/* Botón aplicar filtros */}
                <button
                  onClick={handleApplyFilters}
                  disabled={loading}
                  className="w-full mt-4 px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Generando..." : "Aplicar Filtros"}
                </button>

                {/* Info */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <strong>Tip:</strong> Los filtros permiten probar cómo se verá el certificado
                    con diferentes datos. Las variables como {"{filter.date_from}"} se reemplazarán
                    con los valores seleccionados.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Área del PDF */}
          <div className="flex-1 p-4 bg-gray-100 overflow-hidden">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
                  <span className="text-gray-600">Generando PDF...</span>
                </div>
              </div>
            ) : url ? (
              <iframe
                src={url}
                className="w-full h-full rounded border border-gray-300"
                title="Vista previa del certificado"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No se pudo cargar el preview</p>
                  <button
                    onClick={onRefresh}
                    className="mt-3 px-4 py-2 text-sm text-sky-600 hover:text-sky-700 hover:underline"
                  >
                    Intentar de nuevo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
