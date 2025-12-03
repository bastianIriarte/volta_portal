import { useAuth } from "../context/auth";

export const usePermission = (codes, mode = "OR") => {
  const { session } = useAuth();
  const perms = session?.user.permissions_users || [];
  if (!codes) return true;

  if (!Array.isArray(codes)) {
    codes = [codes]; // convertir en array si es string
  }

  if (mode === "AND") {
    // Debe tener TODOS
    return codes.every(c => perms.includes(c));
  } else {
    // Por defecto OR → basta con que tenga al menos uno
    return codes.some(c => perms.includes(c));
  }
};
