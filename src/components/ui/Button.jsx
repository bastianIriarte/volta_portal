import React from "react";

export const Button = ({
  variant = "primary",
  size = "md",
  className,
  icon: Icon,
  loading = false,
  disabled,
  children,
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center gap-2 rounded font-semibold transition focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed";
  const sizes = {
    p11: "px-3 py-1.5 text-[11px]",
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };
  const styles = {
    primary: "bg-[var(--brand-primary)] text-white hover:brightness-110 shadow-sm hover:shadow",
    accent:  "bg-[var(--brand-accent)] text-black hover:brightness-110 shadow-sm hover:shadow",
    ghost:   "text-[var(--text-primary)] border border-black/10 hover:bg-black/5",
    outline: "border border-[var(--brand-primary)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5",
    danger:  "bg-red-600 hover:bg-red-700 text-white",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white",
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${styles[variant]} ${className || ""}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
      ) : Icon ? (
        <Icon className="w-3 h-3" />
      ) : null}
      {children}
    </button>
  );
};
