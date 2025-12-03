import React from "react";
import { Button } from "../../../../components/ui/Button";
export const PostulacionCard = ({ postulacion, onView }) => {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white rounded-lg border border-amber-200">
      <div>
        <p className="font-semibold text-gray-800">{postulacion.alumnoNombre}</p>
        <p className="text-xs text-gray-600">
          Curso: {postulacion.curso} | Periodo:  {postulacion.anio}
        </p>
      </div>
      <Button variant="outline" size="md" onClick={() => onView(postulacion)}>
        Ver postulación
      </Button>
    </div>
  );
};