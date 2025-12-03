import React from "react";
import { Input } from "../ui/Input";
import SearchInputWithModal from "../common/SearchInputWithModal";
import { getEmployees } from "../../services/SAP/employeeService";

const DocumentFooter = ({ form, totals, isViewMode, onFormChange, setForm }) => {
    const handleSelectOwner = (employee) => {
        if (isViewMode) return;
        setForm(f => ({
            ...f,
            owner: employee.LastName + ' ' + employee.FirstName || employee.EmployeeName,
            owner_id: employee.EmployeeID,
            selectedOwner: employee
        }));
    };

    const handleSelectBuyer = (employee) => {
        if (isViewMode) return;
        setForm(f => ({
            ...f,
            buyer: employee.LastName + ' ' + employee.FirstName || employee.EmployeeName,
            buyer_id: employee.EmployeeID,
            selectedBuyer: employee
        }));
    };

    const { itemsSubtotal, globalDiscount, subtotalAfterDiscount, additionalExpenses, taxBase, tax, total } = totals;

    return (
        <div className="grid md:grid-cols-12 gap-3 p-3 border-t bg-gray-50">
            {/* Columna izquierda: Encargado, Propietario, Comentarios */}
            <div className="md:col-span-8 lg:col-span-9 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                    <SearchInputWithModal
                        title="Listado de Empleados del departamento de ventas"
                        label="Encargado de compras"
                        placeholder="Seleccione encargado"
                        value={form.buyer}
                        onChange={(e) => onFormChange("buyer", e.target.value)}
                        onSelect={handleSelectBuyer}
                        searchFunction={getEmployees}
                        columns={[
                            { key: "LastName", label: "Apellido" },
                            { key: "FirstName", label: "Nombre" },
                            { key: "EmployeeID", label: "Código de empleado" },
                        ]}
                        renderRow={(employee) => (
                            <>
                                <td className="px-3 py-2 text-xs text-left">{employee.LastName}</td>
                                <td className="px-3 py-2 text-xs text-left">{employee.FirstName}</td>
                                <td className="px-3 py-2 text-xs text-left">{employee.EmployeeID || "-"}</td>
                            </>
                        )}
                        codeField="EmployeeID"
                        displayField="LastName"
                        disabled={isViewMode}
                        selectedItem={form.selectedBuyer}
                        height="h-6"
                        marginButton="mt-[22px]"
                        showButton={!isViewMode}
                        readonly
                    />
                    <SearchInputWithModal
                        label="Propietario"
                        title="Listado de Empleados"
                        placeholder="Seleccione propietario"
                        value={form.owner}
                        onChange={(e) => onFormChange("owner", e.target.value)}
                        onSelect={handleSelectOwner}
                        searchFunction={getEmployees}
                        columns={[
                            { key: "LastName", label: "Apellido" },
                            { key: "FirstName", label: "Nombre" },
                            { key: "EmployeeID", label: "Código de empleado" },
                        ]}
                        renderRow={(employee) => (
                            <>
                                <td className="px-3 py-2 text-xs text-left">{employee.LastName}</td>
                                <td className="px-3 py-2 text-xs text-left">{employee.FirstName}</td>
                                <td className="px-3 py-2 text-xs text-left">{employee.EmployeeID || "-"}</td>
                            </>
                        )}
                        codeField="EmployeeID"
                        displayField="LastName"
                        disabled={isViewMode}
                        selectedItem={form.selectedOwner}
                        height="h-6"
                        marginButton="mt-[22px]"
                        showButton={!isViewMode}
                        readonly
                    />
                </div>
                <div>
                    <label className="text-[10px] font-semibold text-gray-700 block mb-0.5">Comentarios</label>
                    <textarea
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 min-h-[100px]"
                        value={form.comments}
                        onChange={(e) => setForm(f => ({ ...f, comments: e.target.value }))}
                        placeholder="Comentarios..."
                        maxLength={500}
                        disabled={isViewMode}
                    />
                </div>
            </div>

            {/* Columna derecha: Totales */}
            <div className="md:col-span-4 lg:col-span-3">
                <div className="bg-white border rounded p-3">
                    <div className="space-y-2 text-xs">
                        <div className="grid grid-cols-12 gap-2">
                            <div className="col-span-6">
                                <Input
                                    label="Descuento %"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={form.discount_percent}
                                    onChange={(e) => onFormChange("discount_percent", e.target.value)}
                                    disabled={isViewMode}
                                    height={'h-6'}
                                />
                            </div>
                            <div className="col-span-6">
                                <Input
                                    label="Gastos adic %"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={form.additional_expenses_percent}
                                    onChange={(e) => onFormChange("additional_expenses_percent", e.target.value)}
                                    disabled={isViewMode}
                                    height={'h-6'}
                                />
                            </div>
                            <div className="col-span-6"></div>
                            <div className="col-span-6">
                                <div className="flex items-center gap-2 py-1 justify-end">
                                    <input
                                        type="checkbox"
                                        id="rounding"
                                        checked={form.rounding}
                                        onChange={(e) => setForm(f => ({ ...f, rounding: e.target.checked }))}
                                        disabled={isViewMode}
                                        className="w-3 h-3"
                                    />
                                    <label htmlFor="rounding" className="text-xs text-gray-700">
                                        Redondeado
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="border-t pt-2 space-y-1">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total antes descuento:</span>
                                <span className="font-medium">{form.currency} {Number(itemsSubtotal).toLocaleString('es-CL', { minimumFractionDigits: 2 })}</span>
                            </div>
                            {form.discount_percent > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Descuento:</span>
                                    <span className="text-red-600">- {Number(globalDiscount).toLocaleString('es-CL', { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            {form.additional_expenses_percent > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Gastos adic:</span>
                                    <span>+ {Number(additionalExpenses).toLocaleString('es-CL', { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-600">Impuesto:</span>
                                <span className="font-medium">{Number(tax).toLocaleString('es-CL', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between border-t-2 border-gray-300 pt-2 font-bold text-sm">
                                <span>Total pago vencido:</span>
                                <span className=" ">{form.currency} {Number(total).toLocaleString('es-CL', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentFooter;