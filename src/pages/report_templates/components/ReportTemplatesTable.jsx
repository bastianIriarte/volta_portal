import { BarChart3, Edit2, Trash2, Table2, CheckCircle, XCircle } from "lucide-react";
import TableActions from "../../../components/common/TableActions";
import { getOriginTypeInfo } from "../constants";

export default function ReportTemplatesTable({
  templates,
  onEdit,
  onDelete,
  onConfigureColumns,
}) {
  const getRowActions = (template) => {
    const actions = [
      {
        label: "",
        icon: Edit2,
        variant: "outline",
        onClick: onEdit,
        title: "Editar plantilla",
        className: "text-emerald-600 hover:text-emerald-900 hover:bg-emerald-50",
      },
    ];

    // Agregar botón de configurar columnas solo para SQL con fuente de datos
    if (template.origin_type === "sql" && template.data_source_id) {
      actions.push({
        label: "",
        icon: Table2,
        variant: "outline",
        onClick: onConfigureColumns,
        title: "Configurar columnas",
        className: "text-cyan-600 hover:text-cyan-900 hover:bg-cyan-50",
      });
    }

    actions.push({
      label: "",
      icon: Trash2,
      variant: "danger",
      onClick: onDelete,
      title: "Eliminar",
    });

    return actions;
  };

  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">No hay plantillas de reportes</p>
        <p className="text-sm text-gray-400 mt-1">
          Crea una nueva plantilla para comenzar
        </p>
      </div>
    );
  }

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            ID
          </th>
          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Plantilla
          </th>
          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Código
          </th>
          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Tipo Origen
          </th>
          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Estado
          </th>
          <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">
            Acciones
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {templates.map((template) => {
          const originInfo = getOriginTypeInfo(template.origin_type);
          const OriginIcon = originInfo.icon;
          return (
            <tr key={template.id} className="hover:bg-gray-50">
              <td className="px-3 py-2 text-sm text-gray-500">{template.id}</td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded flex items-center justify-center bg-indigo-50">
                    <BarChart3 className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{template.name}</div>
                    {template.description && (
                      <div className="text-xs text-gray-500 truncate max-w-xs">
                        {template.description}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-3 py-2">
                <span className="text-sm text-gray-500 font-mono">{template.code || "-"}</span>
              </td>
              <td className="px-3 py-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-${originInfo.color}-100 text-${originInfo.color}-800`}>
                  <OriginIcon className="w-3.5 h-3.5" />
                  {originInfo.label.split(" ")[0]}
                </span>
              </td>
              <td className="px-3 py-2">
                {template.status ? (
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
                <TableActions actions={getRowActions(template)} item={template} className="justify-end mr-12" />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
