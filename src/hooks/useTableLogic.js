// hooks/useTableLogic.js
import { useState, useMemo, useEffect } from "react";

export function useTableLogic(data = [], options = {}) {
  const {
    defaultSort = "id",
    defaultSortDir = "asc",
    pageSize = 8,
    searchFields = [],
    filterField = null
  } = options;

  const [q, setQ] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const [sortBy, setSortBy] = useState(defaultSort);
  const [sortDir, setSortDir] = useState(defaultSortDir);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [q, filterValue]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
    setPage(1);
  };

  const filteredData = useMemo(() => {
    let filtered = [...data];
    
    if (q.trim() && searchFields.length > 0) {
      const query = q.toLowerCase();
      filtered = filtered.filter((item) => {
        return searchFields.some(field => {
          const value = getNestedValue(item, field);
          return String(value || "").toLowerCase().includes(query);
        });
      });
    }

    if (filterValue !== "all" && filterField) {
      filtered = filtered.filter((item) => {
        const value = getNestedValue(item, filterField);
        return value === filterValue;
      });
    }

    // Ordenar
    filtered.sort((a, b) => {
      const va = getNestedValue(a, sortBy);
      const vb = getNestedValue(b, sortBy);
      
      // Si ambos son números, comparar numéricamente
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDir === "asc" ? va - vb : vb - va;
      }
      
      // Si no, comparar como strings
      const valueA = String(va || "").toLowerCase();
      const valueB = String(vb || "").toLowerCase();
      
      if (valueA < valueB) return sortDir === "asc" ? -1 : 1;
      if (valueA > valueB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [data, q, filterValue, sortBy, sortDir, searchFields, filterField]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pageData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  return {
    q,
    setQ,
    filterValue,
    setFilterValue,
    sortBy,
    setSortBy,
    sortDir,
    setSortDir,
    page,
    setPage,
    pageSize,
    filteredData,
    pageData,
    totalPages,
    handleSort
  };
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : '';
  }, obj);
}