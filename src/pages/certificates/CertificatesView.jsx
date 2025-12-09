// File: src/pages/certificates/CertificatesView.jsx
import React, { useState } from "react";
import { Award, Plus, Search, Eye, Download, CheckCircle, AlertCircle, XCircle, Clock, Building2, Cog } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

// Datos dummy para certificados
const dummyCertificates = [
  {
    id: 1,
    template_name: "Certificado de Cumplimiento Tributario",
    template_code: "F30",
    company_name: "Constructora Los Andes SpA",
    company_rut: "76.123.456-7",
    certificate_number: "CERT-001",
    issue_date: "2024-11-15",
    expiration_date: "2024-12-15",
    status: "valid",
    file_name: "f30_losandes_nov2024.pdf"
  },
  {
    id: 2,
    template_name: "Certificado de Antecedentes Laborales",
    template_code: "CAL",
    company_name: "Constructora Los Andes SpA",
    company_rut: "76.123.456-7",
    certificate_number: "CERT-002",
    issue_date: "2024-11-10",
    expiration_date: "2024-12-10",
    status: "expiring",
    file_name: "cal_losandes_nov2024.pdf"
  },
  {
    id: 3,
    template_name: "Poliza de Responsabilidad Civil",
    template_code: "PRC",
    company_name: "Servicios Integrales del Norte Ltda",
    company_rut: "76.987.654-3",
    certificate_number: "CERT-003",
    issue_date: "2024-06-01",
    expiration_date: "2025-06-01",
    status: "valid",
    file_name: "prc_sinorte_2024.pdf"
  },
  {
    id: 4,
    template_name: "Certificado de Cumplimiento Tributario",
    template_code: "F30",
    company_name: "Transportes del Sur SA",
    company_rut: "77.111.222-K",
    certificate_number: "CERT-004",
    issue_date: "2024-10-01",
    expiration_date: "2024-10-31",
    status: "expired",
    file_name: "f30_transur_oct2024.pdf"
  },
  {
    id: 5,
    template_name: "Certificado ISO 9001",
    template_code: "ISO9001",
    company_name: "Minera Central SpA",
    company_rut: "76.555.444-1",
    certificate_number: "CERT-005",
    issue_date: "2024-01-15",
    expiration_date: "2027-01-15",
    status: "valid",
    file_name: "iso9001_mineracentral_2024.pdf"
  },
  {
    id: 6,
    template_name: "Certificado de Antecedentes Laborales",
    template_code: "CAL",
    company_name: "Minera Central SpA",
    company_rut: "76.555.444-1",
    certificate_number: "CERT-006",
    issue_date: "2024-11-20",
    expiration_date: "2024-12-05",
    status: "expiring",
    file_name: "cal_mineracentral_nov2024.pdf"
  },
];

const statusConfig = {
  valid: { label: "Vigente", color: "bg-green-100 text-green-800", icon: CheckCircle },
  expiring: { label: "Por Vencer", color: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
  expired: { label: "Vencido", color: "bg-red-100 text-red-800", icon: XCircle },
};

export default function CertificatesView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredCertificates = dummyCertificates.filter(cert => {
    const matchesSearch =
      cert.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.template_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.certificate_number.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" || cert.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Contadores
  const counts = {
    all: dummyCertificates.length,
    valid: dummyCertificates.filter(c => c.status === "valid").length,
    expiring: dummyCertificates.filter(c => c.status === "expiring").length,
    expired: dummyCertificates.filter(c => c.status === "expired").length,
  };

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-7 h-7" />
            Certificados
          </h1>
          <p className="text-gray-500 mt-1">Gestiona los certificados de las empresas</p>
        </div>
        <Button icon={Plus} onClick={() => alert("Funcionalidad en desarrollo")}>
          Nuevo Certificado
        </Button>
      </div>

      {/* Stats Cards */}
      {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4" >
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">{counts.all}</p>
            </div>
            <Award className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Vigentes</p>
              <p className="text-2xl font-bold text-green-600">{counts.valid}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Por Vencer</p>
              <p className="text-2xl font-bold text-yellow-600">{counts.expiring}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Vencidos</p>
              <p className="text-2xl font-bold text-red-600">{counts.expired}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div> */}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por empresa, certificado o numero..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
         
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Certificado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CÓDIGO
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCertificates.map((cert) => {
              const status = statusConfig[cert.status];
              const StatusIcon = status.icon;

              return (
                <tr key={cert.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{cert.template_name}</div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {cert.certificate_number}
                  </td>
                 
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => alert("Funcionalidad en desarrollo")}
                        className="flex text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100"
                        title="Ver"
                      > 
                        <Cog className="w-4 h-4 mt-1 mr-1" />
                        Configurar
                      </button>
                      <button
                        onClick={() => alert("Funcionalidad en desarrollo")}
                        className="flex text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="Descargar"
                      >
                        
                        <Download className="w-4 h-4 mt-1 mr-1" />
                        Descargar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredCertificates.length === 0 && (
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron certificados</p>
          </div>
        )}
      </div>
    </div>
  );
}
