import React, { useState } from "react";
import { Lock, Sparkles, Check } from "lucide-react";
import SubscriptionCheckout from "../SubscriptionCheckout";
import { Link } from "react-router-dom";

/**
 * Componente que muestra el mensaje de suscripción requerida
 * con los planes disponibles, usando el mismo diseño que PlanSection
 */
const SubscriptionRequired = ({
    title = "¡Desbloquea Todo el Contenido!",
    message = "Suscríbete para acceder a todos los cursos y recursos educativos"
}) => {
 
    return (
        <>
            {/* Contenido Principal */}
            <div className="py-32">
                <div className="container mx-auto px-4">
                    <div className="px-8 md:px-11">
                        {/* Header con icono de bloqueo */}
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-full mb-6 animate-pulse">
                                <Lock size={40} className="text-white" />
                            </div>

                            <h1 className="text-xl md:text-4xl font-bold text-neutral-900 mb-4">
                                {title}
                            </h1>

                            <p className="text-MD text-neutral-600 max-w-2xl mx-auto mb-8">
                                {message}
                            </p>

                            {/* Badge de llamada a la acción */}
                            <div className="inline-flex items-center gap-2 text-whitemb-12">
                                <Link
                                    to={`/plans`}
                                    className=" bg-black hover:bg-gray-800 text-white px-6 py-3  rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transform hover:scale-105"
                                >
                                    <Sparkles size={18} />
                                    <span className="font-medium">Ver Planes</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SubscriptionRequired;