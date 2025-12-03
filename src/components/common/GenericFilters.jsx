// components/common/GenericFilters.jsx
import React from "react";
import { Card } from "../ui/Card.jsx";
import { Input } from "../ui/Input.jsx";
import { Select } from "../ui/Select.jsx";
import { Button } from "../ui/Button.jsx";
import { Search, Filter, Plus } from "lucide-react";

export default function GenericFilters({
  title = "Filtros y búsqueda",
  searchPlaceholder = "Buscar...",
  searchValue,
  onSearchChange,
  onSearch,
  showSearchButton = false,
  searchButtonLabel = "Buscar",
  minSearchLength = 0,
  searchLoading = false,
  filterValue,
  onFilterChange,
  filterOptions = [],
  filterLabel = "Filtrar por",
  resultsCount = 0,
  showAddButton = false,
  addButtonLabel = "Agregar",
  onAdd,
  children
}) {
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter' && onSearch && !searchLoading) {
      e.preventDefault();
      onSearch();
    }
  };

  const isSearchValid = !minSearchLength || searchValue.trim().length === 0 || searchValue.trim().length >= minSearchLength;

  return (
    <Card title={title}>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        {/* Búsqueda */}
        <div className="w-full lg:max-w-md">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="pl-9"
                disabled={searchLoading}
              />
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
            </div>
            {showSearchButton && (
              <Button
                onClick={onSearch}
                disabled={!isSearchValid || searchLoading}
                loading={searchLoading}
                title={!isSearchValid ? `Mínimo ${minSearchLength} caracteres requeridos` : ''}
              >
                {searchLoading ? 'Buscando...' : searchButtonLabel}
              </Button>
            )}
          </div>
          {minSearchLength > 0 && searchValue.trim().length > 0 && searchValue.trim().length < minSearchLength && (
            <p className="text-xs text-orange-600 mt-1">
              Ingrese al menos {minSearchLength} caracteres para buscar
            </p>
          )}
        </div>
        
        {/* Filtros y acciones */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
          {/* Filtro dropdown */}
          {filterOptions.length > 0 && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 " />
              <Select
                value={filterValue}
                onChange={(e) => onFilterChange(e.target.value)}
                className="min-w-[140px]"
              >
                <option value="all">Todos</option>
                {filterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          )}
          
          {/* Filtros personalizados */}
          {children}
          
          {/* Botón agregar */}
          {showAddButton && (
            <Button icon={Plus} onClick={onAdd}>
              {addButtonLabel}
            </Button>
          )}
          
          {/* Contador de resultados */}
          {/* <span className="text-sm  whitespace-nowrap">
            {resultsCount} resultado{resultsCount !== 1 ? 's' : ''}
          </span> */}
        </div>
      </div>
    </Card>
  );
}