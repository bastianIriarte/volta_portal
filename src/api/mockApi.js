const USE_MOCK = true;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = (arr) => arr[rand(0, arr.length - 1)];
import {
    CURSOS
} from "../constants/catalogo";
const NOMBRES_APOD = ["Juan Pérez", "María López", "Ana Gutiérrez", "Pedro Sánchez", "Carla Romero", "Luis Fuentes", "Jaime Fuentes", "Martin Ramirez"];
const RUTS = ["12.345.678-5", "9.876.543-2", "21.334.556-1", "7.654.321-K", "19.876.543-3", "17.222.111-9", "17.222.111-1", "17.222.234-9", "27.222.234-9"];
const ALUM = ["Ignacio", "Valentina", "Martina", "Benjamín", "Sofía", "Matías", "Isidora", "Andres", "Mateo", "Fernando", "Abel"];
const phone = () => `9${rand(10000000,99999999)}`;

function makeApoderados() {
    return NOMBRES_APOD.map((n, i) => ({
        id: crypto.randomUUID(),
        nombre: n,
        rut: RUTS[i] || `11.111.11${i}-K`,
        email: n.toLowerCase().replace(/[^a-z]/g, ".") + "@mail.com",
        telefono: phone(),
        rol: pick(["apoderado", "agente", "admin"])
    }));
}


function makePostulaciones(apoderados, anio) {
    const xs = [];
    for (let i = 0; i < 12; i++) {
        const ap = pick(apoderados);
        const alumnoNombre = `${pick(ALUM)} ${String.fromCharCode(65+i)}`;
        xs.push({
            id: crypto.randomUUID(),
            alumnoNombre,
            alumnoRut: RUTS[rand(0, RUTS.length - 1)],
            alumnoNacimiento: `201${rand(2,6)}-0${rand(1,9)}-${rand(10,28)}`,
            alumnoGenero: pick(["Femenino", "Masculino", "No especifica"]),
            direccion: "Av. Siempre Viva 742",
            comuna: "Santiago",
            region: "RM",
            apoderadoNombre: ap.nombre,
            apoderadoRut: ap.rut,
            apoderadoEmail: ap.email,
            apoderadoTelefono: ap.telefono,
            colegioAnterior: "Colegio Demo",
            necesidades: "",
            curso: pick(CURSOS),
            anio,
            hermanos: rand(0, 2),
            matriculaTardia: Math.random() < .2,
            cuotas: pick([1, 3, 6, 10]),
            status: pick(["pending", "generado", "signed"])
        });
    }
    return xs;
}
export function makeContratos(posts) {
    return posts.slice(0, 3).map(p => ({
        id: crypto.randomUUID(),
        postulacionId: p.id,
        alumnoNombre: p.alumnoNombre,
        curso: p.curso,
        anio: p.anio,
        apoderadoNombre: p.apoderadoNombre,
        apoderadoEmail: p.apoderadoEmail,
        reglasAplicadas: [],
        fecha: new Date().toISOString().slice(0, 10),
        status: pick(["pending", "generado", "signed"])
    }));
}
export function makePagos(posts) {
    return posts.slice(0, 2).map(p => ({
        id: crypto.randomUUID(),
        postulacionId: p.id,
        total: rand(120000, 180000),
        status: pick(["pagado", "pendiente", "pagado"]),
        ts: new Date(Date.now() - rand(1, 5) * 86400000).toISOString()
    }));
}
export const api = {
    async getPeriodo() {
        if (!USE_MOCK) throw new Error("GET /periodo-activo");
        await sleep(rand(300, 800));
        const y = new Date().getFullYear();
        return {
            anio: y + 1,
            inicio: `${y}-10-01`,
            fin: `${y}-12-15`,
            activo: true
        };
    },
    async getReglas() {
        if (!USE_MOCK) throw new Error("GET /reglas");
        await sleep(rand(200, 700));
        return [{
            id: 1,
            nombre: "Descuento hermano",
            tipo: "porcentaje",
            valor: 10
        }, {
            id: 2,
            nombre: "Recargo matrícula tardía",
            tipo: "porcentaje",
            valor: 5
        }, {
            id: 3,
            nombre: "Cuota especial bienvenida",
            tipo: "monto",
            valor: 15000
        }];
    },
    async listApoderados() {
        if (!USE_MOCK) throw new Error("GET /apoderados");
        await sleep(rand(400, 900));
        return makeApoderados();
    },
    async listPostulaciones({
        anio
    }) {
        if (!USE_MOCK) throw new Error("GET /postulaciones?anio=" + anio);
        await sleep(rand(500, 1000));
        const aps = makeApoderados();
        return makePostulaciones(aps, anio);
    },
    async listCursos() {
        if (!USE_MOCK) throw new Error("GET /cursos");
        await sleep(rand(200, 600));
        return [{
                id: "prekinder",
                nombre: "Pre-Kínder"
            },
            {
                id: "kinder",
                nombre: "Kínder"
            },
            {
                id: "1b",
                nombre: "1° Básico"
            },
            {
                id: "2b",
                nombre: "2° Básico"
            },
            {
                id: "3b",
                nombre: "3° Básico"
            },
            {
                id: "4b",
                nombre: "4° Básico"
            },
            {
                id: "5b",
                nombre: "5° Básico"
            },
            {
                id: "6b",
                nombre: "6° Básico"
            },
            {
                id: "7b",
                nombre: "7° Básico"
            },
            {
                id: "8b",
                nombre: "8° Básico"
            },
            {
                id: "1m",
                nombre: "I° Medio"
            },
            {
                id: "2m",
                nombre: "II° Medio"
            },
            {
                id: "3m",
                nombre: "III° Medio"
            },
            {
                id: "4m",
                nombre: "IV° Medio"
            },
        ];
    }
};

