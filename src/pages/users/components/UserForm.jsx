import React, { useEffect, useState } from "react";
import { Select } from "../../../components/ui/Select";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Loader2, SaveIcon, X, Building2, Check } from "lucide-react";
import { getProfiles } from "../../../services/profileService";
import { createUser, getUserById, updateUser, getUserCompanies, syncUserCompanies } from "../../../services/userService";
import { getCompaniesList } from "../../../services/companyService";
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

    // Estados para empresas asignadas (commercial)
    const [companies, setCompanies] = useState([]);
    const [selectedCompanyIds, setSelectedCompanyIds] = useState([]);
    const [loadingCompanies, setLoadingCompanies] = useState(false);

    // Verificar si el perfil seleccionado es "commercial"
    const isComercial = form.profile === "commercial";

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

    // Obtener lista de empresas
    const fetchCompanies = async () => {
        try {
            setLoadingCompanies(true);
            const response = await getCompaniesList();
            if (response.success) {
                setCompanies(response.data || []);
            }
        } catch (error) {
            console.error("Error al obtener empresas:", error);
        } finally {
            setLoadingCompanies(false);
        }
    };

    // Obtener empresas asignadas al usuario
    const fetchUserCompanies = async (userId) => {
        try {
            const response = await getUserCompanies(userId);
            if (response.success) {
                setSelectedCompanyIds(response.data.map(c => c.id));
            }
        } catch (error) {
            console.error("Error al obtener empresas del usuario:", error);
        }
    };

    // Toggle selección de empresa
    const toggleCompany = (companyId) => {
        setSelectedCompanyIds(prev => {
            if (prev.includes(companyId)) {
                return prev.filter(id => id !== companyId);
            }
            return [...prev, companyId];
        });
    };

    // sincronizar al abrir modal
    useEffect(() => {
        const loadData = async () => {
            fetchProfiles();
            fetchCompanies();

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

                        // Si es commercial, cargar empresas asignadas
                        if (response.data.role === "commercial") {
                            await fetchUserCompanies(response.data.id);
                        }
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
                setSelectedCompanyIds([]);
            }
        };
        loadData();
    }, [mode, register, onClose]);

    // Cuando cambia el perfil a commercial, limpiar las empresas si es nuevo
    useEffect(() => {
        if (mode === "new" && form.profile !== "commercial") {
            setSelectedCompanyIds([]);
        }
    }, [form.profile, mode]);

    const submit = async () => {
        if (!validateAll()) return;

        setSaving(true);

        try {
            let response;
            if (mode === "edit") {
                response = await updateUser(form.id, form);

                // Si es commercial, sincronizar empresas
                if (response.success && form.profile === "commercial") {
                    await syncUserCompanies(form.id, selectedCompanyIds);
                }
            } else {
                response = await createUser(form);

                // Si es commercial y se creó exitosamente, sincronizar empresas
                if (response.success && form.profile === "commercial" && response.data?.id) {
                    await syncUserCompanies(response.data.id, selectedCompanyIds);
                }
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

                        {/* Selector de empresas para usuarios commerciales */}
                        {isComercial && (
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-neutral-600 uppercase mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <Building2 size={14} />
                                        Empresas Asignadas
                                    </div>
                                </label>
                                <p className="text-xs text-gray-500 mb-2">
                                    Seleccione las empresas a las que este usuario commercial tendrá acceso
                                </p>

                                {loadingCompanies ? (
                                    <div className="flex items-center justify-center py-4">
                                        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                                        <span className="ml-2 text-sm text-gray-500">Cargando empresas...</span>
                                    </div>
                                ) : companies.length === 0 ? (
                                    <p className="text-sm text-gray-500 py-4 text-center">
                                        No hay empresas disponibles
                                    </p>
                                ) : (
                                    <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                                        {companies.map((company) => {
                                            const isSelected = selectedCompanyIds.includes(company.id);
                                            return (
                                                <div
                                                    key={company.id}
                                                    onClick={() => toggleCompany(company.id)}
                                                    className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors border-b last:border-b-0 ${
                                                        isSelected
                                                            ? "bg-blue-50 hover:bg-blue-100"
                                                            : "hover:bg-gray-50"
                                                    }`}
                                                >
                                                    <div
                                                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                                            isSelected
                                                                ? "bg-blue-600 border-blue-600"
                                                                : "border-gray-300"
                                                        }`}
                                                    >
                                                        {isSelected && <Check size={14} className="text-white" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {company.business_name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {company.rut}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {selectedCompanyIds.length > 0 && (
                                    <p className="text-xs text-blue-600 mt-2">
                                        {selectedCompanyIds.length} empresa{selectedCompanyIds.length !== 1 ? "s" : ""} seleccionada{selectedCompanyIds.length !== 1 ? "s" : ""}
                                    </p>
                                )}
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
