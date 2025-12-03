import Rut from "./rutValidator";

export const validateField = (
  value_data,
  type_data = "text",
  require = true,
  msg = "Campo Obligatorio"
) => {
  // Solo validamos contenido si no está vacío
  if (value_data !== "") {
    let value_data_number = 0;

    switch (type_data) {
      case "text_min":
        value_data = value_data.trim();
        if (value_data.length < 3) {
          return {
            validate: false,
            msg: "El largo Mínimo de 3 Caracteres",
          };
        }
        if (value_data.length > 254) {
          return {
            validate: false,
            msg: "Supera largo máximo permitido",
          };
        }
        return {
          validate: true,
          msg: null,
        };

      case "text_min_description":
        value_data = value_data.trim();
        if (value_data.length < 3) {
          return {
            validate: false,
            msg: "El largo Mínimo de 3 Caracteres",
          };
        }
        return {
          validate: true,
          msg: null,
        };

      case "names":
        // notNumber y trim
        value_data = value_data != null ? value_data.toString() : "";
        value_data = notNumber(value_data).trim();
        if (value_data.length < 3) {
          return {
            validate: false,
            msg: "El largo Mínimo de 3 Caracteres",
            value_data,
          };
        }
        if (value_data.length > 254) {
          return {
            validate: false,
            msg: "Supera largo máximo permitido",
            value_data,
          };
        }
        return {
          validate: true,
          msg: null,
          value_data,
        };

      case "money":
        value_data = value_data.toString().trim();
        value_data_number = OnlyNumbers(value_data.toString());
        if (value_data_number.length == 0 && require == false) {
          return {
            validate: true,
            msg: null,
            value_data: value_data_number,
          };
        }
        if (value_data_number < 0) {
          return {
            validate: false,
            msg: "El valor mínimo debe ser 0",
            value_data: value_data_number,
          };
        }
        if (value_data.length > 11) {
          return {
            validate: false,
            msg: "Supera largo máximo permitido",
          };
        }
        return {
          validate: true,
          msg: null,
          value_data: formatMoney(value_data_number),
        };

      case "money_min":
        value_data = value_data.toString().trim();
        value_data_number = OnlyNumbers(value_data.toString());
        if (value_data_number.length == 0 && require == false) {
          return {
            validate: true,
            msg: null,
            value_data: value_data_number,
          };
        }
        if (value_data_number < 1) {
          return {
            validate: false,
            msg: "El valor mínimo debe ser 1",
            value_data: value_data_number,
          };
        }
        if (value_data.length > 11) {
          return {
            validate: false,
            msg: "Supera largo máximo permitido",
          };
        }
        return {
          validate: true,
          msg: null,
          value_data: formatMoney(value_data_number),
        };

      case "number":
        value_data_number = OnlyNumbers(value_data);
        if (value_data && value_data.length > 11) {
          return {
            validate: false,
            msg: "Supera largo máximo permitido",
          };
        }
        return {
          validate: true,
          msg: null,
          value_data: formatNumber(value_data_number),
        };

      case "only_number":
        value_data_number = OnlyNumbers(value_data.toString());
        if (value_data.length > 11) {
          return {
            validate: false,
            msg: "Supera largo máximo permitido",
          };
        }
        return {
          validate: true,
          msg: null,
          value_data: value_data_number,
        };

      case "any_number":
        value_data_number = AnyNumber(value_data.toString());
        if (value_data.length > 11) {
          return {
            validate: false,
            msg: "Supera largo máximo permitido",
          };
        }
        return {
          validate: true,
          msg: null,
          value_data: value_data_number,
        };
      case "only_number_positive":
        value_data_number = OnlyNumbers(value_data.toString());
        if (value_data.length > 11) {
          return {
            validate: false,
            msg: "Supera largo máximo permitido",
          };
        }
        console.log(value_data_number);
        if (parseInt(value_data_number) < 0) {
          return {
            validate: false,
            msg: "El valor debe ser mayor o igual a 0",
          };
        }
        return {
          validate: true,
          msg: null,
          value_data: value_data_number,
        };
      case "only_number_positive_min":
        value_data_number = OnlyNumbers(value_data.toString());
        if (value_data.length > 11) {
          return {
            validate: false,
            msg: "Supera largo máximo permitido",
          };
        }
        console.log(value_data_number);
        if (parseInt(value_data_number) <= 0) {
          return {
            validate: false,
            msg: "El valor debe ser mayor o igual a 1",
          };
        }
        return {
          validate: true,
          msg: null,
          value_data: value_data_number,
        };

      case "decimal":
        // Limpieza básica - Asegurarse de que value_data sea una cadena
        value_data =
          value_data !== null && value_data !== undefined
            ? String(value_data)
            : "";
        value_data = value_data.trim();
        value_data = formateaDecimal(value_data);
        if (parseFloat(value_data) < 0) {
          return {
            validate: false,
            msg: "El valor debe ser mayor o igual a 0",
          };
        }
        if (value_data.length > 11) {
          return {
            validate: false,
            msg: "Supera largo máximo permitido",
          };
        }
        return {
          validate: true,
          msg: null,
          value_data,
        };

      case "mobile":
        let number = OnlyNumbers(value_data.toString());
        let cel = checkNumero(number);
        let celval = formatMobile(cel);
        console.log(cel);
        console.log(cel.length);
        console.log(celval);
        if (celval === false || cel.length > 12) {
          return {
            validate: false,
            msg: "N° Incorrecto. Ej: +5691234XXXX",
            value_data: cel,
          };
        }
        return {
          validate: true,
          msg: null,
          value_data: cel,
        };

      case "phone":
        if (value_data.length > 8) {
          return {
            validate: false,
            msg: "N° Incorrecto. Ej: 22531XXXX",
            value_data: OnlyNumbers(value_data.toString()),
          };
        }
        return {
          validate: true,
          msg: null,
          value_data: OnlyNumbers(value_data.toString()),
        };

      case "rut": {
        const result = Rut(value_data);
        // Si no es válido o es inferior a 1.000.000, retorna de inmediato
        if (!result.validate || result.length < 10) {
          return {
            validate: false,
            msg: "Formato de Rut Inválido",
            value_data: result.invertido || value_data,
          };
        }

        if (
          [
            // "11.111.111-1",
            // "22.222.222-2",
            // "33.333.333-3",
            // "44.444.444-4",
            // "55.555.555-5",
            // "66.666.666-6",
            // "77.777.777-7",
            // "88.888.888-8",
            // "99.999.999-9",
          ].includes(result.invertido)
        ) {
          return {
            validate: false,
            msg: "Rut no permitido",
            value_data: result.invertido,
          };
        }

        // Retorna la versión formateada de la función 'Rut'
        return {
          validate: true,
          msg: null,
          value_data: result.invertido, // <- Esta ya viene con puntos y guion correctos
        };
      }

      case "status":
        // Aquí se revisa que NO sea ni 1 ni 0
        if (parseInt(value_data) !== 1 && parseInt(value_data) !== 0) {
          return {
            validate: false,
            msg: "Seleccione opción Válida",
          };
        }
        return {
          validate: true,
          msg: null,
        };

      case "select":
        if (value_data == "") {
          return {
            validate: false,
            msg,
          };
        }
        return {
          validate: true,
          msg: null,
        };

      case "url":
        if (value_data.length === 0) {
          return {
            validate: false,
            msg,
          };
        }
        // urlVal(...) debería devolver true si la URL es inválida
        if (!urlVal(value_data)) {
          return {
            validate: false,
            msg: "Ingrese una url válida",
          };
        }
        return {
          validate: true,
          msg: null,
        };

      case "date": {
        // Verifica formato exacto yyyy-mm-dd

        const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
        if (!regex.test(value_data)) {
          return {
            validate: false,
            msg: "Formato de fecha inválido",
          };
        }

        const [year, month, day] = value_data.split("-").map(Number);
        const date = new Date(year, month - 1, day);

        if (
          date.getFullYear() !== year ||
          date.getMonth() + 1 !== month ||
          date.getDate() !== day
        ) {
          return {
            validate: false,
            msg: "Fecha inválida",
          };
        }

        return {
          validate: true,
          msg: null,
        };
      }

      case "email":
        if (!IsEmail(value_data)) {
          return {
            validate: false,
            msg: "Ingrese un email válido",
          };
        }
        return {
          validate: true,
          msg: null,
        };
      case "color":
        if (!IsColor(value_data)) {
          return {
            validate: false,
            msg: "Seleccione un valor válido",
          };
        }
        return {
          validate: true,
          msg: null,
        };

      default:
        if (value_data.length === 0) {
          return {
            validate: false,
            msg,
          };
        }
        return {
          validate: true,
          msg: null,
        };
    }
  }

  // Si está vacío y es requerido
  if (require) {
    return {
      validate: false,
      msg,
      value_data,
    };
  }

  // Si no es requerido y está vacío
  return {
    validate: true,
    msg: null,
    value_data,
  };
};