// Datos dummy del contrato
export const contratoDummy = {
    id: "CONT-2025-001",
    numero: "2025001",
    anio: 2025,
    fechaCreacion: "2024-12-15",
    fechaModificacion: "2024-12-15T10:30:00Z",
    estado: "pendiente_pago",
    version: "1.2",

    configuracion: {
        permiteModificacionDatos: true,
        fechaLimitePago: "2025-02-28",
        fechaLimiteFirma: "2025-03-15",
        requiereFirmaApoderado: true,
        requiereFirmaSuplente: false,
    },

    apoderado: {
        nombre: "Juan Carlos Pérez González",
        rut: "11.111.111-1",
        email: "juan.perez@email.com",
        telefono: "+56 9 1111 1111",
        direccion: "Av. Providencia 1234, Depto 501",
        comuna: "Providencia",
        region: "Región Metropolitana",
        codigoPostal: "7500000",
        profesion: "Ingeniero Civil",
        lugarTrabajo: "Empresa Constructora ABC",

        suplente: {
            nombre: "María Elena González Sánchez",
            rut: "22.222.222-2",
            telefono: "+56 9 2222 2222",
            email: "maria.gonzalez@email.com",
            relacion: "Madre",
            direccion: "Av. Providencia 1234, Depto 501",
        },

        firmaDigital: {
            firmado: false,
            fechaFirma: null,
            ip: null,
            dispositivo: null,
            proveedor: "FirmaYa",
        },
    },

    alumnos: [{
            id: "a1",
            nombre: "Ignacio Andrés Pérez González",
            rut: "12.345.678-5",
            curso: "3° Básico",
            anio: 2025,
            fechaNacimiento: "2014-03-15",
            genero: "Masculino",

            religion: "SI",
            programaReligion: "CATÓLICO",
            correoInstitucional: "SI",
            transporte: "IDA Y VUELTA",
            almuerzo: "SI",
            necesidadesEspeciales: "",
            alergias: "Alergia a frutos secos (nueces, maní)",
            grupoSanguineo: "O+",
            contactoEmergencia: "María González - 9 2222 2222",

            conceptos: [{
                    id: "c1",
                    codigo: "CAL2025",
                    nombre: "CENTRO DE ALUMNOS 2025",
                    descripcion: "Cuota anual para actividades del Centro de Alumnos",
                    monto: 15000,
                    moneda: "CLP",
                    pagado: false,
                    obligatorio: false,
                    categoria: "servicios",
                    fechaVencimiento: "2025-03-31",
                },
                {
                    id: "c2",
                    codigo: "MAT2025B",
                    nombre: "MATRÍCULA PK A VIII BÁSICO",
                    descripcion: "Matrícula anual para niveles de educación básica",
                    monto: 264281,
                    moneda: "CLP",
                    pagado: true,
                    obligatorio: true,
                    categoria: "matricula",
                    fechaVencimiento: "2025-01-15",
                    fechaPago: "2024-12-10",
                    metodoPago: "Transferencia",
                    comprobante: "COMP-2024-1234",
                },
                {
                    id: "c3",
                    codigo: "SVA2025",
                    nombre: "SEG DE VIDA APODERADO 2025",
                    descripcion: "Seguro de vida para apoderados",
                    monto: 63813,
                    moneda: "CLP",
                    pagado: false,
                    obligatorio: false,
                    categoria: "servicios",
                    fechaVencimiento: "2025-02-28",
                },
                {
                    id: "c4",
                    codigo: "SC2025",
                    nombre: "SEGURO CLÍNICA 2025",
                    descripcion: "Seguro médico complementario",
                    monto: 35000,
                    moneda: "CLP",
                    pagado: false,
                    obligatorio: false,
                    categoria: "servicios",
                    fechaVencimiento: "2025-02-28",
                },
            ],
        },
        {
            id: "a2",
            nombre: "Valentina Sofía Pérez González",
            rut: "9.876.543-2",
            curso: "I° Medio",
            anio: 2025,
            fechaNacimiento: "2009-07-22",
            genero: "Femenino",

            religion: "NO",
            programaReligion: "NO LO CONSIDERA",
            correoInstitucional: "SI",
            transporte: "NO",
            almuerzo: "NO",
            necesidadesEspeciales: "Requiere lentes para leer",
            alergias: "Sin alergias conocidas",
            grupoSanguineo: "A+",
            contactoEmergencia: "Juan Pérez - 9 1111 1111",

            conceptos: [{
                    id: "c5",
                    codigo: "CAL2025",
                    nombre: "CENTRO DE ALUMNOS 2025",
                    descripcion: "Cuota anual para actividades del Centro de Alumnos",
                    monto: 15000,
                    moneda: "CLP",
                    pagado: false,
                    obligatorio: false,
                    categoria: "servicios",
                    fechaVencimiento: "2025-03-31",
                },
                {
                    id: "c6",
                    codigo: "MAT2025M",
                    nombre: "MATRÍCULA I° A IV° MEDIO",
                    descripcion: "Matrícula anual para educación media",
                    monto: 312450,
                    moneda: "CLP",
                    pagado: false,
                    obligatorio: true,
                    categoria: "matricula",
                    fechaVencimiento: "2025-01-15",
                },
                {
                    id: "c7",
                    codigo: "COL2025M",
                    nombre: "COLEGIATURA I° A IV° MEDIO",
                    descripcion: "Mensualidad de colegiatura (valor en UF)",
                    monto: 177.3,
                    moneda: "UF",
                    pagado: false,
                    obligatorio: true,
                    categoria: "colegiatura",
                    fechaVencimiento: "2025-03-01",
                    recurrente: "mensual",
                    valorUF: 36000,
                },
            ],
        },
    ],

    historial: [{
            id: "h1",
            fecha: "2024-12-15T09:00:00Z",
            tipo: "creacion",
            usuario: "sistema",
            descripcion: "Contrato creado automáticamente",
        },
        {
            id: "h2",
            fecha: "2024-12-10T14:30:00Z",
            tipo: "pago",
            usuario: "apoderado",
            descripcion: "Pago matrícula Ignacio - MATRÍCULA PK A VIII BÁSICO",
        },
    ],
};