import React from "react";
import { FileText, Plus, Link2, ExternalLink, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/Button";

export default function CompanyDocumentsTab({
  documents,
  loading,
  deletingDoc,
  onOpenModal,
  onDelete
}) {

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Accesos Directos</h3>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona los enlaces a documentos y reportes para esta empresa.
          </p>
        </div>
        <Button onClick={() => onOpenModal('create')} icon={Plus}>
          Nuevo Acceso
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : documents.length > 0 ? (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className={`border rounded-lg p-4 ${doc.status ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-70'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${doc.status ? 'bg-cyan-100' : 'bg-gray-200'}`}>
                    <FileText className={`w-5 h-5 ${doc.status ? 'text-cyan-600' : 'text-gray-500'}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-gray-900">{doc.name}</h4>
                    {doc.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{doc.description}</p>
                    )}
                    {doc.file_path && (
                      <p className="text-xs text-gray-400 mt-1 truncate">{doc.file_path}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {doc.file_path && (
                    <a
                      href={doc.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                      title="Abrir en nueva pestaña"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => onOpenModal('edit', doc)}
                    className="p-2 text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(doc)}
                    disabled={deletingDoc === doc.id}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    {deletingDoc === doc.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <Link2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No hay accesos directos</p>
          <p className="text-sm text-gray-400 mt-1">Crea un nuevo acceso para comenzar</p>
        </div>
      )}
    </div>
  );
}
