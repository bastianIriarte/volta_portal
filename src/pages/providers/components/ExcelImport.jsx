import React, { useState, useRef } from "react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import {
    Upload,
    Download,
    FileSpreadsheet,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Loader2,
    X
} from "lucide-react";
import { storeByExcel } from "../../../services/customerService";
import { handleSnackbar } from "../../../utils/messageHelpers";
import { Input } from "../../../components/ui/Input";

const ExcelImport = ({ onImportSuccess, showExcelImport, setShowExcelImport }) => {


    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [results, setResults] = useState(null);
    const fileInputRef = useRef(null);

    // Limpiar estado
    const resetState = () => {
        setPreview(null);
        setResults(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Descargar plantilla desde ruta física
    const downloadTemplate = async () => {
        try {
            // Ruta física del archivo de plantilla - puedes cambiar esta URL
            const templateUrl = '/templates/plantilla_apoderados.xlsx';

            // Crear elemento de descarga
            const link = document.createElement('a');
            link.href = templateUrl;
            link.download = 'plantilla_apoderados.xlsx';
            link.target = '_blank'; // Abrir en nueva pestaña como respaldo

            // Agregar al DOM, hacer clic y remover
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            handleSnackbar("Plantilla Excel descargada exitosamente", "success");
        } catch (error) {
            console.error('Error al descargar plantilla:', error);
            handleSnackbar("Error al descargar la plantilla. Verifica que el archivo existe.", "error");
        }
    };
    // Procesar archivo seleccionado
    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validar tipo de archivo
        const validTypes = [
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/csv'
        ];

        if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
            handleSnackbar("Por favor seleccione un archivo Excel (.xlsx, .xls) o CSV", "error");
            resetState();
            return;
        }

        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            handleSnackbar("El archivo es demasiado grande. Máximo 5MB permitido.", "error");
            resetState();
            return;
        }

        try {
            setLoading(true);

            // Crear FormData para enviar el archivo
            const formData = new FormData();
            formData.append('file', file);

            // Llamar al servicio
            const response = await storeByExcel(formData);

            if (response.success) {
                setResults(response.data);
                handleSnackbar(response.message, "success");

                // Notificar al componente padre si hay registros exitosos
                if (response.data?.successful?.length > 0) {
                    onImportSuccess && onImportSuccess();
                }
            } else {
                handleSnackbar(response.message || "Error al procesar el archivo", "error");
                setResults(response.data || null);
            }

        } catch (error) {
            console.error("Error al procesar archivo:", error);
            handleSnackbar("Error al procesar el archivo: " + error.message, "error");
            setResults(null);
        } finally {
            setLoading(false);
        }
    };

    // Renderizar resultados
    const renderResults = () => {
        if (!results) return null;

        const { successful = [], errors = [], total = 0 } = results;

        return (
            <div className="mt-6 space-y-4">
                <h4 className="font-semibold  ">Resultados de la importación</h4>

                {/* Resumen */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">Total procesados</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">{total}</p>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                            <span className="text-sm font-medium text-emerald-800">Exitosos</span>
                        </div>
                        <p className="text-2xl font-bold text-emerald-600">{successful.length}</p>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                            <XCircle className="w-5 h-5 text-red-600" />
                            <span className="text-sm font-medium text-red-800">Con errores</span>
                        </div>
                        <p className="text-2xl font-bold text-red-600">{errors.length}</p>
                    </div>
                </div>

                {/* Registros exitosos */}
                {successful.length > 0 && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                        <h5 className="font-medium text-emerald-800 mb-2 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Registros creados exitosamente ({successful.length})
                        </h5>
                        <div className="max-h-32 overflow-y-auto">
                            <ul className="text-sm text-emerald-700 space-y-1">
                                {successful.map((item, index) => (
                                    <li key={index} className="flex items-center">
                                        <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></span>
                                        {item.name} ({item.email})
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Errores */}
                {errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h5 className="font-medium text-red-800 mb-2 flex items-center">
                            <XCircle className="w-4 h-4 mr-2" />
                            Errores encontrados ({errors.length})
                        </h5>
                        <div className="max-h-40 overflow-y-auto">
                            <ul className="text-sm text-red-700 space-y-2">
                                {errors.map((error, index) => (
                                    <li key={index} className="border-l-2 border-red-300 pl-3">
                                        <div className="font-medium">Fila {error.row || index + 1}</div>
                                        <div className="text-xs opacity-80">{error.message || error.error}</div>
                                        {error.data && (
                                            <div className="text-xs opacity-60 mt-1">
                                                Datos: {JSON.stringify(error.data)}
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <Card title="Importación masiva desde Excel" className="lg:col-span-3">
            <div className="space-y-6">
                {/* Instrucciones */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="font-medium text-blue-800 mb-2">Instrucciones para la importación</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• El archivo debe contener las columnas: Nombre, RUT, Correo, Perfil</li>
                                <li>• Los RUTs deben tener formato válido (ej: 12.345.678-5)</li>
                                <li>• Los correos deben ser válidos</li>
                                <li>• Formatos soportados: .xlsx y .xls</li>
                                <li>• Tamaño máximo: 5MB</li>
                                <li>
                                    <Button
                                        variant="outline"
                                        icon={Download}
                                        onClick={downloadTemplate}
                                        className="w-full sm:w-auto"
                                    >
                                        Descargar plantilla
                                    </Button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-3 items-center text-center">


                    <div className="flex-1 w-full sm:w-auto">
                        <Input

                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileSelect}
                            className="w-full sm:w-auto mb-2"
                            disabled={loading}
                        />
                        <Button
                            variant="ghost"
                            icon={X}
                            onClick={() => setShowExcelImport(!showExcelImport)}

                            disabled={loading}
                            className="w-full sm:w-auto mr-2"
                        >
                            {"Cancelar"}
                        </Button>
                        <Button
                            variant="primary"
                            icon={loading ? Loader2 : Upload}
                            onClick={() => fileInputRef.current?.click()}
                            disabled={loading}
                            loading={loading}
                            className="w-full sm:w-auto"
                        >
                            {loading ? "Procesando archivo..." : "Seleccionar y cargar Excel"}
                        </Button>
                    </div>

                    {(preview || results) && (
                        <Button
                            variant="ghost"
                            onClick={resetState}
                            disabled={loading}
                            className="w-full sm:w-auto"
                        >
                            Limpiar
                        </Button>
                    )}
                </div>

                {/* Resultados */}
                {renderResults()}

                {/* Estado de carga */}
                {loading && (
                    <div className="flex items-center justify-center py-8">
                        <div className="flex items-center space-x-3">
                            <Loader2 className="w-6 h-6 animate-spin  " />
                            <span className="  font-medium">
                                Procesando archivo, por favor espere...
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default ExcelImport;