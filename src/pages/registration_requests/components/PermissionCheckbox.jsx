import React from "react";
import { CheckSquare, Square } from "lucide-react";

export default function PermissionCheckbox({
  permission,
  isSelected,
  isReadOnly,
  onToggle,
  colorScheme = "cyan" // cyan, amber, emerald
}) {
  const colorClasses = {
    cyan: {
      selected: "bg-cyan-50 border-cyan-300",
      icon: "text-cyan-600"
    },
    amber: {
      selected: "bg-amber-50 border-amber-300",
      icon: "text-amber-600"
    },
    emerald: {
      selected: "bg-emerald-50 border-emerald-300",
      icon: "text-emerald-600"
    }
  };

  const colors = colorClasses[colorScheme] || colorClasses.cyan;

  return (
    <div
      onClick={() => !isReadOnly && onToggle(permission.id)}
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
        isReadOnly ? "cursor-default" : "cursor-pointer"
      } ${
        isSelected
          ? colors.selected
          : isReadOnly
            ? "bg-gray-50 border-gray-200"
            : "bg-white border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="flex-shrink-0">
        {isSelected
          ? <CheckSquare className={`w-5 h-5 ${colors.icon}`} />
          : <Square className="w-5 h-5 text-gray-400" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${isSelected ? "text-gray-900" : "text-gray-700"}`}>
          {permission.name}
        </p>
        <p className="text-xs text-gray-500 truncate">{permission.description}</p>
      </div>
    </div>
  );
}
