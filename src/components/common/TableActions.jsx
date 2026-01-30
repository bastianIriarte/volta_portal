// components/common/TableActions.jsx
import React from "react";
import { Button } from "../ui/Button";

export default function TableActions({
  actions = [],
  item,
  size = "sm",
  className = ""
}) {
  return (
    <div className={`flex gap-1 ${className}`}>
      {actions.map((action, index) => {
        if (action.condition && !action.condition(item)) {
          return null;
        }

        // hidden oculta el botón, disabled solo lo deshabilita
        if (action.hidden) {
          const isHidden = typeof action.hidden === "function" ? action.hidden(item) : action.hidden;
          if (isHidden) return null;
        }

        // Soportar iconos y títulos dinámicos (funciones que reciben el item)
        const icon = typeof action.icon === "function" ? action.icon(item) : action.icon;
        const title = typeof action.title === "function" ? action.title(item) : action.title;
        const actionClassName = typeof action.className === "function" ? action.className(item) : action.className;
        const iconClassName = typeof action.iconClassName === "function" ? action.iconClassName(item) : action.iconClassName;

        // Soportar disabled como función o booleano
        const isDisabled = typeof action.disabled === "function"
          ? action.disabled(item)
          : action.disabled;

        return (
          <Button
            key={index}
            size={size}
            variant={action.variant || "outline"}
            icon={icon}
            iconClassName={iconClassName}
            onClick={() => !isDisabled && action.onClick(item)}
            title={title}
            disabled={isDisabled}
            className={actionClassName}
          >
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}