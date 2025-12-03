/**
 * Utilidades para la generación y descarga de PDFs
 */

/**
 * Descarga un blob como archivo PDF
 * @param {Blob} blob - El blob del PDF
 * @param {string} filename - Nombre del archivo
 */
export const downloadPDFBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

/**
 * Genera y descarga un PDF de Orden de Compra
 * @param {Object} purchaseOrder - Datos de la orden de compra
 * @param {Function} generatePDFService - Servicio para generar el PDF
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const downloadPurchaseOrderPDF = async (purchaseOrder, generatePDFService) => {
    try {
        const response = await generatePDFService(purchaseOrder.id);
        if (response.success) {
            const blob = new Blob([response.data], { type: 'application/pdf' });
            downloadPDFBlob(blob, `OC-${purchaseOrder.number || purchaseOrder.id}.pdf`);
            return { success: true, message: "PDF generado correctamente" };
        } else {
            return { success: false, message: response.message || "Error al generar PDF" };
        }
    } catch (error) {
        console.error("Error al generar PDF:", error);
        return { success: false, message: "Error al generar PDF" };
    }
};

/**
 * Genera y descarga un PDF de Cotización
 * @param {Object} quotation - Datos de la cotización
 * @param {Function} generatePDFService - Servicio para generar el PDF
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const downloadQuotationPDF = async (quotation, generatePDFService) => {
    try {
        const response = await generatePDFService(quotation.id);
        if (response.success) {
            const blob = new Blob([response.data], { type: 'application/pdf' });
            downloadPDFBlob(blob, `Cotizacion-${quotation.number || quotation.id}.pdf`);
            return { success: true, message: "PDF generado correctamente" };
        } else {
            return { success: false, message: response.message || "Error al generar PDF" };
        }
    } catch (error) {
        console.error("Error al generar PDF:", error);
        return { success: false, message: "Error al generar PDF" };
    }
};

/**
 * Genera y descarga un PDF genérico
 * @param {Object} document - Datos del documento
 * @param {Function} generatePDFService - Servicio para generar el PDF
 * @param {string} filename - Nombre del archivo
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const downloadGenericPDF = async (document, generatePDFService, filename) => {
    try {
        const response = await generatePDFService(document.id);
        if (response.success) {
            const blob = new Blob([response.data], { type: 'application/pdf' });
            downloadPDFBlob(blob, filename);
            return { success: true, message: "PDF generado correctamente" };
        } else {
            return { success: false, message: response.message || "Error al generar PDF" };
        }
    } catch (error) {
        console.error("Error al generar PDF:", error);
        return { success: false, message: "Error al generar PDF" };
    }
};

/**
 * Abre un PDF en una nueva ventana
 * @param {Blob} blob - El blob del PDF
 */
export const openPDFInNewWindow = (blob) => {
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
    // Nota: El URL no se revoca inmediatamente para permitir que la ventana lo cargue
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
};

/**
 * Genera un preview del PDF
 * @param {Object} document - Datos del documento
 * @param {Function} generatePDFService - Servicio para generar el PDF
 * @returns {Promise<{success: boolean, message: string, url: string|null}>}
 */
export const previewPDF = async (document, generatePDFService) => {
    try {
        const response = await generatePDFService(document.id);
        if (response.success) {
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            return { success: true, message: "Preview generado correctamente", url };
        } else {
            return { success: false, message: response.message || "Error al generar preview", url: null };
        }
    } catch (error) {
        console.error("Error al generar preview:", error);
        return { success: false, message: "Error al generar preview", url: null };
    }
};
