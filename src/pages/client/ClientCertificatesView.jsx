import { useState, useEffect } from "react";
import { Award, Calendar, Loader2, Download, Building2, ChevronDown, MapPin } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { useAuth } from "../../context/auth";
import { getCertificateTemplates, getCertificatesByCompany, getCompanies } from "../../services/companyService";
import { generateCertificatePdfWithDates, getBranches } from "../../services/certificateBuilderService";
import { handleSnackbar } from "../../utils/messageHelpers";

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
  const [selectedBranch, setSelectedBranch] = useState("");
  const [loadingBranches, setLoadingBranches] = useState(false);

  // Selector de empresa (para admin/root)
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  const userRole = session?.user?.role;
  const isAdmin = userRole === "root" || userRole === "admin";
  const companyId = session?.user?.company_id;
  const companyName = session?.user?.company?.business_name || "";
  const companyRut = session?.user?.company?.rut || "";

  useEffect(() => {
    loadCertificates();
    if (isAdmin) {
      loadCompanies();
    }
  }, [companyId, isAdmin]);

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

  const loadCompanies = async () => {
    setLoadingCompanies(true);
    try {
      const response = await getCompanies();
      if (response.success && response.data) {
        setCompanies(response.data);
      }
    } catch (error) {
      console.error("Error loading companies:", error);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const loadBranches = async (rut) => {
    if (!rut) {
      setBranches([]);
      return;
    }

    setLoadingBranches(true);
    try {
      const response = await getBranches(rut);
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
    setSelectedBranch("");
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
        loadBranches(rutToUse);
      }
    }
  };

  const handleCloseModal = () => {
    setSelectedCert(null);
    setDateFrom("");
    setDateTo("");
    setSelectedBranch("");
    setBranches([]);
  };

  // Cuando cambia la empresa seleccionada (para admin)
  const handleCompanyChange = (e) => {
    const newCompanyId = e.target.value;
    setSelectedCompanyId(newCompanyId);
    setSelectedBranch("");

    // Si hay un certificado seleccionado y requiere sucursales, recargarlas
    if (selectedCert?.query_branches && newCompanyId) {
      const company = companies.find(c => c.id === parseInt(newCompanyId));
      if (company?.rut) {
        loadBranches(company.rut);
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

    const { dateFrom: from, dateTo: to } = getDateParams();

    if (!from || !to) {
      handleSnackbar("Selecciona el periodo", "error");
      return;
    }

    setGenerating(true);

    try {
      // Generar PDF con autenticación - descarga directa
      const result = await generateCertificatePdfWithDates(
        selectedCert.id,
        from,
        to,
        true // true = descargar directamente
      );

      if (result.success) {
        handleSnackbar("Certificado descargado correctamente", "success");
        setSelectedCert(null);
        setDateFrom("");
        setDateTo("");
      } else {
        handleSnackbar(result.error || "Error al generar certificado", "error");
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
          {
            label: generating ? "Generando..." : "Generar PDF",
            variant: "primary",
            onClick: handleGeneratePDF,
            disabled: generating,
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

          {/* Selector de empresa (solo admin) */}
          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Empresa
              </label>
              <div className="relative">
                <select
                  value={selectedCompanyId}
                  onChange={handleCompanyChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none bg-white"
                >
                  <option value="">Seleccionar empresa...</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.business_name} ({company.rut})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Selector de sucursal (si query_branches está activo) */}
          {selectedCert?.query_branches && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  Sucursal
                </div>
              </label>
              <div className="relative">
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none bg-white"
                  disabled={loadingBranches || branches.length === 0}
                >
                  <option value="">
                    {loadingBranches
                      ? "Cargando sucursales..."
                      : branches.length === 0
                        ? "Sin sucursales disponibles"
                        : "Todas las sucursales"}
                  </option>
                  {branches.map((branch) => (
                    <option key={branch.code} value={branch.code}>
                      {branch.name} {branch.city ? `(${branch.city})` : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              {loadingBranches && (
                <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Cargando sucursales...
                </p>
              )}
            </div>
          )}

          {/* Selector de periodo - CONDICIONAL según search_type */}
          {selectedCert?.search_type === "month" ? (
            /* Selector de mes y año */
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Periodo del certificado
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Mes</label>
                  <div className="relative">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none bg-white"
                    >
                      {MONTHS.map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Año</label>
                  <div className="relative">
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none bg-white"
                    >
                      {YEARS.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Rango de fechas (por defecto) */
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Periodo del certificado
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Desde</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Hasta</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
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
              El certificado se generará con los datos correspondientes al periodo seleccionado
              y se descargará automáticamente.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
