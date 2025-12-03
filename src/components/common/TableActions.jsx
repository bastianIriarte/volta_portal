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
    <div className={`flex gap-1 justify-center ${className}`}>
      {actions.map((action, index) => {
        if (action.condition && !action.condition(item)) {
          return null;
        }

        if(action.disabled?.(item)){
          return null;
        }
        return (
          <Button
            key={index}
            size={size}
            variant={action.variant || "outline"}
            icon={action.icon}
            onClick={() => action.onClick(item)}
            title={action.title}
            disabled={action.disabled?.(item)}
          >
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}