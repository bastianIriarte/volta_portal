import React from "react";
import { Card } from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import { Phone, Mail } from "lucide-react";

export const HelpCard = ({ currentPeriod, configurationData }) => {

  // Contactos
  const whatsappRaw = configurationData?.whatsapp || null;
  const email = configurationData?.email || null;

  // Normaliza número para wa.me (solo dígitos)
  const whatsappDigits = (whatsappRaw || "").replace(/\D+/g, "");
  const waMsg = `Hola, tengo dudas sobre el bloqueo de matrículas.`;
  const waLink =
    whatsappDigits.length > 0
      ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(waMsg)}`
      : null;

  const mailSubject = `Consulta bloqueo de matrícula ${currentPeriod?.period_year ?? ""}`;
  const mailBody = `Hola,\n\nTengo dudas sobre el bloqueo de matrícula.\n\nGracias.`;
  const mailLink = `mailto:${email}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;

  if (!whatsappRaw && !email) return null;
  return (
    <Card variant="default" className="bg-gradient-to-br from-gray-50 to-white">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-bold text-green-800 mb-2">
            ¿Necesitas ayuda?
          </h3>
          <p className="text-sm ">
            Nuestro equipo está disponible para asistirte
          </p>
        </div>
        <div className="flex gap-3">
          {whatsappRaw != null && (
            <Button variant="outline" size="md" icon={Phone}
              onClick={() => window.open(waLink, "_blank")}
            >
              WhatsApp
            </Button>
          )}
          {email != null && (
            <Button variant="ghost" size="md" icon={Mail}
              onClick={() => window.open(mailLink, "_blank")}
            >
              Correo electrónico
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};