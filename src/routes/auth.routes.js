import { Router } from "express";
import { registerAuthRoutes } from "../controllers/auth.controller.js";
const router = Router();
registerAuthRoutes(router);
export default router;
