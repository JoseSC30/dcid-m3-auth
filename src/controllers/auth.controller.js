import {
  findUserByEmail,
  findPublicUser,
} from "../repositories/user.repository.js";
import { validateRegistration } from "../models/user.model.js";
import { run, db } from "../config/database.js";
import { auth, internal } from "../middleware/auth.middleware.js";
import { call } from "../services/http.service.js";
import { log } from "../utils/logger.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
export function registerAuthRoutes(router) {
  router.post("/auth/register", async (req, res, next) => {
    try {
      const { nombre, correo, password, rol = "cliente" } = req.body;
      if (
        !nombre ||
        !correo ||
        !password ||
        password.length < 8 ||
        !["cliente", "organizador", "portero"].includes(rol)
      )
        return res
          .status(400)
          .json({ error: "Datos inválidos (contraseña mínimo 8 caracteres)" });
      validateRegistration({ nombre, correo, password, rol });
      const hash = await bcrypt.hash(password, 10);
      const x = await run(
        "INSERT INTO users(nombre,correo,password_hash,rol) VALUES($1,$2,$3,$4) RETURNING id,nombre,correo,rol",
        [nombre, correo.toLowerCase(), hash, rol],
      );
      res.status(201).json(x.rows[0]);
    } catch (e) {
      if (e.code === "23505")
        return res.status(409).json({ error: "Correo ya registrado" });
      next(e);
    }
  });
  router.post("/auth/login", async (req, res, next) => {
    try {
      const u = await findUserByEmail(
        String(req.body.correo || "").toLowerCase(),
      );
      if (
        !u ||
        !(await bcrypt.compare(req.body.password || "", u.password_hash))
      )
        return res.status(401).json({ error: "Credenciales incorrectas" });
      res.json({
        token: jwt.sign({ id: u.id, rol: u.rol }, process.env.JWT_SECRET, {
          expiresIn: "8h",
          algorithm: "HS256",
        }),
        usuario: { id: u.id, nombre: u.nombre, correo: u.correo, rol: u.rol },
      });
    } catch (e) {
      next(e);
    }
  });
  router.get("/auth/me", auth(), async (req, res, next) => {
    try {
      res.json(await findPublicUser(req.user.id));
    } catch (e) {
      next(e);
    }
  });
}
