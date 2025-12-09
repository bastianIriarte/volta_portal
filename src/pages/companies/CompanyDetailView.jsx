// File: src/pages/companies/CompanyDetailView.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Building2, FileText, Award, Save, ArrowLeft,
  CheckCircle, AlertCircle, CheckSquare, Square,
  ToggleLeft, ToggleRight, Link2, Plus, Trash2, ExternalLink
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
    created_at: "2024-04-05"
  },
];

// Datos dummy para accesos a documentos SharePoint (company_documents)
const dummyCompanyDocuments = {
  1: [
    { id: 1, name: "Ordenes de Compra 2024", url: "https://voltacl.sharepoint.com/sites/Proveedores/OC2024", status: true },
    { id: 2, name: "Contratos Vigentes", url: "https://voltacl.sharepoint.com/sites/Proveedores/Contratos", status: true },
    { id: 3, name: "Guias de Despacho", url: "https://voltacl.sharepoint.com/sites/Proveedores/Guias", status: true },
    { id: 4, name: "Facturas Pendientes", url: "https://voltacl.sharepoint.com/sites/Proveedores/Facturas", status: false },
    { id: 5, name: "Documentos Legales", url: "https://voltacl.sharepoint.com/sites/Proveedores/Legal", status: true },
  ],
  2: [
    { id: 6, name: "Ordenes de Compra 2024", url: "https://voltacl.sharepoint.com/sites/Proveedores/OC2024", status: true },
    { id: 7, name: "Contratos Vigentes", url: "https://voltacl.sharepoint.com/sites/Proveedores/Contratos", status: true },
  ],
  3: [
    { id: 8, name: "Ordenes de Compra 2024", url: "https://voltacl.sharepoint.com/sites/Proveedores/OC2024", status: false },
  ],
  4: [
    { id: 9, name: "Ordenes de Compra 2024", url: "https://voltacl.sharepoint.com/sites/Proveedores/OC2024", status: true },
    { id: 10, name: "Contratos Vigentes", url: "https://voltacl.sharepoint.com/sites/Proveedores/Contratos", status: true },
    { id: 11, name: "Guias de Despacho", url: "https://voltacl.sharepoint.com/sites/Proveedores/Guias", status: true },
    { id: 12, name: "Facturas Pendientes", url: "https://voltacl.sharepoint.com/sites/Proveedores/Facturas", status: true },
  ],
};

// Templates de certificados disponibles (para asignar)
const certificateTemplates = [
  { id: 1, code: "F30", name: "Certificado de Cumplimiento Tributario", category: "tributario", is_mandatory: true },
  { id: 2, code: "CAL", name: "Certificado de Antecedentes Laborales", category: "laboral", is_mandatory: true },
  { id: 3, code: "PRC", name: "Poliza de Responsabilidad Civil", category: "seguros", is_mandatory: true },
  { id: 4, code: "CRC", name: "Certificado Registro de Contratistas", category: "laboral", is_mandatory: false },
  { id: 5, code: "ISO9001", name: "Certificado ISO 9001", category: "calidad", is_mandatory: false },
  { id: 6, code: "ISO14001", name: "Certificado ISO 14001", category: "calidad", is_mandatory: false },
  { id: 7, code: "OHSAS", name: "Certificado OHSAS 18001", category: "seguridad", is_mandatory: false },
];

// Certificados asignados por empresa (company_certificates)
const dummyCompanyCertificates = {
  1: [1, 2, 3],
  2: [1, 2, 3, 4, 5],
  3: [1],
  4: [1, 2, 3, 4, 5, 6, 7],
};

const categoryColors = {
  tributario: "bg-cyan-100 text-cyan-800",
  laboral: "bg-indigo-100 text-indigo-800",
  seguros: "bg-amber-100 text-amber-800",
  calidad: "bg-emerald-100 text-emerald-800",
  seguridad: "bg-rose-100 text-rose-800",
};

