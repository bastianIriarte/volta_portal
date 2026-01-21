import { Layers, Settings } from "lucide-react";

// Componentes del builder
import {
  HelpGuide,
  ConfirmDialog,
  ActivityLog,
  FieldConfigPanel,
  CertificateSection,
  FieldsPanel,
  BuilderToolbar,
  AddFieldModal,
  BuilderPdfPreviewModal,
} from "./components/builder";

// Hook personalizado
import { useCertificateBuilder } from "./hooks/useCertificateBuilder";

export default function CertificateBuilder({ templateId, onClose }) {
  const {
    // Estados
    loading,
    saving,
    config,
    template,
    expandedCategories,
    dragOverSection,
    selectedField,
    showFieldConfig,
    showHelp,
    hasInteracted,
    scale,
    stylePanel,
    deleteConfirm,
    activityLogs,
    showActivityLog,
    pdfPreview,
    showMobileFields,
    showMobileConfig,
    addFieldModal,
    tableProcessors,
    availableVariables,
    canUndo,
    canRedo,
    simulatedData,

    // Setters
    setScale,
    setStylePanel,
    setShowHelp,
    setShowActivityLog,
    setActivityLogs,
    setShowMobileFields,
    setShowMobileConfig,
    setAddFieldModal,
    setShowFieldConfig,
    setSelectedField,

    // Handlers
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFieldTap,
    handleAddFieldToSection,
    handleReorder,
    handleRemoveField,
    confirmDeleteField,
    cancelDeleteField,
    handleConfigureField,
    handleUpdateField,
    handleQuickStyleUpdate,
    handleDuplicateField,
    handleSave,
    handleUndo,
    handleRedo,
    toggleCategory,
    getFieldsBySection,
    groupedPredefinedFields,
    resolveValue,

    // PDF Preview handlers
    handleOpenPdfPreview,
    handleRefreshPdfPreview,
    handleDownloadPdf,
    handleClosePdfPreview,
  } = useCertificateBuilder(templateId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-120px)] bg-gray-100 relative">
      {/* Keyframes para animaciones */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>

      {/* Overlay para cerrar drawers en mobile */}
      {(showMobileFields || showMobileConfig) && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => {
            setShowMobileFields(false);
            setShowMobileConfig(false);
          }}
        />
      )}

      {/* Panel Izquierdo - Campos */}
      <FieldsPanel
        config={config}
        expandedCategories={expandedCategories}
        hasInteracted={hasInteracted}
        showMobileFields={showMobileFields}
        onToggleCategory={toggleCategory}
        onDragStart={handleDragStart}
        onFieldTap={handleFieldTap}
        onShowHelp={() => setShowHelp(true)}
        onCloseMobile={() => setShowMobileFields(false)}
        groupedPredefinedFields={groupedPredefinedFields}
      />

      {/* Panel Central */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <BuilderToolbar
          template={template}
          scale={scale}
          setScale={setScale}
          saving={saving}
          canUndo={canUndo}
          canRedo={canRedo}
          selectedField={selectedField}
          pdfLoading={pdfPreview.loading}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onSave={handleSave}
          onClose={onClose}
          onOpenPdfPreview={handleOpenPdfPreview}
          onDownloadPdf={handleDownloadPdf}
          onShowMobileFields={() => setShowMobileFields(true)}
          onShowMobileConfig={() => setShowMobileConfig(true)}
        />

        {/* Certificado - centrado con scroll horizontal */}
        <div className="flex-1 overflow-auto p-2 sm:p-4 md:p-6">
          <div
            className="flex justify-center"
            style={{
              minWidth: `${900 * scale}px`,
              paddingBottom: `${Math.max(0, (1 - scale) * 200)}px`,
            }}
          >
            <div
              className="bg-white shadow-xl overflow-hidden transition-transform origin-top flex flex-col flex-shrink-0"
              style={{
                transform: `scale(${scale})`,
                width: "900px",
                minHeight: "297mm",
                padding: "30px 100px 0 100px",
              }}
            >
              {/* Header */}
              <CertificateSection
                section="header"
                label="Encabezado"
                fields={getFieldsBySection("header")}
                dragOverSection={dragOverSection}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onRemoveField={handleRemoveField}
                onConfigureField={handleConfigureField}
                onDuplicateField={handleDuplicateField}
                onReorder={handleReorder}
                onQuickStyleUpdate={handleQuickStyleUpdate}
                config={config}
                resolveValue={resolveValue}
                simulatedData={simulatedData}
                template={template}
                stylePanel={stylePanel}
                setStylePanel={setStylePanel}
              />

              {/* Body */}
              <CertificateSection
                section="body"
                label="Cuerpo"
                fields={getFieldsBySection("body")}
                dragOverSection={dragOverSection}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onRemoveField={handleRemoveField}
                onConfigureField={handleConfigureField}
                onDuplicateField={handleDuplicateField}
                onReorder={handleReorder}
                onQuickStyleUpdate={handleQuickStyleUpdate}
                config={config}
                resolveValue={resolveValue}
                simulatedData={simulatedData}
                template={template}
                stylePanel={stylePanel}
                setStylePanel={setStylePanel}
                isMain
              />

              {/* Área de Firma */}
              <CertificateSection
                section="signature_area"
                label="Área de Firma"
                fields={getFieldsBySection("signature_area")}
                dragOverSection={dragOverSection}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onRemoveField={handleRemoveField}
                onConfigureField={handleConfigureField}
                onDuplicateField={handleDuplicateField}
                onReorder={handleReorder}
                onQuickStyleUpdate={handleQuickStyleUpdate}
                config={config}
                resolveValue={resolveValue}
                simulatedData={simulatedData}
                template={template}
                stylePanel={stylePanel}
                setStylePanel={setStylePanel}
              />

              {/* Footer */}
              <CertificateSection
                section="footer"
                label="Pie de página"
                fields={getFieldsBySection("footer")}
                dragOverSection={dragOverSection}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onRemoveField={handleRemoveField}
                onConfigureField={handleConfigureField}
                onDuplicateField={handleDuplicateField}
                onReorder={handleReorder}
                onQuickStyleUpdate={handleQuickStyleUpdate}
                config={config}
                resolveValue={resolveValue}
                simulatedData={simulatedData}
                template={template}
                stylePanel={stylePanel}
                setStylePanel={setStylePanel}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Botón flotante para agregar campos en mobile */}
      <button
        onClick={() => setShowMobileFields(true)}
        className="fixed bottom-6 left-4 z-20 lg:hidden w-12 h-12 bg-sky-600 text-white rounded-full shadow-lg hover:bg-sky-700 active:bg-sky-800 flex items-center justify-center transition-all"
        title="Agregar campos"
      >
        <Layers className="h-5 w-5" />
      </button>

      {/* Indicador de campo seleccionado en mobile */}
      {selectedField && !showMobileConfig && (
        <button
          onClick={() => setShowMobileConfig(true)}
          className="fixed bottom-6 right-4 z-20 lg:hidden flex items-center gap-1.5 px-3 py-2 bg-white border border-sky-200 rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <Settings className="h-4 w-4 text-sky-600" />
          <span className="text-xs font-medium text-gray-700 max-w-[100px] truncate">
            {selectedField.field_label}
          </span>
        </button>
      )}

      {/* Panel Derecho - Configuración de Campo */}
      {showFieldConfig && selectedField && (
        <div
          className={`
            fixed lg:relative inset-y-0 right-0 z-40
            transform transition-transform duration-300 ease-in-out
            ${showMobileConfig ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
          `}
        >
          <FieldConfigPanel
            field={selectedField}
            config={config}
            tableProcessors={tableProcessors}
            availableVariables={availableVariables}
            onSave={handleUpdateField}
            onClose={() => {
              setShowFieldConfig(false);
              setSelectedField(null);
              setShowMobileConfig(false);
            }}
          />
        </div>
      )}

      {/* Modales */}
      <HelpGuide open={showHelp} onClose={() => setShowHelp(false)} />

      <ConfirmDialog
        open={deleteConfirm.show && !!deleteConfirm.field}
        title="¿Eliminar campo?"
        message={deleteConfirm.field ? `¿Estás seguro de eliminar "${deleteConfirm.field.field_label}"? Puedes usar Deshacer (Ctrl+Z) para recuperarlo.` : ""}
        onConfirm={confirmDeleteField}
        onCancel={cancelDeleteField}
        confirmText="Eliminar"
        confirmColor="red"
      />

      {/* Panel de Historial */}
      <ActivityLog
        logs={activityLogs}
        isOpen={showActivityLog}
        onToggle={() => setShowActivityLog(!showActivityLog)}
        onClear={() => setActivityLogs([])}
      />

      {/* Modal de selección de sección (tap to add en mobile) */}
      <AddFieldModal
        show={addFieldModal.show}
        field={addFieldModal.field}
        onAddToSection={handleAddFieldToSection}
        onClose={() => setAddFieldModal({ show: false, field: null })}
      />

      {/* Modal de Preview PDF */}
      <BuilderPdfPreviewModal
        show={pdfPreview.show}
        url={pdfPreview.url}
        loading={pdfPreview.loading}
        onRefresh={handleRefreshPdfPreview}
        onDownload={handleDownloadPdf}
        onClose={handleClosePdfPreview}
      />
    </div>
  );
}
