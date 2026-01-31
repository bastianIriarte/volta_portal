import { useState, useEffect, useCallback } from "react";
import { Award, Calendar, Loader2, Download, Building2, MapPin, Eye, RefreshCw, X, FileText } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Select } from "../../components/ui/Select";
import { SearchableSelect } from "../../components/ui/SearchableSelect";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../context/auth";
import { getCertificateTemplates, getCertificatesByCompany } from "../../services/companyService";
import { generateCertificatePdfWithDates, getBranches } from "../../services/certificateBuilderService";
import { getToken } from "../../services/api";
import { handleSnackbar } from "../../utils/messageHelpers";
import { validateField } from "../../utils/validators";

// Meses para selector
const MONTHS = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
];

// Generar años (últimos 5 años)
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => currentYear - i);

export default function ClientCertificatesView() {
  const { session } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal de generación
  const [selectedCert, setSelectedCert] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [generating, setGenerating] = useState(false);

  // Sucursales
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState({ code: "", name: "", address: "" });
  const [loadingBranches, setLoadingBranches] = useState(false);

  // Selector de empresa (multi-empresa)
  const [selectedCompanyId, setSelectedCompanyId] = useState("");

  // Errores de validación
  const [errors, setErrors] = useState({});

  // Estado del preview PDF (incluye datos del certificado para mostrar después de cerrar el modal de generación)
  const [pdfPreview, setPdfPreview] = useState({ show: false, url: null, loading: false, cert: null, dateFrom: null, dateTo: null, options: null });

  const userRole = session?.user?.role;
  const isAdmin = userRole === "root" || userRole === "admin";
  const companyId = session?.user?.company_id;
  const companyName = session?.user?.company?.business_name || "";
  const companyRut = session?.user?.company?.rut || "";

  const companies = session?.user?.companies || [];

  // Auto-seleccionar empresa: si hay 1 sola, seleccionarla; si hay varias, seleccionar la principal
  useEffect(() => {
    if (companies.length === 1 && !selectedCompanyId) {
      setSelectedCompanyId(String(companies[0].id));
    } else if (companies.length > 1 && !selectedCompanyId && companyId) {
      setSelectedCompanyId(String(companyId));
    }
  }, [companies]);

  useEffect(() => {
    loadCertificates();
  }, [companyId]);

  const loadCertificates = async () => {
    setLoading(true);
    try {
      let response;
      if (!isAdmin && companyId) {
        response = await getCertificatesByCompany(companyId);
      } else {
        response = await getCertificateTemplates();
      }

      if (response.success && response.data) {
        // Filtrar solo certificados activos (status puede ser boolean o integer)
        setCertificates(response.data.filter(c => c.status === true || c.status === 1));
      }
    } catch (error) {
      console.error("Error loading certificates:", error);
      handleSnackbar("Error al cargar certificados", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadBranches = async (rut, templateId = null) => {
    if (!rut) {
      setBranches([]);
      return;
    }

    setLoadingBranches(true);
    try {
      // Pasar el templateId para usar el data source configurado
      const response = await getBranches(rut, templateId);
      if (response.success && response.data) {
        setBranches(response.data);
      } else {
        setBranches([]);
      }
    } catch (error) {
      console.error("Error loading branches:", error);
      setBranches([]);
    } finally {
      setLoadingBranches(false);
    }
  };

  const handleOpenModal = (cert) => {
    setSelectedCert(cert);

    // Reiniciar estados
    setSelectedBranch({ code: "", name: "", address: "" });
    setBranches([]);

    // Establecer fechas por defecto según tipo de búsqueda
    const now = new Date();
    if (cert.search_type === "month") {
      setSelectedMonth(now.getMonth() + 1);
      setSelectedYear(now.getFullYear());
    } else {
      // Valores por defecto: mes actual para rango
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setDateFrom(firstDay.toISOString().split("T")[0]);
      setDateTo(lastDay.toISOString().split("T")[0]);
    }

    // Cargar sucursales si aplica
    if (cert.query_branches) {
      const rutToUse = isAdmin && selectedCompanyId
        ? companies.find(c => c.id === parseInt(selectedCompanyId))?.rut
        : companyRut;
      if (rutToUse) {
        // Pasar el ID de la plantilla para usar el data source de sucursales configurado
        loadBranches(rutToUse, cert.id);
      }
    }
  };

  const handleCloseModal = () => {
    setSelectedCert(null);
    setDateFrom("");
    setDateTo("");
    setSelectedBranch({ code: "", name: "", address: "" });
    setBranches([]);
    setErrors({});
  };

  // Validar todos los campos del formulario
  const validateAll = () => {
    const newErrors = {};
    const { dateFrom: from, dateTo: to } = getDateParams();

    // Validar empresa (solo admin)
    if (isAdmin) {
      const companyValidation = validateField(selectedCompanyId, "select", true, "Seleccione una empresa");
      if (!companyValidation.validate) {
        newErrors.company = companyValidation.msg;
      }
    }

    // Validar sucursal si el certificado requiere sucursal
    if (selectedCert?.query_branches) {
      const branchValidation = validateField(selectedBranch.code, "select", true, "Seleccione una sucursal");
      if (!branchValidation.validate) {
        newErrors.branch = branchValidation.msg;
      }
    }

    // Validar periodo (solo para tipo rango)
    if (selectedCert?.search_type !== "month") {
      const dateFromValidation = validateField(from, "date", true, "Seleccione fecha desde");
      if (!dateFromValidation.validate) {
        newErrors.dateFrom = dateFromValidation.msg;
      }

      const dateToValidation = validateField(to, "date", true, "Seleccione fecha hasta");
      if (!dateToValidation.validate) {
        newErrors.dateTo = dateToValidation.msg;
      }
    }

    setErrors(newErrors);

    const hasErrors = Object.keys(newErrors).length > 0;
    if (hasErrors) {
      handleSnackbar("Complete los campos requeridos", "error");
    }

    return !hasErrors;
  };

  // Cuando cambia la empresa seleccionada (para admin)
  const handleCompanyChange = (e) => {
    const newCompanyId = e.target.value;
    setSelectedCompanyId(newCompanyId);
    setSelectedBranch({ code: "", name: "", address: "" });
    setBranches([]);

    // Si hay un certificado seleccionado y requiere sucursales, recargarlas
    if (selectedCert?.query_branches && newCompanyId) {
      const company = companies.find(c => c.id === parseInt(newCompanyId));
      if (company?.rut) {
        // Pasar el ID de la plantilla para usar el data source de sucursales configurado
        loadBranches(company.rut, selectedCert.id);
      }
    }
  };

  const getDateParams = () => {
    if (selectedCert?.search_type === "month") {
      // Calcular primer y último día del mes seleccionado
      const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
      const lastDay = new Date(selectedYear, selectedMonth, 0);
      return {
        dateFrom: firstDay.toISOString().split("T")[0],
        dateTo: lastDay.toISOString().split("T")[0],
      };
    }
    return { dateFrom, dateTo };
  };

  const handleGeneratePDF = async () => {
    if (!selectedCert) return;

    // Validar todos los campos usando el validador unificado
    if (!validateAll()) return;

    const { dateFrom: from, dateTo: to } = getDateParams();

    setGenerating(true);

    try {
      // Construir opciones con todos los parámetros necesarios
      const options = {};

      // company_id: enviar si hay empresa seleccionada
      if (selectedCompanyId) {
        options.companyId = selectedCompanyId;
      }

      // branch_code y branch_address: solo enviar si hay sucursal seleccionada
      if (selectedBranch.code) {
        options.branchCode = selectedBranch.code;
        options.branchName = selectedBranch.name;
        options.branchAddress = selectedBranch.address;
      }

      // month y year: solo enviar si el certificado es tipo mes
      if (selectedCert.search_type === "month") {
        options.month = selectedMonth;
        options.year = selectedYear;
      }

      // Generar PDF con autenticación - descarga directa
      const result = await generateCertificatePdfWithDates(
        selectedCert.id,
        from,
        to,
        true, // true = descargar directamente
        options
      );

      if (result.success) {
        handleSnackbar("Certificado descargado correctamente", "success");
        setSelectedCert(null);
        setDateFrom("");
        setDateTo("");
        setSelectedBranch({ code: "", name: "", address: "" });
      } else {
        handleSnackbar(result.error , "error");
      }
    } catch (error) {
      handleSnackbar("Error al generar certificado", "error");
    } finally {
      setGenerating(false);
    }
  };

  // Obtener empresa activa (la seleccionada o la del usuario)
  const getActiveCompany = () => {
    if (isAdmin && selectedCompanyId) {
      return companies.find(c => c.id === parseInt(selectedCompanyId));
    }
    return session?.user?.company;
  };

  // Construir opciones para generación de PDF
  const buildPdfOptions = useCallback(() => {
    const options = {};

    if (isAdmin && selectedCompanyId) {
      options.companyId = selectedCompanyId;
    }

    if (selectedBranch.code) {
      options.branchCode = selectedBranch.code;
      options.branchName = selectedBranch.name;
      options.branchAddress = selectedBranch.address;
    }

    if (selectedCert?.search_type === "month") {
      options.month = selectedMonth;
      options.year = selectedYear;
    }

    return options;
  }, [isAdmin, selectedCompanyId, selectedBranch, selectedCert, selectedMonth, selectedYear]);

  // Generar vista previa del PDF
  const handlePreviewPdf = useCallback(async () => {
    if (!selectedCert) return;

    // Validar todos los campos
    if (!validateAll()) return;

    const { dateFrom: from, dateTo: to } = getDateParams();
    const options = buildPdfOptions();

    // Limpiar URL anterior si existe
    if (pdfPreview.url) {
      window.URL.revokeObjectURL(pdfPreview.url);
    }

    // Guardar datos del certificado y cerrar modal de generación
    const certData = { ...selectedCert };
    setPdfPreview({ show: true, url: null, loading: true, cert: certData, dateFrom: from, dateTo: to, options });
    setSelectedCert(null); // Cerrar modal de generación

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const token = getToken();

      // Construir URL con parámetros
      const params = new URLSearchParams();
      params.append("date_from", from);
      params.append("date_to", to);
      if (options.companyId) params.append("company_id", options.companyId);
      if (options.branchCode) params.append("branch_code", options.branchCode);
      if (options.branchName) params.append("branch_name", options.branchName);
      if (options.branchAddress) params.append("branch_address", options.branchAddress);
      if (options.month) params.append("month", options.month);
      if (options.year) params.append("year", options.year);

      const response = await fetch(
        `${baseUrl}/api/certificate-builder/templates/${selectedCert.id}/pdf?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/pdf")) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          setPdfPreview(prev => ({ ...prev, url, loading: false }));
        } else {
          // La respuesta no es un PDF, probablemente es un error JSON
          const errorData = await response.json().catch(() => ({}));
          handleSnackbar(errorData.error || "Error al generar PDF", "error");
          setPdfPreview({ show: false, url: null, loading: false, cert: null, dateFrom: null, dateTo: null, options: null });
        }
      } else {
        // Intentar leer el error del blob si es JSON
        const blob = await response.blob();
        try {
          const text = await blob.text();
          const errorData = JSON.parse(text);
          handleSnackbar(errorData.error || `Error ${response.status}`, "error");
        } catch {
          handleSnackbar(`Error al generar vista previa (${response.status})`, "error");
        }
        setPdfPreview({ show: false, url: null, loading: false, cert: null, dateFrom: null, dateTo: null, options: null });
      }
    } catch (error) {
      console.error("Error generating preview:", error);
      handleSnackbar("Error de conexión al generar vista previa", "error");
      setPdfPreview({ show: false, url: null, loading: false, cert: null, dateFrom: null, dateTo: null, options: null });
    }
  }, [selectedCert, pdfPreview.url, buildPdfOptions, dateFrom, dateTo, selectedMonth, selectedYear]);

  // Refrescar vista previa
  const handleRefreshPreview = useCallback(async () => {
    // Usar datos almacenados del preview
    if (!pdfPreview.cert) {
      handleSnackbar("No hay certificado seleccionado", "error");
      return;
    }

    if (pdfPreview.url) {
      window.URL.revokeObjectURL(pdfPreview.url);
    }
    setPdfPreview(prev => ({ ...prev, url: null, loading: true }));

    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const token = getToken();

    // Usar las fechas y opciones almacenadas
    const { dateFrom: from, dateTo: to, options, cert } = pdfPreview;

    // Construir URL con parámetros
    const params = new URLSearchParams();
    params.append("date_from", from);
    params.append("date_to", to);
    if (options?.companyId) params.append("company_id", options.companyId);
    if (options?.branchCode) params.append("branch_code", options.branchCode);
    if (options?.branchName) params.append("branch_name", options.branchName);
    if (options?.branchAddress) params.append("branch_address", options.branchAddress);
    if (options?.month) params.append("month", options.month);
    if (options?.year) params.append("year", options.year);

    try {
      const response = await fetch(
        `${baseUrl}/api/certificate-builder/templates/${cert.id}/pdf?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/pdf")) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          setPdfPreview(prev => ({ ...prev, url, loading: false }));
        } else {
          const errorData = await response.json().catch(() => ({}));
          handleSnackbar(errorData.error || "Error al refrescar", "error");
          setPdfPreview(prev => ({ ...prev, loading: false }));
        }
      } else {
        const blob = await response.blob();
        try {
          const text = await blob.text();
          const errorData = JSON.parse(text);
          handleSnackbar(errorData.error || `Error ${response.status}`, "error");
        } catch {
          handleSnackbar(`Error al refrescar (${response.status})`, "error");
        }
        setPdfPreview(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error("Error refreshing preview:", error);
      handleSnackbar("Error de conexión al refrescar", "error");
      setPdfPreview(prev => ({ ...prev, loading: false }));
    }
  }, [pdfPreview]);


  // Cerrar modal de preview
  const handleClosePreview = useCallback(() => {
    if (pdfPreview.url) {
      window.URL.revokeObjectURL(pdfPreview.url);
    }
    setPdfPreview({ show: false, url: null, loading: false, cert: null, dateFrom: null, dateTo: null, options: null });
  }, [pdfPreview.url]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Award size={32} className="text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Certificados</h2>
            <p className="text-gray-600">
              {isAdmin
                ? "Todos los certificados disponibles en el sistema"
                : "Certificados disponibles para tu empresa"
              }
            </p>
          </div>
        </div>

        {companyName && !isAdmin && (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">{companyName}</span>
          </div>
        )}
      </div>

      {/* Grid de certificados */}
      {certificates.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No hay certificados disponibles</h3>
          <p className="text-gray-500 mt-2">
            {isAdmin
              ? "No se han creado certificados en el sistema"
              : "Tu empresa no tiene certificados asignados"
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              onClick={() => handleOpenModal(cert)}
              className="relative p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 bg-blue-50 border-blue-200 hover:bg-blue-100 transform hover:scale-105 hover:shadow-lg"
            >
              {/* Badge de tipo de búsqueda */}
              {cert.search_type && (
                <div className="absolute top-3 right-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    cert.search_type === "month"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                  }`}>
                    {cert.search_type === "month" ? "Por mes" : "Por rango"}
                  </span>
                </div>
              )}

              {/* Icono */}
              <div className="mb-4 text-blue-600">
                <Award size={40} />
              </div>

              {/* Contenido */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {cert.name}
                </h3>

                {cert.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {cert.description}
                  </p>
                )}

                {cert.code && (
                  <div className="text-xs text-gray-500">
                    Código: <span className="font-mono">{cert.code}</span>
                  </div>
                )}

                {/* Indicadores */}
                <div className="flex items-center gap-2 mt-2">
                  {cert.query_branches && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                      <MapPin className="w-3 h-3" />
                      Sucursales
                    </span>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-blue-200">
                <span className="text-sm font-medium text-blue-600">
                  Generar
                </span>
                <Calendar size={16} className="text-blue-600" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de generación */}
      <Modal
        open={!!selectedCert}
        onClose={handleCloseModal}
        title={`Generar: ${selectedCert?.name}`}
        size="sm"
        actions={[
          {
            label: "Cancelar",
            variant: "outline",
            onClick: handleCloseModal,
          },
          // {
          //   label: "Vista Previa",
          //   variant: "secondary",
          //   onClick: handlePreviewPdf,
          //   disabled: generating || pdfPreview.loading,
          //   icon: Eye,
          // },
          {
            label: generating ? "Generando..." : "Descargar",
            variant: "primary",
            onClick: handleGeneratePDF,
            disabled: generating || pdfPreview.loading,
            icon: Download,
          },
        ]}
      >
        <div className="space-y-4">
          {/* Info del certificado */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">{selectedCert?.name}</p>
                <p className="text-xs text-blue-600">Código: {selectedCert?.code}</p>
              </div>
            </div>
          </div>

          {/* Selector de empresa (multi-empresa) */}
          {companies.length > 1 && (
            <SearchableSelect
              id="company"
              label="Empresa"
              required
              value={selectedCompanyId}
              onChange={(val) => {
                const syntheticEvent = { target: { value: val } };
                handleCompanyChange(syntheticEvent);
                if (errors.company) setErrors(prev => ({ ...prev, company: null }));
              }}
              options={companies.map((company) => ({
                value: company.id,
                label: `${company.business_name} (${company.rut})`,
              }))}
              placeholder="Seleccionar empresa..."
              error={errors.company}
            />
          )}

          {/* Selector de sucursal (si query_branches está activo) */}
          {selectedCert?.query_branches && (
            <div>
              <SearchableSelect
                id="branch"
                label="Sucursal"
                required
                value={selectedBranch.code}
                onChange={(val) => {
                  const branch = branches.find(b => b.code === val);
                  setSelectedBranch(branch ? { code: branch.code, name: branch.name, address: branch.address } : { code: "", name: "", address: "" });
                  if (errors.branch) setErrors(prev => ({ ...prev, branch: null }));
                }}
                options={branches.map((branch) => ({
                  value: branch.code,
                  label: `${branch.name}${branch.city ? ` (${branch.city})` : ""}`,
                }))}
                placeholder={
                  loadingBranches
                    ? "Cargando sucursales..."
                    : branches.length === 0
                      ? "Sin sucursales disponibles"
                      : "Seleccionar sucursal..."
                }
                error={errors.branch}
                disabled={loadingBranches || branches.length === 0}
                helper={loadingBranches ? "Cargando sucursales..." : undefined}
              />
            </div>
          )}

          {/* Selector de periodo - CONDICIONAL según search_type */}
          {selectedCert?.search_type === "month" ? (
            /* Selector de mes y año */
            <div>
              <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1.5">
                Periodo del certificado
              </label>
              <div className="grid grid-cols-2 gap-3">
                <Select
                  id="month"
                  label="Mes"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                >
                  {MONTHS.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </Select>
                <Select
                  id="year"
                  label="Año"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                  {YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          ) : (
            /* Rango de fechas (por defecto) */
            <>
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1.5">
                  Periodo del certificado
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    id="dateFrom"
                    label="Desde"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value);
                      if (errors.dateFrom) setErrors(prev => ({ ...prev, dateFrom: null }));
                    }}
                    error={errors.dateFrom}
                    required
                  />
                  <Input
                    id="dateTo"
                    label="Hasta"
                    type="date"
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value);
                      if (errors.dateTo) setErrors(prev => ({ ...prev, dateTo: null }));
                    }}
                    error={errors.dateTo}
                    required
                  />
                </div>
              </div>

              {/* Accesos rápidos de periodo */}
              <div>
                <label className="block text-xs text-gray-500 mb-2">Accesos rápidos</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Este mes", getValue: () => {
                      const now = new Date();
                      return {
                        from: new Date(now.getFullYear(), now.getMonth(), 1),
                        to: new Date(now.getFullYear(), now.getMonth() + 1, 0)
                      };
                    }},
                    { label: "Mes anterior", getValue: () => {
                      const now = new Date();
                      return {
                        from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
                        to: new Date(now.getFullYear(), now.getMonth(), 0)
                      };
                    }},
                    { label: "Últimos 3 meses", getValue: () => {
                      const now = new Date();
                      return {
                        from: new Date(now.getFullYear(), now.getMonth() - 2, 1),
                        to: new Date(now.getFullYear(), now.getMonth() + 1, 0)
                      };
                    }},
                    { label: "Este año", getValue: () => {
                      const now = new Date();
                      return {
                        from: new Date(now.getFullYear(), 0, 1),
                        to: new Date(now.getFullYear(), 11, 31)
                      };
                    }},
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        const { from, to } = preset.getValue();
                        setDateFrom(from.toISOString().split("T")[0]);
                        setDateTo(to.toISOString().split("T")[0]);
                      }}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Nota */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">
              El certificado se generará con los datos correspondientes al periodo seleccionado.
            </p>
          </div>
        </div>
      </Modal>

      {/* Modal de Vista Previa PDF */}
      {pdfPreview.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" style={{ top: "-30px" }}>
          <div className="bg-white rounded-lg shadow-2xl w-[90vw] h-[90vh] max-w-6xl flex flex-col mt-8">
            {/* Header del modal */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">
                Vista Previa - {pdfPreview.cert?.name || "Certificado"}
              </h3>
              <div className="flex items-center gap-2">
                {/* Botón de refrescar */}
                <button
                  onClick={handleRefreshPreview}
                  disabled={pdfPreview.loading}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50"
                  title="Refrescar"
                >
                  <RefreshCw className={`h-4 w-4 ${pdfPreview.loading ? "animate-spin" : ""}`} />
                </button>
                {/* Botón de descargar */}
              
                {/* Botón de cerrar */}
                <button
                  onClick={handleClosePreview}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                  title="Cerrar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Contenido del PDF */}
            <div className="flex-1 p-4 bg-gray-100 overflow-hidden">
              {pdfPreview.loading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
                    <span className="text-gray-600">Generando PDF...</span>
                  </div>
                </div>
              ) : pdfPreview.url ? (
                <iframe
                  src={pdfPreview.url}
                  className="w-full h-full rounded border border-gray-300"
                  title="Vista previa del certificado"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No se pudo cargar el preview</p>
                    <button
                      onClick={handleRefreshPreview}
                      className="mt-3 px-4 py-2 text-sm text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded"
                    >
                      Reintentar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
