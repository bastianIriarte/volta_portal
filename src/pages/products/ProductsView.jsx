import { Modal } from "../../components/ui/Modal.jsx";
import GenericFilters from "../../components/common/GenericFilters.jsx";
import GenericTable from "../../components/common/GenericTable.jsx";
import { useServerPagination } from "../../hooks/useServerPagination.js";
import { useModals } from "../../hooks/useModals.js";
import { getProducts } from "../../services/SAP/productService.js";
import { Package, Eye } from "lucide-react";
import { useState } from "react";

export default function ProductsView() {
  const { modals, closeModal } = useModals();
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Hook de paginación del servidor
  const {
    data: products,
    loading,
    search,
    setSearch,
    activeSearch,
    executeSearch,
    sortBy,
    sortDir,
    handleSort,
    page,
    setPage,
    totalPages,
    totalItems,
  } = useServerPagination(getProducts, {
    defaultSort: "name",
    defaultSortDir: "asc",
    pageSize: 10,
    autoFetch: true,
  });

  // Función para ver stock
  const handleViewStock = (product) => {
    setSelectedProduct(product);
  };

  // Función para limpiar búsqueda
  const handleClearSearch = () => {
    setSearch("");
    // Si hay una búsqueda activa, ejecutar búsqueda vacía para resetear los resultados
    if (activeSearch) {
      setTimeout(() => executeSearch(), 0);
    }
  };

  // Configuración de columnas
  const columns = [
    { key: "ItemCode", label: "Código" },
    { key: "ItemName", label: "Nombre" },
    { key: "ItemType", label: "Tipo", sortable: false },
    { key: "BuyUnitMsr", label: "Unidad Compra" },
    { key: "SalUnitMsr", label: "Unidad Venta" },
    { key: "QuantityOnStock", label: "Stock Total", sortable: false },
    { key: "QuantityOrderedFromVendors", label: "En Compra", sortable: false },
    { key: "QuantityOrderedByCustomers", label: "En Venta", sortable: false },
    { key: "actions", label: "Acciones", sortable: false },
  ];

  // Renderizado de filas
  const renderRow = (product, index) => {
    // Mapear tipo de item
    const itemTypeMap = {
      'itItems': 'Artículo',
      'itServices': 'Servicio',
      'itLabor': 'Labor',
    };

    return (
      <tr key={product.ItemCode || index} className="border-t hover:bg-gray-50">
        <td className="px-3 py-2 text-xs font-medium font-mono">{product.ItemCode || "-"}</td>
        <td className="px-3 py-2 text-sm">{product.ItemName || "-"}</td>
        <td className="px-3 py-2 text-xs">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            product.ItemType === 'itItems' ? 'bg-blue-100 text-blue-800' :
            product.ItemType === 'itServices' ? 'bg-green-100 text-green-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {itemTypeMap[product.ItemType] || product.ItemType || "-"}
          </span>
        </td>
        <td className="px-3 py-2 text-sm text-center">{product.BuyUnitMsr || "-"}</td>
        <td className="px-3 py-2 text-sm text-center">{product.SalUnitMsr || "-"}</td>
        <td className="px-3 py-2 text-sm text-right font-medium">
          <span className={`${
            product.QuantityOnStock > 0 ? 'text-green-600' :
            product.QuantityOnStock === 0 ? 'text-gray-500' :
            'text-red-600'
          }`}>
            {product.QuantityOnStock !== undefined ? Number(product.QuantityOnStock).toLocaleString('es-CL') : "0"}
          </span>
        </td>
        <td className="px-3 py-2 text-sm text-right text-blue-600">
          {product.QuantityOrderedFromVendors !== undefined ? Number(product.QuantityOrderedFromVendors).toLocaleString('es-CL') : "0"}
        </td>
        <td className="px-3 py-2 text-sm text-right text-orange-600">
          {product.QuantityOrderedByCustomers !== undefined ? Number(product.QuantityOrderedByCustomers).toLocaleString('es-CL') : "0"}
        </td>
        <td className="px-3 py-2 text-sm">
          <button
            onClick={() => handleViewStock(product)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            title="Ver detalle de stock por bodega"
          >
            <Eye size={14} />
            Ver Stock
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold   mb-2">
          Productos
        </h2>
        <p className=" /70">
          Listado de productos disponibles
        </p>
      </div>

      {/* Filtros */}
      <GenericFilters
        searchPlaceholder="Buscar productos..."
        searchValue={search}
        onSearchChange={setSearch}
        onSearch={executeSearch}
        showSearchButton={true}
        searchButtonLabel="Buscar"
        minSearchLength={3}
        searchLoading={loading}
        resultsCount={totalItems}
        showAddButton={false}
      />

      {/* Tabla */}
      <GenericTable
        title="Productos registrados"
        loading={loading}
        columns={columns}
        data={products}
        pageData={products}
        emptyMessage="No hay productos disponibles"
        emptyIcon={Package}
        searchQuery={search}
        onClearSearch={handleClearSearch}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={handleSort}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalResults={totalItems}
        renderRow={renderRow}
      />

      {/* Modal de Stock por Bodega */}
      <Modal
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title={`Stock por Bodega - ${selectedProduct?.ItemCode || ''}`}
        size="xl"
        actions={[
          {
            label: "Cerrar",
            variant: "secondary",
            onClick: () => setSelectedProduct(null),
          },
        ]}
      >
        {selectedProduct && (
          <div className="space-y-4">
            {/* Información del Producto */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Código</p>
                  <p className="text-sm font-semibold font-mono">{selectedProduct.ItemCode}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Nombre</p>
                  <p className="text-sm font-semibold">{selectedProduct.ItemName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Stock Total</p>
                  <p className="text-sm font-semibold text-green-600">
                    {Number(selectedProduct.QuantityOnStock || 0).toLocaleString('es-CL')} {selectedProduct.SalUnitMsr}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Tipo</p>
                  <p className="text-sm font-semibold">
                    {selectedProduct.ItemType === 'itItems' ? 'Artículo' :
                     selectedProduct.ItemType === 'itServices' ? 'Servicio' : 'Otro'}
                  </p>
                </div>
              </div>
            </div>

            {/* Tabla de Inventario por Bodega */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Bodega
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                      En Stock
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Comprometido
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Pedido
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Disponible
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Stock Mín.
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Stock Máx.
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedProduct.Inventory && selectedProduct.Inventory.length > 0 ? (
                    selectedProduct.Inventory
                      .filter(inv => inv.InStock > 0 || inv.Committed > 0 || inv.Ordered > 0)
                      .map((inv, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {inv.WhsCode}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            <span className={`font-medium ${
                              inv.InStock > 0 ? 'text-green-600' : 'text-gray-500'
                            }`}>
                              {Number(inv.InStock || 0).toLocaleString('es-CL')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            <span className={`${
                              inv.Committed > 0 ? 'text-red-600 font-medium' : 'text-gray-500'
                            }`}>
                              {Number(inv.Committed || 0).toLocaleString('es-CL')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            <span className={`${
                              inv.Ordered > 0 ? 'text-blue-600 font-medium' : 'text-gray-500'
                            }`}>
                              {Number(inv.Ordered || 0).toLocaleString('es-CL')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            <span className={`font-semibold ${
                              inv.Available > 0 ? 'text-green-700' :
                              inv.Available === 0 ? 'text-gray-500' :
                              'text-red-600'
                            }`}>
                              {Number(inv.Available || 0).toLocaleString('es-CL')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-600">
                            {Number(inv.MinStock || 0).toLocaleString('es-CL')}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-600">
                            {Number(inv.MaxStock || 0).toLocaleString('es-CL')}
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-sm text-gray-500">
                        No hay información de inventario disponible
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Leyenda */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-900 font-semibold mb-2">Leyenda:</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
                <div><span className="font-semibold">En Stock:</span> Cantidad física en bodega</div>
                <div><span className="font-semibold">Comprometido:</span> Asignado a órdenes de venta</div>
                <div><span className="font-semibold">Pedido:</span> En órdenes de compra pendientes</div>
                <div><span className="font-semibold">Disponible:</span> Stock - Comprometido</div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de notificación */}
      <Modal
        open={!!modals.notify}
        onClose={() => closeModal('notify')}
        title={modals.notify?.title}
        variant={modals.notify?.variant || "info"}
        isHtml={true}
        actions={[
          {
            label: "Cerrar",
            variant: "primary",
            onClick: () => closeModal('notify'),
          },
        ]}
      >
        {modals.notify?.msg}
      </Modal>
    </div>
  );
}
