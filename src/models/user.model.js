export const ROLES = Object.freeze(["cliente", "organizador", "portero"]);
export function validateRegistration({
  nombre,
  correo,
  password,
  rol = "cliente",
} = {}) {
  if (typeof nombre !== "string" || nombre.trim().length < 2)
    throw new Error("Nombre inválido");
  if (typeof correo !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo))
    throw new Error("Correo inválido");
  if (typeof password !== "string" || password.length < 8)
    throw new Error("Contraseña mínimo 8 caracteres");
  if (!ROLES.includes(rol)) throw new Error("Rol inválido");
  return {
    nombre: nombre.trim(),
    correo: correo.trim().toLowerCase(),
    password,
    rol,
  };
}
