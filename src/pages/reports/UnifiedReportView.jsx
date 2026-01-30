// File: src/pages/reports/UnifiedReportView.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, FileText, Table, ExternalLink, Calendar,
  Download, Loader2, Building2, Search, Award, AlertCircle,
  BarChart2, Image, X, Eye, FileSpreadsheet
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/auth";
import { executeReportByCode, getReportTemplateByCode } from "../../services/reportTemplateService";
import { getCertificateTemplateByCode } from "../../services/certificateTemplateService";
import { getCompanyReports } from "../../services/companyReportService";
import { getLists, getListItems, getSharepointListConfig } from "../../services/microsoftGraphService";
import { getCompaniesList } from "../../services/companyService";
import { getTicketImage, checkTicketImages, bulkRegisterTicketImages } from "../../services/ticketImageService";
import { exportReportToExcel } from "../../services/reportExportService";
import { handleSnackbar } from "../../utils/messageHelpers";

// Configuracion de columnas para la tabla SharePoint
const DEFAULT_COLUMNS = [
  { key: "FechaProgramada", label: "Fecha Programada", type: "date" },
  { key: "FechaEjecucion", label: "Fecha Ejecucion", type: "date" },
  { key: "DisposicionFinal", label: "Disposicion Final", type: "text" },
  { key: "NombreCliente", label: "Cliente", type: "text" },
  { key: "Sucursal", label: "Sucursal", type: "text" },
  { key: "Bodega", label: "Bodega", type: "text" },
  { key: "Formato", label: "Formato", type: "text" },
  { key: "Material", label: "Material", type: "text" },
  { key: "PesoTotal", label: "Peso Total", type: "number" },
  { key: "Cantidad", label: "Cantidad", type: "number" },
];

