// File: src/pages/companies/CompaniesView.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2, Plus, Search, FileText, Award, Edit
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

// Datos dummy para empresas
const dummyCompanies = [
  {
    id: 1,
    rut: "76.123.456-7",
    business_name: "Constructora Los Andes SpA",
    sap_code: "SAP001",
    email: "contacto@losandes.cl",
    phone: "+56 9 8765 4321",
    status: true,
    documents_count: 5,
    certificates_count: 3,
    created_at: "2024-01-15"
  },
  {
    id: 2,
    rut: "76.987.654-3",
    business_name: "Servicios Integrales del Norte Ltda",
    sap_code: "SAP002",
    email: "info@sinorte.cl",
    phone: "+56 9 1234 5678",
    status: true,
    documents_count: 8,
    certificates_count: 5,
    created_at: "2024-02-20"
  },
  {
    id: 3,
    rut: "77.111.222-K",
    business_name: "Transportes del Sur SA",
    sap_code: "SAP003",
    email: "gerencia@transur.cl",
    phone: "+56 9 5555 4444",
    status: false,
    documents_count: 2,
    certificates_count: 1,
    created_at: "2024-03-10"
  },
  {
    id: 4,
    rut: "76.555.444-1",
    business_name: "Minera Central SpA",
    sap_code: "SAP004",
    email: "operaciones@mineracentral.cl",
    phone: "+56 9 7777 8888",
    status: true,
    documents_count: 12,
    certificates_count: 8,
    created_at: "2024-04-05"
  },
];

export default function CompaniesView() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCompanies = dummyCompanies.filter(company =>
    company.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.rut.includes(searchTerm)
  );

  const handleEditCompany = (companyId) => {
    navigate(`/dashboard/empresas/${companyId}/editar`);
  };

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-7 h-7" />
            Empresas
          </h1>
          <p className="text-gray-500 mt-1">Gestiona las empresas registradas en el sistema</p>
        </div>
        <Button icon={Plus} onClick={() => alert("Funcionalidad en desarrollo")}>
          Nueva Empresa
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nombre o RUT..."
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
                Empresa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Codigo SAP
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Documentos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Certificados
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCompanies.map((company) => (
              <tr key={company.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{company.business_name}</div>
                    <div className="text-sm text-gray-500">{company.rut}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {company.sap_code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{company.email}</div>
                  <div className="text-sm text-gray-500">{company.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800">
                    <FileText className="w-3 h-3" />
                    {company.documents_count}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-white">
                    <Award className="w-3 h-3" />
                    {company.certificates_count}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    company.status
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {company.status ? "Activa" : "Inactiva"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEditCompany(company.id)}
                    className="inline-flex items-center gap-1 text-cyan-600 hover:text-cyan-900 px-3 py-1.5 rounded-lg hover:bg-cyan-50 transition-colors"
                    title="Editar empresa"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCompanies.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No se encontraron empresas</p>
          </div>
        )}
      </div>
    </div>
  );
}
