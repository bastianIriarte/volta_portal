import { Globe, Database, Cloud, Layers } from "lucide-react";

export const ORIGIN_TYPES = [
  { value: "iframe", label: "Iframe (URL externa)", icon: Globe, color: "blue" },
  { value: "sql", label: "SQL (Fuente de datos)", icon: Database, color: "indigo" },
  { value: "sharepoint", label: "SharePoint", icon: Cloud, color: "green" },
  { value: "mixed", label: "Mixto (Múltiples orígenes)", icon: Layers, color: "purple" },
];

export const COLUMN_FORMATS = [
  { value: "text", label: "Texto" },
  { value: "number", label: "Número entero" },
  { value: "decimal", label: "Decimal (10,25)" },
  { value: "currency", label: "Moneda ($)" },
  { value: "date", label: "Fecha (dd/mm/yyyy)" },
  { value: "date_dmy", label: "Fecha (d-m-Y)" },
  { value: "date_split", label: "Fecha (Año | Mes | Día)" },
  { value: "doc_num", label: "Nº Documento (para imágenes)" },
  { value: "image", label: "Imagen" },
  { value: "download", label: "Descargar (URL)" },
];

export const getOriginTypeInfo = (type) =>
  ORIGIN_TYPES.find(t => t.value === type) || ORIGIN_TYPES[0];

export const INITIAL_FORM_DATA = {
  name: "",
  code: "",
  description: "",
  origin_type: "iframe",
  report_url: "",
  data_source_id: "",
  sharepoint_site_id: "",
  sharepoint_list_id: "",
  sharepoint_path: "",
  origins: [],
  query_branches: false,
  status: true,
};