export const IsEmail = (email) => {
  let regex =
    /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  if (!regex.test(email)) {
    return false;
  } else {
    return true;
  }
};

export const IsColor = (color) => {
  let regex = /^#([0-9A-F]{6})$/;
  if (!/^#([0-9A-F]{6})$/i.test(color)) {
    return false;
  } else {
    return true;
  }
};

export const formatNumber = (costo) => {
  costo = costo.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  costo = "" + costo;
  return costo;
};

export const formatMoney = (costo) => {
  if (costo == null) {
    costo = "0";
  }
  costo = costo.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  costo = "$" + costo;
  return costo;
};

export const formateaDecimal = (valor) => {
  if (valor == null || valor === "") {
    return "0.00"; // Valor por defecto si está vacío
  }

  // Remueve cualquier carácter no numérico ni punto decimal
  valor = valor.replace(/[^\d.]/g, "");

  // Asegura que solo tenga un punto decimal y lo limita a 2 decimales
  let partes = valor.split(".");
  partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, "."); // Formateo de miles
  if (partes[1] != null) {
    partes[1] = partes[1].substring(0, 2); // Limitar a dos decimales
  }

  return partes.join("."); // Reunir las partes de nuevo
};

export const OnlyNumbers = (number) => {
  if (!number) {
    return "";
  }
  number = number.toString();
  number = number.replace(/[^0-9+]/g, "");
  return number;
};

