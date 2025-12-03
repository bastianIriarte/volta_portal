// components/common/SortableHeader.jsx
import React from "react";
import { ArrowUpDown } from "lucide-react";
import { cls } from "../../utils/format.js";

export default function SortableHeader({ 
  field, 
  label, 
  sortBy, 
  sortDir, 
  onSort, 
  sortable = true,
  className = ""
}) {
  if (!sortable) {
    return (
      <th className={cls("px-3 py-2", className)}>
        {label}
      </th>
    );
  }

  return (
    <th
      className={cls(
        "px-3 py-2 cursor-pointer select-none hover:bg-gray-50 transition-colors",
        className
      )}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        {sortBy === field && (
          <span className="text-xs opacity-60">
            {sortDir === "asc" ? "↑" : "↓"}
          </span>
        )}
        {sortBy !== field && (
          <ArrowUpDown className="w-3.5 h-3.5 opacity-30" />
        )}
      </div>
    </th>
  );
}