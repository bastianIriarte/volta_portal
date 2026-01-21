import { Modal } from "../../../components/ui/Modal.jsx";
import { Table2, AlertCircle } from "lucide-react";

/**
 * Modal para mostrar las columnas detectadas de un DataSource
 */
export default function DataSourceColumnsModal({ open, source, onClose }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Table2 className="w-5 h-5 text-indigo-600" />
          <span>Columnas detectadas</span>
          {source && (
            <>
              <span className="text-gray-400 font-normal">|</span>
              <span className="text-indigo-600 font-normal">{source?.name}</span>
            </>
          )}
        </div>
      }
      size="md"
      actions={[
        {
          label: "Cerrar",
          variant: "outline",
          onClick: onClose,
        },
      ]}
    >
      {source && (
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <p className="text-xs text-slate-500 mb-1">Consulta SQL</p>
            <p className="text-sm font-medium text-slate-700">{source.name}</p>
            {source.description && (
              <p className="text-xs text-slate-500 mt-1">{source.description}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-700">
                {source.columns?.length || 0} columnas detectadas
              </p>
            </div>

            {source.columns?.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-80 overflow-y-auto">
                {source.columns.map((col, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                  >
                    <span className="text-xs text-gray-400 font-mono w-5">{index + 1}</span>
                    <span className="text-sm font-mono text-gray-700 truncate" title={col}>
                      {col}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No hay columnas detectadas</p>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
