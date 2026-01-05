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

        if(action.disabled?.(item)){
          return null;
        }

        // Soportar iconos y títulos dinámicos (funciones que reciben el item)
        const icon = typeof action.icon === "function" ? action.icon(item) : action.icon;
        const title = typeof action.title === "function" ? action.title(item) : action.title;
        const actionClassName = typeof action.className === "function" ? action.className(item) : action.className;

        return (
          <Button
            key={index}
            size={size}
            variant={action.variant || "outline"}
            icon={icon}
            onClick={() => action.onClick(item)}
            title={title}
            disabled={action.disabled?.(item)}
            className={actionClassName}
          >
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}