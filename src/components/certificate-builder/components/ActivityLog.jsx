import {
  Plus,
  Trash2,
  Settings,
  X,
  Copy,
  Undo2,
  Redo2,
  History,
  Clock,
  ArrowUpDown,
  Paintbrush,
  CheckCircle2,
} from "lucide-react";

const getActionIcon = (type) => {
  const icons = {
    add: { icon: Plus, color: "text-green-500", bg: "bg-green-50" },
    delete: { icon: Trash2, color: "text-red-500", bg: "bg-red-50" },
    move: { icon: ArrowUpDown, color: "text-blue-500", bg: "bg-blue-50" },
    style: { icon: Paintbrush, color: "text-purple-500", bg: "bg-purple-50" },
    duplicate: { icon: Copy, color: "text-amber-500", bg: "bg-amber-50" },
    config: { icon: Settings, color: "text-gray-500", bg: "bg-gray-50" },
    save: { icon: CheckCircle2, color: "text-sky-500", bg: "bg-sky-50" },
    undo: { icon: Undo2, color: "text-orange-500", bg: "bg-orange-50" },
    redo: { icon: Redo2, color: "text-orange-500", bg: "bg-orange-50" },
  };
  return icons[type] || icons.config;
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export default function ActivityLog({ logs, onClear, isOpen, onToggle }) {
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 p-3 bg-white border border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-shadow z-40"
        title="Ver historial de cambios"
      >
        <History className="h-5 w-5 text-gray-600" />
        {logs.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-sky-500 text-white text-xs rounded-full flex items-center justify-center">
            {logs.length > 99 ? "99+" : logs.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-40 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-gray-600" />
          <span className="font-medium text-sm text-gray-900">Historial</span>
          <span className="text-xs text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded">
            {logs.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {logs.length > 0 && (
            <button
              onClick={onClear}
              className="p-1 text-gray-400 hover:text-red-500 rounded"
              title="Limpiar historial"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={onToggle}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-72 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Sin actividad aún</p>
            <p className="text-xs text-gray-400 mt-1">
              Los cambios aparecerán aquí
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {logs
              .slice()
              .reverse()
              .map((log, index) => {
                const { icon: Icon, color, bg } = getActionIcon(log.type);
                return (
                  <div
                    key={log.id || index}
                    className="px-3 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <div className={`p-1.5 rounded ${bg} flex-shrink-0`}>
                        <Icon className={`h-3 w-3 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 truncate">
                          {log.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatTime(log.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
