import React, { forwardRef } from "react";

function cls(...xs) {
  return xs.filter(Boolean).join(" ");
}

/**
 * Props extra soportadas:
 * - id, label, helper, error, success, required, variant ("default" | "elegant")
 * - className para el <input/>
 * - wrapperClass para el contenedor
 * - maxLength: número máximo de caracteres permitidos
 * - showCounter: boolean para mostrar/ocultar contador de caracteres
 */
export const Input = forwardRef(function Input(
  {
    id,
    label,
    helper,
    error,
    success,
    required,
    variant = "default",
    className,
    wrapperClass,
    maxLength,
    showCounter = false,
    value = "",
    height = "h-[37px]",
    ...props
  },
  ref
) {
  const describedBy = [];
  if (error) describedBy.push(`${id}-err`);
  if (!error && helper) describedBy.push(`${id}-help`);

  const base =
    "w-full rounded border px-3 py-2 bg-white outline-none transition shadow-sm text-[13px]";
  const elegant = "bg-white/70 backdrop-blur-sm";
  const ok = "border-emerald-300 focus:ring-2 focus:ring-emerald-200";
  const bad = "border-red-300 focus:ring-2 focus:ring-red-200";
  const norm = "border-gray-300 focus:ring-2 focus:ring-indigo-200";

  const inputClass = cls(
    base,
    variant === "elegant" && elegant,
    error ? bad : success ? ok : norm,
    props.disabled && "bg-neutral-400/10 text-gray-600 cursor-not-allowed border-gray-200",
    props.readOnly && "bg-neutral-300/20 text-gray-600 cursor-not-allowed border-gray-200",
    className
  );

  // Calcular caracteres actuales para el contador
  const currentLength = String(value || "").length;
  const isNearLimit = maxLength && currentLength >= maxLength * 0.8;
  const isAtLimit = maxLength && currentLength >= maxLength;

  return (
    <div className={cls("space-y-1.5", wrapperClass)}>
      {label && (
        <div className="flex items-center justify-between">
          <label
            htmlFor={id}
            className="block text-[11px] font-bold text-neutral-600 uppercase"
          >
            {label}{" "}
            {required && (
              <span className="text-red-500" aria-hidden="true">
                *
              </span>
            )}
          </label>

          {/* Contador de caracteres en el label */}
          {maxLength && showCounter && (
            <span
              className={cls(
                "text-xs font-medium",
                isAtLimit
                  ? "text-red-600"
                  : isNearLimit
                    ? "text-amber-600"
                    : "text-gray-500"
              )}
            >
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      )}

      <div className="relative">
        <input
          id={id}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={describedBy.join(" ") || undefined}
          className={`${inputClass} ${height}`}
          value={value}
          maxLength={maxLength}
          {...props}
        />

        {/* Contador de caracteres dentro del input (alternativo) */}
        {maxLength && showCounter && !label && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <span
              className={cls(
                "text-xs font-medium",
                isAtLimit
                  ? "text-red-600"
                  : isNearLimit
                    ? "text-amber-600"
                    : "text-gray-400"
              )}
            >
              {currentLength}/{maxLength}
            </span>
          </div>
        )}
      </div>

      {/* Mensajes de estado */}
      {error ? (
        <p id={`${id}-err`} className="text-xs text-red-600">
          {error}
        </p>
      ) : success ? (
        <p className="text-xs text-emerald-700">{success}</p>
      ) : helper ? (
        <p id={`${id}-help`} className="text-xs text-gray-600">
          {helper}
        </p>
      ) : null}

    </div>
  );
});