import React, { useEffect, useState } from "react";
import { Select } from "../../../components/ui/Select";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Loader2, SaveIcon, X } from "lucide-react";
import { createCustomer, getCustomerById, updateCustomer } from "../../../services/customerService";
import { handleSnackbar } from "../../../utils/messageHelpers";
import { validateField } from "../../../utils/validators";
import Loading from "../../../components/ui/Loading";
// Importar los componentes reutilizables;

const CustomerForm = ({ mode, register, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        id: null,
        rut: "",
        first_name: "",
        second_name: "",
        last_name: "",
        second_last_name: "",
        email: "",
        mobile: "",
        status: true,
    });

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    // 🔹 Validar un campo individual usando el validador unificado
    const validateSingleField = (field, value) => {
        let validationType = "text";
        let isRequired = false;
        let customMessage = "Campo requerido";

        // Definir campos requeridos
        const requiredFields = ["first_name", "last_name", "rut", "email", "relationship"];
        isRequired = requiredFields.includes(field);

        // Definir el tipo de validación según el campo
        switch (field) {
            case "first_name":
            case "last_name":
                validationType = "names";
                customMessage = "El nombre debe tener al menos 3 caracteres";
                break;
            case "second_name":
            case "second_last_name":
                validationType = "names";
                customMessage = "El nombre debe tener al menos 3 caracteres";
                isRequired = false;
                break;
            case "email":
                validationType = "email";
                customMessage = "Ingrese un email válido";
                break;
            case "mobile":
                validationType = "mobile";
                customMessage = "Ingrese un número celular válido";
                break;
            case "rut":
                validationType = "rut";
                customMessage = "RUT inválido";
                break;
            case "status":
                validationType = "status";
                customMessage = "Seleccione un estado válido";
                isRequired = mode === "edit";
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

    // 🔹 Validar todos los campos
    const validateAll = () => {
        const newErrors = {};

        // Definir campos requeridos
        const requiredFields = ["first_name", "last_name", "rut", "email"];

        // 1. Validar campos requeridos (siempre deben tener valor)
        requiredFields.forEach(field => {
            const value = form[field];
            const validation = validateSingleField(field, value || "");

            if (!validation.isValid) {
                newErrors[field] = validation.message;
            }
        });

        // 2. Validar campos opcionales SOLO si tienen contenido
        const optionalFields = ["second_name", "second_last_name", "mobile"];

        optionalFields.forEach(field => {
            const value = form[field];

            // Solo validar si el campo tiene contenido
            if (value && value.toString().trim() !== "") {
                const validation = validateSingleField(field, value);

                if (!validation.isValid) {
                    newErrors[field] = validation.message;
                }
            }
        });

        // 3. Validar estado solo en modo edición
        if (mode === "edit") {
            const validation = validateSingleField("status", form.status);
            if (!validation.isValid) {
                newErrors.status = validation.message;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 🔹 Manejar cambios en campos con validación y limpieza
    const handleChange = (field, value) => {
        const validation = validateSingleField(field, value);

        // Usar el valor limpio del validador si está disponible
        const cleanValue = validation.cleanValue;

        setForm(f => ({ ...f, [field]: cleanValue }));

        // Actualizar errores
        setErrors(prev => ({
            ...prev,
            [field]: validation.isValid ? null : validation.message
        }));
    };


    // sincronizar al abrir modal
    useEffect(() => {
        const loadData = async () => {
            if (mode === "edit" && register) {
                setLoading(true);
                try {
                    const response = await getCustomerById(register.id);
                    if (response.success) {
                        const data = response.data;
                        setForm({
                            id: data.id,
                            rut: data.rut || "",
                            first_name: data.first_name || "",
                            second_name: data.second_name || "",
                            last_name: data.last_name || "",
                            second_last_name: data.second_last_name || "",
                            email: data.email || "",
                            mobile: data.mobile || "",
                            status: data.status ? 1 : 0,
                        });
                    } else {
                        handleSnackbar(response.message, "error");
                        onClose(false);
                    }
                } catch (error) {
                    console.log(error)
                    handleSnackbar("Error al obtener registro", "error");
                    onClose(false);
                } finally {
                    setTimeout(() => {
                        setLoading(false);
                    }, 500);
                }
            } else if (mode === "new") {
                setForm({
                    id: Math.random().toString(36).substring(2, 10),
                    rut: "",
                    first_name: "",
                    second_name: "",
                    last_name: "",
                    second_last_name: "",
                    email: "",
                    mobile: "",
                    status: true,
                });
            }
        };
        loadData();
    }, [mode, register, onClose]);

    const submit = async () => {
        if (!validateAll()) {
            handleSnackbar("Por favor, corrija los errores en el formulario", "error");
            return;
        }

        setSaving(true);
        try {
            let response;
            if (mode === "edit") {
                response = await updateCustomer(form.id, form);
            } else {
                response = await createCustomer(form);
            }
            handleSnackbar(response.message, response.success ? "success" : "error");
            if (response.success) {
                onClose(true);
            }
        } catch (error) {
            const errorMsg = mode === "edit"
                ? "Error al actualizar registro: " + error.message
                : "Error al crear registro: " + error.message;
            handleSnackbar(errorMsg, "error");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        onClose(false);
    };

    return (
        <>
            {loading ? (
                <Loading text="Cargando datos..." />
            ) : (
                <>
                    <div className="max-h-[50vh] overflow-y-auto  p-2">
                        {/* Información Personal */}
                        <div className="col-span-1 md:col-span-2">
                            <h4 className="font-semibold   mb-3 border-b pb-2">Información Personal</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">

                            <div>
                                <Input
                                    label="RUT"
                                    placeholder="12.345.678-5"
                                    value={form.rut}
                                    onChange={(e) => handleChange("rut", e.target.value)}
                                    error={errors.rut}
                                    maxLength={12}
                                    required
                                />
                            </div>
                            {/* Componente SelectRelationships */}

                            <div>
                                <Input
                                    label="Primer Nombre"
                                    value={form.first_name}
                                    onChange={(e) => handleChange("first_name", e.target.value)}
                                    placeholder="Ej: Juan"
                                    error={errors.first_name}
                                    maxLength={254}
                                    showCounter={true}
                                    required
                                />
                            </div>

                            <div>
                                <Input
                                    label="Segundo Nombre"
                                    value={form.second_name}
                                    onChange={(e) => handleChange("second_name", e.target.value)}
                                    placeholder="Ej: Carlos"
                                    error={errors.second_name}
                                    maxLength={254}
                                    showCounter={true}
                                />
                            </div>

                            <div>
                                <Input
                                    label="Apellido Paterno"
                                    value={form.last_name}
                                    onChange={(e) => handleChange("last_name", e.target.value)}
                                    placeholder="Ej: Pérez"
                                    error={errors.last_name}
                                    maxLength={254}
                                    showCounter={true}
                                    required
                                />
                            </div>

                            <div>
                                <Input
                                    label="Apellido Materno"
                                    value={form.second_last_name}
                                    onChange={(e) => handleChange("second_last_name", e.target.value)}
                                    placeholder="Ej: González"
                                    error={errors.second_last_name}
                                    maxLength={254}
                                    showCounter={true}
                                />
                            </div>


                            {/* Información de Contacto */}
                            <div className="col-span-1 md:col-span-2 lg:col-span-3">
                                <h4 className="font-semibold   mb-3 border-b pb-2 mt-4">Información de Contacto</h4>
                            </div>

                            <div>
                                <Input
                                    label="Correo Electrónico"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => handleChange("email", e.target.value)}
                                    placeholder="correo@ejemplo.com"
                                    error={errors.email}
                                    maxLength={254}
                                    required
                                />
                            </div>

                            <div>
                                <Input
                                    label="Teléfono Móvil"
                                    value={form.mobile}
                                    onChange={(e) => handleChange("mobile", e.target.value)}
                                    placeholder="+56912345678"
                                    error={errors.mobile}
                                    maxLength={12}
                                    helper="Formato: +56912345678"
                                    type="tel"
                                />
                            </div>
                            {mode === 'edit' && (
                                <>
                                    {/* Información del Sistema */}
                                    <div className="col-span-1 md:col-span-2 lg:col-span-3">
                                        <h4 className="font-semibold   mb-3 border-b pb-2 mt-4">Información del Sistema</h4>
                                    </div>
                                    <div>
                                        <label className="text-sm">Estado *</label>
                                        <Select
                                            value={form.status}
                                            onChange={(e) => handleChange("status", e.target.value)}
                                            error={errors.status}
                                        >
                                            <option value={1}>Activo</option>
                                            <option value={0}>Inactivo</option>
                                        </Select>
                                    </div>
                                </>
                            )}
                        </div>

                    </div>

                    {/* Botones */}
                    <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            icon={X}
                            disabled={saving}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={submit}
                            icon={saving ? Loader2 : SaveIcon}
                            disabled={saving}
                            loading={saving}
                        >
                            {saving ? "Guardando…" : mode === "edit" ? "Actualizar" : "Guardar"}
                        </Button>
                    </div>
                </>
            )}
        </>
    );
};

export default CustomerForm;