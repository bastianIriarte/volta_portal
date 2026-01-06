import { useState, useEffect } from "react";
import { FolderOpen, ExternalLink, FileText } from "lucide-react";
import { useAuth } from "../../context/auth";
import { handleSnackbar } from "../../utils/messageHelpers";
import { getCompanyDocuments } from "../../services/companyService";
import GenericFilters from "../../components/common/GenericFilters";
import GenericTable from "../../components/common/GenericTable";
import { useTableLogic } from "../../hooks/useTableLogic";

export default function ClientDocumentsView() {
  const { session } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const companyId = session?.user?.company_id;

  // Configuración de la tabla
  const tableConfig = {
    defaultSort: "name",
    defaultSortDir: "asc",
    pageSize: 10,
    searchFields: ["name", "document_type", "category", "description"]
  };

  const {
    q,
    setQ,
    sortBy,
    sortDir,
    page,
    setPage,
    filteredData,
    pageData,
    totalPages,
    handleSort
  } = useTableLogic(documents, tableConfig);

  useEffect(() => {
    loadDocuments();
  }, [companyId]);

  const loadDocuments = async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await getCompanyDocuments(companyId);
      if (response.success) {
        setDocuments(response.data || []);
      } else {
        setDocuments([]);
      }
    } catch (error) {
      console.error("Error loading documents:", error);
      handleSnackbar("Error al cargar documentos", "error");
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDocument = (doc) => {
    if (doc.file_path) {
      window.open(doc.file_path, '_blank');
    } else {
      handleSnackbar("Este documento no tiene un enlace asociado", "warning");
    }
  };

  // Configuración de columnas
  const columns = [
    { key: "name", label: "Nombre" },
    { key: "description", label: "Descripción" },
    { key: "actions", label: "Acciones", sortable: false, headerClassName: "text-center" }
  ];

  // Renderizado de filas
  const renderRow = (doc) => {
    return (
      <tr key={doc.id} className="border-t hover:bg-gray-50 text-[13px]">
        <td className="px-3 py-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" />
            <span className="font-medium text-gray-900">{doc.name}</span>
          </div>
        </td>
        <td className="px-3 py-2 text-gray-600">
          {doc.description || '-'}
        </td>
        <td className="px-3 py-2 text-center">
          {doc.file_path && (
            <button
              onClick={() => handleOpenDocument(doc)}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center gap-1"
              title="Abrir documento"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <FolderOpen className="w-8 h-8 text-blue-600" />
          Documentos
        </h2>
        <p className="text-gray-500">
          Documentos disponibles para tu empresa
        </p>
      </div>

      {/* Filtros */}
      <GenericFilters
        searchPlaceholder="Buscar documentos..."
        searchValue={q}
        onSearchChange={setQ}
        resultsCount={filteredData.length}
      />

      {/* Tabla */}
      <GenericTable
        title="Documentos de la empresa"
        loading={loading}
        columns={columns}
        data={filteredData}
        pageData={pageData}
        emptyMessage="No hay documentos disponibles"
        emptyIcon={FolderOpen}
        searchQuery={q}
        onClearSearch={() => setQ("")}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={handleSort}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalResults={filteredData.length}
        renderRow={renderRow}
        perPage={10}
      />
    </div>
  );
}
