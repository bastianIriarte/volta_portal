import React from "react";
import { useNavigate } from "react-router-dom";
import {
  UserPlus,
  CheckCircle2,
  CreditCard,
  FileSignature,
  Lock,
  ArrowRight,
  Plus,
  UserLock,
  Mail,
  MessageSquareText,
  AlertTriangle,
  Calendar,
  Clock
} from "lucide-react";

import { Button } from "../../../components/ui/Button";
import { WelcomeBanner } from "../WelcomeBanner";
import { AlertBanner } from "./components/AlertBanner";

import { FeatureCard } from "./components/FeatureCard";
import { MatriculaStatusCard } from "./components/MatriculaStatusCard";
import { PostulacionesAlert } from "./components/PostulacionesAlert";
import { HelpCard } from "./components/HelpCard";

export default function DashboardParentView({ dataDashboard }) {
  const navigate = useNavigate();

  // Bases de datos recibidas
  const currentPeriod = dataDashboard?.period ?? null;
  const studentsData = dataDashboard?.students ?? {};
  const configurationData = dataDashboard?.configuration ?? {};
  const postulations = dataDashboard?.postulations ?? [];
  const currentContract = dataDashboard?.contract ?? null;
  const activeSegment = dataDashboard?.active_segment ?? null;

  // Estados del contrato
  const contractPaid = !!currentContract?.paid;
  const contractSigned = !!currentContract?.signed;
  const contractCompleted = contractPaid && contractSigned;
  const contractFinished = currentContract?.status_contract === 'finished';

  // Postulaciones
  const postulationsInProgress = postulations.filter((p) => p.status === "en_proceso");
  const postulationsCompleted = postulations.filter(
    (p) => p.status === "completa" || p.status === "aprobada"
  );

  // ---- Bloqueos CAE/CFE ----
  const cfeStudents = Array.isArray(studentsData?.CFE) ? studentsData.CFE : [];
  const caeStudents = Array.isArray(studentsData?.CAE) ? studentsData.CAE : [];

  const hasCFE = cfeStudents.length > 0;
  const hasCAE = caeStudents.length > 0;

  // NUEVO: Variable que determina si hay algún bloqueo activo
  const isBlocked = hasCFE || hasCAE;

  // Verificar si no estamos en ningún segmento activo
  // IMPORTANTE: Si el contrato está finalizado, no aplicar bloqueo de período
  const isOutsideSegment = activeSegment && !activeSegment.is_active && !contractFinished;

  // Función para obtener el próximo segmento
  const getNextSegment = () => {
    if (!currentPeriod?.segments || currentPeriod.segments.length === 0) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureSegments = currentPeriod.segments
      .filter(seg => seg.status === 1)
      .map(seg => ({
        ...seg,
        start: new Date(seg.start_date + 'T00:00:00')
      }))
      .filter(seg => seg.start > today)
      .sort((a, b) => a.start - b.start);

    return futureSegments.length > 0 ? futureSegments[0] : null;
  };

  const nextSegment = getNextSegment();

  // Función para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Mensajes / títulos desde configuración (fallbacks defensivos)
  const caeTitle =
    configurationData?.cae_title ||
    `El proceso de matrículas ${currentPeriod?.period_year ?? ""} se encuentra temporalmente bloqueado por "Condición Académica Especial (CAE)".`;
  const caeMessage =
    configurationData?.cae_message ||
    "Para más información sobre tu situación académica, comunícate con nosotros por email.";

  const cfeTitle =
    configurationData?.cfe_title ||
    `El proceso de matrículas ${currentPeriod?.period_year ?? ""} se encuentra temporalmente bloqueado por "Condición Financiera Especial (CFE)".`;
  const cfeMessage =
    configurationData?.cfe_message ||
    "Si tienes dudas o necesitas regularizar tu situación, contáctanos por WhatsApp o correo.";

  const handleViewPostulation = (postulation) => {
    navigate(`/dashboard/postulations/${postulation.id}`);
  };

  // NUEVO: Función para manejar clics bloqueados
  const handleBlockedAction = () => {
    alert("No puedes realizar esta acción debido a condiciones especiales. Contacta a administración.");
  };

  // Render helper: lista breve de alumnos bloqueados (máx 3 + contador)
  const BlockedList = ({ items = [] }) => {
    if (!items.length) return null;
    const preview = items.slice(0, 3);
    const remaining = items.length - preview.length;
    return (
      <div className="mt-2 text-sm text-gray-700">
        <span className="font-medium">Alumnos afectados:</span>{" "}
        {preview.map((s) => s.full_name || s.rut).join(", ")}
        {remaining > 0 ? ` y ${remaining} más.` : "."}
      </div>
    );
  };

  // NUEVO: Función helper para determinar la descripción de matrícula
  const getMatriculaDescription = () => {
    if (isBlocked) {
      return "Proceso bloqueado por condiciones especiales";
    }

    if (isOutsideSegment) {
      return "El Periodo de matrícula no está disponible";
    }

    if (!currentPeriod?.period_year) {
      return "No existe ninguna matrícula disponible";
    }

    if (!currentContract) {
      return "Aún no posee ninguna Matrícula asociada";
    }

    if (contractPaid) {
      return `Pago confirmado el ${currentContract.paid_at
        ? new Date(currentContract.paid_at).toLocaleDateString("es-CL")
        : ""
      }`;
    }

    return "Realiza el pago de matrícula para asegurar tu cupo";
  };

  // NUEVO: Función helper para determinar la descripción de firma
  const getFirmaDescription = () => {
    if (isBlocked) {
      return "Proceso bloqueado por condiciones especiales";
    }

    if (isOutsideSegment) {
      return "El Periodo de matrícula no está disponible";
    }

    if (!currentPeriod?.period_year) {
      return "No existe ninguna matrícula disponible";
    }

    if (!currentContract) {
      return "Aún no posee ninguna Matrícula asociada";
    }

    if (contractSigned) {
      return "Contrato firmado digitalmente";
    }

    if (contractPaid) {
      return "Tu contrato está listo para ser firmado";
    }

    return "Primero debes realizar el pago de matrícula";
  };

  return (
    <div className="space-y-6 fade-in-up">
      {/* Banner de Bienvenida */}
      <WelcomeBanner />

      {/* Alertas */}
      {contractCompleted && !isBlocked && !isOutsideSegment && (
        <AlertBanner
          type="success"
          title="¡Matrícula Completada!"
          message={`Has completado exitosamente el periodo ${currentPeriod?.period_year}`}
        />
      )}

      {currentPeriod && currentPeriod?.finished == 1 && (
        <AlertBanner
          type="error"
          title={`El Periodo de Matrículas ${currentPeriod?.period_year} ha finalizado`}
          message={`¿Tienes dudas? Contáctanos: ${configurationData?.email || "hola@hitch.cl"}`}
        />
      )}

      {/* Banner cuando estamos fuera de cualquier segmento */}
      {isOutsideSegment && !isBlocked && currentPeriod?.finished != 1 && (
        <AlertBanner
          type="error"
          title="Período de Matrícula no disponible "
          message={
            "Por favor, contacta con administración para conocer las próximas fechas de matrícula"
          }
          icon={Clock}
        >
        
        </AlertBanner>
      )}

      {/* Bloqueo CFE */}
      {hasCFE && (
        <AlertBanner
          type="error"
          title={cfeTitle}
          message={cfeMessage}
        >
          <div className="bg-gray-50 w-[100%] px-2 lg:ml-[-25px] rounded-lg">
            <BlockedList items={cfeStudents} />
          </div>
        </AlertBanner>
      )}

      {/* Bloqueo CAE */}
      {hasCAE && (
        <AlertBanner
          type="error"
          title={caeTitle}
          message={caeMessage}
        >
          <div className="bg-gray-50 w-[100%] px-2 lg:ml-[-25px] rounded-lg">
            <BlockedList items={caeStudents} />
          </div>
        </AlertBanner>
      )}

      {/* Tres procesos principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 2. PAGO DE MATRÍCULA */}
        <FeatureCard
          title="Pago de Matrícula"
          description={getMatriculaDescription()}
          icon={
            isBlocked
              ? AlertTriangle
              : isOutsideSegment
                ? Clock
                : currentContract && currentPeriod?.period_year
                  ? contractPaid
                    ? CheckCircle2
                    : CreditCard
                  : Lock
          }
          variant={
            isBlocked || isOutsideSegment
              ? "error"
              : currentContract && currentPeriod?.period_year
                ? contractPaid
                  ? "success"
                  : "gold"
                : "default"
          }
          badge={
            isBlocked
              ? "🚫 Bloqueado"
              : isOutsideSegment
                ? " No disponible"
                : contractPaid
                  ? "✓ Pagada"
                  : null
          }
          action={
            // MODIFICADO: Solo mostrar botón si no está bloqueado y estamos dentro de un segmento
            !isBlocked && !isOutsideSegment && currentContract && currentPeriod?.period_year && !contractPaid && (
              <Button
                variant="primary"
                size="lg"
                icon={ArrowRight}
                onClick={() => navigate("/dashboard/matriculas/" + currentContract.code)}
              >
                Ir a Matricular
              </Button>
            )
          }
          // NUEVO: Agregar acción alternativa para casos bloqueados
          alternativeAction={
            isBlocked && (
              <Button
                variant="outline"
                size="lg"
                icon={AlertTriangle}
                onClick={handleBlockedAction}
                disabled
              >
                Proceso Bloqueado
              </Button>
            )
          }
        />

        {/* 3. FIRMA DE CONTRATO */}
        <FeatureCard
          title="Firma de Contrato"
          description={getFirmaDescription()}
          icon={
            isBlocked
              ? AlertTriangle
              : isOutsideSegment
                ? Clock
                : contractSigned
                  ? CheckCircle2
                  : contractPaid
                    ? FileSignature
                    : Lock
          }
          variant={
            isBlocked || isOutsideSegment
              ? "error"
              : contractSigned
                ? "success"
                : contractPaid
                  ? "gold"
                  : "default"
          }
          badge={
            isBlocked
              ? "🚫 Bloqueado"
              : isOutsideSegment
                ? "No disponible"
                : contractSigned
                  ? "✓ Firmada"
                  : null
          }
          action={
            // MODIFICADO: Mostrar botón según estado del contrato
            !isBlocked && !isOutsideSegment && contractPaid && (
              contractFinished ? (
                // Si el contrato está finalizado, mostrar "Ver Contrato"
                <Button
                  variant="primary"
                  size="lg"
                  icon={ArrowRight}
                  onClick={() => navigate("/dashboard/matriculas/" + currentContract.code)}
                >
                  Ver Contrato
                </Button>
              ) : !contractSigned ? (
                // Si no está firmado, mostrar "Firmar Contrato"
                <Button
                  variant="primary"
                  size="lg"
                  icon={ArrowRight}
                  onClick={() => navigate("/dashboard/matriculas/" + currentContract.code)}
                >
                  Firmar Contrato
                </Button>
              ) : (
                // Si está firmado pero no finalizado, mostrar "Ir a Contrato"
                <Button
                  variant="primary"
                  size="lg"
                  icon={ArrowRight}
                  onClick={() => navigate("/dashboard/matriculas/" + currentContract.code)}
                >
                  Ver Contrato
                </Button>
              )
            )

          }
          // NUEVO: Agregar acción alternativa para casos bloqueados
          alternativeAction={
            isBlocked && (
              <Button
                variant="outline"
                size="lg"
                icon={AlertTriangle}
                onClick={handleBlockedAction}
                disabled
              >
                Proceso Bloqueado
              </Button>
            )
          }
        />

        {/* 1. POSTULACIÓN */}
        <FeatureCard
          title="Postulaciones"
          description={
            isBlocked
              ? "Proceso bloqueado por condiciones especiales"
              : isOutsideSegment
                ? "El periodo de postulaciones no se encuentra disponible"
                : "El periodo de postulaciones no se encuentra disponible"
          }
          icon={
            isBlocked
              ? AlertTriangle
              : isOutsideSegment
                ? Lock
                : Lock
          }
          variant={isBlocked ? "error" : "default"}
          badge={
            isBlocked
              ? "🚫 Bloqueado"
              : isOutsideSegment
                ? null
                : null
          }
        />
      </div>

      {/* Estado de Matrícula Actual - MODIFICADO: Solo mostrar si no está bloqueado */}
      {!isBlocked && !contractCompleted && contractPaid && !isOutsideSegment && (
        <MatriculaStatusCard currentContract={currentContract} currentPeriod={currentPeriod} />
      )}

      {/* NUEVO: Mensaje informativo adicional cuando hay bloqueos */}
      {isBlocked && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-800 mb-1">
                Proceso de Matrícula Temporalmente Suspendido
              </h3>
              <p className="text-amber-700 text-sm">
                Tu proceso de matrícula está temporalmente suspendido debido a condiciones especiales. 
                Para resolver esta situación y continuar con tu matrícula, por favor contacta con 
                administración a través de los canales oficiales.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Postulaciones en Proceso - MODIFICADO: Solo mostrar si no está bloqueado */}
      {!isBlocked && postulationsInProgress.length > 0 && (
        <PostulacionesAlert
          postulaciones={postulationsInProgress}
          type="proceso"
          onViewPostulacion={handleViewPostulation}
        />
      )}

      {/* Postulaciones Completadas - MODIFICADO: Solo mostrar si no está bloqueado */}
      {!isBlocked && postulationsCompleted.length > 0 && (
        <PostulacionesAlert
          postulaciones={postulationsCompleted}
          type="completadas"
          onViewPostulacion={handleViewPostulation}
        />
      )}

      {/* Ayuda y Soporte */}
      <HelpCard 
        configurationData={configurationData} 
        currentPeriod={currentPeriod}
        isBlocked={isBlocked} // NUEVO: Pasar estado de bloqueo
      />
    </div>
  );
}