// Utilidades
export const normalizarRut = (rut) => (rut || "").replace(/\./g, "").replace(/-/g, "").toUpperCase();

export function validarRut(rut) {
  const r = normalizarRut(rut);
  if (!r || r.length < 2) return false;
  const cuerpo = r.slice(0, -1);
  const dv = r.slice(-1);
  let suma = 0, multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }
  const dvr = 11 - (suma % 11);
  const dvCalc = dvr === 11 ? "0" : dvr === 10 ? "K" : String(dvr);
  return dvCalc === dv;
}

export function formatearRut(rut) {
  const limpio = normalizarRut(rut);
  if (!limpio) return "";
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  return cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "-" + dv;
}