export const AnyNumber = (number) => {
  if (!number) {
    return "";
  }
  // Permitir solo un signo negativo al principio y dígitos del 0-9
  number = number.replace(/(?!^-)[^0-9]/g, "");
  return number;
};

export const formatMobile = (phone) => {
  phone = phone.split(" ").join("");
  if (!/\+569\d{8}/.test(phone)) {
    return false;
  }
  return true;
};

export const checkNumero = (numero) => {
  if (numero.length == 0) {
    return numero;
  } else if (numero.length < 4) {
    numero = "+569";
  }

  // Si ya comienza con +569 y el resto tiene 8 dígitos
  if (/^\+569\d{8}$/.test(numero)) {
    return numero;
  }

  // Si empieza con 9 y tiene 9 dígitos en total
  if (/^9\d{8}$/.test(numero)) {
    return "+56" + numero;
  }

  // Si tiene solo 8 dígitos (faltando el 9 inicial)
  if (/^\d{8}$/.test(numero)) {
    return "+569" + numero;
  }

  // Si ya empieza con +56 pero el resto no es válido
  if (/^\+56\d+$/.test(numero)) {
    // Aseguramos que tenga 11 caracteres en total
    if (numero.length === 12) return numero;
  }
  return numero;
};

export const notNumber = (string) => {
  string = string.toString();
  string = string.replace(/[^a-zA-ZñÑáÁéÉíÍóÓúÚ\s]/g, "");
  return string;
};

