import { useState, useEffect } from "react";
import { Receipt, Search, Download, Eye, Loader2 } from "lucide-react";
import { useAuth } from "../../context/auth";
import { handleSnackbar } from "../../utils/messageHelpers";

export default function ClientInvoicesView() {
  const { session } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const companyId = session?.user?.company_id;

  useEffect(() => {
    loadInvoices();
  }, [companyId]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      // TODO: Implementar servicio para obtener facturas de la empresa
      // const response = await getInvoicesByCompany(companyId);
      // if (response.success) {
      //   setInvoices(response.data || []);
      // }
      setInvoices([]);
    } catch (error) {
      handleSnackbar("Error al cargar facturas", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter((inv) =>
    inv.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Receipt className="w-7 h-7 text-amber-600" />
          Facturas
        </h1>
        <p className="text-gray-500 mt-1">
          Consulta las facturas de tu empresa
        </p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por numero o descripcion..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredInvoices.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Numero
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Descripcion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Fecha
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Monto
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {invoice.number}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900">{invoice.description}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {invoice.date}
                  </td>
                  <td className="px-6 py-4 text-right font-medium">
                    {formatCurrency(invoice.amount)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : invoice.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {invoice.status === "paid"
                        ? "Pagada"
                        : invoice.status === "pending"
                        ? "Pendiente"
                        : "Vencida"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver detalle"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Descargar PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No hay facturas disponibles</p>
            <p className="text-sm text-gray-400 mt-1">
              Las facturas de tu empresa apareceran aqui
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
