// File: src/components/permissions/PermissionButton.jsx
import { usePermission } from "../../utils/permissions";

/**
 * Botón que se deshabilita automáticamente si no tiene permisos
 * 
 * @param {string|string[]} permission - Permiso(s) requerido(s)
 * @param {string} mode - "OR" (por defecto) o "AND"
 * @param {boolean} hide - Si es true, oculta el botón en vez de deshabilitarlo
 * @param {string} className - Clases CSS
 * @param {React.ReactNode} children - Contenido del botón
 * @param {function} onClick - Función al hacer click
 */
export const PermissionButton = ({ 
  permission, 
  mode = "OR", 
  hide = false,
  className = "",
  children,
  onClick,
  disabled = false,
  ...props 
}) => {
  const hasPermission = usePermission(permission, mode);
  
  // Si está configurado para ocultarse y no tiene permiso
  if (hide && !hasPermission) {
    return null;
  }
  
  // Deshabilitar si no tiene permiso o si está deshabilitado por props
  const isDisabled = !hasPermission || disabled;
  
  return (
    <button
      className={`${className} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={hasPermission ? onClick : undefined}
      disabled={isDisabled}
      title={!hasPermission ? "No tienes permisos para esta acción" : undefined}
      {...props}
    >
      {children}
    </button>
  );
};

export default PermissionButton;