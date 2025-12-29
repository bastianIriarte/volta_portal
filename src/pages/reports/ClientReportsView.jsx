// File: src/pages/reports/ClientReportsView.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText, BarChart3, Calendar, Building2, Loader2,
  ChevronRight, Filter, Search
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/auth";
import { getCertificateTemplates } from "../../services/companyService";
import { handleSnackbar } from "../../utils/messageHelpers";

export default function ClientReportsView() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Obtener permisos del usuario
  const userPermissions = session?.user?.permissions || [];
  const companyName = session?.user?.company?.business_name || "";

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    setLoading(true);
    try {
      const response = await getCertificateTemplates();
      if (response.success && response.data) {
        // Filtrar certificados segun permisos del usuario
        const filteredCerts = response.data.filter(cert => {
          const permCode = `certificates.${cert.code}`;
          // Si el usuario tiene el permiso especifico o tiene permiso general
          return userPermissions.includes(permCode) ||
                 userPermissions.includes('certificates.*') ||
                 session?.user?.profile?.code === 'root' ||
                 session?.user?.profile?.code === 'admin';
        });
        setCertificates(filteredCerts);
      }
    } catch (error) {
      console.error("Error loading certificates:", error);
      handleSnackbar("Error al cargar certificados", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredCertificates = certificates.filter(cert =>
    cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewCertificate = (cert) => {
    navigate(`/dashboard/reportes/${cert.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-blue-600" />
            Reportes
          </h1>
          <p className="text-gray-500 mt-1">
            Acceda a los reportes y certificados de su empresa
          </p>
        </div>

        {companyName && (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">{companyName}</span>
          </div>
        )}
      </div>

      {/* Barra de busqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar reportes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Lista de certificados */}
      {filteredCertificates.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No hay reportes disponibles</h3>
          <p className="text-gray-500 mt-1">
            {searchTerm ? "No se encontraron reportes con ese criterio de busqueda" : "No tiene permisos asignados para ver reportes"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCertificates.map((cert) => (
            <div
              key={cert.id}
              onClick={() => handleViewCertificate(cert)}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {cert.name}
                    </h3>
                    <p className="text-sm text-gray-500">{cert.code}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>

              {cert.description && (
                <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                  {cert.description}
                </p>
              )}

              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>Filtrar por fechas disponible</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
