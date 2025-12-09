// File: src/pages/certificate_templates/CertificateTemplatesView.jsx
import React, { useState } from "react";
import { FileCheck, Plus, Search, Edit, Trash2, Eye, Clock } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

// Datos dummy para plantillas de certificados
const dummyTemplates = [
  {
    id: 1,
    name: "Certificado de Cumplimiento Tributario",
    code: "F30",
    description: "Certificado emitido por el SII que acredita situacion tributaria al dia",
    category: "tributario",
    is_mandatory: true,
    validity_days: 30,
    certificates_count: 45,
    status: true,
    created_at: "2024-01-10"
  },
  {
    id: 2,
    name: "Certificado de Antecedentes Laborales",
    code: "CAL",
    description: "Certificado de la Direccion del Trabajo sobre deudas previsionales",
    category: "laboral",
    is_mandatory: true,
    validity_days: 30,
    certificates_count: 38,
    status: true,
    created_at: "2024-01-15"
  },
  {
    id: 3,
    name: "Poliza de Responsabilidad Civil",
    code: "PRC",
    description: "Poliza que cubre danos a terceros durante la ejecucion de servicios",
    category: "seguros",
    is_mandatory: true,
    validity_days: 365,
    certificates_count: 32,
    status: true,
    created_at: "2024-02-01"
  },
  {
    id: 4,
    name: "Certificado de Inscripcion en Registro de Contratistas",
    code: "CRC",
    description: "Inscripcion en registro de contratistas del organismo administrador",
    category: "laboral",
    is_mandatory: false,
    validity_days: 365,
    certificates_count: 15,
    status: true,
    created_at: "2024-02-20"
  },
  {
    id: 5,
    name: "Certificado ISO 9001",
    code: "ISO9001",
    description: "Certificacion de sistema de gestion de calidad",
    category: "calidad",
    is_mandatory: false,
    validity_days: 1095,
    certificates_count: 8,
    status: true,
    created_at: "2024-03-01"
  },
];

const categoryLabels = {
  tributario: { label: "Tributario", color: "bg-blue-100 text-blue-800" },
  laboral: { label: "Laboral", color: "bg-purple-100 text-purple-800" },
  seguros: { label: "Seguros", color: "bg-orange-100 text-orange-800" },
  calidad: { label: "Calidad", color: "bg-green-100 text-green-800" },
};

export default function CertificateTemplatesView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);

  const filteredTemplates = dummyTemplates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleView = (template) => {
    setSelectedTemplate(template);
    setShowModal(true);
  };

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileCheck className="w-7 h-7" />
            Plantillas de Certificados
          </h1>
          <p className="text-gray-500 mt-1">Define los tipos de certificados requeridos a las empresas</p>
        </div>
        <Button icon={Plus} onClick={() => setShowFormModal(true)}>
          Nueva Plantilla
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nombre o codigo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
        </div>
      </div>

      {/* Grid de plantillas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => {
          const category = categoryLabels[template.category] || { label: template.category, color: "bg-gray-100 text-gray-800" };

          return (
            <div
              key={template.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">{template.code}</span>
                    {template.is_mandatory && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Obligatorio</span>
                    )}
                  </div>
                  <h3 className="font-medium text-gray-900 line-clamp-2">{template.name}</h3>
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{template.description}</p>

              <div className="flex items-center justify-between text-sm">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${category.color}`}>
                  {category.label}
                </span>
                <div className="flex items-center gap-1 text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  {template.validity_days} dias
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {template.certificates_count} certificados activos
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleView(template)}
                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                    title="Ver"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => alert("Editar plantilla")}
                    className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => alert("Eliminar plantilla")}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de detalle */}
      {showModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Detalle de Plantilla</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Codigo</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{selectedTemplate.code}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Categoria</label>
                  <p className="mt-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryLabels[selectedTemplate.category]?.color}`}>
                      {categoryLabels[selectedTemplate.category]?.label}
                    </span>
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-500">Nombre</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedTemplate.name}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-500">Descripcion</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedTemplate.description}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Vigencia</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedTemplate.validity_days} dias</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Obligatorio</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedTemplate.is_mandatory ? "Si" : "No"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Certificados Activos</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedTemplate.certificates_count}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Estado</label>
                  <p className="mt-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedTemplate.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {selectedTemplate.status ? "Activo" : "Inactivo"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cerrar
              </Button>
              <Button icon={Edit}>
                Editar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de formulario (placeholder) */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Nueva Plantilla</h2>
              <button
                onClick={() => setShowFormModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <div className="p-6">
              <div className="text-center py-8">
                <FileCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Proximamente</h3>
                <p className="text-gray-500 mt-2">El formulario de creacion estara disponible pronto</p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <Button variant="secondary" onClick={() => setShowFormModal(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
