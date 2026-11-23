import { run } from "../config/database.js";
export async function findUserByEmail(correo) {
  return (
    (await run("SELECT * FROM users WHERE correo=$1", [correo])).rows[0] || null
  );
}
export async function findPublicUser(id) {
  return (
    (await run("SELECT id,nombre,correo,rol FROM users WHERE id=$1", [id]))
      .rows[0] || null
  );
}
