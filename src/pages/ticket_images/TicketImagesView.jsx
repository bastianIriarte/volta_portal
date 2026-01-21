import { useState, useEffect } from "react";
import { Modal } from "../../components/ui/Modal";
import GenericFilters from "../../components/common/GenericFilters";
import GenericTable from "../../components/common/GenericTable";
import TableActions from "../../components/common/TableActions";
import { useModals } from "../../hooks/useModals";
import { handleSnackbar } from "../../utils/messageHelpers";
import {
  getTicketImages,
  getTicketImage,
  fetchTicketImagesFromSap,
  uploadTicketImage,
  createManualTicketImage,
  deleteTicketImage,
} from "../../services/ticketImageService";
import { getCompaniesList } from "../../services/companyService";
import {
  Image,
  Building2,
  Cloud,
  HardDrive,
  Download,
  Plus,
  Eye,
  Upload,
  Trash2,
  CheckCircle,
  XCircle,
  Filter,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";

// Componentes modales
import FetchSapModal from "./components/FetchSapModal";
import UploadImageModal from "./components/UploadImageModal";
import CreateManualModal from "./components/CreateManualModal";
import ImagePreviewModal from "./components/ImagePreviewModal";

export default function TicketImagesView() {
  // Estados de datos
  const [images, setImages] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [trigger, setTrigger] = useState(0);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [filterIsPublic, setFilterIsPublic] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modales
  const [showFetchModal, setShowFetchModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);

  const { modals, openConfirm, closeModal } = useModals();

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    loadData(currentPage);
  }, [trigger, selectedCompanyId, filterIsPublic]);

  const loadCompanies = async () => {
    try {
      const response = await getCompaniesList();
      if (response.success && response.data) {
        setCompanies(response.data);
      }
    } catch (error) {
      console.error("Error loading companies:", error);
    }
  };

  const loadData = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: 20,
      };

      if (selectedCompanyId) params.company_id = selectedCompanyId;
      if (searchTerm) params.search = searchTerm;
      if (filterIsPublic !== "") params.is_public = filterIsPublic;

      const response = await getTicketImages(params);
      if (response.success && response.data) {
        setImages(response.data.data || []);
        setPagination(response.data.pagination || null);
      }
    } catch (error) {
      handleSnackbar("Error cargando imágenes", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadData(1);
  };

  // Handlers para modales
  const handleFetchFromSap = async (companyId, dateFrom, dateTo, rut) => {
    try {
      const response = await fetchTicketImagesFromSap(companyId, dateFrom, dateTo, rut);
      if (response.success) {
        handleSnackbar(response.data?.message || "Registros obtenidos correctamente", "success");
        setTrigger((prev) => prev + 1);
      } else {
        handleSnackbar(response.message || "Error al obtener registros", "error");
      }
    } catch (error) {
      handleSnackbar("Error al consultar SharePoint", "error");
    }
  };

  const handleUploadImage = async (recordId, file) => {
    try {
      const response = await uploadTicketImage(recordId, file);
      if (response.success) {
        handleSnackbar("Imagen subida correctamente", "success");
        setTrigger((prev) => prev + 1);
      } else {
        handleSnackbar(response.message || "Error al subir imagen", "error");
      }
    } catch (error) {
      handleSnackbar("Error al subir imagen", "error");
    }
  };

  const handleCreateManual = async (companyId, docNum, file) => {
    try {
      const response = await createManualTicketImage(companyId, docNum, file);
      if (response.success) {
        handleSnackbar("Registro creado correctamente", "success");
        setTrigger((prev) => prev + 1);
      } else {
        handleSnackbar(response.message || "Error al crear registro", "error");
      }
    } catch (error) {
      handleSnackbar("Error al crear registro", "error");
    }
  };

  const handlePreview = async (record) => {
    if (!record.company_id || !record.doc_num) return;

    setLoadingImage(true);
    setShowPreviewModal(true);

    try {
      const response = await getTicketImage(record.company_id, record.doc_num);
      if (response.success && response.data) {
        const imageData = response.data.data || response.data;
        const imageUrl = imageData.url || imageData.original_url;
        setPreviewUrl(imageUrl || null);
      } else {
        setPreviewUrl(null);
      }
    } catch (error) {
      console.error("Error loading image:", error);
      setPreviewUrl(null);
    } finally {
      setLoadingImage(false);
    }
  };

  const handleOpenUpload = (record) => {
    setSelectedRecord(record);
    setShowUploadModal(true);
  };

  const handleDelete = (record) => {
    openConfirm({
      title: "Eliminar Registro",
      msg: (
        <div>
          <p>
            ¿Está seguro que desea eliminar el registro del documento{" "}
            <strong>{record.doc_num}</strong>?
          </p>
          <p className="text-sm text-red-600 mt-2">Esta acción no se puede deshacer.</p>
        </div>
      ),
      variant: "danger",
      actionLabel: "Eliminar",
      onConfirm: async () => {
        try {
          const response = await deleteTicketImage(record.id);
          if (response.success) {
            handleSnackbar("Registro eliminado", "success");
            setTrigger((prev) => prev + 1);
          } else {
            handleSnackbar(response.message || "Error al eliminar", "error");
          }
        } catch (error) {
          handleSnackbar("Error al eliminar", "error");
        }
        closeModal("confirm");
      },
    });
  };

  // Configuración de columnas
  const columns = [
    { key: "company", label: "Empresa" },
    { key: "doc_num", label: "Nº Documento" },
    { key: "origin", label: "Origen", sortable: false },
    { key: "has_image", label: "Imagen", sortable: false },
    { key: "created_at", label: "Fecha" },
    { key: "actions", label: "Acciones", sortable: false, headerClassName: "text-center" },
  ];

  // Acciones por fila
  const getRowActions = (record) => {
    const hasImage = record.url || record.original_url;
    return [
      ...(hasImage
        ? [
            {
              icon: Eye,
              variant: "outline",
              onClick: () => handlePreview(record),
              title: "Ver imagen",
              className: "text-blue-600 hover:text-blue-900 hover:bg-blue-50",
            },
          ]
        : []),
      {
        icon: Upload,
        variant: "outline",
        onClick: () => handleOpenUpload(record),
        title: "Subir/Reemplazar imagen",
        className: "text-emerald-600 hover:text-emerald-900 hover:bg-emerald-50",
      },
      {
        icon: Trash2,
        variant: "danger",
        onClick: () => handleDelete(record),
        title: "Eliminar",
      },
    ];
  };

  // Renderizado de filas
  const renderRow = (record) => {
    const hasImage = record.url || record.original_url;

    return (
      <tr key={record.id} className="border-t hover:bg-gray-50">
        {/* Empresa */}
        <td className="px-3 py-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded flex items-center justify-center bg-blue-50">
              <Building2 className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">{record.company_name}</div>
              <div className="text-xs text-gray-500">{record.company_rut}</div>
            </div>
          </div>
        </td>

        {/* Nº Documento */}
        <td className="px-3 py-2">
          <span className="text-sm font-mono text-gray-900">{record.doc_num}</span>
        </td>

        {/* Origen */}
        <td className="px-3 py-2">
          {record.is_public ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              <Cloud className="w-3 h-3" />
              SAP
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
              <HardDrive className="w-3 h-3" />
              Local
            </span>
          )}
        </td>

        {/* Tiene Imagen */}
        <td className="px-3 py-2">
          {hasImage ? (
            <span className="inline-flex items-center text-green-600 text-sm">
              <CheckCircle className="w-4 h-4 mr-1" />
              Sí
            </span>
          ) : (
            <span className="inline-flex items-center text-gray-400 text-sm">
              <XCircle className="w-4 h-4 mr-1" />
              No
            </span>
          )}
        </td>

        {/* Fecha */}
        <td className="px-3 py-2">
          <span className="text-sm text-gray-500">{record.created_at || "-"}</span>
        </td>

        {/* Acciones */}
        <td className="px-3 py-2">
          <TableActions actions={getRowActions(record)} item={record} className="justify-center" />
        </td>
      </tr>
    );
  };

  // Calcular páginas totales
  const totalPages = pagination ? pagination.last_page : 1;

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-bradford-navy mb-2">
          Gestión de Imágenes de Tickets
        </h2>
        <p className="text-bradford-navy/70">
          Administra las imágenes asociadas a documentos de tickets
        </p>
      </div>

      {/* Filtros */}
      <GenericFilters
        searchPlaceholder="Buscar por Nº documento..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onSearch={handleSearch}
        showSearchButton={true}
        searchButtonLabel="Buscar"
        resultsCount={pagination?.total || 0}
        showAddButton={false}
      >
        {/* Filtros personalizados */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <Select
            value={selectedCompanyId}
            onChange={(e) => {
              setSelectedCompanyId(e.target.value);
              setCurrentPage(1);
            }}
            className="min-w-[160px]"
          >
            <option value="">Todas las empresas</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.business_name}
              </option>
            ))}
          </Select>
        </div>

        <Select
          value={filterIsPublic}
          onChange={(e) => {
            setFilterIsPublic(e.target.value);
            setCurrentPage(1);
          }}
          className="min-w-[120px]"
        >
          <option value="">Todos los orígenes</option>
          <option value="true">SAP</option>
          <option value="false">Local</option>
        </Select>

        <Button onClick={() => setShowFetchModal(true)} icon={Download} variant="outline">
          Obtener desde SAP
        </Button>

        <Button onClick={() => setShowCreateModal(true)} icon={Plus}>
          Crear Manual
        </Button>
      </GenericFilters>

      {/* Tabla */}
      <GenericTable
        title="Registros de imágenes"
        loading={loading}
        columns={columns}
        data={images}
        pageData={images}
        emptyMessage="No hay registros de imágenes"
        emptyIcon={Image}
        searchQuery={searchTerm}
        onClearSearch={() => {
          setSearchTerm("");
          setTrigger((prev) => prev + 1);
        }}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => {
          setCurrentPage(page);
          loadData(page);
        }}
        totalResults={pagination?.total || 0}
        renderRow={renderRow}
      />

      {/* Modal Fetch SAP */}
      <FetchSapModal
        open={showFetchModal}
        companies={companies}
        onFetch={handleFetchFromSap}
        onClose={() => setShowFetchModal(false)}
      />

      {/* Modal Upload */}
      <UploadImageModal
        open={showUploadModal}
        record={selectedRecord}
        onUpload={handleUploadImage}
        onClose={() => {
          setShowUploadModal(false);
          setSelectedRecord(null);
        }}
      />

      {/* Modal Create Manual */}
      <CreateManualModal
        open={showCreateModal}
        companies={companies}
        onCreate={handleCreateManual}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Modal Preview */}
      <ImagePreviewModal
        open={showPreviewModal}
        url={previewUrl}
        loading={loadingImage}
        onClose={() => {
          setShowPreviewModal(false);
          setPreviewUrl(null);
        }}
      />

      {/* Modal Confirm Delete */}
      <Modal
        open={!!modals.confirm}
        onClose={() => closeModal("confirm")}
        title={modals.confirm?.title}
        variant="warn"
        actions={[
          { label: "Cancelar", variant: "outline", onClick: () => closeModal("confirm") },
          {
            label: modals.confirm?.actionLabel || "Confirmar",
            variant: modals.confirm?.variant || "primary",
            onClick: modals.confirm?.onConfirm,
          },
        ]}
      >
        {modals.confirm?.msg}
      </Modal>
    </div>
  );
}
