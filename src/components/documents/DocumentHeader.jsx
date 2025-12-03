import React, { useState } from "react";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import SearchInputWithModal from "../common/SearchInputWithModal";
import { getBusinessPartners } from "../../services/SAP/businessPartnerService";
import { getClients } from "../../services/SAP/clientService";

const DocumentHeader = ({ form, errors, isViewMode, onFormChange, setForm, type="PROVIDER" }) => {
    const currencyOptions = ["CLP", "USD", "EUR", "CNY", "UF"];
    const [contactPersons, setContactPersons] = useState([]);

    const handleSelectSupplier = (supplier) => {
        if (isViewMode) return;

        // Extraer las personas de contacto del proveedor seleccionado
        const contacts = supplier.Contact || [];
        setContactPersons(contacts);

        setForm(f => ({
            ...f,
            supplier_id: supplier.CardCode,
            supplier_code: supplier.CardCode,
            supplier_name: supplier.CardName,
            currency: supplier.Currency || "CLP",
            // Resetear persona de contacto al cambiar proveedor
            contact_person: "",
            contact_person_id: null,
            selectedContactPerson: null
        }));
    };

    const handleSelectContactPerson = (e) => {
        if (isViewMode) return;
        const selectedName = e.target.value;
        const selectedContact = contactPersons.find(c => c.Name === selectedName);

        setForm(f => ({
            ...f,
            contact_person: selectedName,
            contact_person_id: selectedContact?.Name || null,
            selectedContactPerson: selectedContact
        }));
    };

    return (
        <div className="p-2 bg-gray-50 border-b">
            <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="grid md:grid-cols-6 gap-2 text-xs">
                    {/* Proveedor */}
                    <div className="col-span-6 lg:col-span-2">
                        <SearchInputWithModal
                            label={type == 'PROVIDER' ? "Proveedores" : "Clientes"}
                            title={type == 'PROVIDER' ? "Listado de Proveedores" : "Listado de Clientes"}
                            placeholder="Seleccione proveedor"
                            value={form.supplier_code}
                            onChange={(e) => onFormChange("supplier_code", e.target.value)}
                            onSelect={handleSelectSupplier}
                            searchFunction={type == 'PROVIDER' ? getBusinessPartners : getClients}
                            columns={[
                                { key: "CardCode", label: "Código" },
                                { key: "CardName", label: type == 'PROVIDER' ? "Nombre Proveedor" : "Nombre Cliente" },
                            ]}
                            renderRow={(partner) => (
                                <>
                                    <td className="px-3 py-1 text-[12px] font-semibold">{partner.CardCode}</td>
                                    <td className="px-3 py-1 text-[12px]">{partner.CardName}</td>
                                </>
                            )}
                            displayField="CardName"
                            codeField="CardCode"
                            className={errors.supplier_id ? 'border-red-500' : ''}
                            required
                            disabled={isViewMode}
                            showButton={!isViewMode}
                            readonly
                            marginButton="mt-[22px]"
                        />
                    </div>

                    {/* Nombre Proveedor */}
                    <div className="col-span-6 lg:col-span-4">
                        <Input
                            height="h-6"
                            label="Nombre Proveedor"
                            value={form.supplier_name}
                            disabled={true}
                            placeholder="Se autocompleta al seleccionar"
                        />
                    </div>

                    {/* Persona de contacto */}
                    <div className="col-span-6 lg:col-span-2">
                        <Select
                            label="Persona de contacto"
                            value={form.contact_person}
                            onChange={handleSelectContactPerson}
                            disabled={isViewMode || !form.supplier_id || contactPersons.length === 0}
                            height="h-6"
                        >
                            <option value="">Seleccione persona</option>
                            {contactPersons.map((contact, index) => (
                                <option key={index} value={contact.Name}>
                                    {contact.Name} {contact.Position ? `- ${contact.Position}` : ''}
                                </option>
                            ))}
                        </Select>
                    </div>

                    {/* No.Ref.del acreedor */}
                    <div className="col-span-6 lg:col-span-2">
                        <Input
                            label="No.Ref.del acreedor"
                            value={form.supplier_ref_num}
                            onChange={(e) => onFormChange("supplier_ref_num", e.target.value)}
                            placeholder="No.Ref.del acreedor"
                            className={errors.supplier_ref_num ? 'border-red-500' : ''}
                            disabled={isViewMode}
                            height="h-6"
                        />
                    </div>

                    {/* Tipo divisa */}
                    <div className="col-span-6 lg:col-span-2">
                        <Select 
                            value={form.currency}
                            label={'Tipo divisa'}
                            required
                            disabled={isViewMode}
                            onChange={(e) => onFormChange("currency", e.target.value)} 
                            height="h-6"
                        >
                            {currencyOptions.map(currency => (
                                <option key={currency} value={currency}>{currency}</option>
                            ))}
                        </Select>
                    </div>
                </div>

                <div className="grid md:grid-cols-6 gap-2 text-xs">
                    <div className="col-span-6 lg:col-span-2"></div>

                    {/* N° Primario */}
                    <div className="col-span-6 -mt-2 lg:mt-0 lg:col-span-2">
                        <Input
                            label="N° Primario"
                            value={form.doc_num}
                            disabled
                            placeholder="automático"
                            height="h-6"
                        />
                    </div>

                    {/* Estado */}
                    <div className="col-span-6 lg:col-span-2">
                        <Select
                            label={'Estado'}
                            value={form.status} 
                            onChange={(e) => onFormChange("status", e.target.value)}
                            disabled={isViewMode}
                            className="text-xs py-0.5" 
                            height="h-6"
                        >
                            <option value="open">Abierto</option>
                            <option value="closed">Cerrado</option>
                        </Select>
                    </div>

                    {/* Fecha contabilización */}
                    <div className="col-span-6 lg:col-span-2">
                        <Input
                            label="Fecha contabilización"
                            type="date"
                            value={form.posting_date}
                            onChange={(e) => onFormChange("posting_date", e.target.value)}
                            className={errors.posting_date ? 'border-red-500' : ''}
                            disabled={isViewMode}
                            height="h-6"
                            required
                        />
                    </div>

                    {/* Fecha entrega */}
                    <div className="col-span-6 lg:col-span-2">
                        <Input
                            label="Fecha entrega"
                            type="date"
                            value={form.delivery_date}
                            onChange={(e) => onFormChange("delivery_date", e.target.value)}
                            className={errors.delivery_date ? 'border-red-500' : ''}
                            disabled={isViewMode}
                            height="h-6"
                            required
                        />
                    </div>

                    {/* Fecha doc */}
                    <div className="col-span-6 lg:col-span-2">
                        <Input
                            label="Fecha doc"
                            type="date"
                            value={form.doc_date}
                            onChange={(e) => onFormChange("doc_date", e.target.value)}
                            className={errors.doc_date ? 'border-red-500' : ''}
                            disabled={isViewMode}
                            height="h-6"
                            required
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentHeader;