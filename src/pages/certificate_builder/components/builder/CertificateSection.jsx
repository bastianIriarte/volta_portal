import { useState } from "react";
import {
  GripVertical,
  Plus,
  Trash2,
  Settings,
  Image,
  Palette,
  Copy,
} from "lucide-react";
import StylePanel from "./StylePanel";

export default function CertificateSection({
  section,
  label,
  fields,
  dragOverSection,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemoveField,
  onConfigureField,
  onDuplicateField,
  onReorder,
  onQuickStyleUpdate,
  config,
  resolveValue,
  simulatedData,
  template,
  isMain,
  stylePanel,
  setStylePanel,
}) {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [hoveredField, setHoveredField] = useState(null);
  const isDragOver = dragOverSection === section;

  const handleFieldDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleFieldDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      onReorder(section, draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleFieldDragEnd = () => setDraggedIndex(null);

  const renderFieldValue = (field) => {
    const value = resolveValue(field.data_source || field.field_key);

    switch (field.field_type) {
      case "image": {
        const uploadedImage = field.default_value?.startsWith("http")
          ? field.default_value
          : null;
        const imageUrl = uploadedImage || value || field.default_value;
        const imageStyles = {
          maxWidth: field.styles?.maxWidth || "auto",
          maxHeight: field.styles?.maxHeight || "80px",
          objectFit: field.styles?.objectFit || "contain",
        };
        return imageUrl ? (
          <img src={imageUrl} alt={field.field_label} style={imageStyles} />
        ) : (
          <div className="w-24 h-16 bg-gray-100 rounded flex items-center justify-center border-2 border-dashed border-gray-300">
            <Image className="h-8 w-8 text-gray-300" />
          </div>
        );
      }

      case "signature": {
        const uploadedSig = field.default_value?.startsWith("http")
          ? field.default_value
          : null;
        const signatureImage =
          uploadedSig || field.default_value || resolveValue("signature.image");
        const sigStyles = {
          maxWidth: field.styles?.maxWidth || "auto",
          maxHeight: field.styles?.maxHeight || "64px",
          objectFit: field.styles?.objectFit || "contain",
        };
        return (
          <div className="text-center py-4">
            {signatureImage ? (
              <img
                src={signatureImage}
                alt="Firma"
                className="mx-auto mb-2"
                style={sigStyles}
              />
            ) : (
              <div className="w-40 h-20 border-b-2 border-gray-400 mx-auto mb-2"></div>
            )}
            <p className="font-medium">
              {resolveValue("signature.name") || "Nombre Firmante"}
            </p>
            <p className="text-sm text-gray-500">
              {resolveValue("signature.position") || "Cargo"}
            </p>
          </div>
        );
      }

      case "table": {
        const hasProcessor = !!field.processor_id;
        return (
          <div className="py-3">
            <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50/50 py-8 flex flex-col items-center justify-center">
              <div className="w-14 h-14 bg-sky-100 rounded-xl flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18M3 6h18M3 18h18M8 6v12M16 6v12" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-600">
                {hasProcessor && field.processor_name
                  ? `Tabla: ${field.processor_name}`
                  : field.field_label || "Tabla de datos"}
              </span>
              {!hasProcessor && (
                <span className="mt-1 text-xs text-gray-400">
                  Sin procesador
                </span>
              )}
            </div>
          </div>
        );
      }

      case "paragraph": {
        let text = field.default_value || value || "Sin texto (no visible)";
        text = text.replace(
          /\{([^}]+)\}/g,
          (_, key) => resolveValue(key) || `{${key}}`
        );
        return (
          <p
            className="leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: text }}
          />
        );
      }

      case "date":
        return <span>{value || new Date().toLocaleDateString("es-CL")}</span>;

      case "divider":
        return <hr className="border-t-2 border-gray-300 my-2" />;

      case "spacer":
        return (
          <div
            className="bg-gray-100 border border-dashed border-gray-300 rounded"
            style={{ height: field.styles?.spacerHeight || "20px" }}
          />
        );

      case "break_page":
        return (
          <div className="border-t-2 border-dashed border-sky-300 my-4 relative">
            <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-white px-2 text-xs text-sky-500 font-medium">
              Salto de Página
            </span>
          </div>
        );

      default:
        return <span>{value || field.default_value || field.field_label}</span>;
    }
  };

  const sectionBg = {
    header: "bg-gradient-to-b from-gray-50 to-white border-b",
    body: "bg-white",
    footer: "bg-gradient-to-t from-gray-50 to-white border-t",
  };

  return (
    <div
      className={`relative transition-all ${sectionBg[section]} ${
        isMain ? "flex-1 min-h-[450px]" : "min-h-[100px] flex-shrink-0"
      } ${isDragOver ? "ring-2 ring-sky-400 ring-inset" : ""}`}
      onDragOver={(e) => onDragOver(e, section)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, section)}
    >
      {(isDragOver || fields.length === 0) && (
        <div
          className={`absolute inset-0 flex items-center justify-center pointer-events-none ${
            isDragOver ? "bg-sky-50/80" : ""
          }`}
        >
          <div
            className={`flex flex-col items-center gap-2 ${
              isDragOver ? "text-sky-600" : "text-gray-300"
            }`}
          >
            <Plus className="h-8 w-8" />
            <span className="text-sm font-medium">
              {isDragOver ? "Suelta aquí" : `Arrastra campos al ${label}`}
            </span>
          </div>
        </div>
      )}

      <div
        className={`px-8 pt-4 ${fields.length === 0 ? "opacity-0" : ""}`}
        style={{ minHeight: isMain ? "400px" : "80px", display: "flex", flexWrap: "wrap", alignItems: "flex-start" }}
      >
        {fields.map((field, index) => {
          const isHovered = hoveredField === field.id;

          const fieldStyles = {
            width: field.styles?.width || "100%",
            fontSize: field.styles?.fontSize || "",
            ...field.styles,
          };

          return (
            <div
              key={field.id}
              draggable
              onDragStart={(e) => handleFieldDragStart(e, index)}
              onDragOver={(e) => handleFieldDragOver(e, index)}
              onDragEnd={handleFieldDragEnd}
              onMouseEnter={() => setHoveredField(field.id)}
              onMouseLeave={() => setHoveredField(null)}
              className={`relative group ${draggedIndex === index ? "opacity-50" : ""}`}
              style={fieldStyles}
            >
              {/* Controles */}
              {isHovered && (
                <div className="absolute -top-3 right-0 flex gap-0.5 z-20 bg-white rounded-lg shadow-lg border border-gray-200 p-0.5">
                  <button
                    onClick={() => setStylePanel({ show: true, fieldId: field.id })}
                    className="p-1 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded"
                    title="Estilos rápidos"
                  >
                    <Palette className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onConfigureField(field)}
                    className="p-1 text-gray-500 hover:text-sky-600 hover:bg-sky-50 rounded"
                    title="Configurar"
                  >
                    <Settings className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onDuplicateField(field)}
                    className="p-1 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
                    title="Duplicar"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onRemoveField(field.id)}
                    className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Eliminar"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Handle de arrastre */}
              {isHovered && (
                <div className="absolute -left-5 top-1/2 -translate-y-1/2 p-1 bg-white border border-gray-200 rounded shadow-sm cursor-move z-20">
                  <GripVertical className="h-3 w-3 text-gray-400" />
                </div>
              )}

              {/* Panel de estilos */}
              {stylePanel.show && stylePanel.fieldId === field.id && (
                <StylePanel
                  field={field}
                  onUpdate={onQuickStyleUpdate}
                  onClose={() => setStylePanel({ show: false, fieldId: null })}
                />
              )}

              {/* Contenido */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onConfigureField(field);
                }}
                className={`transition-all cursor-pointer ${
                  isHovered ? "ring-2 ring-sky-300 ring-offset-1 rounded" : ""
                }`}
                style={{
                  fontSize: field.styles?.fontSize || "12px",
                  ...(["image", "signature"].includes(field.field_type)
                    ? {
                        display: "flex",
                        justifyContent:
                          field.styles?.textAlign === "center"
                            ? "center"
                            : field.styles?.textAlign === "right"
                            ? "flex-end"
                            : "flex-start",
                        width: "100%",
                      }
                    : {
                        textAlign: field.styles?.textAlign || "left",
                        display: "block",
                        width: "100%",
                      }),
                }}
              >
                {![
                  "image",
                  "signature",
                  "table",
                  "paragraph",
                  "divider",
                  "spacer",
                  "break_page",
                ].includes(field.field_type) &&
                  field.styles?.showLabel === true && (
                    <p
                      className="text-xs mb-0.5"
                      style={{ color: field.styles?.labelColor || "#6b7280" }}
                    >
                      {field.field_label}
                    </p>
                  )}
                {renderFieldValue(field)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
