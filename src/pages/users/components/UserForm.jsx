import React, { useEffect, useState } from "react";
import { Select } from "../../../components/ui/Select";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Loader2, SaveIcon, X } from "lucide-react";
import { getProfiles } from "../../../services/profileService";
import { createUser, getUserById, updateUser } from "../../../services/userService";
import { handleSnackbar } from "../../../utils/messageHelpers";
import { validateField } from "../../../utils/validators";
import Loading from "../../../components/ui/Loading";
import { useAuth } from "../../../context/auth";

const UserForm = ({ mode, register, onClose }) => {
    const { session } = useAuth();
    const isRoot = session?.user?.role === 'root';

    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        id: Math.random().toString(36).substring(2, 10),
        name: "",
        rut: "",
        email: "",
        profile: "",
        status: true,
    });

    const [registers, setRegisters] = useState([]);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    // 🔹 Validar un campo individual usando el validador unificado
    const validateSingleField = (field, value) => {
        let validationType = "text";
        let isRequired = false;
        let customMessage = "Campo requerido";

        // Definir campos requeridos
        const requiredFields = ["name", "rut", "email", "profile"];
        isRequired = requiredFields.includes(field);

        // Definir el tipo de validación según el campo
        switch (field) {
            case "name":
                validationType = "names";
                customMessage = "El nombre debe tener al menos 3 caracteres";
                break;
            case "rut":
                validationType = "rut";
                customMessage = "RUT inválido";
                break;
            case "email":
                validationType = "email";
                customMessage = "Ingrese un email válido";
                break;
            case "profile":
                validationType = "select";
                customMessage = "Debe seleccionar un perfil";
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
        const requiredFields = ["name", "rut", "email", "profile"];

        // 1. Validar campos requeridos (siempre deben tener valor)
        requiredFields.forEach(field => {
            const value = form[field];
            const validation = validateSingleField(field, value || "");

            if (!validation.isValid) {
                newErrors[field] = validation.message;
            }
        });

        // 2. Validar estado solo en modo edición
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

    // Obtener lista de perfiles
    const fetchProfiles = async () => {
        try {
            const response = await getProfiles();
            if (response.success) {
                setRegisters(response.data || []);
            }
        } catch (error) {
            console.error("Error al obtener los registros:", error);
        }
    };

    // sincronizar al abrir modal
    useEffect(() => {
        const loadData = async () => {
            fetchProfiles();
            if (mode === "edit" && register) {
                setLoading(true);
                try {
                    const response = await getUserById(register.id);
                    if (response.success) {
                        setForm({
                            id: response.data.id,
                            name: response.data.name,
                            rut: response.data.rut,
                            email: response.data.email,
                            profile: response.data.role,
                            status: response.data.status ? 1 : 0,
                        });
                    } else {
                        handleSnackbar(response.message, "error");
                        onClose(false);
                    }
                } catch (error) {
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
                    name: "",
                    rut: "",
                    email: "",
                    profile: "",
                    status: true,
                });
            }
        };
        loadData();
    }, [mode, register, onClose]);

    const submit = async () => {
        if (!validateAll()) return;

        setSaving(true);

        try {
            let response;
            if (mode === "edit") {
                response = await updateUser(form.id, form);
            } else {
                response = await createUser(form);
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <div>
                            <Input
                                label="Nombre Completo"
                                value={form.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                placeholder="Ingrese nombre completo..."
                                error={errors.name}
                                maxLength={254}
                                showCounter={false}
                                required
                            />
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
                            <Select
                                label={'Perfil'}
                                required
                                height="h-37 py-2"
                                value={form.profile}
                                onChange={(e) => handleChange("profile", e.target.value)}
                                error={errors.profile}
                            >
                                <option value="">Seleccione un perfil...</option>
                                {registers.map((profile) => (
                                    <option key={profile.id} value={profile.code}>
                                        {profile.profile}
                                    </option>
                                ))}
                            </Select>
                        </div>



                        {mode === 'edit' && (
                            <div>
                                <label className="block text-xs font-bold  /70 uppercase mb-1.5">
                                    Estado <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    height="h-37 py-2"
                                    value={form.status}
                                    onChange={(e) => handleChange("status", e.target.value)}
                                    error={errors.status}
                                >
                                    <option value={1}>Activo</option>
                                    <option value={0}>Inactivo</option>
                                </Select>
                            </div>
                        )}

                        <div className="md:col-span-2 flex justify-end gap-2 mt-4 pt-4 border-t">
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
                    </div>
                </>
            )}
        </>
    );
};

export default UserForm;