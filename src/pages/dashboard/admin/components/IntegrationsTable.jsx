import React from "react";
import { Card } from "../../../../components/ui/Card";
import { Send } from "lucide-react";

export const IntegrationsTable = ({ logs }) => {
  return (
    <Card title="Últimas integraciones" icon={Send} variant="default">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left">
            <tr className="border-b border-gray-200">
              <th className="py-3 font-semibold text-green-800">Fecha</th>
              <th className="py-3 font-semibold text-green-800">Tipo</th>
              <th className="py-3 font-semibold text-green-800">Detalle</th>
              <th className="py-3 font-semibold text-green-800">Estado</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr
                key={l.id}
                className="border-b border-gray-100 hover:bg-green-800/5 transition-colors"
              >
                <td className="py-3 ">
                  {new Date(l.created_at).toLocaleString("es-CL", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                  }).replace(/\//g, "-")}
                </td>
                <td className="py-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                    {l.origin}
                  </span>
                </td>
                <td className="py-3  truncate max-w-[40ch]" title={l.reason}>
                  {l.reason}
                </td>
                <td className="py-3">
                  <span className={`${l.status_code === "success" ? "badge-ok" : l.status_code === "pending" ? "bg-yellow-100" : "badge-err"} p-1 text-[10px] rounded bottom-2`}>
                    {l.status_code ?? 'N/A'}
                  </span>
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td className="py-6 text-center " colSpan={4}>
                  Sin eventos recientes
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};