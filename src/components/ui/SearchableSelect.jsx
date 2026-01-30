import React, { useState, useRef, useEffect, useMemo } from "react";

function cls(...xs) {
  return xs.filter(Boolean).join(" ");
}

/**
 * SearchableSelect — Select con búsqueda integrada estilo Select2.
 *
 * Props:
 * - id, label, error, helper, required, disabled
 * - value: valor seleccionado actualmente
 * - onChange(value): callback cuando se selecciona una opción
 * - options: [{ value, label }]
 * - placeholder: texto cuando no hay selección
 */
export const SearchableSelect = ({
  id,
  label,
  error,
  helper,
  required,
  disabled,
  value,
  onChange,
  options = [],
  placeholder = "Seleccionar...",
  className,
  wrapperClass,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const selectedOption = useMemo(
    () => options.find((o) => String(o.value) === String(value)),
    [options, value]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    const term = search.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(term));
  }, [options, search]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus input when opening
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleSelect = (opt) => {
    onChange(opt.value);
    setOpen(false);
    setSearch("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setSearch("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
      setSearch("");
    }
    if (e.key === "Enter" && filtered.length === 1) {
      e.preventDefault();
      handleSelect(filtered[0]);
    }
  };

  const borderClass = error
    ? "border-red-300 focus-within:ring-2 focus-within:ring-red-200"
    : "border-gray-300 focus-within:ring-2 focus-within:ring-indigo-200";

  const disabledClass = disabled
    ? "bg-gray-600/10 text-gray-500 cursor-not-allowed"
    : "bg-white cursor-pointer";

  return (
    <div className={cls("space-y-1.5", wrapperClass)} ref={containerRef}>
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
        </div>
      )}

      <div className="relative">
        {/* Trigger */}
        <div
          className={cls(
            "w-full rounded border px-3 h-[37px] flex items-center justify-between text-[13px] transition shadow-sm",
            borderClass,
            disabledClass,
            className
          )}
          onClick={() => {
            if (!disabled) setOpen(!open);
          }}
        >
          <span
            className={cls(
              "truncate flex-1",
              !selectedOption && "text-gray-400"
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <div className="flex items-center gap-1 ml-2">
            {value && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 p-0.5"
                tabIndex={-1}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
            <svg
              className={cls(
                "w-4 h-4 text-gray-400 transition-transform",
                open && "rotate-180"
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* Dropdown */}
        {open && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg">
            {/* Search input */}
            <div className="p-2 border-b border-gray-200">
              <input
                ref={inputRef}
                type="text"
                className="w-full px-2.5 py-1.5 text-[13px] border border-gray-300 rounded outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Options list */}
            <ul
              ref={listRef}
              className="max-h-52 overflow-y-auto py-1"
              role="listbox"
            >
              {filtered.length === 0 ? (
                <li className="px-3 py-2 text-[13px] text-gray-400 text-center">
                  Sin resultados
                </li>
              ) : (
                filtered.map((opt) => (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={String(opt.value) === String(value)}
                    className={cls(
                      "px-3 py-1.5 text-[13px] cursor-pointer hover:bg-indigo-50 transition-colors",
                      String(opt.value) === String(value) &&
                        "bg-indigo-100 font-medium text-indigo-700"
                    )}
                    onClick={() => handleSelect(opt)}
                  >
                    {opt.label}
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>

      {error ? (
        <p id={`${id}-err`} className="text-xs text-red-600">
          {error}
        </p>
      ) : helper ? (
        <p id={`${id}-help`} className="text-xs text-gray-600">
          {helper}
        </p>
      ) : null}
    </div>
  );
};
