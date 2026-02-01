import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ClipboardList, ArrowLeft, ArrowRight,
  CheckCircle, AlertTriangle, Loader2, Building2,
  Info
} from "lucide-react";
import {
  getRegistrationRequestById,
  approveRequest,
  rejectRequest,
  getRequestCompanies,
  saveWizardProgress
} from "../../services/registrationRequestService";
import { getSapCompaniesList } from "../../services/companyService";
import { handleSnackbar } from "../../utils/messageHelpers";
import { Button } from "../../components/ui/Button";

import {
  CompanyInfoSection,
  ApplicantInfoSection,
  RequestStatusBanner,
  RejectModal,
  ApproveModal,
  CompanyAssignmentSection,
  CompanyPermissionCard,
  CompanyPermissionModal,
  statusConfig
} from "./components";

export default function RegistrationRequestDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [advancingStep, setAdvancingStep] = useState(false);
  const [request, setRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);

  // Empresas
  const [userCompanies, setUserCompanies] = useState([]);
  const [sapCompanies, setSapCompanies] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [loadingSap, setLoadingSap] = useState(false);

  // Wizard (solo para pendientes)
  const [wizardStep, setWizardStep] = useState(1);

  // Permisos por empresa: { companyKey: ['report_1', 'cert_2', ...] }
  const [companyPermissions, setCompanyPermissions] = useState({});
  // Labels de permisos: { 'report_1': 'Nombre Reporte', 'cert_2': 'Nombre Cert', ... }
  const [permissionLabels, setPermissionLabels] = useState({});

  // Acordeón: solo 1 card expandida a la vez
  const [expandedCardKey, setExpandedCardKey] = useState(null);
  const handleToggleCard = (key) => setExpandedCardKey(prev => prev === key ? null : key);

  // Modal de permisos por empresa
  const [permissionModal, setPermissionModal] = useState({ open: false, companyKey: null, company: null });

  useEffect(() => {
    loadRequest();
  }, [id]);

  const loadRequest = async () => {
    setLoading(true);
    try {
      const response = await getRegistrationRequestById(id);
      if (response.success) {
        const data = response.data;
        setRequest(data);

        // Restaurar estado del wizard si existe
        if (data.request_status === "pending") {
          if (data.wizard_step) {
            setWizardStep(data.wizard_step);
          }
          if (data.wizard_data) {
            // Restaurar empresas seleccionadas (ya tienen ID real)
            if (data.wizard_data.selected_companies?.length > 0) {
              setUserCompanies(data.wizard_data.selected_companies);
            }
            // Restaurar permisos por empresa
            if (data.wizard_data.company_permissions) {
              setCompanyPermissions(data.wizard_data.company_permissions);
            }
          }
        }

        // Cargar empresas asignadas si el usuario ya fue creado
        if (data.user_created_id) {
          loadUserCompanies(data.id);
          // Permisos: mapa normalizado por empresa desde el backend
          if (data.company_permissions_map) {
            setCompanyPermissions(data.company_permissions_map);
          }
          // Labels resueltos desde el backend (no necesita queries extra)
          if (data.resolved_permission_labels) {
            setPermissionLabels(data.resolved_permission_labels);
          }
        }
      } else {
        handleSnackbar(response.message || "Error al cargar solicitud", "error");
        navigate("/dashboard/solicitudes");
      }
    } catch (error) {
      console.error("Error loading request:", error);
      handleSnackbar("Error al cargar solicitud", "error");
      navigate("/dashboard/solicitudes");
    } finally {
      setLoading(false);
    }
  };

  const loadUserCompanies = async (requestId) => {
    try {
      const response = await getRequestCompanies(requestId);
      if (response.success && response.data) {
        setUserCompanies(response.data);
      }
    } catch (error) {
      console.error("Error loading user companies:", error);
    }
  };

  const loadSapCompanies = async () => {
    setLoadingSap(true);
    try {
      const response = await getSapCompaniesList();
      if (response.success && response.data) {
        setSapCompanies(response.data);
      }
    } catch (error) {
      console.error("Error loading SAP companies:", error);
      handleSnackbar("Error al cargar empresas desde SAP", "error");
    } finally {
      setLoadingSap(false);
    }
  };

  const handleAddCompanies = (companies) => {
    setSelectedCompanies((prev) => [...prev, ...companies]);
  };

  const handleRemoveCompany = (index) => {
    const removed = selectedCompanies[index];
    setSelectedCompanies((prev) => prev.filter((_, i) => i !== index));
    if (removed) {
      const key = `sap_${removed.sap_code}`;
      setCompanyPermissions((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleRemoveUserCompany = (index) => {
    const removed = userCompanies[index];
    setUserCompanies((prev) => prev.filter((_, i) => i !== index));
    if (removed) {
      const key = String(removed.id);
      setCompanyPermissions((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  // --- Permisos por empresa ---
  const handleOpenPermissionModal = (companyKey, company) => {
    setPermissionModal({ open: true, companyKey, company });
  };

  const handleSavePermissions = (companyKey, permissions, labels = {}) => {
    setCompanyPermissions((prev) => ({
      ...prev,
      [companyKey]: permissions,
    }));
    setPermissionLabels((prev) => ({ ...prev, ...labels }));
    setPermissionModal({ open: false, companyKey: null, company: null });
  };

  const handleEditCompany = (companyId) => {
    window.open(`/dashboard/empresas/${companyId}/gestionar`, "_blank");
  };

  const handleRemoveCompanyFromStep2 = (companyKey) => {
    // Filtrar de userCompanies (ya que en step 2 todas son resolved con ID)
    setUserCompanies((prev) => prev.filter((c) => String(c.id) !== companyKey));
    setCompanyPermissions((prev) => {
      const next = { ...prev };
      delete next[companyKey];
      return next;
    });
  };

  // --- Avanzar al paso 2: crear empresas y persistir estado ---
  const handleNextStep = async () => {
    setAdvancingStep(true);
    try {
      // Llamar al backend para crear empresas SAP y guardar progreso
      const response = await saveWizardProgress(
        id,
        2,
        selectedCompanies.map((c) => ({
          rut: c.rut,
          sap_code: c.sap_code,
          business_name: c.business_name,
        })),
        companyPermissions
      );

      if (response.success && response.data) {
        // Las empresas SAP ahora tienen ID real — moverlas a userCompanies
        const resolvedCompanies = response.data.resolved_companies || [];
        if (resolvedCompanies.length > 0) {
          setUserCompanies((prev) => [...prev, ...resolvedCompanies]);
          setSelectedCompanies([]); // ya no son "pendientes"
        }
        setWizardStep(2);
      } else {
        handleSnackbar(response.message || "Error al guardar progreso", "error");
      }
    } catch (error) {
      console.error("Error saving progress:", error);
      handleSnackbar("Error al guardar progreso", "error");
    } finally {
      setAdvancingStep(false);
    }
  };

  // --- Volver al paso 1: persistir estado ---
  const handlePrevStep = async () => {
    // Guardar progreso en background (no bloqueante)
    saveWizardProgress(id, 1, [], companyPermissions).catch(() => {});
    setWizardStep(1);
  };

  // --- Aprobar ---
  const handleApprove = async () => {
    setProcessing(true);
    try {
      const permissionsByCompany = {};

      // Empresa principal
      const primaryKey = String(request.company_id);
      if (companyPermissions[primaryKey]?.length > 0) {
        permissionsByCompany[primaryKey] = companyPermissions[primaryKey];
      }

      // Empresas adicionales (todas en userCompanies, ya resueltas con ID)
      userCompanies.forEach((c) => {
        const key = String(c.id);
        if (companyPermissions[key]?.length > 0) {
          permissionsByCompany[key] = companyPermissions[key];
        }
      });

      // Construir lista de empresas adicionales para enviar al backend
      // userCompanies ya fueron resueltas con ID real en handleNextStep
      const additionalCompanies = userCompanies
        .filter(c => c.id !== request.company_id)
        .map(c => ({
          rut: c.rut,
          sap_code: c.sap_code,
          business_name: c.business_name,
        }));

      // selectedCompanies restantes (si no se avanzó al paso 2)
      selectedCompanies.forEach((c) => {
        const key = `sap_${c.sap_code}`;
        if (companyPermissions[key]?.length > 0) {
          permissionsByCompany[c.sap_code] = companyPermissions[key];
        }
        additionalCompanies.push({
          rut: c.rut,
          sap_code: c.sap_code,
          business_name: c.business_name,
        });
      });

      const response = await approveRequest(id, permissionsByCompany, additionalCompanies);
      if (response.success) {
        handleSnackbar("Solicitud aprobada y permisos asignados exitosamente.", "success");
        setRequest(response.data);
        setShowApproveModal(false);
        setWizardStep(1);
      } else {
        handleSnackbar(response.message || "Error al aprobar solicitud", "error");
      }
    } catch (error) {
      console.error("Error approving request:", error);
      handleSnackbar("Error al aprobar solicitud", "error");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      handleSnackbar("Debe ingresar un motivo de rechazo", "error");
      return;
    }

    setProcessing(true);
    try {
      const response = await rejectRequest(id, rejectionReason);
      if (response.success) {
        handleSnackbar("Solicitud rechazada", "success");
        setRequest(response.data);
        setShowRejectModal(false);
        setRejectionReason("");
      } else {
        handleSnackbar(response.message || "Error al rechazar solicitud", "error");
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      handleSnackbar("Error al rechazar solicitud", "error");
    } finally {
      setProcessing(false);
    }
  };

  // --- Lista de empresas para Step 2 ---
  const getAllCompaniesForStep2 = () => {
    const companies = [];

    if (request?.company_id) {
      companies.push({
        key: String(request.company_id),
        company: {
          id: request.company_id,
          business_name: request.company_name,
          rut: request.company_rut_formatted || request.company_rut || "",
          sap_code: request.company_sap_code || "",
        },
        isPrimary: true,
      });
    }

    // Empresas adicionales (ya resueltas con ID real)
    userCompanies.forEach((c) => {
      // Evitar duplicar la empresa principal
      if (c.id !== request?.company_id) {
        companies.push({
          key: String(c.id),
          company: c,
          isPrimary: false,
        });
      }
    });

    return companies;
  };

  const getTotalPermissionsCount = () => {
    return Object.values(companyPermissions).reduce((sum, perms) => sum + perms.length, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Solicitud no encontrada</p>
      </div>
    );
  }

  const status = statusConfig[request.request_status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const isPending = request.request_status === "pending";

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/solicitudes")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ClipboardList className="w-7 h-7" />
              Detalle de Solicitud #{request.id}
            </h1>
            <p className="text-gray-500 mt-1">{request.company_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isPending && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
              Paso {wizardStep} de 2
            </div>
          )}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${status.color}`}>
            <StatusIcon className="w-4 h-4" />
            {status.label}
          </span>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* ======= SOLICITUDES NO PENDIENTES: vista read-only ======= */}
        {!isPending && (
          <>
            <RequestStatusBanner request={request} />
            <CompanyInfoSection request={request} />
            <ApplicantInfoSection request={request} />

            {request.request_status === "approved" && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5" />
                  Empresas y Permisos Asignados
                </h3>
                <div className="space-y-3">
                  {/* Empresa principal */}
                  {request.company_id && (
                    <CompanyPermissionCard
                      company={{
                        id: request.company_id,
                        business_name: request.company_name,
                        rut: request.company_rut_formatted || request.company_rut || "",
                        sap_code: request.company_sap_code || "",
                      }}
                      companyKey={String(request.company_id)}
                      isPrimary={true}
                      permissions={companyPermissions[String(request.company_id)] || []}
                      permissionLabels={permissionLabels}
                      isReadOnly={true}
                      expandedKey={expandedCardKey}
                      onToggleExpand={handleToggleCard}
                    />
                  )}
                  {/* Empresas adicionales */}
                  {userCompanies
                    .filter(c => c.id !== request?.company_id)
                    .map(c => (
                      <CompanyPermissionCard
                        key={c.id}
                        company={c}
                        companyKey={String(c.id)}
                        isPrimary={false}
                        permissions={companyPermissions[String(c.id)] || []}
                        permissionLabels={permissionLabels}
                        isReadOnly={true}
                        expandedKey={expandedCardKey}
                        onToggleExpand={handleToggleCard}
                      />
                    ))}
                  {!request.company_id && userCompanies.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">Sin empresas asignadas</p>
                  )}
                </div>
              </div>
            )}

            {/* Navegación */}
            <div className="flex items-center justify-start pt-4 border-t">
              <Button
                variant="outline"
                icon={ArrowLeft}
                onClick={() => navigate("/dashboard/solicitudes")}
              >
                Volver a lista
              </Button>
            </div>
          </>
        )}

        {/* ======= STEP 1: Datos empresa + solicitante + empresas asignadas ======= */}
        {isPending && wizardStep === 1 && (
          <>
            <CompanyInfoSection request={request} />
            <ApplicantInfoSection request={request} />

            <CompanyAssignmentSection
              requestCompany={request.company_id ? {
                id: request.company_id,
                business_name: request.company_name,
                rut: request.company_rut_formatted || request.company_rut,
              } : null}
              userCompanies={userCompanies}
              selectedCompanies={selectedCompanies}
              onAddCompanies={handleAddCompanies}
              onRemoveCompany={handleRemoveCompany}
              onRemoveUserCompany={handleRemoveUserCompany}
              isReadOnly={false}
              sapCompanies={sapCompanies}
              loadingSap={loadingSap}
              onOpenModal={loadSapCompanies}
            />

            {/* Navegación Step 1 */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="outline"
                icon={ArrowLeft}
                onClick={() => navigate("/dashboard/solicitudes")}
              >
                Volver a lista
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  onClick={() => setShowRejectModal(true)}
                  disabled={processing || advancingStep}
                >
                  Rechazar
                </Button>
                <Button
                  icon={advancingStep ? Loader2 : ArrowRight}
                  onClick={handleNextStep}
                  disabled={advancingStep}
                >
                  {advancingStep ? "Guardando..." : "Siguiente: Permisos"}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* ======= STEP 2: Detalle solicitud + Permisos por empresa ======= */}
        {isPending && wizardStep === 2 && (
          <>
            {/* Detalle de la solicitud (colapsado) */}
            <CompanyInfoSection request={request} />
            <ApplicantInfoSection request={request} />

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-2">
                <Building2 className="w-5 h-5" />
                Permisos por Empresa
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Configure los permisos de acceso para cada empresa. Haga clic en "Permisos" para gestionar reportes, certificados y documentos.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 mb-6">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Seleccione los permisos antes de aprobar
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Una vez aprobada, el usuario tendrá acceso a los recursos seleccionados por empresa.
                    Si la empresa no tiene asociados reportes, certificados o documentos, el usuario <strong>no podrá visualizarlos</strong> aunque tenga los permisos asignados.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {getAllCompaniesForStep2().map(({ key, company, isPrimary }) => (
                  <CompanyPermissionCard
                    key={key}
                    company={company}
                    companyKey={key}
                    isPrimary={isPrimary}
                    permissions={companyPermissions[key] || []}
                    permissionLabels={permissionLabels}
                    onManagePermissions={handleOpenPermissionModal}
                    onEditCompany={company.id ? handleEditCompany : null}
                    onRemove={!isPrimary ? handleRemoveCompanyFromStep2 : null}
                    isReadOnly={false}
                    expandedKey={expandedCardKey}
                    onToggleExpand={handleToggleCard}
                  />
                ))}
              </div>

              {getAllCompaniesForStep2().length === 0 && (
                <div className="text-center py-8 text-gray-400 border border-dashed border-gray-300 rounded-lg">
                  <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay empresas asignadas</p>
                </div>
              )}
            </div>

            {/* Navegación Step 2 */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="outline"
                icon={ArrowLeft}
                onClick={handlePrevStep}
              >
                Volver al Paso 1
              </Button>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  {getTotalPermissionsCount()} permiso{getTotalPermissionsCount() !== 1 ? "s" : ""} configurado{getTotalPermissionsCount() !== 1 ? "s" : ""}
                </span>
                <Button
                  variant="danger"
                  onClick={() => setShowRejectModal(true)}
                  disabled={processing}
                >
                  Rechazar
                </Button>
                <Button
                  icon={CheckCircle}
                  onClick={() => setShowApproveModal(true)}
                  disabled={processing}
                >
                  Aprobar
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modales */}
      <RejectModal
        open={showRejectModal}
        request={request}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        processing={processing}
        onConfirm={handleReject}
        onCancel={() => {
          setShowRejectModal(false);
          setRejectionReason("");
        }}
      />

      <ApproveModal
        open={showApproveModal}
        request={request}
        companyPermissions={companyPermissions}
        permissionLabels={permissionLabels}
        companies={getAllCompaniesForStep2()}
        processing={processing}
        onConfirm={handleApprove}
        onCancel={() => setShowApproveModal(false)}
      />

      <CompanyPermissionModal
        open={permissionModal.open}
        company={permissionModal.company}
        companyKey={permissionModal.companyKey}
        currentPermissions={companyPermissions[permissionModal.companyKey] || []}
        onSave={handleSavePermissions}
        onClose={() => setPermissionModal({ open: false, companyKey: null, company: null })}
      />
    </div>
  );
}