export default function CompanyDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const companyId = parseInt(id);

  const [activeTab, setActiveTab] = useState("info");
  const [company, setCompany] = useState(null);
  const [formData, setFormData] = useState({});
  const [companyDocuments, setCompanyDocuments] = useState([]);
  const [assignedCertificates, setAssignedCertificates] = useState({});
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [newDocument, setNewDocument] = useState({ name: "", url: "", status: true });

  useEffect(() => {
    // Cargar empresa
    const foundCompany = dummyCompanies.find(c => c.id === companyId);
    if (foundCompany) {
      setCompany(foundCompany);
      setFormData({ ...foundCompany });
      // Cargar documentos SharePoint
      setCompanyDocuments(dummyCompanyDocuments[companyId] || []);
      // Cargar certificados asignados
      setAssignedCertificates(
        certificateTemplates.reduce((acc, template) => {
          acc[template.id] = (dummyCompanyCertificates[companyId] || []).includes(template.id);
          return acc;
        }, {})
      );
    }
  }, [companyId]);

  // Handlers para documentos SharePoint
  const handleToggleDocumentStatus = (docId) => {
    setCompanyDocuments(prev =>
      prev.map(doc =>
        doc.id === docId ? { ...doc, status: !doc.status } : doc
      )
    );
  };

  const handleAddDocument = () => {
    if (newDocument.name && newDocument.url) {
      const newId = Math.max(...companyDocuments.map(d => d.id), 0) + 1;
      setCompanyDocuments(prev => [...prev, { ...newDocument, id: newId }]);
      setNewDocument({ name: "", url: "", status: true });
      setShowAddDocument(false);
    }
  };

  const handleDeleteDocument = (docId) => {
    setCompanyDocuments(prev => prev.filter(doc => doc.id !== docId));
  };

  // Handlers para certificados
  const handleToggleCertificate = (templateId) => {
    setAssignedCertificates(prev => ({
      ...prev,
      [templateId]: !prev[templateId]
    }));
  };

  const handleSelectAll = () => {
    const allSelected = certificateTemplates.every(t => assignedCertificates[t.id]);
    const newState = {};
    certificateTemplates.forEach(t => {
      newState[t.id] = !allSelected;
    });
    setAssignedCertificates(newState);
  };

  const handleSelectMandatory = () => {
    const newState = { ...assignedCertificates };
    certificateTemplates.forEach(t => {
      if (t.is_mandatory) {
        newState[t.id] = true;
      }
    });
    setAssignedCertificates(newState);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveCompany = () => {
    alert("Guardando cambios de la empresa...");
  };

  const handleSaveDocuments = () => {
    alert("Guardando configuracion de accesos SharePoint...");
  };

  const handleSaveCertificates = () => {
    alert("Guardando asignacion de certificados...");
  };

  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Empresa no encontrada</p>
      </div>
    );
  }

  const assignedCount = Object.values(assignedCertificates).filter(Boolean).length;
  const activeDocsCount = companyDocuments.filter(d => d.status).length;

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/empresas")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-7 h-7" />
              {company.business_name}
            </h1>
            <p className="text-gray-500 mt-1">{company.rut} | {company.sap_code}</p>
          </div>
        </div>
        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
          company.status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {company.status ? "Activa" : "Inactiva"}
        </span>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px px-6">
            {[
              { id: "info", label: "Informacion", icon: Building2 },
              { id: "documents", label: `Documentos (${activeDocsCount}/${companyDocuments.length})`, icon: FileText },
              { id: "certificates", label: `Certificados (${assignedCount})`, icon: Award },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-cyan-500 text-cyan-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* TAB: Informacion */}
          {activeTab === "info" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Editar Informacion de la Empresa</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RUT</label>
                  <Input
                    value={formData.rut || ""}
                    onChange={(e) => handleFormChange("rut", e.target.value)}
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">El RUT no puede ser modificado</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Codigo SAP</label>
                  <Input
                    value={formData.sap_code || ""}
                    onChange={(e) => handleFormChange("sap_code", e.target.value)}
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">El codigo SAP se asigna automaticamente</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Razon Social</label>
                  <Input
                    value={formData.business_name || ""}
                    onChange={(e) => handleFormChange("business_name", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email de Contacto</label>
                  <Input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => handleFormChange("email", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                  <Input
                    value={formData.phone || ""}
                    onChange={(e) => handleFormChange("phone", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <button
                    onClick={() => handleFormChange("status", !formData.status)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      formData.status
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-red-50 border-red-200 text-red-700"
                    }`}
                  >
                    {formData.status ? (
                      <>
                        <ToggleRight className="w-5 h-5" />
                        Activa
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-5 h-5" />
                        Inactiva
                      </>
                    )}
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Registro</label>
                  <Input
                    value={formData.created_at || ""}
                    disabled
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSaveCompany} icon={Save}>
                  Guardar Cambios
                </Button>
              </div>
            </div>
          )}

          {/* TAB: Documentos (Accesos SharePoint) */}
          {activeTab === "documents" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Accesos a Documentos</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Configura los accesos a carpetas de SharePoint u otro sistema para esta empresa.
                    Los accesos activos estaran disponibles para los usuarios de la empresa que tengan el permiso de visualización.
                  </p>
                </div>
                <Button size="sm" icon={Plus} onClick={() => setShowAddDocument(true)}>
                  Agregar Acceso
                </Button>
              </div>

              {/* Formulario para agregar nuevo acceso */}
              {showAddDocument && (
                <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Link2 className="w-4 h-4" />
                    Nuevo Acceso a Documento
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Nombre del Acceso</label>
                      <Input
                        placeholder="Ej: Ordenes de Compra"
                        value={newDocument.name}
                        onChange={(e) => setNewDocument(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">URL de documento</label>
                      <Input
                        placeholder="https://voltacl.sharepoint.com/sites/..."
                        value={newDocument.url}
                        onChange={(e) => setNewDocument(prev => ({ ...prev, url: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button size="sm" variant="secondary" onClick={() => {
                      setShowAddDocument(false);
                      setNewDocument({ name: "", url: "", status: true });
                    }}>
                      Cancelar
                    </Button>
                    <Button size="sm" onClick={handleAddDocument}>
                      Agregar
                    </Button>
                  </div>
                </div>
              )}

              {/* Lista de accesos */}
              {companyDocuments.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL SharePoint</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {companyDocuments.map((doc) => (
                        <tr key={doc.id} className={`hover:bg-gray-50 ${!doc.status ? 'opacity-60' : ''}`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <FileText className={`w-4 h-4 ${doc.status ? 'text-cyan-500' : 'text-gray-400'}`} />
                              <span className="text-sm font-medium text-gray-900">{doc.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-cyan-600 hover:text-cyan-800 flex items-center gap-1 max-w-md truncate"
                            >
                              <ExternalLink className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{doc.url}</span>
                            </a>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleToggleDocumentStatus(doc.id)}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                doc.status
                                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              {doc.status ? (
                                <>
                                  <ToggleRight className="w-4 h-4" />
                                  Activo
                                </>
                              ) : (
                                <>
                                  <ToggleLeft className="w-4 h-4" />
                                  Inactivo
                                </>
                              )}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                              title="Eliminar acceso"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <Link2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No hay accesos configurados</p>
                  <p className="text-sm text-gray-400 mt-1">Agrega accesos a carpetas de SharePoint para esta empresa</p>
                  <Button className="mt-4" size="sm" icon={Plus} onClick={() => setShowAddDocument(true)}>
                    Agregar primer acceso
                  </Button>
                </div>
              )}

              {companyDocuments.length > 0 && (
                <div className="flex justify-between items-center pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    <span className="font-medium text-green-600">{activeDocsCount}</span> accesos activos de <span className="font-medium">{companyDocuments.length}</span> configurados
                  </p>
                  <Button onClick={handleSaveDocuments} icon={Save}>
                    Guardar Cambios
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* TAB: Certificados */}
          {activeTab === "certificates" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Asignar Certificados</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Selecciona los certificados que debe presentar esta empresa.
                  </p>
                </div>
                <div className="flex gap-2">
                  {/* <Button size="sm" variant="secondary" onClick={handleSelectMandatory}>
                    Obligatorios
                  </Button> */}
                  <Button size="sm" variant="secondary" onClick={handleSelectAll}>
                    {certificateTemplates.every(t => assignedCertificates[t.id]) ? 'Quitar todos' : 'Asignar todos'}
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12">
                        <button
                          onClick={handleSelectAll}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          {certificateTemplates.every(t => assignedCertificates[t.id])
                            ? <CheckSquare className="w-4 h-4 text-cyan-600" />
                            : <Square className="w-4 h-4 text-gray-400" />
                          }
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Codigo</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Certificado</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Obligatorio</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {certificateTemplates.map((template) => (
                      <tr
                        key={template.id}
                        className={`hover:bg-gray-50 cursor-pointer ${assignedCertificates[template.id] ? 'bg-cyan-50' : ''}`}
                        onClick={() => handleToggleCertificate(template.id)}
                      >
                        <td className="px-4 py-3">
                          <button className="p-1">
                            {assignedCertificates[template.id]
                              ? <CheckSquare className="w-5 h-5 text-cyan-600" />
                              : <Square className="w-5 h-5 text-gray-400" />
                            }
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">{template.code}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">{template.name}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${categoryColors[template.category] || 'bg-gray-100 text-gray-800'}`}>
                            {template.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {template.is_mandatory ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <AlertCircle className="w-3 h-3" />
                              Si
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">No</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <p className="text-sm text-gray-500">
                  <span className="font-medium text-cyan-600">{assignedCount}</span> de <span className="font-medium">{certificateTemplates.length}</span> certificados asignados
                </p>
                <Button onClick={handleSaveCertificates} icon={Save}>
                  Guardar Cambios
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
