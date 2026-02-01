import React from "react";

function cls(...xs) {
  return xs.filter(Boolean).join(" ");
}

/**
 * Props extra soportadas:
 * - id, label, helper, error, success, required, variant ("default" | "elegant")
 * - className para el <select/>
 * - wrapperClass para el contenedor
 */
export const Select = ({
  id,
  label,
  helper,
  error,
  success,
  required,
  variant = "default",
  className,
  wrapperClass,
  children,
  height = "h-[37px]",
  padding = "",
  ...props
}) => {
  const describedBy = [];
  if (error) describedBy.push(`${id}-err`);
  if (!error && helper) describedBy.push(`${id}-help`);

  const base =
    `w-full rounded border px-3 bg-white outline-none transition shadow-sm ${padding}`;
  const elegant = "bg-white/70 backdrop-blur-sm";
  const ok = "border-emerald-300 focus:ring-2 focus:ring-emerald-200";
  const bad = "border-red-300 focus:ring-2 focus:ring-red-200";
  const norm = "border-gray-300 focus:ring-2 focus:ring-indigo-200";

  const selectClass = cls(
    base,
    variant === "elegant" && elegant,
    error ? bad : success ? ok : norm,
    className,
    props.disabled && "bg-gray-600/15 text-gray-500 cursor-not-allowed",
  );

  return (
    <div className={cls("space-y-1.5", wrapperClass)}>
      {label && (
        <div className="flex items-center justify-between">
          <label
            htmlFor={id}
            className="block text-[11px] font-bold text-neutral-600 uppercase"
          >
            {label}{" "}
            {required && <span className="text-red-500" aria-hidden="true">*</span>}
          </label>
        </div>
      )}

      <div className="relative">
        <select
          id={id}
          aria-invalid={!!error}
          aria-describedby={describedBy.join(" ") || undefined}
          className={`${selectClass} ${height} text-[13px]`}
          {...props}
        >
          {children}
        </select>
      </div>
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
};
