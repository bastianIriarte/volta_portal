import React, { useEffect, useState } from "react";
import { Select } from "../../../components/ui/Select";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Loader2, SaveIcon, X } from "lucide-react";
import { createProfile, getProfileById, updateProfile } from "../../../services/profileService";
import { handleSnackbar } from "../../../utils/messageHelpers";
import { validateField } from "../../../utils/validators";
import Loading from "../../../components/ui/Loading";

const ProfileForm = ({ mode, register, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        id: null,
        profile: "",
        code: "",
        description: "",
        status: true,
    });

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    // Validar un campo individual
    const validateSingleField = (field, value) => {
        let validationType = "text";
        let isRequired = false;
        let customMessage = "Campo requerido";

        const requiredFields = ["profile", "code"];
        isRequired = requiredFields.includes(field);

        switch (field) {
            case "profile":
                validationType = "names";
                customMessage = "El nombre del perfil debe tener al menos 3 caracteres";
                break;
            case "code":
                validationType = "text";
                customMessage = "El código es requerido";
                break;
            case "description":
                validationType = "text";
                isRequired = false;
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

    // Validar todos los campos
    const validateAll = () => {
        const newErrors = {};
        const requiredFields = ["profile", "code"];

        requiredFields.forEach(field => {
            const value = form[field];
            const validation = validateSingleField(field, value || "");

            if (!validation.isValid) {
                newErrors[field] = validation.message;
            }
        });

        if (mode === "edit") {
            const validation = validateSingleField("status", form.status);
            if (!validation.isValid) {
                newErrors.status = validation.message;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Manejar cambios en campos con validación
    const handleChange = (field, value) => {
        const validation = validateSingleField(field, value);
        const cleanValue = validation.cleanValue;

        // Auto-generar código a partir del nombre del perfil
        if (field === "profile" && mode === "new") {
            const autoCode = cleanValue
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]/g, "_")
                .replace(/_+/g, "_")
                .replace(/^_|_$/g, "");

            setForm(f => ({
                ...f,
                [field]: cleanValue,
                code: autoCode
            }));
        } else {
            setForm(f => ({ ...f, [field]: cleanValue }));
        }

        setErrors(prev => ({
            ...prev,
            [field]: validation.isValid ? null : validation.message
        }));
    };

    // Cargar datos al abrir modal
    useEffect(() => {
        const loadData = async () => {
            if (mode === "edit" && register) {
                setLoading(true);
                try {
                    const response = await getProfileById(register.id);
                    if (response.success) {
                        setForm({
                            id: response.data.id,
                            profile: response.data.profile,
                            code: response.data.code,
                            description: response.data.description || "",
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
                    id: null,
                    profile: "",
                    code: "",
                    description: "",
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
                response = await updateProfile(form.id, form);
            } else {
                response = await createProfile(form);
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
                                label="Nombre del Perfil"
                                value={form.profile}
                                onChange={(e) => handleChange("profile", e.target.value)}
                                placeholder="Ej: Administrador"
                                error={errors.profile}
                                maxLength={100}
                                required
                            />
                        </div>

                        <div>
                            <Input
                                label="Código"
                                value={form.code}
                                onChange={(e) => handleChange("code", e.target.value)}
                                placeholder="Ej: admin"
                                error={errors.code}
                                maxLength={50}
                                required
                                disabled={mode === "edit"}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <Input
                                label="Descripción"
                                value={form.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                                placeholder="Descripción del perfil (opcional)"
                                error={errors.description}
                                maxLength={255}
                            />
                        </div>

                        {mode === 'edit' && (
                            <div>
                                <label className="block text-xs font-bold /70 uppercase mb-1.5">
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

export default ProfileForm;
