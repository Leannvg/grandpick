import * as yup from "yup";

/* =====================
   🔹 AUTH
===================== */

export const loginSchema = yup.object({
  email: yup.string()
    .required("El email es requerido")
    .email("El email no es válido"),
  password: yup.string()
    .required("La contraseña es requerida")
    .min(6, "Debe tener al menos 6 caracteres"),
}).noUnknown();


export const registerSchema = yup.object({
  name: yup.string()
    .required("El nombre es requerido")
    .max(50, "Máximo 50 caracteres"),
  last_name: yup.string()
    .required("El apellido es requerido")
    .max(50, "Máximo 50 caracteres"),
  country: yup.string()
    .required("El país es requerido"),
  email: yup.string()
    .required("El email es requerido")
    .email("El email no es válido"),
  password: yup.string()
    .required("La contraseña es requerida")
    .min(6, "Debe tener al menos 6 caracteres"),
}).noUnknown();


/* =====================
   🔹 TEAMS
===================== */

export const teamSchema = yup.object({
  name: yup.string()
    .required("El nombre corto es requerido")
    .max(50, "Máximo 50 caracteres"),
  full_team_name: yup.string()
    .required("El nombre completo es requerido")
    .max(100, "Máximo 100 caracteres"),
  chief: yup.string()
    .required("El director es requerido")
    .max(80, "Máximo 80 caracteres"),
  power_unit: yup.string()
    .required("La unidad de potencia es requerida")
    .max(80, "Máximo 80 caracteres"),
  world_championships: yup.number()
    .typeError("Debe ser un número")
    .min(0, "No puede ser negativo")
    .required("Indica la cantidad de campeonatos"),
  country: yup.string()
    .required("El país es requerido"),
  city: yup.string()
    .required("La ciudad es requerida"),
  color: yup.string()
    .matches(/^#([0-9A-F]{3}){1,2}$/i, "Debe ser un color HEX válido")
    .required("El color es requerido"),
  logo: yup
    .string()
    .required("La imagen de logo es requerida"),
  isologo: yup
    .string()
    .required("La imagen de isologo requerida"),
}).noUnknown();


/* =====================
   🔹 DRIVERS
===================== */

export const driverSchema = yup.object({
  full_name: yup.string()
    .required("El nombre completo es requerido")
    .max(80, "Máximo 80 caracteres"),
  trigram: yup.string()
    .required("El trigrama es requerido")
    .length(3, "Debe tener exactamente 3 letras"),
  country: yup.string()
    .required("La nacionalidad es requerida"),
  number: yup.number()
    .typeError("Debe ser un número")
    .min(1, "El número debe ser mayor que 0")
    .max(99, "El número no puede ser mayor a 99")
    .required("El número es requerido"),
  img: yup.string()
    .required("La imagen es requerida"),
}).noUnknown();


/* =====================
   🔹 CIRCUITS
===================== */

export const circuitSchema = yup.object({
  circuit_name: yup.string()
    .required("El nombre del circuito es requerido")
    .max(100, "Máximo 100 caracteres"),
  gp_name: yup.string()
    .required("El nombre del GP es requerido")
    .max(100, "Máximo 100 caracteres"),
  length: yup.number()
    .typeError("Debe ser un número")
    .positive("Debe ser un valor positivo")
    .required("La longitud es requerida"),
  laps: yup.number()
    .typeError("Debe ser un número")
    .min(1, "Debe tener al menos una vuelta")
    .required("El número de vueltas es requerido"),
  description: yup.string()
    .required("La descripción es requerida")
    .max(500, "Máximo 500 caracteres"),
  country: yup.string()
    .required("El país es requerido"),
  city: yup.string()
    .required("La ciudad es requerida"),
  timezone: yup.string()
    .required("El timezone es requerido"),
  img: yup
    .string()
    .required("La imagen es requerida"),
}).noUnknown();


/* =====================
   🔹 RACES
===================== */

export const raceSchema = yup.object({
  type: yup.string().required("El tipo de carrera es requerido"),
  enabled: yup.boolean().default(false),
  id_circuit: yup.string().required("El circuito es requerido"),
  date_gp_start: yup
    .date()
    .typeError("Fecha inválida")
    .required("La fecha de inicio del GP es requerida"),
  date_gp_end: yup
    .date()
    .typeError("Fecha inválida")
    .required("La fecha de fin del GP es requerida"),
  date_race: yup
    .date()
    .nullable()
    .when("enabled", {
      is: true,
      then: (schema) =>
        schema
          .required("La fecha de la carrera es requerida")
          .typeError("Fecha inválida"),
      otherwise: (schema) => schema.nullable(),
    }),
  points_system: yup.string().required("El sistema de puntos es requerido"),
  state: yup.string().default("Pendiente"),
  date: yup.string().required("La fecha es requerida"),
  time: yup.string().required("La hora es requerida"),
});


/* =====================
   🔹 EDITAR PASSWORD
===================== */

export const updateSecuritySchema = yup.object({
  oldPassword: yup.string()
    .required("La contraseña actual es obligatoria"),
  newPassword: yup.string()
  .required("La nueva contraseña es requerida")
    .min(6, "La nueva contraseña debe tener al menos 6 caracteres")
}).noUnknown();



/* =====================
   🔹 EDITAR PERFIL
===================== */

export const profileDataSchema = yup.object({
  name: yup.string()
    .required("El nombre es requerido")
    .max(50, "Máximo 50 caracteres"),
  last_name: yup.string()
    .required("El apellido es requerido")
    .max(50, "Máximo 50 caracteres"),
  country: yup.string()
    .required("El país es requerido"),
  email: yup.string()
    .required("El email es requerido")
    .email("El email no es válido"),
}).noUnknown();
