import React, { useState, useEffect } from "react";
import { Select } from "../ui/Select";
import { getBusinessPartners } from "../../services/SAP/businessPartnerService";

const SelectSuppliers = ({
    value,
    onChange,
    error,
    label = "Proveedor",
    required = false,
    placeholder = "Seleccione un proveedor...",
    className,
    disabled = false
}) => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const response = await getBusinessPartners();
            if (response.success) {
                setSuppliers(response.data.items || []);
            }
        } catch (error) {
            console.error("Error al obtener los proveedores:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    return (
        <div>
            <label className="text-[11px] font-semibold text-gray-800 uppercase">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <Select
                value={value}
                onChange={onChange}
                error={error}
                className={className}
                disabled={disabled || loading}
            >
                <option value="">{loading ? "Cargando..." : placeholder}</option>
                {suppliers.map((supplier) => (
                    <option key={supplier.CardCode} value={supplier.CardCode}>
                        {supplier.LicTracNum ? `${supplier.LicTracNum} - ` : ''}{supplier.CardName}
                    </option>
                ))}
            </Select>
        </div>
    );
};

export default SelectSuppliers;
