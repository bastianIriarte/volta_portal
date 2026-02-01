// File: src/pages/reports/ClientReportsView.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart3, Building2, Loader2,
  Search, ChevronRight
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { getReportTemplates, getCompanyReports } from "../../services/companyService";
import { handleSnackbar } from "../../utils/messageHelpers";

export default function ClientReportsView() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Leer company de la URL o usar vacío
  const [selectedCompanyId, setSelectedCompanyId] = useState(
    () => searchParams.get("company") || ""
  );

  const userRole = session?.user?.role;
  const isAdmin = userRole === "root" || userRole === "admin";
  const companyId = session?.user?.company_id;
  const companies = session?.user?.companies || [];
  const userPermissions = session?.user?.permissions_users || [];

  // Auto-seleccionar empresa solo si no viene en la URL
  useEffect(() => {
    const urlCompany = searchParams.get("company");
    if (urlCompany) return; // Ya viene de la URL, no auto-seleccionar
    if (companies.length === 1 && !selectedCompanyId) {
      setSelectedCompanyId(String(companies[0].id));
    } else if (companies.length > 1 && !selectedCompanyId && companyId) {
      setSelectedCompanyId(String(companyId));
    }
  }, [companies]);

  // Sincronizar selectedCompanyId con la URL
  useEffect(() => {
    if (selectedCompanyId) {
      setSearchParams({ company: selectedCompanyId }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [selectedCompanyId]);

  useEffect(() => {
    loadReports();
  }, [selectedCompanyId, isAdmin]);

  const loadReports = async () => {
    setLoading(true);
    try {
      let response;
      if (selectedCompanyId) {
        // Obtener reportes asignados a la empresa seleccionada
        response = await getCompanyReports(selectedCompanyId);
      } else if (isAdmin) {
        // Para admins sin empresa seleccionada: obtener todas las plantillas
        response = await getReportTemplates();
      } else {
        setLoading(false);
        return;
      }

      if (response.success && response.data) {
        // Normalizar campos (API de empresa usa report_name/report_code, admin usa name/code)
        const normalized = response.data.map(r => ({
          ...r,
          id: r.report_id || r.id,
          name: r.report_name || r.name,
          code: r.report_code || r.code,
        }));
        // Filtrar solo reportes activos (status puede ser boolean o integer)
        setReports(normalized.filter(r => r.status === true || r.status === 1 || r.status === undefined));
      }
    } catch (error) {
      console.error("Error loading reports:", error);
      handleSnackbar("Error al cargar reportes", "error");
    } finally {
      setLoading(false);
    }
  };

  // Filtrar por permisos del usuario (solo para no-admin)
  const allowedReports = useMemo(() => {
    if (isAdmin) return reports;

    return reports.filter(report => {
      const reportId = report.id;
      const permCodeById = `reports.report_${reportId}`;
      const code = report.code;
      const permCodeByCode = code ? `reports.${code.toLowerCase()}` : null;

      return userPermissions.includes(permCodeById) ||
             (permCodeByCode && userPermissions.includes(permCodeByCode)) ||
             userPermissions.includes('reports.*');
    });
  }, [reports, userPermissions, isAdmin]);

  const selectedCompanyName = useMemo(() => {
    if (!selectedCompanyId) return null;
    const company = companies.find(c => String(c.id) === String(selectedCompanyId));
    return company?.business_name || null;
  }, [selectedCompanyId, companies]);

  const filteredReports = allowedReports.filter(report =>
    report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (report.code && report.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleViewReport = (report) => {
    const params = new URLSearchParams();
    params.append("report", report.code);
    if (selectedCompanyId) {
      params.append("company_id", selectedCompanyId);
    }
    navigate(`/dashboard/view?${params.toString()}`);
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
          <BarChart3 size={32} className="text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Reportes</h2>
            <p className="text-gray-600">
              {isAdmin
                ? "Todos los reportes disponibles en el sistema"
                : "Reportes disponibles para tu empresa"
              }
            </p>
          </div>
        </div>

        {companies.length > 1 && (
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="min-w-[250px] px-3 py-2 text-sm border border-blue-200 rounded-lg bg-blue-50 text-blue-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seleccione una empresa</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.business_name} {company.rut ? `(${company.rut})` : ""}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Barra de busqueda */}
      {allowedReports.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar reportes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Estado: sin empresa seleccionada */}
      {!selectedCompanyId && companies.length > 1 && !isAdmin ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Seleccione una empresa</h3>
          <p className="text-gray-500 mt-2">
            Seleccione una empresa para ver los reportes disponibles
          </p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">
            {searchTerm
              ? "Sin resultados"
              : "No hay reportes disponibles"
            }
          </h3>
          <p className="text-gray-500 mt-2">
            {searchTerm
              ? "No se encontraron reportes con ese criterio"
              : selectedCompanyName
                ? `No existen reportes asociados a la empresa: ${selectedCompanyName}`
                : "No existen reportes disponibles"
            }
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporte</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Código</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Descripción</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredReports.map((report) => (
                <tr
                  key={report.id}
                  onClick={() => handleViewReport(report)}
                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{report.name}</p>
                        <p className="text-xs text-gray-500 md:hidden">{report.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className="inline-flex px-2 py-0.5 text-xs font-mono text-gray-600 bg-gray-100 rounded">
                      {report.code}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <p className="text-sm text-gray-500 truncate max-w-xs">
                      {report.description || "-"}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <ChevronRight className="w-4 h-4 text-gray-400 inline-block" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              {filteredReports.length} {filteredReports.length === 1 ? "reporte" : "reportes"} disponibles
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
