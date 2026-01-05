import React from "react";

function cls(...xs) {
  return xs.filter(Boolean).join(" ");
}

/**
 * Props extra soportadas:
 * - id, label, helper, error, success, required, variant ("default" | "elegant")
 * - className para el <textarea/>
 * - wrapperClass para el contenedor
 */
export const Textarea = ({
  id,
  label,
  helper,
  error,
  success,
  required,
  variant = "default",
  className,
  wrapperClass,
  ...props
}) => {
  const describedBy = [];
  if (error) describedBy.push(`${id}-err`);
  if (!error && helper) describedBy.push(`${id}-help`);

  const base =
    "w-full border px-3 py-2 bg-white outline-none transition shadow-sm";
  const elegant = "bg-white/70 backdrop-blur-sm";
  const ok = "border-emerald-300 focus:ring-2 focus:ring-emerald-200";
  const bad = "border-red-300 focus:ring-2 focus:ring-red-200";
  const norm = "border-gray-300 focus:ring-2 focus:ring-indigo-200";

  const taClass = cls(
    base,
    variant === "elegant" && elegant,
    error ? bad : success ? ok : norm,
    className,
    props.disabled && "bg-gray-600/10 text-gray-500 cursor-not-allowed",
  );

  return (
    <div className={cls("space-y-1.5", wrapperClass)}>
      {label && (
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
      )}

      <textarea
        id={id}
        aria-invalid={!!error}
        aria-describedby={describedBy.join(" ") || undefined}
        className={taClass}
        {...props}
      />

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
