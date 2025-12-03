import React, { useState, useEffect } from "react";
import { Select } from "../ui/Select";
import { getProducts } from "../../services/SAP/productService";

const SelectProducts = ({
    value,
    onChange,
    error,
    label = "Producto",
    required = false,
    placeholder = "Seleccione un producto...",
    className,
    disabled = false
}) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await getProducts();
            if (response.success) {
                setProducts(response.data.items || []);
            }
        } catch (error) {
            console.error("Error al obtener los productos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
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
                {products.map((product) => (
                    <option key={product.ItemCode} value={product.ItemCode}>
                        {product.ItemCode ? `${product.ItemCode} - ` : ''}{product.ItemName}
                    </option>
                ))}
            </Select>
        </div>
    );
};

export default SelectProducts;
