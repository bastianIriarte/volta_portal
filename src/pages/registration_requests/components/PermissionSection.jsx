import React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import PermissionCheckbox from "./PermissionCheckbox";

export default function PermissionSection({
  title,
  icon: Icon,
  iconColor,
  colorScheme,
  items,
  selectedPermissions,
  loading,
  isReadOnly,
  onToggle,
  onSelectAll,
  emptyMessage = "No hay items disponibles"
}) {
  const selectedCount = items.filter(item =>
    selectedPermissions.includes(item.id)
  ).length;

  const allSelected = items.length > 0 &&
    items.every(item => selectedPermissions.includes(item.id));

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-md font-medium text-gray-900 flex items-center gap-2">
          <Icon className={`w-5 h-5 ${iconColor}`} />
          {title} ({selectedCount}/{items.length})
        </h4>
        {!isReadOnly && !loading && items.length > 0 && (
          <Button size="sm" variant="secondary" onClick={onSelectAll}>
            {allSelected ? "Quitar todos" : "Seleccionar todos"}
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item) => (
            <PermissionCheckbox
              key={item.id}
              permission={item}
              isSelected={selectedPermissions.includes(item.id)}
              isReadOnly={isReadOnly}
              onToggle={onToggle}
              colorScheme={colorScheme}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <Icon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
}
