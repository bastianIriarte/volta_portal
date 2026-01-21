/**
 * Utilidad compartida para syntax highlighting de SQL
 * Usa tokenización para manejar correctamente sintaxis SAP HANA (ej: 300">"columna")
 */

/**
 * Palabras clave SQL para highlighting
 */
export const SQL_KEYWORDS = [
  "SELECT", "FROM", "WHERE", "AND", "OR", "NOT", "IN", "IS", "NULL",
  "JOIN", "LEFT", "RIGHT", "INNER", "OUTER", "FULL", "CROSS", "ON",
  "GROUP", "BY", "ORDER", "ASC", "DESC", "HAVING", "LIMIT", "OFFSET",
  "INSERT", "INTO", "VALUES", "UPDATE", "SET", "DELETE", "CREATE",
  "TABLE", "INDEX", "VIEW", "DROP", "ALTER", "ADD", "COLUMN",
  "PRIMARY", "KEY", "FOREIGN", "REFERENCES", "UNIQUE", "CHECK",
  "DEFAULT", "CONSTRAINT", "CASCADE", "DISTINCT", "AS", "CASE",
  "WHEN", "THEN", "ELSE", "END", "BETWEEN", "LIKE", "EXISTS",
  "UNION", "ALL", "ANY", "SOME", "TOP", "PERCENT", "WITH", "RECURSIVE",
  "TRUE", "FALSE", "COUNT", "SUM", "AVG", "MIN", "MAX", "COALESCE",
  "NULLIF", "CAST", "CONVERT", "TRIM", "UPPER", "LOWER", "CONCAT",
  "SUBSTRING"
];

const keywordSet = new Set(SQL_KEYWORDS.map(k => k.toUpperCase()));

/**
 * Escapa caracteres HTML
 */
const escapeHtml = (text) => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
};

/**
 * Temas de colores para el highlighter
 */
export const SQL_THEMES = {
  // Tema claro (para DataSourceFormModal)
  light: {
    keyword: 'color:#0000ff;font-weight:500',
    string: 'color:#a31515',
    stringDouble: 'color:#a31515',
    comment: 'color:#008000',
    number: 'color:#098658',
    param: 'color:#2563eb;background:#dbeafe;padding:0 2px;border-radius:2px',
    paramWithValue: 'color:#2563eb;background:#dbeafe;padding:0 2px;border-radius:2px',
  },
  // Tema oscuro (para DataSourceTestModal)
  dark: {
    keyword: 'color:#f472b6;font-weight:600',  // text-pink-400
    string: 'color:#a3e635',  // text-lime-400
    stringDouble: 'color:#67e8f9',  // text-cyan-300
    comment: 'color:#64748b;font-style:italic',  // text-slate-500
    number: 'color:#fb923c',  // text-orange-400
    param: 'color:#60a5fa;background:rgba(59,130,246,0.2);padding:0 4px;border-radius:4px',  // text-blue-400
    paramWithValue: 'color:#fcd34d;background:rgba(245,158,11,0.2);padding:0 4px;border-radius:4px',  // text-amber-300
  }
};

/**
 * Tokeniza una cadena SQL
 * @param {string} sql - Query SQL a tokenizar
 * @returns {Array<{type: string, value: string}>} - Array de tokens
 */
