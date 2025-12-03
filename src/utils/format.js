export const CLP=(n)=> new Intl.NumberFormat("es-CL",{style:"currency",currency:"CLP"}).format(n||0);
export const cls=(...xs)=> xs.filter(Boolean).join(" ");