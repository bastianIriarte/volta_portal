// File: src/components/ui/Modal.jsx
import React, { useEffect, useRef } from "react";
import { X, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { Button } from "./Button";

const palette = {
  success: { icon: CheckCircle2, ring: "ring-emerald-200", bg: "bg-emerald-50", text: "text-emerald-700" },
  error: { icon: AlertTriangle, ring: "ring-red-200", bg: "bg-red-50", text: "text-red-700" },
  warn: { icon: AlertTriangle, ring: "ring-amber-200", bg: "bg-amber-50", text: "text-amber-800" },
  info: { icon: Info, ring: "ring-blue-200", bg: "bg-blue-50", text: "text-blue-800" },
  default: { icon: Info, ring: "ring-black/10", bg: "bg-black/[.04]", text: "text-black/80" },
};

export function Modal({
  open,
  onClose,
  title,
  children,
  variant = "default",
  actions = [], // [{label, onClick, variant, autofocus}]
  isHtml = false,
  showIcon = true,
  size = "default" // Nueva prop opcional: "sm", "default", "lg", "xl", "xxl", "full"
}) {
  const ref = useRef(null);
  const p = palette[variant] || palette.default;
  const Icon = p.icon;

  // Definir las clases de ancho según el tamaño
  const sizeClasses = {
    sm: "max-w-sm",
    default: "max-w-lg", // Mantiene el comportamiento original
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    xxl: "max-w-6xl",
    full: "max-w-[90vw]"
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    // autofocus primer botón marcado
    const btn = ref.current?.querySelector("[data-autofocus='true']");
    btn?.focus?.();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0   bg-black/40 backdrop-blur-[2px] animate-fade-in  mt-[-40px]" onClick={onClose} />
      <div
        ref={ref}
        className={`relative w-full  ${sizeClasses[size]} rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 animate-scale-in`}
      >
        <div className="flex items-start gap-3 p-4 border-b border-black/10">
          {showIcon && (
            <div className={`shrink-0 ${p.bg} ${p.text} rounded-xl p-2 ring-1 ${p.ring}`}>
              <Icon className="w-5 h-5" />
            </div>
          )}

          <div className="grow bg-gray-100 p-2">
            <h3 className="text-[15px] font-bold uppercase mt-1">{title}</h3>
          </div>
          <button
            aria-label="Cerrar"
            className="p-2 rounded-md hover:bg-black/5"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className={`px-5 py-4 text-sm leading-relaxed  ${size !== 'default' ? 'max-h-[70vh]  overflow-y-auto ' : ''}`}>
          {isHtml ? (
            <div
              dangerouslySetInnerHTML={{
                __html: children || ""
              }}
            />
          ) :
            (
              children
            )}
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-black/10">
          {actions.map((a, i) => (
            <Button
              key={i}
              variant={a.variant || (variant === "error" || variant === "warn" ? "outline" : "primary")}
              onClick={a.onClick}
              data-autofocus={a.autofocus ? "true" : undefined}
            >
              {a.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Animations (opcionales, usa Tailwind arbitrary) */
const style = document.createElement("style");
style.innerHTML = `
@keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
@keyframes scale-in { from { opacity: 0; transform: translateY(6px) scale(.98) }
                      to   { opacity: 1; transform: translateY(0)   scale(1) } }
.animate-fade-in { animation: fade-in .18s ease-out both }
.animate-scale-in { animation: scale-in .18s ease-out both }
`;
if (typeof document !== "undefined" && !document.getElementById("modal-anims")) {
  style.id = "modal-anims";
  document.head.appendChild(style);
}