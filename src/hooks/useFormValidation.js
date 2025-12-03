// hooks/useFormValidation.js
import { useState } from "react";
import { validateField } from "../utils/validators";

export const useFormValidation = (form) => {
    const [errors, setErrors] = useState({});

    const validateSingleField = (field, value) => {
        let validationType = "text";
        let isRequired = false;
        let customMessage = "Campo requerido";

        const requiredFields = ["supplier_id", "doc_date", "delivery_date", "supplier_ref_num", "posting_date"];
        isRequired = requiredFields.includes(field);

        switch (field) {
            case "supplier_id":
                validationType = "select";
                customMessage = "Proveedor: Debe seleccionar un proveedor";
                break;
            case "posting_date":
                validationType = "date";
                customMessage = "Fecha contabilización: Campo requerido";
                break;
            case "doc_date":
                validationType = "date";
                customMessage = "Fecha documento: Campo requerido";
                break;
            case "delivery_date":
                validationType = "date";
                customMessage = "Fecha entrega: Campo requerido";
                break;
            case "supplier_ref_num":
                validationType = "text";
                customMessage = "No.Ref.del acreedor: Campo requerido";
                break;
            case "exchange_rate":
            case "discount_percent":
            case "additional_expenses_percent":
                validationType = "number";
                isRequired = false;
                break;
            default:
                validationType = "text";
                isRequired = false;
                break;
        }

        const result = validateField(value, validationType, isRequired, customMessage);
        return {
            isValid: result.validate,
            message: result.msg,
            cleanValue: result.value_data !== undefined ? result.value_data : value
        };
    };

    const validateAll = () => {
        const newErrors = {};
        const requiredFields = ["supplier_id", "doc_date", "delivery_date", "posting_date"];

        requiredFields.forEach(field => {
            const value = form[field];
            const validation = validateSingleField(field, value || "");
            if (!validation.isValid) {
                newErrors[field] = validation.message;
            }
        });

        if (form.items.length === 0) {
            newErrors.items = `Líneas: Debe agregar al menos un ${form.type === 'articles' ? 'artículo' : 'servicio'}`;
        } else {
            form.items.forEach((item, index) => {
                if (form.type === 'articles' && !item.product_id) {
                    newErrors[`item_${index}_product`] = `Línea ${index + 1} - Número de artículo: Debe seleccionar un producto`;
                }
                
                if (form.type === 'services' && !item.description) {
                    newErrors[`item_${index}_description`] = `Línea ${index + 1} - Descripción: Campo requerido`;
                }
                
                if (!item.quantity || parseFloat(item.quantity) < 0.000001) {
                    newErrors[`item_${index}_quantity`] = `Línea ${index + 1} - Cantidad: Debe ser mayor a 0`;
                }
                
                if (item.unit_price === undefined || item.unit_price === null || item.unit_price === "" || parseFloat(item.unit_price) < 0) {
                    newErrors[`item_${index}_unit_price`] = `Línea ${index + 1} - Precio: Campo requerido y debe ser mayor o igual a 0`;
                }
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    return {
        errors,
        setErrors,
        validateAll,
        validateSingleField
    };
};