export default function UnifiedReportView() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { session } = useAuth();

  // Obtener parametros de la URL
  const certCode = searchParams.get("cert");
  const reportCode = searchParams.get("report");

  // Estados generales
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState(null);
  const [templateType, setTemplateType] = useState(null); // "certificate" | "report"
  const [activeTab, setActiveTab] = useState("data");
  const [companyReport, setCompanyReport] = useState(null); // Datos de la asignación de reporte a empresa

  // Estados para datos
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false); // Estado separado para cargar más
  const [hasMore, setHasMore] = useState(false);
  const [tableColumns, setTableColumns] = useState([]); // Columnas dinamicas para SQL
  const [sharePointListId, setSharePointListId] = useState(null); // ID resuelto de lista SharePoint
  const [nextPageToken, setNextPageToken] = useState(null); // Token para paginación SharePoint (skiptoken)

  // Estados para filtros - Por defecto el mes actual para no sobrecargar el servidor
  const getDefaultDates = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      from: firstDay.toISOString().split('T')[0],
      to: lastDay.toISOString().split('T')[0]
    };
  };
  const defaultDates = getDefaultDates();
  const [dateFrom, setDateFrom] = useState(defaultDates.from);
  const [dateTo, setDateTo] = useState(defaultDates.to);
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para selector de empresa (solo admin/super usuario)
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");

  // Estado para loading del iframe
  const [iframeLoading, setIframeLoading] = useState(true);

  // Estado para loader global (cambio de empresa)
  const [globalLoading, setGlobalLoading] = useState(false);

  // Estado para exportación a Excel
  const [exporting, setExporting] = useState(false);

  // Estados para modal de imagen
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [imageStatus, setImageStatus] = useState({}); // { doc_num: { has_image, url } }

  // Informacion del usuario
  const companyName = session?.user?.company?.business_name || "";
  const isClientUser = session?.user?.role === "customer";
  const companyId = session?.user?.company_id;
  const userRole = session?.user?.role;
  const isAdmin = userRole === 'root' || userRole === 'admin';
  const userPermissions = session?.user?.permissions_users || [];

  const tableContainerRef = useRef(null);

  useEffect(() => {
    // Resetear estados cuando cambia el reporte
    setActiveTab("data"); // Importante: resetear tab para evitar quedarse en "iframe" de reporte anterior
    setTemplate(null);
    setItems([]);
    setTableColumns([]);
    setCompanyReport(null);
    setImageStatus({});
    setSharePointListId(null); // Resetear ID de lista SharePoint
    setNextPageToken(null); // Resetear token de paginación
    setHasMore(false);
    // Resetear fechas al mes actual cuando cambia de reporte
    const dates = getDefaultDates();
    setDateFrom(dates.from);
    setDateTo(dates.to);
    setSearchTerm("");
    // Deseleccionar empresa para admin/root al cambiar de reporte (evita errores de render)
    if (!isClientUser) {
      setSelectedCompanyId("");
    }

    loadTemplate();
    // Cargar lista de empresas para usuarios no-cliente
    if (!isClientUser) {
      loadCompanies();
    }
  }, [certCode, reportCode]);

  useEffect(() => {
    // Para clientes, cargar datos automaticamente al cargar template
    // Para admin/super, deben usar "Aplicar filtros"
    // Importante: esperar a que companyId esté disponible de la sesión
    if (template && isClientUser && companyId) {
      loadData();
    }
  }, [template, companyId]);

  // Efecto para recargar companyReport y datos cuando admin cambia la empresa seleccionada
  useEffect(() => {
    console.log('[useEffect selectedCompanyId] Changed to:', selectedCompanyId, 'template:', template?.code, 'isClientUser:', isClientUser);
    if (!isClientUser && selectedCompanyId && template && templateType === "report") {
      console.log('[useEffect selectedCompanyId] Conditions met, loading data for company:', selectedCompanyId);
      // Activar loader global
      setGlobalLoading(true);
      // Resetear datos e iframe cuando cambia la empresa
      setItems([]);
      setCompanyReport(null);
      setIframeLoading(true);
      setNextPageToken(null); // Resetear token de paginación
      // Resetear filtros al mes actual al cambiar de empresa
      const dates = getDefaultDates();
      setDateFrom(dates.from);
      setDateTo(dates.to);
      setSearchTerm("");
      // Cargar el companyReport para la nueva empresa
      loadCompanyReport(template.id, selectedCompanyId);
      // Cargar datos automáticamente cuando admin selecciona empresa (pasar companyId y filtros vacíos)
      loadData(false, selectedCompanyId, { dateFrom: "", dateTo: "" });
    }
  }, [selectedCompanyId]);

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

  // Verificar si el usuario tiene permiso para acceder al reporte/certificado
  const checkUserPermission = (code, type) => {
    // Admin siempre tiene acceso
    if (isAdmin) return true;

    // Para clientes: verificar permisos específicos
    if (type === "report") {
      const permCode = `reports.${code?.toLowerCase()}`;
      return userPermissions.includes(permCode) || userPermissions.includes('reports.*');
    } else if (type === "certificate") {
      const permCode = `certificates.${code?.toLowerCase()}`;
      return userPermissions.includes(permCode) || userPermissions.includes('certificates.*');
    }
    return false;
  };

  const loadTemplate = async () => {
    setLoading(true);
    try {
      let response;
      let type;

      if (certCode) {
        // Cargar certificado por codigo
        response = await getCertificateTemplateByCode(certCode);
        type = "certificate";
      } else if (reportCode) {
        // Cargar reporte por codigo
        response = await getReportTemplateByCode(reportCode);
        type = "report";
      } else {
        handleSnackbar("No se especificó un certificado o reporte", "error");
        navigate("/dashboard");
        return;
      }

      // Verificar si la respuesta fue exitosa
      if (response.success && response.data) {
        const templateData = response.data;
        setTemplate(templateData);
        setTemplateType(type);

        // Si es tipo iframe, activar tab iframe por defecto (no tiene tab de detalle)
        if (templateData.origin_type === "iframe") {
          setActiveTab("iframe");
        }

        // Para reportes, cargar también la asignación específica de la empresa del usuario
        if (type === "report" && companyId) {
          await loadCompanyReport(templateData.id);
        }
      } else if (response.status === 403) {
        // Acceso denegado por falta de permisos
        handleSnackbar(response.message || "No tienes permiso para acceder a este recurso", "error");
        navigate("/dashboard");
      } else {
        // Plantilla no encontrada o no disponible - redirigir al dashboard
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error loading template:", error);
      // Manejar error 403 de la API
      if (error?.status === 403) {
        handleSnackbar(error.message || "No tienes permiso para acceder a este recurso", "error");
      }
      // Cualquier error (404, 500, etc.) - redirigir al dashboard
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyReport = async (reportId, targetCompanyId = null) => {
    // Usar empresa pasada como parámetro, o empresa del usuario
    const effectiveCompanyId = targetCompanyId || companyId;
    if (!effectiveCompanyId) {
      setGlobalLoading(false);
      return;
    }

    try {
      // Cargar los reportes asignados a la empresa
      const response = await getCompanyReports(effectiveCompanyId);
      if (response.success && response.data) {
        // Buscar la asignación específica para este reporte
        const assignment = response.data.find(r => r.report_id === reportId);
        if (assignment) {
          console.log('[UnifiedReportView] Company report assignment found:', assignment);
          setCompanyReport(assignment);
          // Si tiene report_url configurado, activar el tab de iframe primero
          if (assignment.report_url) {
            setActiveTab("iframe");
          } else {
            // No tiene reporte visual, ir a tab de detalle
            setActiveTab("data");
          }
        } else {
          // No hay asignación para esta empresa, limpiar companyReport
          console.log('[UnifiedReportView] No company report assignment for company:', effectiveCompanyId);
          setCompanyReport(null);
          // Sin asignación, ir a tab de detalle
          setActiveTab("data");
        }
      } else {
        setCompanyReport(null);
      }
    } catch (error) {
      console.error("Error loading company report:", error);
      setCompanyReport(null);
    } finally {
      // Desactivar loader global
      setGlobalLoading(false);
    }
  };

  const loadData = async (isLoadMore = false, targetCompanyId = null, filters = null) => {
    if (!template) return;

    if (isLoadMore) {
      // Cargando más registros
      setLoadingMore(true);
    } else {
      // Primera carga
      setLoadingItems(true);
      setItems([]);
    }

    try {
      // Determinar origen de datos segun el tipo de plantilla
      const originType = template.origin_type || "sharepoint";

      if (originType === "iframe") {
        // No hay datos tabulares para iframe
        setLoadingItems(false);
        return;
      }

      if (originType === "sql" || template.query_id) {
        // Cargar datos desde SQL
        await loadSQLData(targetCompanyId, filters);
      } else if (originType === "sharepoint" || template.sharepoint_list_id) {
        // Cargar datos desde SharePoint
        await loadSharePointData(isLoadMore, targetCompanyId);
      } else if (originType === "mixed") {
        // Cargar ambos tipos de datos
        await loadSharePointData(isLoadMore, targetCompanyId);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      handleSnackbar("Error al cargar datos", "error");
    } finally {
      setLoadingItems(false);
      setLoadingMore(false);
    }
  };

  const loadSQLData = async (targetCompanyId = null, filters = null) => {
    // Usar empresa pasada como parámetro, o empresa seleccionada, o empresa del usuario
    const rawCompanyId = targetCompanyId || (isClientUser ? companyId : selectedCompanyId);
    // Asegurar que company_id sea un número
    const effectiveCompanyId = rawCompanyId ? Number(rawCompanyId) : null;
    // Usar filtros pasados como parámetro, o los del estado
    const effectiveDateFrom = filters?.dateFrom !== undefined ? filters.dateFrom : dateFrom;
    const effectiveDateTo = filters?.dateTo !== undefined ? filters.dateTo : dateTo;

    if (!effectiveCompanyId) {
      console.warn('[loadSQLData] No company ID available');
      return; // No cargar si no hay empresa
    }

    console.log('[loadSQLData] Loading data for company:', effectiveCompanyId, 'dateFrom:', effectiveDateFrom, 'dateTo:', effectiveDateTo);

    try {
      const response = await executeReportByCode(template.code, {
        company_id: effectiveCompanyId,
        date_from: effectiveDateFrom,
        date_to: effectiveDateTo,
      });

      if (response.success && response.data) {
        // response.data = { data: [], total, columns: [], template, company, params }
        const reportData = response.data.data || [];
        setItems(reportData);
        // Guardar columnas dinamicas del reporte SQL
        if (response.data.columns && response.data.columns.length > 0) {
          setTableColumns(response.data.columns);
        }
        // Mostrar fechas usadas en la consulta (defaults si no se enviaron)
        if (response.data.params) {
          if (response.data.params.date_from && !dateFrom) {
            setDateFrom(response.data.params.date_from);
          }
          if (response.data.params.date_to && !dateTo) {
            setDateTo(response.data.params.date_to);
          }
        }
        // Verificar imágenes si hay columnas tipo doc_num (identificador para imágenes)
        if (reportData.length > 0 && response.data.columns) {
          const hasDocNumCol = response.data.columns.some(c => c.format === "doc_num");
          if (hasDocNumCol) {
            checkImagesForReport(reportData, response.data.columns);
          }
        }
      }
    } catch (error) {
      console.error("Error loading SQL data:", error);
    }
  };

  const loadSharePointData = async (loadMore = false, targetCompanyId = null) => {
    try {
      const listName = template.sharepoint_list_id || "09_TBL_OnSite";
      const dateField = "FechaProgramada"; // Campo de fecha por defecto para SharePoint

      // Obtener configuración de columnas si es necesario
      if (tableColumns.length === 0) {
        try {
          const configResponse = await getSharepointListConfig(listName);
          if (configResponse.success && configResponse.data?.columns) {
            setTableColumns(configResponse.data.columns);
          } else {
            setTableColumns(DEFAULT_COLUMNS);
          }
        } catch (configError) {
          console.warn("No se pudo cargar config de SharePoint, usando columnas por defecto");
          setTableColumns(DEFAULT_COLUMNS);
        }
      }

      // Buscar el ID real de la lista en SharePoint
      let listId = listName;
      try {
        const listsResponse = await getLists();
        if (listsResponse.success && listsResponse.data?.value) {
          const sharePointList = listsResponse.data.value.find(
            list => list.displayName === listName || list.name === listName
          );
          if (sharePointList) {
            listId = sharePointList.id;
            setSharePointListId(listId);
          }
        }
      } catch (listError) {
        console.warn("No se pudo obtener ID de lista, usando nombre directamente");
      }

      // Construir filtro OData
      const filters = [];

      // Filtro por nombre de cliente (razon social)
      if (isClientUser && companyName) {
        // Usuario cliente: usar su nombre de empresa
        const clientName = companyName.replace(/'/g, "''");
        filters.push(`startswith(fields/NombreCliente,'${clientName}')`);
      } else if (!isClientUser && targetCompanyId) {
        // Admin: buscar el nombre de la empresa seleccionada
        console.log('[loadSharePointData] Looking for company:', targetCompanyId, 'in companies list of', companies.length, 'items');
        const selectedCompany = companies.find(c => String(c.id) === String(targetCompanyId));
        if (selectedCompany?.business_name) {
          const clientName = selectedCompany.business_name.replace(/'/g, "''");
          console.log('[loadSharePointData] Filtering by company:', clientName);
          filters.push(`startswith(fields/NombreCliente,'${clientName}')`);
        } else {
          console.warn('[loadSharePointData] Company not found or no business_name:', selectedCompany);
        }
      }

      // Filtro por fechas
      if (dateFrom) {
        filters.push(`fields/${dateField} ge '${dateFrom}T00:00:00Z'`);
      }
      if (dateTo) {
        filters.push(`fields/${dateField} le '${dateTo}T23:59:59Z'`);
      }

      const odataFilter = filters.length > 0 ? filters.join(" and ") : null;

      console.log('[loadSharePointData] Fetching ALL items with filter:', odataFilter);

      // Usar servicio para obtener TODOS los items (el backend hace la paginación)
      const response = await getListItems(listId, {
        expand: true,
        filter: odataFilter,
        all: true, // El backend devolverá todos los items con paginación automática
      });

      if (response.success && response.data) {
        const data = response.data;
        // Procesar items: aplanar fields para acceso directo
        const newItems = (data.value || []).map(item => ({
          ...item.fields,
          _id: item.id,
          _webUrl: item.webUrl,
        }));

        console.log('[loadSharePointData] Received ALL items:', newItems.length);

        setItems(newItems);
        setNextPageToken(null);
        setHasMore(false); // No hay más páginas, ya tenemos todos los datos
      }
    } catch (error) {
      console.error("Error loading SharePoint data:", error);
      handleSnackbar("Error al cargar datos de SharePoint", "error");
    }
  };

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && nextPageToken) {
      // Pasar el company ID para admin users al cargar más
      const targetCompanyId = isClientUser ? null : selectedCompanyId;
      loadData(true, targetCompanyId);
    }
  }, [loadingMore, hasMore, nextPageToken, template, isClientUser, selectedCompanyId]);

  // Handler para scroll infinito
  const handleScroll = useCallback(() => {
    if (!tableContainerRef.current || loadingMore || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = tableContainerRef.current;
    // Cargar más cuando queden menos de 300px para llegar al final
    if (scrollHeight - scrollTop - clientHeight < 300) {
      loadMore();
    }
  }, [loadingMore, hasMore, loadMore]);

  // Conectar scroll listener
  useEffect(() => {
    const container = tableContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const handleRefresh = () => {
    // Validar que admin/super haya seleccionado empresa
    if (!isClientUser && !selectedCompanyId) {
      handleSnackbar("Debe seleccionar una empresa", "error");
      return;
    }
    // Pasar el company ID para admin users
    const targetCompanyId = isClientUser ? null : selectedCompanyId;
    loadData(false, targetCompanyId);
  };

  const handleClearFilters = () => {
    // Resetear fechas al mes actual
    const dates = getDefaultDates();
    setDateFrom(dates.from);
    setDateTo(dates.to);
    setSearchTerm("");
    setNextPageToken(null); // Resetear token de paginación
    if (!isClientUser) {
      setSelectedCompanyId("");
      setItems([]);
      setCompanyReport(null); // Limpiar también el reporte de empresa (iframe URL)
    }
  };

  // Handler para cuando el iframe termina de cargar
  const handleIframeLoad = () => {
    // Delay más largo para asegurar que Power BI termine de renderizar
    setTimeout(() => {
      setIframeLoading(false);
    }, 2500);
  };

  // Determinar columnas activas: usar tableColumns si están disponibles (SQL o SharePoint), sino DEFAULT_COLUMNS
  const baseColumns = tableColumns.length > 0 ? tableColumns : DEFAULT_COLUMNS;

  // Expandir columnas date_split a 3 columnas (Año, Mes, Día)
  const activeColumns = baseColumns.flatMap(col => {
    if (col.format === "date_split") {
      return [
        { ...col, key: col.key, label: `Año`, format: "date_split", datePart: "year" },
        { ...col, key: col.key, label: `Mes`, format: "date_split", datePart: "month" },
        { ...col, key: col.key, label: `Día`, format: "date_split", datePart: "day" },
      ];
    }
    return [col];
  });

  // Filtrar items localmente por busqueda
  const filteredItems = items.filter(item => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return activeColumns.some(col => {
      const value = (item.fields?.[col.key] || item[col.key])?.toString().toLowerCase() || "";
      return value.includes(search);
    });
  });

  const handleExportCSV = () => {
    if (items.length === 0) {
      handleSnackbar("No hay datos para exportar", "error");
      return;
    }

    const headers = activeColumns.map(col => col.label);
    const rows = filteredItems.map(item =>
      activeColumns.map(col => {
        const value = item.fields?.[col.key] || item[col.key] || "";
        const colType = col.format || col.type;
        if ((colType === "date" || colType === "datetime") && value) {
          return new Date(value).toLocaleDateString("es-CL");
        }
        return value;
      })
    );

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${template?.name || "reporte"}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  // Exportar a Excel (genera archivo en servidor y descarga)
  const handleExportExcel = async () => {
    // Validar que hay empresa seleccionada
    const effectiveCompanyId = isClientUser ? companyId : selectedCompanyId;
    if (!effectiveCompanyId) {
      handleSnackbar("Seleccione una empresa para exportar", "warning");
      return;
    }

    // Solo funciona para reportes tipo SQL (no SharePoint ni iframe)
    if (!reportCode || template?.origin_type === "iframe") {
      handleSnackbar("La exportación a Excel solo está disponible para reportes SQL", "info");
      return;
    }

    setExporting(true);
    try {
      const response = await exportReportToExcel(
        reportCode,
        effectiveCompanyId,
        dateFrom,
        dateTo
      );

      if (response.success && response.data) {
        handleSnackbar(`Reporte exportado: ${response.data.rows_exported} registros`, "success");
        // Abrir la URL del archivo en una nueva pestaña para descargar
        if (response.data.file_url) {
          window.open(response.data.file_url, "_blank");
        }
      } else {
        handleSnackbar(response.message || "Error al exportar reporte", "error");
      }
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      handleSnackbar("Error al exportar a Excel", "error");
    } finally {
      setExporting(false);
    }
  };

  // Nombres de meses en español
  const MONTH_NAMES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const formatValue = (value, type, format) => {
    if (!value && value !== 0) return "-";

    // Usar format si está definido, sino type
    const displayFormat = format || type;

    if (displayFormat === "date") {
      return new Date(value).toLocaleDateString("es-CL");
    }
    if (displayFormat === "datetime") {
      try {
        return new Date(value).toLocaleString("es-CL", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch {
        return value;
      }
    }
    if (displayFormat === "date_dmy") {
      const d = new Date(value);
      if (isNaN(d.getTime())) return "-";
      const day = d.getDate();
      const month = d.getMonth() + 1;
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    }
    if (displayFormat === "number") {
      return Number(value).toLocaleString("es-CL", { maximumFractionDigits: 0 });
    }
    if (displayFormat === "decimal") {
      return Number(value).toLocaleString("es-CL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    if (displayFormat === "currency") {
      return `$${Number(value).toLocaleString("es-CL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (displayFormat === "doc_num") {
      // doc_num se muestra como texto, es solo un marcador para el sistema de imágenes
      return value;
    }
    return value;
  };

  // Obtener parte de fecha para columnas date_split
  const getDatePart = (value, part) => {
    if (!value) return "-";
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return "-";

      if (part === "year") return date.getFullYear();
      if (part === "month") return MONTH_NAMES[date.getMonth()];
      if (part === "day") return date.getDate().toString().padStart(2, "0");
      return "-";
    } catch {
      return "-";
    }
  };

  // Verificar imágenes cuando se cargan datos (solo para reportes con columnas tipo doc_num)
  const checkImagesForReport = async (data, columns) => {
    // Buscar si hay columna tipo doc_num (identificador para imágenes)
    const docNumColumn = columns.find(col => col.format === "doc_num");
    if (!docNumColumn || data.length === 0) return;

    const effectiveCompanyId = isClientUser ? companyId : selectedCompanyId;
    if (!effectiveCompanyId) return;

    // Obtener doc_nums de los items usando la columna doc_num
    const docNums = data.map(item => item.fields?.[docNumColumn.key] || item[docNumColumn.key]).filter(Boolean);
    if (docNums.length === 0) return;

    try {
      const response = await checkTicketImages(effectiveCompanyId, docNums);
      if (response.success && response.data) {
        setImageStatus(response.data);
      }
    } catch (error) {
      console.error("Error checking images:", error);
    }
  };

  // Ver imagen
  const handleViewImage = async (docNum) => {
    const effectiveCompanyId = isClientUser ? companyId : selectedCompanyId;
    if (!effectiveCompanyId) return;

    setLoadingImage(true);
    setShowImageModal(true);

    try {
      const response = await getTicketImage(effectiveCompanyId, docNum);
      if (response.success && response.data) {
        // La respuesta tiene estructura: { data: { url, original_url, ... }, has_image, ... }
        const imageData = response.data.data || response.data;
        // Usar url local si existe, sino usar original_url (SAP)
        const imageUrl = imageData.original_url;
        setSelectedImage(imageUrl || null);
      } else {
        setSelectedImage(null);
      }
    } catch (error) {
      console.error("Error loading image:", error);
      setSelectedImage(null);
    } finally {
      setLoadingImage(false);
    }
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  // Determinar si mostrar iframe
  // Prioridad: companyReport.report_url > template.report_url > template.filepath
  const effectiveReportUrl = companyReport?.report_url || template?.report_url || template?.filepath;
  // Mostrar iframe si hay URL o si el tipo de origen es iframe/mixed
  const showIframe = !!effectiveReportUrl || template?.origin_type === "iframe" || template?.origin_type === "mixed";
  const iframeUrl = effectiveReportUrl;

  // Resetear loading cuando cambia el tab a iframe
  useEffect(() => {
    if (activeTab === "iframe") {
      setIframeLoading(true);
      // Timeout de seguridad más largo para reportes pesados
      const timeout = setTimeout(() => {
        setIframeLoading(false);
      }, 8000);
      return () => clearTimeout(timeout);
    }
  }, [activeTab, iframeUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Loader global overlay */}
      {globalLoading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-gray-600 font-medium">Cargando datos de empresa...</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
      
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {templateType === "certificate" ? (
                <Award className="w-7 h-7 text-amber-600" />
              ) : (
                <FileText className="w-7 h-7 text-blue-600" />
              )}
              {template?.name}
            </h1>
            <p className="text-gray-500 text-sm">Visualización de Reporte</p>
          </div>
        </div>

        {/* Selector de empresa para admin / Nombre de empresa para cliente */}
        {isClientUser ? (
          companyName && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">{companyName}</span>
            </div>
          )
        ) : (
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

      {/* Tabs - Reporte Visual siempre primero, Detalle solo si no es tipo iframe */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {/* Reporte Visual siempre primero (si hay URL disponible) */}
          {showIframe && iframeUrl && (
            <button
              onClick={() => setActiveTab("iframe")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "iframe"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              Reporte Visual
            </button>
          )}
          {/* Detalle solo se muestra si el origen NO es iframe (iframe no tiene datos tabulares) */}
          {template?.origin_type !== "iframe" && (
            <button
              onClick={() => setActiveTab("data")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "data"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Table className="w-4 h-4" />
              Detalle
            </button>
          )}
        </nav>
      </div>

      {/* Contenido de tabs */}
      {activeTab === "data" && (
        <div className="space-y-4">
          {/* Barra de herramientas */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {/* <Button variant="outline" size="sm" onClick={handleExportCSV} icon={Download}>
                Exportar CSV
              </Button> */}
              {/* Exportar a Excel (solo para reportes SQL) */}
              {reportCode && template?.origin_type !== "iframe" && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleExportExcel}
                  icon={FileSpreadsheet}
                  loading={exporting}
                  disabled={exporting}
                >
                  {exporting ? "Exportando..." : "Exportar Excel"}
                </Button>
              )}
            </div>

            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar en resultados..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Panel de filtros - siempre visible */}
          <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Filtros</h3>
              <button onClick={handleClearFilters} className="text-sm text-blue-600 hover:underline">
                Limpiar filtros
              </button>
            </div>

              <div className="flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Desde
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex-1 min-w-[150px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hasta
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleRefresh}
                    icon={Search}
                  >
                    Aplicar filtros
                  </Button>
                </div>
              </div>
            </div>

          {/* Tabla de datos */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {loadingItems ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <Table className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No hay datos</h3>
                <p className="text-gray-500 mt-1">
                  No se encontraron registros con los filtros aplicados
                </p>
              </div>
            ) : (
              <div ref={tableContainerRef} className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      {activeColumns.map((col) => (
                        <th
                          key={col.key}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredItems.map((item, index) => (
                      <tr key={`row-${index}-${item._id || item.id || ''}`} className="hover:bg-gray-50">
                        {activeColumns.map((col, colIndex) => {
                          const rawValue = item.fields?.[col.key] || item[col.key];

                          // Renderizado especial para imagen - busca el doc_num de la fila
                          if (col.format === "image") {
                            // Buscar la columna doc_num para obtener el identificador
                            const docNumCol = activeColumns.find(c => c.format === "doc_num");
                            const docNumValue = docNumCol
                              ? (item.fields?.[docNumCol.key] || item[docNumCol.key])
                              : null;
                            const imgInfo = imageStatus[docNumValue];
                            return (
                              <td
                                key={`${col.key}-${colIndex}`}
                                className="px-4 py-3 text-sm whitespace-nowrap"
                              >
                                {docNumValue ? (
                                  <button
                                    onClick={() => handleViewImage(docNumValue)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                      imgInfo?.has_image
                                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    Ver imagen
                                  </button>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                            );
                          }

                          // Renderizado especial para descarga - usa el valor de la celda como URL
                          if (col.format === "download") {
                            const downloadUrl = rawValue;
                            return (
                              <td
                                key={`${col.key}-${colIndex}`}
                                className="px-4 py-3 text-sm whitespace-nowrap"
                              >
                                {downloadUrl ? (
                                  <a
                                    href={downloadUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors bg-blue-100 text-blue-700 hover:bg-blue-200"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    Descargar
                                  </a>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                            );
                          }

                          // Renderizado para date_split (ya expandido)
                          if (col.format === "date_split" && col.datePart) {
                            return (
                              <td
                                key={`${col.key}-${col.datePart}-${colIndex}`}
                                className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap"
                              >
                                {getDatePart(rawValue, col.datePart)}
                              </td>
                            );
                          }

                          // Renderizado normal
                          return (
                            <td
                              key={`${col.key}-${colIndex}`}
                              className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap"
                            >
                              {formatValue(rawValue, col.type, col.format)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    {/* Indicador de carga al final de la tabla */}
                    {loadingMore && (
                      <tr>
                        <td colSpan={activeColumns.length} className="px-4 py-4 text-center">
                          <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto" />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Cargar mas */}
            {hasMore && (
              <div className="p-4 border-t border-gray-200 text-center">
                {loadingMore ? (
                  <div className="inline-flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cargando más registros...
                  </div>
                ) : (
                  <Button variant="outline" onClick={loadMore}>
                    Cargar mas registros
                  </Button>
                )}
              </div>
            )}

            {/* Contador de registros */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
              {searchTerm ? (
                <>Mostrando {filteredItems.length} resultados de búsqueda (de {items.length} registros totales)</>
              ) : (
                <>Mostrando {items.length} registros</>
              )}
              {hasMore && " (hay mas disponibles)"}
            </div>
          </div>
        </div>
      )}

      {activeTab === "iframe" && iframeUrl && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <h3 className="font-medium text-gray-900">Reporte Visual</h3>
            <a
              href={`/report-fullscreen?url=${btoa(iframeUrl)}&title=${encodeURIComponent(template?.name || 'Reporte')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
            >
              Ver en pantalla completa <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          {/* Container con overflow-hidden para ocultar controles del iframe */}
          <div className="relative overflow-hidden" style={{ height: '700px' }}>
            {/* Loader overlay */}
            <div
              className={`absolute inset-0 bg-white flex flex-col items-center justify-center z-10 transition-opacity duration-300 ${
                iframeLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-sm text-gray-600">Cargando reporte...</p>
            </div>
            <iframe
              key={iframeUrl} // Key para forzar re-render cuando cambia URL
              src={iframeUrl}
              className="w-full border-0"
              style={{ height: 'calc(100% + 56px)' }}
              title="Reporte Visual"
              sandbox="allow-scripts allow-same-origin allow-popups"
              onLoad={handleIframeLoad}
            />
          </div>
        </div>
      )}

      {/* Mensaje cuando es tipo iframe pero no tiene URL configurada */}
      {template?.origin_type === "iframe" && !iframeUrl && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="flex flex-col items-center justify-center py-16 px-8">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Reporte no disponible
            </h3>
            <p className="text-gray-500 text-center max-w-md mb-4">
              Este reporte aún no se encuentra configurado para tu empresa.
            </p>
            <p className="text-sm text-gray-400 text-center">
              Si tienes dudas, contacta a tu administrador.
            </p>
          </div>
        </div>
      )}

      {/* Modal de imagen */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 top-[-30px]">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-4 border-b shrink-0">
              <div className="flex items-center gap-2">
                <Image className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-semibold text-gray-900">Imagen del Ticket</h3>
              </div>
              <button
                onClick={closeImageModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center min-h-[300px]">
              {loadingImage ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                  <p className="text-sm text-gray-500">Cargando imagen...</p>
                </div>
              ) : selectedImage ? (
                <img
                  src={selectedImage}
                  alt="Ticket"
                  className="max-w-full max-h-[100vh] object-scale-down shadow-md md:mt-30 lg:mt-40"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Image className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">Imagen no disponible</p>
                  <p className="text-sm text-gray-400 max-w-sm">
                    Este ticket aún no tiene una imagen asociada en el sistema.
                  </p>
                </div>
              )}
            </div>

            {/* Footer del modal */}
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 rounded-b-lg shrink-0">
              <Button variant="secondary" onClick={closeImageModal}>
                Cerrar
              </Button>
              {selectedImage && (
                <a
                  href={selectedImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Descargar
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
