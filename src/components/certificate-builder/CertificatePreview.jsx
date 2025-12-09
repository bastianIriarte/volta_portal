import React from "react";

/**
 * Componente de vista previa del certificado
 * Renderiza los campos configurados con los datos simulados
 */
export default function CertificatePreview({ template, fields, data }) {
  // Helper para obtener valor de data con notación de punto
  const getValue = (path, defaultValue = "") => {
    if (!path || !data) return defaultValue;
    return path.split(".").reduce((obj, key) => obj?.[key], data) || defaultValue;
  };

  // Helper para reemplazar placeholders en texto
  const replacePlaceholders = (text) => {
    if (!text) return "";
    return text.replace(/\{([^}]+)\}/g, (match, path) => {
      return getValue(path, match);
    });
  };

  // Obtener campos por sección
  const getFieldsBySection = (section) => {
    return fields
      .filter((f) => f.section === section)
      .sort((a, b) => a.order_index - b.order_index);
  };

  // Renderizar campo según su tipo
  const renderField = (field) => {
    const value = field.data_source
      ? getValue(field.data_source, field.default_value)
      : field.default_value;

    switch (field.field_type) {
      case "text":
        return renderTextField(field, value);
      case "date":
        return renderDateField(field, value);
      case "number":
        return renderNumberField(field, value);
      case "paragraph":
        return renderParagraphField(field);
      case "image":
        return renderImageField(field, value);
      case "table":
        return renderTableField(field);
      case "signature":
        return renderSignatureField(field);
      case "divider":
        return <hr className="border-t border-gray-300 my-4" />;
      case "spacer":
        return <div className="h-6" />;
      default:
        return renderTextField(field, value);
    }
  };

  const renderTextField = (field, value) => {
    const styles = field.styles || {};
    return (
      <div
        className="py-1"
        style={{
          fontSize: styles.fontSize || "14px",
          fontWeight: styles.fontWeight || "normal",
          color: styles.color || "#333",
          textAlign: styles.textAlign || "left",
        }}
      >
        {field.field_label && styles.showLabel === true && (
          <span style={{ color: styles.labelColor || "#6b7280" }}>{field.field_label}: </span>
        )}
        <span>{value || field.default_value || field.field_label}</span>
      </div>
    );
  };

  const renderDateField = (field, value) => {
    return renderTextField(field, value);
  };

  const renderNumberField = (field, value) => {
    return renderTextField(field, value);
  };

  const renderParagraphField = (field) => {
    let text = field.data_source
      ? getValue(`texts.${field.field_key.replace("texto_", "")}`, field.default_value)
      : field.default_value || data?.texts?.intro;

    // Reemplazar placeholders
    text = replacePlaceholders(text);

    return (
      <div
        className="py-2 leading-relaxed"
        style={{
          fontSize: field.styles?.fontSize || "13px",
          color: field.styles?.color || "#333",
          textAlign: field.styles?.textAlign || "justify",
        }}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  };

  const renderImageField = (field, value) => {
    const styles = field.styles || {};
    return (
      <div
        className="py-2"
        style={{ textAlign: styles.textAlign || "center" }}
      >
        {value ? (
          <img
            src={value}
            alt={field.field_label}
            className="max-h-16 object-contain"
            style={{
              maxWidth: styles.maxWidth || "150px",
              display: "inline-block",
            }}
          />
        ) : (
          <div className="inline-block px-4 py-2 bg-gray-100 text-gray-400 text-sm rounded">
            {field.field_label}
          </div>
        )}
      </div>
    );
  };

  const renderTableField = (field) => {
    // Si el backend envió el HTML completo de la tabla, usarlo directamente
    const tableHtml = getValue(field.data_source || "table_html");
    if (tableHtml) {
      return (
        <div
          className="py-4 certificate-table"
          dangerouslySetInnerHTML={{ __html: tableHtml }}
        />
      );
    }

    // Si no hay HTML del backend, usar la configuración de columnas (para preview en builder)
    const tableData = data?.details || [];
    const columns = field.table_columns || [
      { key: "fecha", label: "Fecha", width: "15%" },
      { key: "orden_trabajo", label: "Orden de Trabajo", width: "15%" },
      { key: "patente", label: "Patente", width: "12%" },
      { key: "tipo_residuo", label: "Tipo de Residuo", width: "20%" },
      { key: "cantidad", label: "Cantidad", width: "12%" },
      { key: "destinatario", label: "Destinatario", width: "26%" },
    ];

    return (
      <div className="py-4">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-sky-600 text-white">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-2 py-2 text-left font-medium border border-sky-700"
                  style={{ width: col.width }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.length > 0 ? (
              tableData.map((row, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-2 py-1.5 border border-gray-200"
                    >
                      {row[col.key] || "—"}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-2 py-4 text-center text-gray-400 border border-gray-200"
                >
                  Sin datos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderSignatureField = (field) => {
    const signatureData = data?.signature || {};
    return (
      <div className="py-4 text-center">
        {signatureData.image ? (
          <img
            src={signatureData.image}
            alt="Firma"
            className="max-h-16 mx-auto mb-2"
          />
        ) : (
          <div className="w-40 h-12 mx-auto mb-2 border-b-2 border-gray-400" />
        )}
        <div className="font-semibold text-sky-700">
          {signatureData.name || "Nombre del Firmante"}
        </div>
        <div className="text-sm text-gray-600">
          {signatureData.position || "Cargo"}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Contenedor del certificado */}
      <div
        className="bg-white shadow-lg rounded-lg overflow-hidden"
        style={{
          borderTop: `4px solid ${template?.primary_color || "#0284c7"}`,
        }}
      >
        {/* Header del certificado */}
        <div className="relative bg-gray-50 border-b border-gray-200">
          {/* Barra superior con fecha y código */}
          <div
            className="flex justify-between items-center px-6 py-2 text-white text-sm"
            style={{ backgroundColor: template?.primary_color || "#0284c7" }}
          >
            <span>FECHA: {getValue("certificate.date", "DD/MM/YYYY")}</span>
            <span>{getValue("certificate.code", "ES-XXX-0000")}</span>
          </div>

          {/* Logo y título */}
          <div className="px-8 py-6 flex items-center gap-6">
            <div className="flex-shrink-0">
              {getValue("issuer.logo") ? (
                <img
                  src={getValue("issuer.logo")}
                  alt="Logo"
                  className="h-16 object-contain"
                />
              ) : (
                <div className="w-32 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-sm">
                  Logo
                </div>
              )}
            </div>
            <div className="border-l-2 border-sky-500 pl-4">
              <h1
                className="text-xl font-light"
                style={{ color: template?.primary_color || "#0284c7" }}
              >
                {getValue("certificate.title", "Certificado")}
              </h1>
            </div>
          </div>

          {/* Campos del header */}
          {getFieldsBySection("header").length > 0 && (
            <div className="px-8 pb-4">
              {getFieldsBySection("header").map((field) => (
                <div key={field.id}>{renderField(field)}</div>
              ))}
            </div>
          )}
        </div>

        {/* Body del certificado */}
        <div className="px-8 py-6">
          {getFieldsBySection("body").map((field) => (
            <div key={field.id}>{renderField(field)}</div>
          ))}

          {/* Si no hay campos en body, mostrar contenido por defecto */}
          {getFieldsBySection("body").length === 0 && (
            <>
              {/* Texto introductorio */}
              <div className="text-sm text-gray-700 leading-relaxed text-justify mb-6">
                {replacePlaceholders(data?.texts?.intro || "")}
              </div>

              {/* Tabla de detalles */}
              {renderTableField({ table_columns: null })}

              {/* Texto de cierre */}
              {data?.texts?.closing && (
                <div className="text-sm text-gray-700 leading-relaxed text-justify mt-6">
                  {replacePlaceholders(data?.texts?.closing)}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer del certificado */}
        <div className="px-8 py-6 border-t border-gray-200">
          {/* Campos del footer o firma por defecto */}
          {getFieldsBySection("footer").length > 0 ? (
            getFieldsBySection("footer").map((field) => (
              <div key={field.id}>{renderField(field)}</div>
            ))
          ) : (
            renderSignatureField({})
          )}
        </div>

        {/* Pie de página con datos de contacto */}
        <div
          className="px-8 py-3 text-center text-xs text-white"
          style={{ backgroundColor: template?.secondary_color || "#64748b" }}
        >
          <div className="flex items-center justify-center gap-2">
            {getValue("issuer.logo") && (
              <img
                src={getValue("issuer.logo")}
                alt=""
                className="h-6 opacity-80"
              />
            )}
            <span>{getValue("issuer.name", "Empresa")}</span>
          </div>
          <div className="mt-1 opacity-80">
            {getValue("issuer.address", "Dirección")} - Teléfono:{" "}
            {getValue("issuer.phone", "(00) 0000 0000")}
          </div>
          {getValue("issuer.website") && (
            <div className="mt-0.5 opacity-80">{getValue("issuer.website")}</div>
          )}
        </div>
      </div>
    </div>
  );
}
