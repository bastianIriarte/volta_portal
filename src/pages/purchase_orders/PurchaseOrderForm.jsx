// PurchaseOrderForm.jsx
import React, { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Loader2, SaveIcon, X, ArrowLeft } from "lucide-react";
import { createPurchaseOrder, getPurchaseOrderById } from "../../services/myPurchaseOrderService";
import { handleSnackbar } from "../../utils/messageHelpers";
import { useNavigate, useParams } from "react-router-dom";
import { useFormValidation } from "../../hooks/useFormValidation";
import { useFormCalculations } from "../../hooks/useFormCalculations";
import DocumentErrorSummary from "../../components/documents/DocumentErrorSummary";
import DocumentHeader from "../../components/documents/DocumentHeader";
import DocumentHeaderTabs from "../../components/documents/DocumentHeaderTabs";
import DocumentContent from "../../components/documents/DocumentContent";
import DocumentFooter from "../../components/documents/DocumentFooter";

const PurchaseOrderForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [form, setForm] = useState({
        id: "",
        doc_num: "",
        supplier_id: "",
        supplier_code: "",
        supplier_name: "",
        contact_person: "",
        supplier_ref_num: "",
        currency: "CLP",
        exchange_rate: 1,
        doc_date: new Date().toISOString().split('T')[0],
        posting_date: new Date().toISOString().split('T')[0],
        delivery_date: new Date().toISOString().split('T')[0],
        type: "articles",
        status: "open",
        buyer: "",
        owner: "",
        comments: "",
        header_notes: "",
        footer_notes: "",
        discount_percent: 0,
        additional_expenses_percent: 0,
        rounding: false,
        items: []
    });

    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);
    const [activeTab, setActiveTab] = useState("contenido");

    const { errors, setErrors, validateAll } = useFormValidation(form);
    const totals = useFormCalculations(form);

    useEffect(() => {
        if (id) {
            loadPurchaseOrder(id);
        }
    }, [id]);

    const loadPurchaseOrder = async (orderId) => {
        setLoading(true);
        try {
            const response = await getPurchaseOrderById(orderId);
            if (response.success) {
                const sanitizedData = JSON.parse(
                    JSON.stringify(response.data, (key, value) => (value === null ? "" : value))
                );
                setForm({
                    ...sanitizedData,
                    items: sanitizedData.items || [],
                });
                setIsViewMode(true);
            } else {
                handleSnackbar(response.message || "Error al cargar la orden", "error");
                navigate('/dashboard/my-purchase-orders');
            }
        } catch (error) {
            handleSnackbar("Error al cargar la orden: " + error.message, "error");
            navigate('/dashboard/my-purchase-orders');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        if (isViewMode) return;

        setForm(f => {
            const newForm = { ...f, [field]: value };
            if (field === "type") {
                newForm.items = [];
            }
            return newForm;
        });
    };

    const submit = async () => {
        if (!validateAll()) {
            handleSnackbar("Por favor, corrija los errores en el formulario", "error");
            return;
        }

        setSaving(true);
        try {
            const dataToSend = {
                ...form,
                ...totals,
                items: form.items.map(item => ({
                    line_num: item.line_num,
                    product_id: item.product_id,
                    product_code: item.product_code,
                    description: item.description,
                    quantity: parseFloat(item.quantity) || 0,
                    unit_price: parseFloat(item.unit_price) || 0,
                    discount_percent: parseFloat(item.discount_percent) || 0,
                    tax_code: item.tax_code,
                    tax_rate: item.tax_rate,
                    warehouse: item.warehouse,
                    country_origin: item.country_origin,
                    global_agreement_num: item.global_agreement_num,
                    standard_item_id: item.standard_item_id,
                    product_classification: item.product_classification,
                    free_text: item.free_text,
                    total: item.total
                }))
            };

            const response = await createPurchaseOrder(dataToSend);
            handleSnackbar(response.message, response.success ? "success" : "error");

            if (response.success) {
                navigate('/dashboard/my-purchase-orders');
            }
        } catch (error) {
            handleSnackbar("Error al crear orden de compra: " + (error.message || "Error desconocido"), "error");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        navigate('/dashboard/my-purchase-orders');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="xs"
                        onClick={handleCancel}
                        icon={ArrowLeft}
                    >
                        Volver
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold uppercase">
                            {isViewMode ? "Detalle Orden de Compra" : "Nueva Orden de Compra"}
                        </h2>
                        {form.id && (
                            <p className="text-sm text-gray-600">ID Interno: {form.id} | DocEntry: {form.doc_entry ?? '-'} | DocNum: {form.doc_num ?? '-'}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Error Summary */}
            <DocumentErrorSummary errors={errors} />

            <div className="bg-white shadow rounded-lg overflow-hidden">
                {/* Header Form */}
                <DocumentHeader
                    form={form}
                    errors={errors}
                    isViewMode={isViewMode}
                    onFormChange={handleChange}
                    setForm={setForm}
                />

                {/* Tabs */}
                <DocumentHeaderTabs
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />

                {/* Content */}
                {activeTab === "contenido" && (
                    <DocumentContent
                        form={form}
                        errors={errors}
                        isViewMode={isViewMode}
                        onFormChange={handleChange}
                        setForm={setForm}
                        setErrors={setErrors}
                    />
                )}

                {/* Footer */}
                <DocumentFooter
                    form={form}
                    totals={totals}
                    isViewMode={isViewMode}
                    onFormChange={handleChange}
                    setForm={setForm}
                />

                {/* Action Buttons */}
                {!isViewMode && (
                    <div className="p-2 border-t bg-gray-50">
                        <div className="flex justify-end gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancel}
                                icon={X}
                                disabled={saving}
                            >
                                Cancelar
                            </Button>
                            <Button
                                size="sm"
                                onClick={submit}
                                icon={saving ? Loader2 : SaveIcon}
                                disabled={saving}
                                loading={saving}
                            >
                                {saving ? "Creando…" : "Crear Orden de Compra"}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PurchaseOrderForm;