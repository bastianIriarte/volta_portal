import React from "react";
import { cls } from "../../utils/format";

export const Card = ({ title, icon: Icon, children, className }) => (
  <div className={cls("card p-6", className)}>
    {title && (
      <div className="flex items-center gap-3 mb-4">
        {Icon ? (
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[var(--brand-accent)]/18 text-[var(--brand-accent)]">
            <Icon className="w-4 h-4" />
          </div>
        ) : null}
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
    )}
    {children}
  </div>
);
