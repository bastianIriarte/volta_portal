// components/UploadForm.jsx
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Upload, FileSpreadsheet, Download, AlertCircle, X, Loader2 } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { UPLOAD_TYPES } from '../../../utils/uploadConstants';
import { downloadTemplate } from '../../../services/excelUploadService';
import { handleSnackbar } from '../../../utils/messageHelpers';
import * as LucideIcons from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UploadForm({ typeInfo, onUpload, onBack }) {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!typeInfo.code) navigate('/dashboard/load-data/seleccionar-tipo');
  }, [typeInfo]);

  const getIcon = (iconName) => {
    if (!iconName) return LucideIcons.FileSpreadsheet;

    // Convertir el nombre del icono a PascalCase si viene en snake_case o kebab-case
    const iconKey = iconName
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

    return LucideIcons[iconKey] || LucideIcons.FileSpreadsheet;
  };

  const TypeIcon = getIcon(typeInfo.icon);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validar tipo de archivo
      const validExtensions = ['xlsx', 'xls', 'csv'];
      const fileExtension = selectedFile.name.split('.').pop().toLowerCase();

      if (!validExtensions.includes(fileExtension)) {
        handleSnackbar('Por favor selecciona un archivo Excel válido (.xlsx, .xls o .csv)', 'error');
        return;
      }

      // Validar tamaño (10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB en bytes
      if (selectedFile.size > maxSize) {
        handleSnackbar('El archivo es demasiado grande. Tamaño máximo: 10MB', 'error');
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    try {
      await onUpload(file);
      // Limpiar después de subir
      handleRemoveFile();
    } catch (error) {
      console.error('Error uploading file:', error);
      handleSnackbar('Error al cargar el archivo', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true);
    try {
      const response = await downloadTemplate(typeInfo?.code);

      if (response.success) {
        handleSnackbar('Plantilla descargada correctamente', 'success');
      } else {
        handleSnackbar(response.message || 'Error al descargar la plantilla', 'error');
      }
    } catch (error) {
      console.error('Error downloading template:', error);
      handleSnackbar('Error al descargar la plantilla', 'error');
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Button
        onClick={onBack}
        variant="ghost"
        icon={ArrowLeft}
        disabled={loading}
      >
        Cambiar tipo de carga
      </Button>

      <Card className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-12 h-12 rounded-xl ${typeInfo.colorClass} flex items-center justify-center`}>
            <TypeIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-black">
              Cargar {typeInfo.name}
            </h3>
            <p className="text-sm text-gray-600">
              {typeInfo.description}
            </p>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Instrucciones importantes
          </h4>
          <ul className="text-sm text-blue-700 space-y-2 ml-6 list-disc">
            <li>Descarga la plantilla Excel proporcionada a continuación</li>
            <li>Completa los datos siguiendo el formato indicado en la plantilla</li>
            <li><strong>No modifiques los nombres de las columnas</strong></li>
            <li>Asegúrate de que todos los campos obligatorios estén completos</li>
            <li>Formatos soportados: <code className="bg-blue-100 px-1 rounded">.xlsx</code>, <code className="bg-blue-100 px-1 rounded">.xls</code>, <code className="bg-blue-100 px-1 rounded">.csv</code></li>
            <li>Tamaño máximo del archivo: <strong>10MB</strong></li>
          </ul>

          <Button
            onClick={handleDownloadTemplate}
            disabled={downloadingTemplate}
            variant="primary"
            icon={downloadingTemplate ? Loader2 : Download}
            className="mt-4"
            size="md"
          >
            {downloadingTemplate ? 'Descargando...' : 'Descargar plantilla Excel'}
          </Button>
        </div>

        {/* Selector de archivo */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Seleccionar archivo Excel
            </label>
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                disabled={loading}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2.5 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-black file:text-white
                  hover:file:bg-black-600
                  file:cursor-pointer file:transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed
                  cursor-pointer border-2 border-dashed border-gray-300
                  rounded-lg p-4 hover:border-black
                  transition-colors"
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Arrastra y suelta un archivo o haz clic para seleccionar
            </p>
          </div>

          {/* Vista previa del archivo seleccionado */}
          {file && (
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-lg p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-emerald-600 flex items-center justify-center shadow-md">
                    <FileSpreadsheet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-black">{file.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-emerald-700 font-medium">
                        {formatFileSize(file.size)}
                      </span>
                      <span className="text-xs text-gray-500">
                        • {file.type || 'application/vnd.ms-excel'}
                      </span>
                    </div>
                  </div>
                </div>
                {!loading && (
                  <button
                    onClick={handleRemoveFile}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Quitar archivo"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button
              onClick={onBack}
              disabled={loading}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || loading}
              variant="primary"
              icon={loading ? Loader2 : Upload}
              loading={loading}
            >
              {loading ? 'Procesando archivo...' : 'Cargar archivo'}
            </Button>
          </div>
        </div>

        {/* Estado de carga */}
        {loading && (
          <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-800">
                  Procesando archivo...
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Por favor espera mientras validamos y procesamos el archivo. Esto puede tomar unos momentos.
                </p>
              </div>
            </div>
            <div className="mt-3 bg-blue-100 rounded-full h-2 overflow-hidden">
              <div className="bg-blue-600 h-full w-full animate-progress"></div>
            </div>
          </div>
        )}
      </Card>

      {/* Información adicional */}
      <Card className="p-4 bg-gray-50">
        <h4 className="text-sm font-semibold text-black mb-2">
          ¿Qué sucede después de cargar el archivo?
        </h4>
        <ol className="text-sm text-gray-700 space-y-1 ml-5 list-decimal">
          <li>El sistema validará automáticamente todos los datos</li>
          <li>Se mostrará un resumen con registros válidos y errores detectados</li>
          <li>Podrás editar las líneas con errores antes de confirmar</li>
          <li>Una vez confirmado, los registros se crearán en el sistema</li>
        </ol>
      </Card>
    </div>
  );
}