import { useState, useEffect, useRef } from "react";
import {
  X,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

const fontSizes = [
  { label: "8", value: "8px" },
  { label: "9", value: "9px" },
  { label: "10", value: "10px" },
  { label: "11", value: "11px" },
  { label: "12", value: "12px" },
  { label: "14", value: "14px" },
  { label: "16", value: "16px" },
  { label: "18", value: "18px" },
  { label: "20", value: "20px" },
  { label: "24", value: "24px" },
  { label: "28", value: "28px" },
  { label: "32", value: "32px" },
  { label: "36", value: "36px" },
  { label: "48", value: "48px" },
];

const columnOptions = [
  { label: "100%", value: "100%" },
  { label: "75%", value: "75%" },
  { label: "66%", value: "66.66%" },
  { label: "50%", value: "50%" },
  { label: "33%", value: "33.33%" },
  { label: "25%", value: "25%" },
];

export default function StylePanel({ field, onUpdate, onClose }) {
  const [styles, setStyles] = useState(field.styles || {});
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleStyleChange = (key, value) => {
    const newStyles = { ...styles, [key]: value };
    setStyles(newStyles);
    onUpdate({ ...field, styles: newStyles });
  };

  const isImageField = field.field_type === "image" || field.field_type === "signature";

  return (
    <div
      ref={panelRef}
      className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-3 w-72"
      style={{ textAlign: "left" }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-700">Estilos Rápidos</span>
        <button onClick={onClose} className="p-0.5 text-gray-400 hover:text-gray-600">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Tamaño de fuente */}
      {!isImageField && (
        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">Tamaño</label>
          <div className="flex gap-1 flex-wrap mb-2">
            {fontSizes.map((size) => (
              <button
                key={size.value}
                onClick={() => handleStyleChange("fontSize", size.value)}
                className={`px-2 py-1 text-xs rounded ${
                  styles.fontSize === size.value
                    ? "bg-sky-100 text-sky-700 border border-sky-300"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1 items-center">
            <input
              type="number"
              min="6"
              max="120"
              value={parseInt(styles.fontSize) || 14}
              onChange={(e) => handleStyleChange("fontSize", `${e.target.value}px`)}
              className="w-16 px-2 py-1 border border-gray-300 rounded text-xs text-center"
            />
            <span className="text-xs text-gray-500">px (personalizado)</span>
          </div>
        </div>
      )}

      {/* Formato de texto */}
      {!isImageField && (
        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">Formato</label>
          <div className="flex gap-1">
            <button
              onClick={() => handleStyleChange("fontWeight", styles.fontWeight === "bold" ? "normal" : "bold")}
              className={`p-1.5 rounded ${styles.fontWeight === "bold" ? "bg-sky-100 text-sky-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleStyleChange("fontStyle", styles.fontStyle === "italic" ? "normal" : "italic")}
              className={`p-1.5 rounded ${styles.fontStyle === "italic" ? "bg-sky-100 text-sky-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleStyleChange("textDecoration", styles.textDecoration === "underline" ? "none" : "underline")}
              className={`p-1.5 rounded ${styles.textDecoration === "underline" ? "bg-sky-100 text-sky-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              <Underline className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Alineación */}
      <div className="mb-3">
        <label className="text-xs text-gray-500 mb-1 block">Alineación</label>
        <div className="flex gap-1">
          <button
            onClick={() => handleStyleChange("textAlign", "left")}
            className={`p-1.5 rounded ${styles.textAlign === "left" || !styles.textAlign ? "bg-sky-100 text-sky-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            <AlignLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleStyleChange("textAlign", "center")}
            className={`p-1.5 rounded ${styles.textAlign === "center" ? "bg-sky-100 text-sky-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            <AlignCenter className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleStyleChange("textAlign", "right")}
            className={`p-1.5 rounded ${styles.textAlign === "right" ? "bg-sky-100 text-sky-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            <AlignRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Color */}
      {!isImageField && (
        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">Color</label>
          <div className="flex gap-1 items-center">
            {["#000000", "#374151", "#0284c7", "#dc2626", "#16a34a", "#ca8a04"].map((color) => (
              <button
                key={color}
                onClick={() => handleStyleChange("color", color)}
                className={`w-6 h-6 rounded border-2 ${styles.color === color ? "border-sky-500" : "border-transparent"}`}
                style={{ backgroundColor: color }}
              />
            ))}
            <input
              type="color"
              value={styles.color || "#000000"}
              onChange={(e) => handleStyleChange("color", e.target.value)}
              className="w-6 h-6 rounded cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Tamaño de imagen */}
      {isImageField && (
        <>
          <div className="mb-2">
            <label className="text-xs text-gray-500 mb-1 block">Ancho imagen</label>
            <div className="flex gap-2 items-center">
              <input
                type="range"
                min="20"
                max="300"
                value={parseInt(styles.maxWidth) || 100}
                onChange={(e) => handleStyleChange("maxWidth", `${e.target.value}px`)}
                className="flex-1"
              />
              <input
                type="text"
                value={styles.maxWidth || "auto"}
                onChange={(e) => handleStyleChange("maxWidth", e.target.value)}
                className="w-16 px-1.5 py-0.5 border border-gray-300 rounded text-xs text-center"
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="text-xs text-gray-500 mb-1 block">Alto imagen</label>
            <div className="flex gap-2 items-center">
              <input
                type="range"
                min="20"
                max="200"
                value={parseInt(styles.maxHeight) || 80}
                onChange={(e) => handleStyleChange("maxHeight", `${e.target.value}px`)}
                className="flex-1"
              />
              <input
                type="text"
                value={styles.maxHeight || "80px"}
                onChange={(e) => handleStyleChange("maxHeight", e.target.value)}
                className="w-16 px-1.5 py-0.5 border border-gray-300 rounded text-xs text-center"
              />
            </div>
          </div>
        </>
      )}

      {/* Ancho del campo */}
      <div className="mb-3">
        <label className="text-xs text-gray-500 mb-1 block">Ancho</label>
        <div className="flex gap-1 flex-wrap">
          {columnOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleStyleChange("width", opt.value)}
              className={`px-2 py-1 text-xs rounded ${
                styles.width === opt.value
                  ? "bg-sky-100 text-sky-700 border border-sky-300"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Espaciado */}
      <div className="mb-2">
        <label className="text-xs text-gray-500 mb-1 block">Espaciado (padding)</label>
        <div className="flex gap-1 items-center">
          <input
            type="number"
            min="0"
            max="100"
            value={parseInt(styles.padding) || 0}
            onChange={(e) => handleStyleChange("padding", `${e.target.value}px`)}
            className="w-16 px-2 py-1 border border-gray-300 rounded text-xs text-center"
          />
          <span className="text-xs text-gray-500">px</span>
        </div>
      </div>

      {/* Margen inferior */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Margen inferior</label>
        <div className="flex gap-1 items-center">
          <input
            type="number"
            min="0"
            max="100"
            value={parseInt(styles.marginBottom) || 8}
            onChange={(e) => handleStyleChange("marginBottom", `${e.target.value}px`)}
            className="w-16 px-2 py-1 border border-gray-300 rounded text-xs text-center"
          />
          <span className="text-xs text-gray-500">px</span>
        </div>
      </div>
    </div>
  );
}
