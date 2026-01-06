// File: src/pages/reports/ReportFullscreenView.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function ReportFullscreenView() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Obtener URL del reporte desde query params (base64 encoded para evitar problemas con caracteres especiales)
  const encodedUrl = searchParams.get("url");
  const reportUrl = encodedUrl ? atob(encodedUrl) : null;

  useEffect(() => {
    if (!reportUrl) {
      navigate("/dashboard");
    }
  }, [reportUrl, navigate]);

  const handleLoad = () => {
    // Delay más largo para asegurar que Power BI termine de renderizar
    setTimeout(() => {
      setLoading(false);
    }, 2500);
  };

  // Timeout de seguridad (más largo para reportes pesados)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 8000);
    return () => clearTimeout(timeout);
  }, []);

  if (!reportUrl) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-white overflow-hidden">
      {/* Loader overlay */}
      <div
        className={`absolute inset-0 bg-white flex flex-col items-center justify-center z-10 transition-opacity duration-300 ${
          loading ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-gray-600">Cargando reporte...</p>
      </div>

      {/* Iframe con controles ocultos - ocupa toda la pantalla */}
      <iframe
        src={reportUrl}
        className="w-full border-0"
        style={{ height: 'calc(100vh + 56px)' }}
        title="Reporte"
        sandbox="allow-scripts allow-same-origin allow-popups"
        onLoad={handleLoad}
      />
    </div>
  );
}
