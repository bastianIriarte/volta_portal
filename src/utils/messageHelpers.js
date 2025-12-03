import React from "react";
import { toast } from "react-toastify";

/**
 * Muestra un snackbar (toast) con estilos personalizados
 * @param {string} message - Mensaje HTML o texto
 * @param {'success' | 'error' | 'warning' | 'info'} variant - Tipo de mensaje
 */
export const handleSnackbar = (message, variant = "info") => {
  const content = React.createElement("div", {
    dangerouslySetInnerHTML: { __html: message },
  });

  const baseOptions = {
    position: "top-right",
    autoClose: 4000,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    hideProgressBar: false,
  };

  let style = {};
  let toastFn = toast.info;

  switch (variant) {
    case "success":
      style = { backgroundColor: "#009c1b", color: "#fff" };
      toastFn = toast.success;
      break;

    case "warning":
      style = { backgroundColor: "#f1c40f", color: "#7b5d00" };
      toastFn = toast.warning;
      break;

    case "error":
      style = { backgroundColor: "#d32f2f", color: "#fff" };
      toastFn = toast.error;
      break;

    case "info":
    default:
      style = { backgroundColor: "#0277bd", color: "#fff" }; // Azul informativo
      toastFn = toast.info;
      break;
  }

  toastFn(content, { ...baseOptions, style });
};
