export const revisarDigito = (dvr) => {
    const validDigits = ['0','1','2','3','4','5','6','7','8','9','k','K'];
    return validDigits.includes(String(dvr));
  };
  
  export const revisarDigito2 = (crut) => {
    // crut es el RUT limpio, sin separadores
    const largo = crut.length;
    if (largo < 2) return false;
    
    // Separa la parte numérica y el dígito verificador
    const rut = crut.slice(0, largo - 1);
    const dvInput = crut.slice(-1).toLowerCase();
    
    let suma = 0;
    let mul = 2;
    
    // Recorre el RUT de derecha a izquierda
    for (let i = rut.length - 1; i >= 0; i--) {
      suma += parseInt(rut.charAt(i)) * mul;
      mul = (mul === 7) ? 2 : mul + 1;
    }
    
    const res = suma % 11;
    let dvComputed;
    if (res === 1) {
      dvComputed = 'k';
    } else if (res === 0) {
      dvComputed = '0';
    } else {
      dvComputed = String(11 - res);
    }
    
    return dvComputed === dvInput;
  };
  
  export const formatRut = (rut) => {
    // Asumiendo que "rut" es la cadena limpia (sin puntos ni guiones)
    if (!rut || rut.length < 2) return rut;
    const numberPart = rut.slice(0, -1);
    const dv = rut.slice(-1).toUpperCase();
    let formatted = '';
    let count = 0;
    for (let i = numberPart.length - 1; i >= 0; i--) {
      formatted = numberPart[i] + formatted;
      count++;
      if (count === 3 && i !== 0) {
        formatted = '.' + formatted;
        count = 0;
      }
    }
    return formatted + '-' + dv;
  };
  
  const Rut = (texto) => {
    if(texto == "" || texto == null || texto == "undefined") {
       return {
        validate: true,
        invertido: "",
      };
    }
    // Limpia el texto: elimina espacios, puntos y guiones
    const cleaned = texto.replace(/[.\s-]/g, '');
    if (cleaned.length < 2) {
      return {
        validate: false,
        invertido: "",
      };
    }
  
    // Verifica que cada caracter sea válido
    for (let char of cleaned) {
      if (!revisarDigito(char)) {
        return {
          validate: false,
          invertido: "",
        };
      }
    }
  
    const isValid = revisarDigito2(cleaned);
    const formattedRut = formatRut(cleaned);
    return {
      validate: isValid,
      invertido: formattedRut.toUpperCase(),
    };
  };
  
  export default Rut;
  