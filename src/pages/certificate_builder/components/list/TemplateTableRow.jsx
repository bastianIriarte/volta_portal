import {
  FileText,
  Eye,
  Edit2,
  Trash2,
  Settings,
  History,
  CheckCircle,
  XCircle,
  Copy,
  Table2,
  Database,
} from "lucide-react";
import TableActions from "../../../../components/common/TableActions";

export default function TemplateTableRow({
  template,
  dataSources,
  onEdit,
  onEditBuilder,
  onClone,
  onPreview,
  onOpenHistory,
  onDelete,
}) {
  // Helper para obtener nombre del data source
  const getDataSourceName = (dataSourceId) => {
    if (!dataSourceId) return null;
    const ds = dataSources.find((d) => d.id === dataSourceId);
    return ds ? ds.name : null;
  };

  const dataSourceName = getDataSourceName(template.data_source_id);
  const tableProcessorName = template.table_processor_name;

  // Acciones por fila
  const rowActions = [
    {
      label: "",
      icon: Edit2,
      variant: "outline",
      onClick: onEdit,
      title: "Editar plantilla",
      className: "text-emerald-600 hover:text-emerald-900 hover:bg-emerald-50",
    },
    {
      label: "",
      icon: Settings,
      variant: "outline",
      onClick: onEditBuilder,
      title: "Configurar plantilla",
      className: "text-sky-600 hover:text-sky-900 hover:bg-sky-50",
    },
    {
      icon: Copy,
      variant: "ghost",
      onClick: onClone,
      title: "Clonar plantilla",
      className: "text-amber-500 hover:text-amber-700 hover:bg-amber-50",
    },
    {
      icon: Eye,
      variant: "ghost",
      onClick: onPreview,
      title: "Vista Previa",
      className: "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
    },
    {
      icon: History,
      variant: "ghost",
      onClick: onOpenHistory,
      title: "Historial de cambios",
      className: "text-violet-500 hover:text-violet-700 hover:bg-violet-50",
    },
    {
      icon: Trash2,
      variant: "danger",
      onClick: onDelete,
      title: "Eliminar",
    },
  ];

  return (
    <tr key={template.id} className="border-t hover:bg-gray-50">
      <td className="px-3 py-2 text-sm text-gray-500">{template.id}</td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded flex items-center justify-center bg-sky-50">
            <FileText className="h-4 w-4 text-sky-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{template.name}</div>
            {template.description && (
              <div className="text-xs text-gray-500 max-w-xs" style={{ maxWidth: "250px" }}>
                {template.description}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="px-3 py-2">
        {dataSourceName ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-cyan-700 bg-cyan-50 px-2 py-1 rounded">
            <Database className="w-3.5 h-3.5" />
            {dataSourceName}
          </span>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        )}
      </td>
      <td className="px-3 py-2">
        {tableProcessorName ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-violet-700 bg-violet-50 px-2 py-1 rounded">
            <Table2 className="w-3.5 h-3.5" />
            {tableProcessorName}
          </span>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        )}
      </td>
      <td className="px-3 py-2">
        <span className={`inline-flex items-center text-xs px-2 py-1 rounded ${
          template.search_type === 'month'
            ? 'bg-blue-50 text-blue-700'
            : 'bg-amber-50 text-amber-700'
        }`}>
          {template.search_type === 'month' ? 'Mes' : 'Rango'}
        </span>
      </td>
      <td className="px-3 py-2 text-center">
        {template.query_branches ? (
          <span className="inline-flex items-center text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
            <CheckCircle className="w-3 h-3 mr-1" />
            Sí
          </span>
        ) : (
          <span className="inline-flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            <XCircle className="w-3 h-3 mr-1" />
            No
          </span>
        )}
      </td>
      <td className="px-3 py-2">
        {template.status == 1 ? (
          <span className="inline-flex items-center text-green-600 text-sm">
            <CheckCircle className="w-4 h-4 mr-1" />
            Activo
          </span>
        ) : (
          <span className="inline-flex items-center text-gray-400 text-sm">
            <XCircle className="w-4 h-4 mr-1" />
            Inactivo
          </span>
        )}
      </td>
      <td className="px-3 py-2">
        <TableActions actions={rowActions} item={template} className="justify-center" />
      </td>
    </tr>
  );
}
