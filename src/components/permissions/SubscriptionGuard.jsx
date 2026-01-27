import React from "react";
import SubscriptionRequired from "./SubscriptionRequired";
import { useAuth } from "../../context/auth";

/**
 * Componente HOC que valida si el usuario tiene suscripción activa
 * Si no tiene, muestra el componente SubscriptionRequired
 *
 * @param {React.ReactNode} children - Contenido a mostrar si tiene suscripción
 * @param {string} title - Título personalizado para el mensaje
 * @param {string} message - Mensaje personalizado
 */
const SubscriptionGuard = ({ children, title, message, showPlans = true }) => {
  const { session } = useAuth();

  // Verificar si el usuario tiene un plan activo
  // El backend devuelve user.plan como { code, title, expiration } o null
  const hasActivePlan =
    session?.user?.plan !== null && session?.user?.plan !== undefined;

  // Verificar si es estudiante
  const isStudent = session?.user?.role === "student";

  // Si es estudiante y NO tiene plan activo, mostrar mensaje
  if (isStudent && !hasActivePlan) {
    return (
      <SubscriptionRequired
        title={title}
        message={message}
        showPlans={showPlans}
      />
    );
  }

  // Si tiene plan o no es estudiante, mostrar contenido
  return children;
};

export default SubscriptionGuard;