export const tokenizeSQL = (sql) => {
  if (!sql) return [];

  const tokens = [];
  let i = 0;
  const text = sql;

  while (i < text.length) {
    // Strings entre comillas simples
    if (text[i] === "'") {
      let j = i + 1;
      while (j < text.length && (text[j] !== "'" || text[j-1] === "\\")) j++;
      tokens.push({ type: "string", value: text.slice(i, j + 1) });
      i = j + 1;
      continue;
    }

    // Strings entre comillas dobles (nombres de columnas)
    if (text[i] === '"') {
      let j = i + 1;
      while (j < text.length && (text[j] !== '"' || text[j-1] === "\\")) j++;
      tokens.push({ type: "stringDouble", value: text.slice(i, j + 1) });
      i = j + 1;
      continue;
    }

    // Comentarios de línea
    if (text[i] === "-" && text[i + 1] === "-") {
      let j = i + 2;
      while (j < text.length && text[j] !== "\n") j++;
      tokens.push({ type: "comment", value: text.slice(i, j) });
      i = j;
      continue;
    }

    // Comentarios de bloque
    if (text[i] === "/" && text[i + 1] === "*") {
      let j = i + 2;
      while (j < text.length - 1 && !(text[j] === "*" && text[j + 1] === "/")) j++;
      tokens.push({ type: "comment", value: text.slice(i, j + 2) });
      i = j + 2;
      continue;
    }

    // Parámetros :param
    if (text[i] === ":") {
      const match = text.slice(i).match(/^:([a-zA-Z_][a-zA-Z0-9_]*)/);
      if (match) {
        tokens.push({ type: "param", value: match[0], paramName: match[1] });
        i += match[0].length;
        continue;
      }
    }

    // Números (solo si no están seguidos de comillas - evita colorear "300" en 300">"columna" sintaxis SAP HANA)
    if (/[0-9]/.test(text[i])) {
      let j = i;
      while (j < text.length && /[0-9.]/.test(text[j])) j++;
      // Si el número está seguido de comillas, tratarlo como identificador (sintaxis SAP HANA)
      const isPartOfIdentifier = text[j] === '"' || text[j] === "'";
      tokens.push({ type: isPartOfIdentifier ? "identifier" : "number", value: text.slice(i, j) });
      i = j;
      continue;
    }

    // Identificadores/palabras
    if (/[a-zA-Z_]/.test(text[i])) {
      let j = i;
      while (j < text.length && /[a-zA-Z0-9_]/.test(text[j])) j++;
      const word = text.slice(i, j);
      const isKeyword = keywordSet.has(word.toUpperCase());
      tokens.push({ type: isKeyword ? "keyword" : "identifier", value: word });
      i = j;
      continue;
    }

    // Cualquier otro caracter (espacios, operadores, puntuación)
    tokens.push({ type: "other", value: text[i] });
    i++;
  }

  return tokens;
};

/**
 * Aplica syntax highlighting a una query SQL usando tokenización
 * @param {string} sql - Query SQL
 * @param {Object} options - Opciones
 * @param {string} options.theme - 'light' o 'dark'
 * @param {Object} options.paramValues - Valores de parámetros para mostrar (ej: { company_id: '123' })
 * @returns {string} - HTML con highlighting
 */
export const highlightSQL = (sql, options = {}) => {
  if (!sql) return options.emptyText || "";

  const { theme = 'light', paramValues = {} } = options;
  const styles = SQL_THEMES[theme] || SQL_THEMES.light;

  const tokens = tokenizeSQL(sql);

  return tokens.map(token => {
    const escaped = escapeHtml(token.value);

    switch (token.type) {
      case "keyword":
        return `<span style="${styles.keyword}">${escaped}</span>`;
      case "string":
        return `<span style="${styles.string}">${escaped}</span>`;
      case "stringDouble":
        return `<span style="${styles.stringDouble}">${escaped}</span>`;
      case "comment":
        return `<span style="${styles.comment}">${escaped}</span>`;
      case "number":
        return `<span style="${styles.number}">${escaped}</span>`;
      case "param": {
        const paramName = token.paramName;
        const hasValue = paramValues && paramValues[paramName];
        if (hasValue) {
          return `<span style="${styles.paramWithValue}">${escaped} → '${escapeHtml(paramValues[paramName])}'</span>`;
        }
        return `<span style="${styles.param}">${escaped}</span>`;
      }
      default:
        return escaped;
    }
  }).join("");
};

/**
 * Formatea SQL con indentación
 * @param {string} sql - Query SQL
 * @returns {string} - Query formateada
 */
export const formatSQL = (sql) => {
  if (!sql) return "";

  // Palabras clave que deben ir en nueva línea
  const newLineKeywords = [
    "SELECT", "FROM", "WHERE", "AND", "OR", "GROUP BY", "ORDER BY",
    "HAVING", "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "OUTER JOIN",
    "LIMIT", "UNION"
  ];

  let formatted = sql.trim();

  // Agregar saltos de línea antes de keywords principales
  newLineKeywords.forEach((kw) => {
    const regex = new RegExp(`\\s+(${kw})\\b`, "gi");
    formatted = formatted.replace(regex, `\n$1`);
  });

  // Limpiar múltiples espacios
  formatted = formatted.replace(/  +/g, " ");

  // Agregar indentación después de SELECT, FROM, etc.
  const lines = formatted.split("\n");
  const indentedLines = lines.map((line, index) => {
    const trimmed = line.trim();
    if (index === 0) return trimmed;

    // Indentar líneas que no son keywords principales
    const startsWithKeyword = newLineKeywords.some(kw =>
      trimmed.toUpperCase().startsWith(kw)
    );

    if (!startsWithKeyword && trimmed.length > 0) {
      return "    " + trimmed;
    }
    return trimmed;
  });

  return indentedLines.join("\n");
};
