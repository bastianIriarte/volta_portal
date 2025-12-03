import React from "react";
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";
import { Plus } from "lucide-react";
import ItemsTable from "./DocumentItemsTable.jsx";

const DocumentContent = ({ form, errors, isViewMode, onFormChange, setForm, setErrors }) => {
    const handleAddItem = () => {
        if (isViewMode) return;

        const newItem = {
            id: Math.random().toString(36).substring(2, 10),
            line_num: form.items.length + 1,
            quantity: 1,
            unit_price: 0,
            discount_percent: 0,
            tax_code: "IVA",
            tax_rate: 19,
            warehouse: "",
            country_origin: "",
            global_agreement_num: "",
            standard_item_id: "",
            product_classification: "",
            free_text: "",
            total: 0,
            selectedProduct: null
        };

        if (form.type === 'articles') {
            newItem.product_id = "";
            newItem.product_code = "";
            newItem.description = "";
        } else {
            newItem.description = "";
            newItem.gl_account_code = "";
            newItem.gl_account_name = "";
            newItem.selectedGLAccount = null;
        }

        setForm(f => ({
            ...f,
            items: [...f.items, newItem]
        }));
    };

    return (
        <div>
            {/* Clase de artículo/servicio */}
            <div className="p-2 bg-white border-b flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-700">Clase de artículo/servicio:</label>
                    <Select
                        value={form.type}
                        onChange={(e) => onFormChange("type", e.target.value)}
                        disabled={isViewMode}
                        className="text-xs py-0.5"
                    >
                        <option value="articles">Artículo</option>
                        <option value="services">Servicio</option>
                    </Select>
                </div>
                {!isViewMode && (
                    <Button
                        size="xs"
                        variant="outline"
                        onClick={handleAddItem}
                        icon={Plus}
                        className="ml-auto"
                    >
                        Agregar línea
                    </Button>
                )}
            </div>

            {/* Tabla de items */}
            <ItemsTable
                form={form}
                errors={errors}
                isViewMode={isViewMode}
                setForm={setForm}
                setErrors={setErrors}
            />
        </div>
    );
};

export default DocumentContent;