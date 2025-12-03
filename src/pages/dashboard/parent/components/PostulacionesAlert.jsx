import React from "react";
import { Card } from "../../../../components/ui/Card";
import { Clock, CheckCircle2 } from "lucide-react";
import { PostulacionCard } from "../../admin/components/PostulacionCard";

export const PostulacionesAlert = ({ postulaciones, type = "proceso", onViewPostulacion }) => {
  const config = {
    proceso: {
      borderColor: "border-amber-500",
      bgGradient: "from-amber-50 to-white",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      icon: Clock,
      title: "Tienes postulaciones en proceso"
    },
    completadas: {
      borderColor: "border-emerald-500",
      bgGradient: "from-emerald-50 to-white",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      icon: CheckCircle2,
      title: "Postulaciones Completadas"
    }
  };

  const settings = config[type];
  const Icon = settings.icon;

  return (
    <Card 
      variant="default" 
      className={`border-l-4 ${settings.borderColor} bg-gradient-to-r ${settings.bgGradient}`}
    >
      <div className="flex items-start space-x-4">
        <div className={`w-10 h-10 ${settings.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${settings.iconColor}`} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-green-800 mb-2">{settings.title}</h3>
          <div className="space-y-2">
            {postulaciones.map(p => (
              <PostulacionCard 
                key={p.id} 
                postulacion={p} 
                onView={onViewPostulacion}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};