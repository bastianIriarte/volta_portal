import React, { useState, useEffect } from "react";
import { Select } from "../ui/Select";
import { getClients } from "../../services/SAP/clientService";

const SelectClients = ({
    value,
    onChange,
    error,
    label = "Cliente",
    required = false,
    placeholder = "Seleccione un cliente...",
    className,
    disabled = false
}) => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const response = await getClients();
            if (response.success) {
                setClients(response.data || []);
            }
        } catch (error) {
            console.error("Error al obtener los clientes:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
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
                {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                        {client.rut ? `${client.rut} - ` : ''}{client.name}
                    </option>
                ))}
            </Select>
        </div>
    );
};

export default SelectClients;
