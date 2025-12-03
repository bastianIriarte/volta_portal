// ItemsTable.jsx
import React from "react";
import { Trash2 } from "lucide-react";
import SearchInputWithModal from "../common/SearchInputWithModal";
import { getProducts } from "../../services/SAP/productService";
import { getGLAccounts } from "../../services/SAP/accountService";
import { getBlanketAgreements } from "../../services/SAP/blanketAgreementService";

const DocumentItemsTable = ({ form, errors, isViewMode, setForm, setErrors }) => {
    const taxCodeOptions = [
        { value: "IVA", label: "IVA - IVA Débito y Crédito Fiscal" },
        { value: "IVA_EXE", label: "IVA_EXE - IVA Exento" },
        { value: "IVA_ND", label: "IVA_ND - IVA Crédito Fiscal No Deducible" },
        { value: "FUEL", label: "FUEL - IVA + Impuesto Combustibles + FEPP" },
        { value: "FUEL_ND", label: "FUEL_ND - IVA + Impto Combustibles No Deducible" },
    ];

    const getTaxRate = (taxCode) => {
        const taxRates = {
            "IVA": 19,
            "IVA_EXE": 0,
            "IVA_ND": 19,
            "FUEL": 20,
            "FUEL_ND": 20
        };
        return taxRates[taxCode] || 19;
    };

    const handleItemChange = (index, field, value) => {
        if (isViewMode) return;

        const newItems = [...form.items];
        newItems[index][field] = value;

        if (field === 'tax_code') {
            newItems[index].tax_rate = getTaxRate(value);
        }

        if (field === 'quantity' || field === 'unit_price' || field === 'discount_percent') {
            const quantity = parseFloat(newItems[index].quantity) || 0;
            const unitPrice = parseFloat(newItems[index].unit_price) || 0;
            const subtotal = quantity * unitPrice;
            const discountPercent = parseFloat(newItems[index].discount_percent) || 0;
            const discount = subtotal * (discountPercent / 100);
            newItems[index].total = subtotal - discount;
        }

        setForm(f => ({ ...f, items: newItems }));
    };

    const handleSelectProduct = (index, product) => {
        if (isViewMode) return;

        const newItems = [...form.items];
        newItems[index].product_id = product.ItemCode;
        newItems[index].product_code = product.ItemCode;
        newItems[index].description = product.ItemName;
        newItems[index].selectedProduct = product;

        const quantity = parseFloat(newItems[index].quantity) || 0;
        const unitPrice = parseFloat(newItems[index].unit_price) || 0;
        const subtotal = quantity * unitPrice;
        const discountPercent = parseFloat(newItems[index].discount_percent) || 0;
        const discount = subtotal * (discountPercent / 100);
        newItems[index].total = subtotal - discount;

        setForm(f => ({ ...f, items: newItems }));
    };

    const handleSelectGLAccount = (index, account) => {
        if (isViewMode) return;

        const newItems = [...form.items];
        newItems[index].gl_account_code = account.Code;
        newItems[index].gl_account_name = account.Name;
        newItems[index].selectedGLAccount = account;
        setForm(f => ({ ...f, items: newItems }));
    };

    const handleSelectBlanketAgreement = (index, agreement) => {
        if (isViewMode) return;

        const newItems = [...form.items];
        newItems[index].global_agreement_num = agreement.AgreementNo || agreement.DocNum;
        newItems[index].selectedBlanketAgreement = agreement;
        setForm(f => ({ ...f, items: newItems }));
    };

    const handleRemoveItem = (index) => {
        if (isViewMode) return;

        const newItems = form.items.filter((_, i) => i !== index);

        const newErrors = { ...errors };
        Object.keys(newErrors).forEach(key => {
            if (key.startsWith(`item_${index}_`)) {
                delete newErrors[key];
            }
        });

        const reindexedErrors = {};
        Object.keys(newErrors).forEach(key => {
            if (key.startsWith('item_')) {
                const match = key.match(/^item_(\d+)_(.+)$/);
                if (match) {
                    const itemIndex = parseInt(match[1]);
                    const field = match[2];
                    if (itemIndex > index) {
                        reindexedErrors[`item_${itemIndex - 1}_${field}`] = newErrors[key];
                    } else if (itemIndex < index) {
                        reindexedErrors[key] = newErrors[key];
                    }
                } else {
                    reindexedErrors[key] = newErrors[key];
                }
            } else {
                reindexedErrors[key] = newErrors[key];
            }
        });

        setErrors(reindexedErrors);
        setForm(f => ({ ...f, items: newItems }));
    };

    return (
        <div className="overflow-x-auto max-h-96">
            <table className="text-xs border-collapse" style={{ minWidth: '100%' }}>
                <thead className="bg-gray-50 border-b sticky top-0">
                    <tr>
                        <th className="px-1 py-1 text-center font-bold text-gray-700" style={{ minWidth: '40px', width: '40px' }}>#</th>
                        {form.type === 'articles' ? (
                            <>
                                <th className="uppercase px-1 text-[10px] py-1 text-center font-bold text-gray-700" style={{ minWidth: '120px', width: '120px' }}>Código de artículo</th>
                                <th className="uppercase px-1 text-[10px] py-1 text-center font-bold text-gray-700" style={{ minWidth: '120px', width: '120px' }}>Cuenta mayor</th>
                                <th className="uppercase px-1 text-[10px] py-1 text-center font-bold text-gray-700" style={{ minWidth: '200px', width: '200px' }}>Nombre cuenta mayor</th>
                                <th className="uppercase px-1 text-[10px] py-1 text-center font-bold text-gray-700" style={{ minWidth: '80px', width: '80px' }}>Cantidad</th>
                                <th className="uppercase px-1 text-[10px] py-1 text-center font-bold text-gray-700" style={{ minWidth: '80px', width: '80px' }}>Precio por unidad</th>
                                <th className="uppercase px-1 text-[10px] py-1 text-center font-bold text-gray-700" style={{ minWidth: '55px', width: '55px' }}>% descuento</th>
                                <th className="uppercase px-1 text-[10px] py-1 text-center font-bold text-gray-700" style={{ minWidth: '75px', width: '75px' }}>impuesto</th>
                                <th className="uppercase px-1 text-[10px] py-1 text-center font-bold text-gray-700" style={{ minWidth: '80px', width: '80px' }}>Total (ML)</th>
                                <th className="uppercase px-1 text-[10px] py-1 text-center font-bold text-gray-700" style={{ minWidth: '180px', width: '180px' }}>Número de acuerdo global</th>
                                <th className="uppercase px-1 text-[10px] py-1 text-center font-bold text-gray-700" style={{ minWidth: '50px', width: '50px' }}></th>
                            </>
                        ) : (
                            <>
                                <th className="uppercase px-1 text-[10px] py-1 text-center font-bold text-gray-700" style={{ minWidth: '200px', width: '200px' }}>Descripción</th>
                                <th className="uppercase px-1 text-[10px] py-1 text-center font-bold text-gray-700" style={{ minWidth: '120px', width: '120px' }}>Cuenta mayor</th>
                                <th className="uppercase px-1 text-[10px] py-1 text-center font-bold text-gray-700" style={{ minWidth: '200px', width: '200px' }}>Nombre cuenta mayor</th>
                                <th className="uppercase px-1 text-[10px] py-1 text-center font-bold text-gray-700" style={{ minWidth: '80px', width: '80px' }}>Precio por unidad</th>
                                <th className="uppercase px-1 text-[10px] py-1 text-center font-bold text-gray-700" style={{ minWidth: '75px', width: '75px' }}>Impuesto</th>
                                <th className="uppercase px-1 text-[10px] py-1 text-center font-bold text-gray-700" style={{ minWidth: '80px', width: '80px' }}>Total (ML)</th>
                                <th className="uppercase px-1 text-[10px] py-1 text-center font-bold text-gray-700" style={{ minWidth: '180px', width: '180px' }}>Número de acuerdo global</th>
                                <th className="uppercase px-1 text-[10px] py-1 text-center font-bold text-gray-700" style={{ minWidth: '50px', width: '50px' }}></th>
                            </>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {form.items.map((item, index) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                            <td className="px-1 py-0.5 text-center text-gray-600 font-mono" style={{ minWidth: '40px', width: '40px' }}>{item.line_num}</td>
                            
                            {form.type === 'articles' ? (
                                <ArticleRow
                                    item={item}
                                    index={index}
                                    form={form}
                                    errors={errors}
                                    isViewMode={isViewMode}
                                    taxCodeOptions={taxCodeOptions}
                                    onItemChange={handleItemChange}
                                    onSelectProduct={handleSelectProduct}
                                    onSelectGLAccount={handleSelectGLAccount}
                                    onSelectBlanketAgreement={handleSelectBlanketAgreement}
                                    onRemoveItem={handleRemoveItem}
                                />
                            ) : (
                                <ServiceRow 
                                    item={item}
                                    index={index}
                                    form={form}
                                    errors={errors}
                                    isViewMode={isViewMode}
                                    taxCodeOptions={taxCodeOptions}
                                    onItemChange={handleItemChange}
                                    onSelectGLAccount={handleSelectGLAccount}
                                    onSelectBlanketAgreement={handleSelectBlanketAgreement}
                                    onRemoveItem={handleRemoveItem}
                                />
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Componente para fila de artículos
const ArticleRow = ({ item, index, form, errors, isViewMode, taxCodeOptions, onItemChange, onSelectProduct, onSelectGLAccount, onSelectBlanketAgreement, onRemoveItem }) => {
    return (
        <>
            <td className="px-1 py-0.5 text-center" style={{ minWidth: '120px', width: '120px' }}>
                <SearchInputWithModal
                    title="Listado de Artículos"
                    label=""
                    placeholder="Seleccione artículo"
                    value={item.product_code || ""}
                    onChange={(e) => onItemChange(index, "product_code", e.target.value)}
                    onSelect={(product) => onSelectProduct(index, product)}
                    searchFunction={getProducts}
                    columns={[
                        { key: "ItemCode", label: "Código" },
                        { key: "ItemName", label: "Nombre" },
                        { key: "BuyUnitMsr", label: "U. Compra" },
                    ]}
                    renderRow={(product) => (
                        <>
                            <td className="px-3 py-2 text-xs text-left">{product.ItemCode}</td>
                            <td className="px-3 py-2 text-xs text-left">{product.ItemName}</td>
                            <td className="px-3 py-2 text-xs text-left">{product.BuyUnitMsr || "-"}</td>
                        </>
                    )}
                    codeField="ItemCode"
                    disabled={isViewMode}
                    selectedItem={item.selectedProduct}
                    className={`px-1 py-0.5 text-xs border rounded focus:ring-2 text-right ${errors[`item_${index}_product`] ? 'border-red-500' : 'border-gray-300'}`}
                    showButton={!isViewMode}
                    readonly
                />
            </td>

            <td className="px-1 py-0.5 text-center" style={{ minWidth: '120px', width: '120px' }}>
                <SearchInputWithModal
                    title="Listado de Cuentas"
                    label=""
                    placeholder="Cuenta..."
                    value={item.gl_account_code || ""}
                    onChange={(e) => onItemChange(index, "gl_account_code", e.target.value)}
                    onSelect={(account) => onSelectGLAccount(index, account)}
                    searchFunction={getGLAccounts}
                    columns={[
                        { key: "Code", label: "Código" },
                        { key: "Name", label: "Cuenta" },
                        { key: "Balance", label: "Saldo de Cuenta" },
                    ]}
                    renderRow={(account) => (
                        <>
                            <td className="px-3 py-2 text-xs text-left">{account.Code}</td>
                            <td className="px-3 py-2 text-xs text-left">{account.Name}</td>
                            <td className="px-3 py-2 text-xs text-left">{account.Balance}</td>
                        </>
                    )}
                    codeField="Code"
                    disabled={isViewMode}
                    selectedItem={item.selectedGLAccount}
                    className={`px-1 py-0.5 text-xs border rounded focus:ring-2 text-right ${errors[`item_${index}_gl_account`] ? 'border-red-500' : 'border-gray-300'}`}
                    showButton={!isViewMode}
                    readonly
                />
            </td>

            <td className="px-1 py-0.5 text-center" style={{ minWidth: '200px', width: '200px' }}>
                <input
                    type="text"
                    disabled
                    className="px-1 py-0.5 text-xs border border-gray-300 rounded bg-gray-50"
                    style={{ width: '190px' }}
                    value={item.gl_account_name || ""}
                    placeholder="Se autocompleta"
                />
            </td>

            <td className="px-1 py-0.5 text-center" style={{ minWidth: '80px', width: '80px' }}>
                <input
                    type="number"
                    min="0.000001"
                    step="0.01"
                    disabled={isViewMode}
                    className={`px-1 py-0.5 text-xs border rounded focus:ring-2 text-right ${errors[`item_${index}_quantity`] ? 'border-red-500' : 'border-gray-300'}`}
                    style={{ width: '80px' }}
                    value={item.quantity}
                    onChange={(e) => onItemChange(index, "quantity", e.target.value)}
                />
            </td>

            <td className="px-1 py-0.5 text-center" style={{ minWidth: '80px', width: '80px' }}>
                <input
                    type="number"
                    min="1"
                    step="0.01"
                    disabled={isViewMode}
                    className={`px-1 py-0.5 text-xs border rounded focus:ring-2 text-right ${errors[`item_${index}_unit_price`] ? 'border-red-500' : 'border-gray-300'}`}
                    style={{ width: '90px' }}
                    value={item.unit_price}
                    onChange={(e) => onItemChange(index, "unit_price", e.target.value)}
                />
            </td>

            <td className="px-1 py-0.5 text-center" style={{ minWidth: '55px', width: '55px' }}>
                <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    disabled={isViewMode}
                    className="px-1 py-0.5 text-xs border border-gray-300 rounded focus:ring-2 text-right"
                    style={{ width: '55px' }}
                    value={item.discount_percent}
                    onChange={(e) => onItemChange(index, "discount_percent", e.target.value)}
                />
            </td>

            <td className="px-1 py-0.5 text-center" style={{ minWidth: '75px', width: '75px' }}>
                <select
                    disabled={isViewMode}
                    className="px-1 py-0.5 text-xs border border-gray-300 rounded focus:ring-2"
                    style={{ width: '80px' }}
                    value={item.tax_code}
                    onChange={(e) => onItemChange(index, "tax_code", e.target.value)}
                >
                    {taxCodeOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.value}</option>
                    ))}
                </select>
            </td>

            <td className="px-1 py-0.5 text-center font-medium text-gray-900 text-[12px]" style={{ minWidth: '80px', width: '80px' }}>
                {form.currency } {Number(item.total || 0).toLocaleString('es-CL', { minimumFractionDigits: 2 })}
            </td>

            <td className="px-1 py-0.5 text-center" style={{ minWidth: '180px', width: '180px' }}>
                <SearchInputWithModal
                    title="Listado de Acuerdos Globales"
                    label=""
                    placeholder="N° de acuerdo"
                    value={item.global_agreement_num || ""}
                    onChange={(e) => onItemChange(index, "global_agreement_num", e.target.value)}
                    onSelect={(agreement) => onSelectBlanketAgreement(index, agreement)}
                    searchFunction={getBlanketAgreements}
                    columns={[
                        { key: "AgreementNo", label: "Número" },
                        { key: "BPName", label: "Proveedor" },
                        { key: "StartDate", label: "Fecha Inicio" },
                    ]}
                    renderRow={(agreement) => (
                        <>
                            <td className="px-3 py-2 text-xs text-left">{agreement.AgreementNo || agreement.DocNum}</td>
                            <td className="px-3 py-2 text-xs text-left">{agreement.BPName || "-"}</td>
                            <td className="px-3 py-2 text-xs text-left">{agreement.StartDate || "-"}</td>
                        </>
                    )}
                    codeField="AgreementNo"
                    disabled={isViewMode}
                    selectedItem={item.selectedBlanketAgreement}
                    className="px-1 py-0.5 text-xs border border-gray-300 rounded focus:ring-2 text-right"
                    showButton={!isViewMode}
                    readonly
                />
            </td>

            <td className="px-1 py-0.5 text-center" style={{ minWidth: '50px', width: '50px' }}>
                {!isViewMode && (
                    <button
                        type="button"
                        onClick={() => onRemoveItem(index)}
                        className="text-red-600 hover:text-red-800 p-0.5"
                        title="Eliminar"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                )}
            </td>
        </>
    );
};

// Componente para fila de servicios
const ServiceRow = ({ item, index, form, errors, isViewMode, taxCodeOptions, onItemChange, onSelectGLAccount, onSelectBlanketAgreement, onRemoveItem }) => {
    return (
        <>
            <td className="px-1 py-0.5 text-center" style={{ minWidth: '200px', width: '200px' }}>
                <input
                    type="text"
                    disabled={isViewMode}
                    className={`px-1 py-0.5 text-xs border rounded focus:ring-2 ${errors[`item_${index}_description`] ? 'border-red-500' : 'border-gray-300'}`}
                    style={{ width: '190px' }}
                    value={item.description}
                    onChange={(e) => onItemChange(index, "description", e.target.value)}
                    placeholder="Descripción del servicio"
                />
            </td>

            <td className="px-1 py-0.5 text-center" style={{ minWidth: '120px', width: '120px' }}>
                <SearchInputWithModal
                    title="Listado de Cuentas"
                    label=""
                    placeholder="Cuenta..."
                    value={item.gl_account_code || ""}
                    onChange={(e) => onItemChange(index, "gl_account_code", e.target.value)}
                    onSelect={(account) => onSelectGLAccount(index, account)}
                    searchFunction={getGLAccounts}
                    columns={[
                        { key: "Code", label: "Código" },
                        { key: "Name", label: "Cuenta" },
                        { key: "Balance", label: "Saldo de Cuenta" },
                    ]}
                    renderRow={(account) => (
                        <>
                            <td className="px-3 py-2 text-xs text-left">{account.Code}</td>
                            <td className="px-3 py-2 text-xs text-left">{account.Name}</td>
                            <td className="px-3 py-2 text-xs text-left">{account.Balance}</td>
                        </>
                    )}
                    codeField="Code"
                    disabled={isViewMode}
                    selectedItem={item.selectedGLAccount}
                    className={`px-1 py-0.5 text-xs border rounded focus:ring-2 text-right ${errors[`item_${index}_gl_account`] ? 'border-red-500' : 'border-gray-300'}`}
                    showButton={!isViewMode}
                    readonly
                />
            </td>

            <td className="px-1 py-0.5 text-center" style={{ minWidth: '200px', width: '200px' }}>
                <input
                    type="text"
                    disabled
                    className="px-1 py-0.5 text-xs border border-gray-300 rounded bg-gray-50"
                    style={{ width: '190px' }}
                    value={item.gl_account_name || ""}
                    placeholder="Se autocompleta"
                />
            </td>

            <td className="px-1 py-0.5 text-center" style={{ minWidth: '80px', width: '80px' }}>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    disabled={isViewMode}
                    className={`px-1 py-0.5 text-xs border rounded focus:ring-2 text-right ${errors[`item_${index}_unit_price`] ? 'border-red-500' : 'border-gray-300'}`}
                    style={{ width: '90px' }}
                    value={item.unit_price}
                    onChange={(e) => onItemChange(index, "unit_price", e.target.value)}
                />
            </td>

            <td className="px-1 py-0.5 text-center" style={{ minWidth: '75px', width: '75px' }}>
                <select
                    disabled={isViewMode}
                    className="px-1 py-0.5 text-xs border border-gray-300 rounded focus:ring-2"
                    style={{ width: '80px' }}
                    value={item.tax_code}
                    onChange={(e) => onItemChange(index, "tax_code", e.target.value)}
                >
                    {taxCodeOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.value}</option>
                    ))}
                </select>
            </td>

            <td className="px-1 py-0.5 text-center font-medium text-gray-900 text-[12px]" style={{ minWidth: '80px', width: '80px' }}>
                {form.currency} {Number(item.total || 0).toLocaleString('es-CL', { minimumFractionDigits: 2 })}
            </td>

            <td className="px-1 py-0.5 text-center" style={{ minWidth: '180px', width: '180px' }}>
                <SearchInputWithModal
                    label=""
                    title="Listado de Acuerdos Globales"
                    placeholder="N° de acuerdo"
                    value={item.global_agreement_num || ""}
                    onChange={(e) => onItemChange(index, "global_agreement_num", e.target.value)}
                    onSelect={(agreement) => onSelectBlanketAgreement(index, agreement)}
                    searchFunction={getBlanketAgreements}
                    columns={[
                        { key: "AgreementNo", label: "Número" },
                        { key: "BPName", label: "Proveedor" },
                        { key: "StartDate", label: "Fecha Inicio" },
                    ]}
                    renderRow={(agreement) => (
                        <>
                            <td className="px-3 py-2 text-xs text-left">{agreement.AgreementNo || agreement.DocNum}</td>
                            <td className="px-3 py-2 text-xs text-left">{agreement.BPName || "-"}</td>
                            <td className="px-3 py-2 text-xs text-left">{agreement.StartDate || "-"}</td>
                        </>
                    )}
                    codeField="AgreementNo"
                    disabled={isViewMode}
                    selectedItem={item.selectedBlanketAgreement}
                    className="px-1 py-0.5 text-xs border border-gray-300 rounded focus:ring-2 text-right"
                    showButton={!isViewMode}
                    readonly
                />
            </td>

            <td className="px-1 py-0.5 text-center" style={{ minWidth: '50px', width: '50px' }}>
                {!isViewMode && (
                    <button
                        type="button"
                        onClick={() => onRemoveItem(index)}
                        className="text-red-600 hover:text-red-800 p-0.5"
                        title="Eliminar"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                )}
            </td>
        </>
    );
};

export default DocumentItemsTable;