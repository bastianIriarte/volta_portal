import { useState, useMemo, useEffect, useRef } from "react";
import { Building2, Plus, X, Search, Loader2 } from "lucide-react";
import { Modal } from "../../../components/ui/Modal";

const MAX_VISIBLE = 50;

export default function CompanyAssignmentSection({
  userCompanies = [],
  selectedCompanies = [],
  requestCompany = null,
  onAddCompanies,
  onRemoveCompany,
  onRemoveUserCompany,
  isReadOnly = false,
  sapCompanies = [],
  loadingSap = false,
  onOpenModal,
}) {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [checked, setChecked] = useState([]);
  const debounceRef = useRef(null);

  // Debounce del buscador
  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  // Filtrar empresas SAP: excluir las que ya están asignadas, seleccionadas o la de la solicitud
  const excludedRuts = useMemo(() => {
    const ruts = new Set();
    if (requestCompany?.rut) {
      ruts.add((requestCompany.rut).replace(/[.\-]/g, "").toUpperCase());
    }
    userCompanies.forEach((c) => ruts.add((c.rut || "").replace(/[.\-]/g, "").toUpperCase()));
    selectedCompanies.forEach((c) => ruts.add((c.rut || "").replace(/[.\-]/g, "").toUpperCase()));
    return ruts;
  }, [userCompanies, selectedCompanies, requestCompany]);

  const filteredSapCompanies = useMemo(() => {
    let list = sapCompanies.filter((c) => {
      const rutClean = (c.rut || "").replace(/[.\-]/g, "").toUpperCase();
      return !excludedRuts.has(rutClean);
    });

    if (debouncedSearch.trim()) {
      const term = debouncedSearch.toLowerCase();
      list = list.filter(
        (c) =>
          (c.business_name || "").toLowerCase().includes(term) ||
          (c.rut || "").toLowerCase().includes(term) ||
          (c.sap_code || "").toLowerCase().includes(term)
      );
    }

    return list;
  }, [sapCompanies, excludedRuts, debouncedSearch]);

  const visibleCompanies = useMemo(() => {
    return filteredSapCompanies.slice(0, MAX_VISIBLE);
  }, [filteredSapCompanies]);

  const handleOpenModal = () => {
    setChecked([]);
    setSearch("");
    setDebouncedSearch("");
    if (onOpenModal) onOpenModal();
    setShowModal(true);
  };

  const handleConfirm = () => {
    const selected = sapCompanies.filter((c) =>
      checked.includes(c.sap_code)
    );
    onAddCompanies(selected);
    setShowModal(false);
    setChecked([]);
    setSearch("");
  };

  const toggleCheck = (sapCode) => {
    setChecked((prev) =>
      prev.includes(sapCode)
        ? prev.filter((c) => c !== sapCode)
        : [...prev, sapCode]
    );
  };

  const allCompanies = [
    ...(requestCompany ? [requestCompany] : []),
    ...userCompanies,
    ...selectedCompanies,
  ];

  return (
    <div className="border-t pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Empresas Asignadas
          {allCompanies.length > 0 && (
            <span className="text-sm font-normal text-gray-500">
              ({allCompanies.length})
            </span>
          )}
        </h3>
        {!isReadOnly && (
          <button
            type="button"
            onClick={handleOpenModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar Empresas
          </button>
        )}
      </div>

      {allCompanies.length === 0 ? (
        <div className="text-center py-8 text-gray-400 border border-dashed border-gray-300 rounded-lg">
          <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No hay empresas asignadas</p>
          {!isReadOnly && (
            <p className="text-xs mt-1">
              Utilice el botón "Agregar Empresas" para buscar en SAP
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {requestCompany && (
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 border border-gray-300 rounded-full text-sm"
              title="Empresa de la solicitud (principal)"
            >
              <Building2 className="w-3.5 h-3.5" />
              {requestCompany.business_name}
              {requestCompany.rut && (
                <span className="text-gray-500 text-xs">
                  ({requestCompany.rut})
                </span>
              )}
              <span className="text-[10px] font-medium bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full ml-1">
                Principal
              </span>
            </span>
          )}
          {userCompanies.map((company, idx) => (
            <span
              key={`existing-${company.id || company.rut}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-sm"
            >
              <Building2 className="w-3.5 h-3.5" />
              {company.business_name}
              {company.rut && (
                <span className="text-emerald-500 text-xs">
                  ({company.rut})
                </span>
              )}
              {!isReadOnly && onRemoveUserCompany && (
                <button
                  type="button"
                  onClick={() => onRemoveUserCompany(idx)}
                  className="ml-0.5 p-0.5 hover:bg-emerald-200 rounded-full transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
          {selectedCompanies.map((company, idx) => (
            <span
              key={`selected-${company.sap_code || idx}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm"
            >
              <Building2 className="w-3.5 h-3.5" />
              {company.business_name}
              {company.rut && (
                <span className="text-blue-500 text-xs">
                  ({company.rut})
                </span>
              )}
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => onRemoveCompany(idx)}
                  className="ml-0.5 p-0.5 hover:bg-blue-200 rounded-full transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Modal de selección SAP */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Seleccionar Empresas desde SAP"
        size="lg"
        actions={[
          {
            label: "Cancelar",
            variant: "outline",
            onClick: () => setShowModal(false),
          },
          {
            label: `Agregar (${checked.length})`,
            variant: "primary",
            onClick: handleConfirm,
            disabled: checked.length === 0,
          },
        ]}
      >
        <div className="space-y-4">
          {/* Buscador */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, RUT o código SAP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-cyan-200 focus:border-cyan-300"
            />
          </div>

          {/* Lista de empresas */}
          {loadingSap ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
              <span className="ml-2 text-sm text-gray-500">
                Cargando empresas desde SAP...
              </span>
            </div>
          ) : filteredSapCompanies.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">
                {search
                  ? "No se encontraron resultados"
                  : "No hay empresas disponibles"}
              </p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
              {visibleCompanies.map((company) => {
                const isChecked = checked.includes(company.sap_code);
                return (
                  <label
                    key={company.sap_code}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors ${
                      isChecked ? "bg-cyan-50" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCheck(company.sap_code)}
                      className="w-4 h-4 text-cyan-600 rounded border-gray-300 focus:ring-cyan-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {company.business_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        RUT: {company.rut || "N/A"} | Código SAP:{" "}
                        {company.sap_code}
                      </p>
                    </div>
                  </label>
                );
              })}
              {filteredSapCompanies.length > MAX_VISIBLE && (
                <div className="px-4 py-2.5 text-center text-xs text-amber-600 bg-amber-50">
                  Mostrando {MAX_VISIBLE} de {filteredSapCompanies.length} resultados. Use el buscador para refinar.
                </div>
              )}
            </div>
          )}

          <p className="text-xs text-gray-500">
            {filteredSapCompanies.length} empresas disponibles
            {checked.length > 0 && ` | ${checked.length} seleccionadas`}
          </p>
        </div>
      </Modal>
    </div>
  );
}