export const isValidDate = (dateString) => {
  // Valida el formato con regex dd-mm-yyyy
  const regex = /^(\d{2})-(\d{2})-(\d{4})$/;
  const match = dateString.match(regex);

  if (!match) return false;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1; // JS usa 0-index en meses
  const year = parseInt(match[3], 10);

  const dateObj = new Date(year, month, day);

  // Verificamos que coincida
  return (
    dateObj.getFullYear() === year &&
    dateObj.getMonth() === month &&
    dateObj.getDate() === day
  );
};

export const urlVal = (url) => {
  let regex =
    /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[\/?#]\S*)?$/i;
  if (!regex.test(url)) {
    return false;
  } else {
    return true;
  }
};

export const formatRut = (rut) => {
  // Elimina puntos, guiones y espacios
  rut = rut.replace(/[\.\-\s]/g, "");

  // Si el rut es muy corto, lo retorna tal cual
  if (rut.length < 2) {
    return rut;
  }

  // Separa el cuerpo y el dígito verificador
  let cuerpo = rut.slice(0, -1);
  let dv = rut.slice(-1).toUpperCase();

  // Inserta los puntos como separadores de miles
  let rutFormateado = "";
  while (cuerpo.length > 3) {
    rutFormateado = "." + cuerpo.slice(-3) + rutFormateado;
    cuerpo = cuerpo.slice(0, -3);
  }
  rutFormateado = cuerpo + rutFormateado;

  // Agrega el guion y el dígito verificador
  return rutFormateado + "-" + dv;
};

export const validatePassword = (texto, msg = "Campo Obligatorio") => {
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_@]).{8,}$/;
  let errorField = [];
  if (!passwordPattern.test(texto)) {
    if (texto.length < 8)
      errorField.push("La contraseña debe tener al menos 8 caracteres.");
    if (!/[A-Z]/.test(texto))
      errorField.push("La contraseña debe tener al menos una letra mayúscula.");
    if (!/[a-z]/.test(texto))
      errorField.push("La contraseña debe tener al menos una letra minúscula.");
    if (!/\d/.test(texto))
      errorField.push("La contraseña debe tener al menos un número.");
    if (!/[\W_]/.test(texto))
      errorField.push(
        "La contraseña debe tener al menos un carácter especial."
      );
    return {
      validate: false,
      msg: texto.length == 0 ? msg : "Contraseña inválida",
      dataError: errorField,
    };
  }

  return {
    validate: true,
    msg: null,
    dataError: null,
  };
};

export const sanitizeSQLQuery = (query) => {
  const cleanedQuery = query
    //   .replace(/\s+/g, ' ')
    .replace(/^\s+|\s+$/g, "")
    .replace(/;/g, "");
  return cleanedQuery;
};

export const containsSQLComments = (query) => {
  // Busca comentarios de línea (--) o en bloque (/* ... */)
  const lineComments = /--/;
  const blockComments = /\/\*[\s\S]*?\*\//;
  return lineComments.test(query) || blockComments.test(query);
};

export function validatePasswordReact(password, compare = null) {
  const messages = [];
  const requiredMsg = "La contraseña es obligatoria.";

  if (!password) {
    return {
      isValid: false,
      messages: [requiredMsg],
    };
  }

  if (password.length < 8)
    messages.push("La contraseña debe tener al menos 8 caracteres.");
  if (!/[A-Z]/.test(password))
    messages.push("La contraseña debe tener al menos una letra mayúscula.");
  if (!/\d/.test(password))
    messages.push("La contraseña debe tener al menos un número.");
  if (!/[\W_]/.test(password))
    messages.push("La contraseña debe tener al menos un carácter especial.");

  if (compare !== null && password !== compare) {
    messages.push("Las contraseñas no coinciden.");
  }

  return {
    isValid: messages.length === 0,
    messages,
  };
}

export default validateField;
