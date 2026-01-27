// File: src/components/permissions/Can.jsx

import { usePermission } from "../../utils/permissions";

/**
 * Componente para controlar la visibilidad basada en permisos
 * 
 * @param {string|string[]} permission - Permiso(s) requerido(s)
 * @param {string} mode - "OR" (por defecto) o "AND"
 * @param {React.ReactNode} children - Contenido a mostrar si tiene permiso
 * @param {React.ReactNode} fallback - Contenido alternativo si no tiene permiso
 * 
 * @example
 * <Can permission="courses.create">
 *   <button>Crear Curso</button>
 * </Can>
 * 
 * @example
 * <Can permission={["courses.edit", "courses.delete"]} mode="AND">
 *   <button>Editar y Eliminar</button>
 * </Can>
 */
export const Can = ({ permission, mode = "OR", children, fallback = null }) => {
  const hasPermission = usePermission(permission, mode);
  
  return hasPermission ? children : fallback;
};

export default Can;