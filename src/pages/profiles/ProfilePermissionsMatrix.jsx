// src/app_courses/pages/profiles/ProfilePermissionsMatrix.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Save,
    Loader2,
    Shield,
    Grid3X3,
    Search,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { getProfiles, getPermissions, updatePermissionsMatrix } from "../../services/profileService";
import { handleSnackbar } from "../../utils/messageHelpers";

export default function ProfilePermissionsMatrix() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profiles, setProfiles] = useState([]);
    const [permissions, setPermissions] = useState({});
    const [matrix, setMatrix] = useState({}); // { permissionId: [profileId1, profileId2, ...] }
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedCategories, setExpandedCategories] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [profilesRes, permissionsRes] = await Promise.all([
                getProfiles(),
                getPermissions()
            ]);

            if (profilesRes.success && permissionsRes.success) {
                setProfiles(profilesRes.data);
                setPermissions(permissionsRes.data);

                // Build initial matrix from profiles' permissions
                const initialMatrix = {};

                // Initialize all permissions
                Object.values(permissionsRes.data).forEach(categoryPerms => {
                    categoryPerms.forEach(permission => {
                        initialMatrix[permission.id] = [];
                    });
                });

                // Fill matrix with existing profile permissions
                profilesRes.data.forEach(profile => {
                    if (profile.permissions && Array.isArray(profile.permissions)) {
                        profile.permissions.forEach(permission => {
                            if (initialMatrix[permission.id]) {
                                initialMatrix[permission.id].push(profile.id);
                            }
                        });
                    }
                });

                setMatrix(initialMatrix);
            } else {
                handleSnackbar("Error al cargar datos", "error");
            }
        } catch (error) {
            handleSnackbar("Error de conexión", "error");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (permissionId, profileId) => {
        setMatrix(prev => {
            const currentProfiles = prev[permissionId] || [];
            const newProfiles = currentProfiles.includes(profileId)
                ? currentProfiles.filter(id => id !== profileId)
                : [...currentProfiles, profileId];

            return {
                ...prev,
                [permissionId]: newProfiles
            };
        });
    };

    const handleToggleAll = (profileId, checked) => {
        setMatrix(prev => {
            const newMatrix = { ...prev };
            Object.keys(newMatrix).forEach(permissionId => {
                if (checked) {
                    if (!newMatrix[permissionId].includes(profileId)) {
                        newMatrix[permissionId] = [...newMatrix[permissionId], profileId];
                    }
                } else {
                    newMatrix[permissionId] = newMatrix[permissionId].filter(id => id !== profileId);
                }
            });
            return newMatrix;
        });
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            // Invert matrix: from { permissionId: [profileIds] } to { profileId: [permissionIds] }
            const profilesWithPermissions = {};

            // Initialize each profile with empty array
            profiles.forEach(profile => {
                profilesWithPermissions[profile.id] = [];
            });

            // Fill arrays of permissionIds for each profile
            Object.keys(matrix).forEach(permissionId => {
                matrix[permissionId].forEach(profileId => {
                    if (profilesWithPermissions[profileId]) {
                        profilesWithPermissions[profileId].push(parseInt(permissionId));
                    }
                });
            });

            const response = await updatePermissionsMatrix(profilesWithPermissions);

            if (response.success) {
                handleSnackbar(response.message || "Permisos actualizados correctamente", "success");
            } else {
                handleSnackbar(response.message || "Error al guardar permisos", "error");
            }

        } catch (error) {
            handleSnackbar("Error al guardar: " + error.message, "error");
        } finally {
            setSaving(false);
        }
    };

    // Get all permissions as flat array for filtering
    const allPermissions = Object.entries(permissions).flatMap(([category, perms]) =>
        perms.map(p => ({ ...p, category }))
    );

    // Filter permissions by search
    const filteredPermissions = searchQuery
        ? allPermissions.filter(perm =>
            perm.permission.toLowerCase().includes(searchQuery.toLowerCase()) ||
            perm.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            perm.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : allPermissions;

    const toggleCategory = (category) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <Loader2 size={48} className="animate-spin text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Cargando matriz...</p>
                </div>
            </div>
        );
    }

    if (profiles.length === 0) {
        return (
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate("/dashboard/profiles-managment")}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="text-2xl font-bold text-black">Asignar Permisos a Perfiles</h2>
                </div>

                <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
                    <Shield size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        No hay perfiles disponibles
                    </h3>
                    <p className="text-gray-500 mb-6">
                        Crea al menos un perfil para poder asignar permisos
                    </p>
                    <button
                        onClick={() => navigate("/dashboard/profiles-managment/new")}
                        className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                    >
                        Crear Perfil
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-full mx-auto space-y-6">
            {/* HEADER */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/dashboard/profiles-managment")}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        disabled={saving}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-black">Asignar Permisos a Perfiles</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Selecciona qué permisos tendrá cada perfil
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {saving ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        <>
                            <Save size={16} />
                            Guardar Cambios
                        </>
                    )}
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <p className="text-sm text-gray-600">Total de Permisos</p>
                    <p className="text-2xl font-bold text-black">{allPermissions.length}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <p className="text-sm text-gray-600">Perfiles</p>
                    <p className="text-2xl font-bold text-black">{profiles.length}</p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-lg border border-gray-100">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar permiso..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                    />
                </div>
            </div>

            {/* Matrix Table */}
            <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider sticky left-0 bg-gray-50 min-w-[300px]">
                                    Permiso ({filteredPermissions.length})
                                </th>
                                {profiles.map(profile => (
                                    <th key={profile.id} className="px-4 py-4 text-center min-w-[150px]">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-xs font-bold text-gray-700 uppercase">
                                                {profile.profile}
                                            </span>
                                            <div className="flex items-center gap-2 mt-1">
                                                <input
                                                    type="checkbox"
                                                    onChange={(e) => handleToggleAll(profile.id, e.target.checked)}
                                                    checked={filteredPermissions.every(perm =>
                                                        matrix[perm.id]?.includes(profile.id)
                                                    )}
                                                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                                                />
                                                <span className="text-xs text-gray-500">Todos</span>
                                            </div>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {Object.keys(permissions).map((category) => {
                                const categoryPerms = permissions[category].filter(perm =>
                                    !searchQuery || filteredPermissions.some(fp => fp.id === perm.id)
                                );

                                if (categoryPerms.length === 0) return null;

                                const isExpanded = expandedCategories[category] !== false;

                                return (
                                    <React.Fragment key={category}>
                                        {/* Category Header */}
                                        <tr className="bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                                            <td
                                                colSpan={profiles.length + 1}
                                                className="px-6 py-3 sticky left-0 bg-gray-50"
                                                onClick={() => toggleCategory(category)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {isExpanded ? (
                                                        <ChevronDown size={16} className="text-gray-600" />
                                                    ) : (
                                                        <ChevronUp size={16} className="text-gray-600" />
                                                    )}
                                                    <span className="font-semibold text-gray-700 text-sm">
                                                        {category}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        ({categoryPerms.length} permisos)
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* Category Permissions */}
                                        {isExpanded && categoryPerms.map((permission) => (
                                            <tr key={permission.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 sticky left-0 bg-white">
                                                    <div className="flex flex-col gap-1">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {permission.permission}
                                                        </p>
                                                        <p className="text-xs text-gray-500 font-mono">
                                                            {permission.description}
                                                        </p>
                                                    </div>
                                                </td>
                                                {profiles.map(profile => (
                                                    <td key={profile.id} className="px-4 py-4 text-center">
                                                        <div className="flex items-center justify-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={matrix[permission.id]?.includes(profile.id) || false}
                                                                onChange={() => handleToggle(permission.id, profile.id)}
                                                                className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black cursor-pointer"
                                                            />
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <Grid3X3 size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">💡 Cómo usar esta matriz:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                            <li>Marca los checkboxes para asignar permisos a perfiles específicos</li>
                            <li>Usa el checkbox "Todos" en el encabezado para seleccionar/deseleccionar todos los permisos de un perfil</li>
                            <li>Los permisos agrupados por categoría se pueden expandir/colapsar</li>
                            <li>No olvides hacer clic en "Guardar Cambios" cuando termines</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
