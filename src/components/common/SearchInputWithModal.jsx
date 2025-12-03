import React, { useState, useEffect } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { Search, Loader2 } from "lucide-react";
import { handleSnackbar } from "../../utils/messageHelpers";

/**
 * Componente reutilizable para búsqueda con modal
 * Similar al comportamiento de SAP Business One
 */
export default function SearchInputWithModal({
  label,
  title,
  placeholder = "Buscar...",
  value,
  onChange,
  onSelect,
  searchFunction,
  columns = [],
  renderRow,
  displayField = "name",
  codeField = "code",
  error,
  required = false,
  disabled = false,
  readonly = false,
  showButton = true,
  selectedItem = null,
  marginButton = ""
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  // Cargar items cuando se abre el modal
  const handleOpenModal = async () => {
    setModalOpen(true);
    setSearchQuery("");
    setItems([]);
  };

  // Ejecutar búsqueda con botón
  const handleExecuteSearch = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await searchFunction({ search: searchQuery });
      if (response.success) {
        setItems(response.data.items || []);
      }
    } catch (error) {
      // handleSnackbar(`Error en búsqueda de ${label}. <br> <b>Motivo:</b> ${error.message}`, "error")
      console.error("Error en búsqueda:", error);
    } finally {
      setLoading(false);
    }
  };

  // Manejar Enter en el campo de búsqueda
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleExecuteSearch();
    }
  };

  // Seleccionar un item del modal
  const handleSelectItem = (item) => {
    onSelect(item);
    setInputValue(item[codeField]);
    setModalOpen(false);
  };

  // Manejar cambio manual del input
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (onChange) {
      onChange(e);
    }
  };

  // Validar código cuando pierde el foco
  const handleBlur = async () => {
    if (inputValue && inputValue !== value) {
      // Buscar el item por código
      try {
        const response = await searchFunction({ search: inputValue });
        if (response.success && response.data && response.data.length > 0) {
          const found = response.data.find(item => item[codeField] === inputValue);
          if (found) {
            onSelect(found);
          }
        }
      } catch (error) {
        console.error("Error al validar código:", error);
      }
    }
  };

  useEffect(() => {
    if (modalOpen) {
      handleExecuteSearch();
    }
  }, [modalOpen]);

  return (
    <div>
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            label={label}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            error={error}
            disabled={disabled}
            required={required}
            readOnly={readonly}
            height="h-6"
            className="rounded"
          />
          {selectedItem && (
            <div className="text-xs text-gray-600 mt-1">
              {selectedItem[displayField]}
            </div>
          )}
        </div>
        {showButton && (
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={handleOpenModal}
            disabled={disabled}
            icon={Search}
            title="Buscar"
            className={`h-6 rounded -ml-1 ${marginButton}`}
          />
        )}

      </div>

      {/* Modal de búsqueda */}
      <Modal
        showIcon={false}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={title}
        size="lg"
        actions={[
          {
            label: "Cerrar",
            variant: "outline",
            onClick: () => setModalOpen(false),
          },
        ]}
      >
        <div className="space-y-4">
          {/* Búsqueda */}
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              placeholder="Buscar..."
              className="flex-1"
              height="h-8"
            />
            <Button
              type="button"
              variant="primary"
              onClick={handleExecuteSearch}
              disabled={loading}
              icon={loading ? Loader2 : Search}
              loading={loading}
              size="xs"
            >
              Buscar
            </Button>
          </div>

          {/* Tabla de resultados */}
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-6 h-6 animate-spin  " />
            </div>
          ) : (
            <div className="border overflow-hidden">
              <div className="max-h-80 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      {columns.map((col) => (
                        <th
                          key={col.key}
                          className="px-3 py-1 text-left text-xs font-bold text-gray-700 uppercase"
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.length === 0 ? (
                      <tr>
                        <td
                          colSpan={columns.length + 1}
                          className="px-3 py-6 text-center text-gray-500"
                        >
                          No se encontraron resultados
                        </td>
                      </tr>
                    ) : (
                      items.map((item, index) => (
                        <tr
                          key={item[codeField] || index}
                          className="hover:bg-gray-50 cursor-pointer py-1 text-[1px]"
                          onClick={() => handleSelectItem(item)}
                        >
                          {renderRow ? (
                            renderRow(item, index)
                          ) : (
                            columns.map((col) => (
                              <td key={col.key} className="px-3 text-sm">
                                {item[col.key] || "-"}
                              </td>
                            ))
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
