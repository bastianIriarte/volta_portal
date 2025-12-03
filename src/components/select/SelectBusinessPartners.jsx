import React, { useState, useEffect } from "react";
import { Select } from "../ui/Select";
import { getBusinessPartners } from "../../services/SAP/businessPartnerService";

const SelectBusinessPartners = ({
    value,
    onChange,
    error,
    label = "Socio de Negocio",
    required = false,
    placeholder = "Seleccione un socio de negocio...",
    className,
    disabled = false,
    filterType = null // 'supplier', 'client', 'both' o null para todos
}) => {
    const [businessPartners, setBusinessPartners] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBusinessPartners = async () => {
        try {
            setLoading(true);
            const response = await getBusinessPartners();
            if (response.success) {
                let data = response.data || [];

                // Filtrar por tipo si se especifica
                if (filterType) {
                    data = data.filter(bp =>
                        bp.type === filterType || bp.type === 'both'
                    );
                }

                setBusinessPartners(data);
            }
        } catch (error) {
            console.error("Error al obtener los socios de negocio:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBusinessPartners();
    }, [filterType]);

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
                {businessPartners.map((partner) => (
                    <option key={partner.id} value={partner.id}>
                        {partner.rut ? `${partner.rut} - ` : ''}{partner.name}
                    </option>
                ))}
            </Select>
        </div>
    );
};

export default SelectBusinessPartners;
