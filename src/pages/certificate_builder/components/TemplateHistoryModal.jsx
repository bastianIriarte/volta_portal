import { History, Clock, User } from "lucide-react";
import { Modal } from "../../../components/ui/Modal";

export default function TemplateHistoryModal({ open, template, logs, loading, onClose }) {
  const getActionColor = (action) => {
    switch (action) {
      case "created":
        return { bg: "bg-green-500", badge: "bg-green-100 text-green-800" };
      case "deleted":
        return { bg: "bg-red-500", badge: "bg-red-100 text-red-800" };
      case "status_changed":
        return { bg: "bg-amber-500", badge: "bg-amber-100 text-amber-800" };
      case "builder_updated":
        return { bg: "bg-violet-500", badge: "bg-violet-100 text-violet-800" };
      default:
        return { bg: "bg-blue-500", badge: "bg-blue-100 text-blue-800" };
    }
  };

  const getLineColor = (line) => {
    if (line.includes("agregado")) return "text-green-700";
    if (line.includes("eliminado")) return "text-red-700";
    if (line.includes("modificado")) return "text-blue-700";
    return "";
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-violet-500" />
          <span>Historial de Cambios</span>
        </div>
      }
      subtitle={template?.name}
      size="xl"
      actions={[{ label: "Cerrar", variant: "outline", onClick: onClose }]}
    >
      <div className="max-h-[60vh] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay registros de cambios</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log, index) => {
              const colors = getActionColor(log.action);
              return (
                <div
                  key={log.id || index}
                  className="relative pl-8 pb-4 border-l-2 border-gray-200 last:border-l-transparent last:pb-0"
                >
                  {/* Dot indicator */}
                  <div
                    className={`absolute left-[-9px] top-0 w-4 h-4 rounded-full border-2 border-white ${colors.bg}`}
                  />

                  <div className="bg-gray-50 rounded-lg p-4">
                    {/* Header del log */}
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors.badge}`}
                        >
                          {log.action_label}
                        </span>
                        {log.field_label && log.field_label !== "builder_fields" && (
                          <span className="text-sm text-gray-600">- {log.field_label}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {log.created_at}
                      </div>
                    </div>

                    {/* Descripcion - soporta multilínea */}
                    {log.description && (
                      <div className="text-sm text-gray-700 mb-2 space-y-1">
                        {log.description.split("\n").map((line, idx) => (
                          <p key={idx} className={getLineColor(line)}>
                            {line}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Cambios de valor */}
                    {(log.old_value || log.new_value) &&
                      log.action !== "created" &&
                      log.action !== "deleted" &&
                      log.action !== "builder_updated" && (
                        <div className="flex flex-wrap gap-2 text-xs">
                          {log.old_value && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded">
                              <span className="font-medium">Antes:</span>
                              <span className="max-w-[200px] truncate">{log.old_value}</span>
                            </span>
                          )}
                          {log.new_value && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded">
                              <span className="font-medium">Después:</span>
                              <span className="max-w-[200px] truncate">{log.new_value}</span>
                            </span>
                          )}
                        </div>
                      )}

                    {/* Usuario */}
                    {log.user && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                        <User className="w-3 h-3" />
                        <span>{log.user.name || log.user.username}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
