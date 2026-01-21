import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  Type,
  Calendar,
  Hash,
  DollarSign,
  Image,
  Table,
  PenTool,
  Minus,
  Square,
  FileText,
  Building,
  Users,
  MapPin,
  PanelTop,
  PanelBottom,
  Truck,
  Recycle,
  Droplet,
  X,
  HelpCircle,
  Zap,
  Box,
  File,
} from "lucide-react";

// Mapeo de iconos
const iconMap = {
  Type,
  Calendar,
  Hash,
  DollarSign,
  Image,
  Table,
  PenTool,
  Minus,
  Square,
  FileText,
  Building,
  Users,
  MapPin,
  PanelTop,
  PanelBottom,
  LayoutTop: PanelTop,
  LayoutBottom: PanelBottom,
  Truck,
  Recycle,
  Droplet,
};

const getIcon = (iconName) => iconMap[iconName] || FileText;

export default function FieldsPanel({
  config,
  expandedCategories,
  hasInteracted,
  showMobileFields,
  onToggleCategory,
  onDragStart,
  onFieldTap,
  onShowHelp,
  onCloseMobile,
  groupedPredefinedFields,
}) {
  return (
    <div
      className={`
        fixed lg:relative inset-y-0 left-0 z-40
        w-64 lg:w-56 bg-white border-r border-gray-200 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${showMobileFields ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        lg:flex-shrink-0
      `}
    >
      <div className="p-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-sm">Campos</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={onShowHelp}
            className="p-1 text-gray-400 hover:text-sky-600 rounded"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
          <button
            onClick={onCloseMobile}
            className="p-1 text-gray-400 hover:text-gray-600 rounded lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!hasInteracted && (
        <div className="mx-3 mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
          <Zap className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            <span className="hidden lg:inline">Arrastra campos hacia el certificado</span>
            <span className="lg:hidden">Toca un campo para agregarlo</span>
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {/* Elementos de Layout */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => onToggleCategory("layout_elements")}
            className="w-full flex items-center justify-between px-2 py-1.5 bg-gray-50 hover:bg-gray-100 text-left"
          >
            <div className="flex items-center gap-1.5">
              <Box className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-xs font-medium text-gray-700">
                Elementos de Layout
              </span>
              <span className="text-xs text-gray-400 bg-gray-200 px-1 rounded">3</span>
            </div>
            {expandedCategories["layout_elements"] ? (
              <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            )}
          </button>
          {expandedCategories["layout_elements"] && (
            <div className="p-1.5 space-y-1">
              {/* Divisor */}
              <div
                draggable
                onDragStart={(e) =>
                  onDragStart(
                    e,
                    {
                      field_key: `divider_${Date.now()}`,
                      field_label: "Divisor",
                      field_type: "divider",
                      section: null,
                      styles: {},
                    },
                    true
                  )
                }
                onClick={() =>
                  onFieldTap({
                    field_key: `divider_${Date.now()}`,
                    field_label: "Divisor",
                    field_type: "divider",
                    section: null,
                    styles: {},
                  })
                }
                className="flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 rounded cursor-move hover:border-sky-400 hover:bg-sky-50 group"
              >
                <GripVertical className="h-3 w-3 text-gray-300 group-hover:text-sky-400 hidden lg:block" />
                <Minus className="h-3 w-3 text-gray-500 group-hover:text-sky-600" />
                <span className="text-xs text-gray-700 truncate">Divisor</span>
              </div>

              {/* Espacio */}
              <div
                draggable
                onDragStart={(e) =>
                  onDragStart(
                    e,
                    {
                      field_key: `spacer_${Date.now()}`,
                      field_label: "Espacio",
                      field_type: "spacer",
                      section: null,
                      styles: { spacerHeight: "40px" },
                    },
                    true
                  )
                }
                onClick={() =>
                  onFieldTap({
                    field_key: `spacer_${Date.now()}`,
                    field_label: "Espacio",
                    field_type: "spacer",
                    section: null,
                    styles: { spacerHeight: "40px" },
                  })
                }
                className="flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 rounded cursor-move hover:border-sky-400 hover:bg-sky-50 group"
              >
                <GripVertical className="h-3 w-3 text-gray-300 group-hover:text-sky-400 hidden lg:block" />
                <Square className="h-3 w-3 text-gray-500 group-hover:text-sky-600" />
                <span className="text-xs text-gray-700 truncate">Espacio</span>
              </div>

              {/* Salto de Página */}
              <div
                draggable
                onDragStart={(e) =>
                  onDragStart(
                    e,
                    {
                      field_key: `break_page_${Date.now()}`,
                      field_label: "Salto de Página",
                      field_type: "break_page",
                      section: null,
                      styles: {},
                    },
                    true
                  )
                }
                onClick={() =>
                  onFieldTap({
                    field_key: `break_page_${Date.now()}`,
                    field_label: "Salto de Página",
                    field_type: "break_page",
                    section: null,
                    styles: {},
                  })
                }
                className="flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 rounded cursor-move hover:border-sky-400 hover:bg-sky-50 group"
              >
                <GripVertical className="h-3 w-3 text-gray-300 group-hover:text-sky-400 hidden lg:block" />
                <File className="h-3 w-3 text-gray-500 group-hover:text-sky-600" />
                <span className="text-xs text-gray-700 truncate">Salto de Página</span>
              </div>
            </div>
          )}
        </div>

        {/* Campos predefinidos por categoría */}
        {Object.entries(groupedPredefinedFields()).map(([category, categoryFields]) => {
          const catInfo = config?.field_categories?.[category] || {
            label: category,
            icon: "FileText",
          };
          const CatIcon = getIcon(catInfo.icon);
          return (
            <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => onToggleCategory(category)}
                className="w-full flex items-center justify-between px-2 py-1.5 bg-gray-50 hover:bg-gray-100 text-left"
              >
                <div className="flex items-center gap-1.5">
                  <CatIcon className="h-3.5 w-3.5 text-gray-500" />
                  <span className="text-xs font-medium text-gray-700">{catInfo.label}</span>
                  <span className="text-xs text-gray-400 bg-gray-200 px-1 rounded">
                    {categoryFields.length}
                  </span>
                </div>
                {expandedCategories[category] ? (
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                )}
              </button>
              {expandedCategories[category] && (
                <div className="p-1.5 space-y-1">
                  {categoryFields.map((field) => {
                    const FIcon = getIcon(config?.field_types?.[field.field_type]?.icon || "Type");
                    return (
                      <div
                        key={field.field_key}
                        draggable
                        onDragStart={(e) => onDragStart(e, field, true)}
                        onClick={() => onFieldTap(field)}
                        className="flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 rounded cursor-move hover:border-sky-400 hover:bg-sky-50 group"
                      >
                        <GripVertical className="h-3 w-3 text-gray-300 group-hover:text-sky-400 hidden lg:block" />
                        <FIcon className="h-3 w-3 text-gray-500 group-hover:text-sky-600" />
                        <span className="text-xs text-gray-700 truncate">{field.field_label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
