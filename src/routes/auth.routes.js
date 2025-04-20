// auth.routes.js
import { Router } from "express";
import {
  login,
  register,
  logout,
  profile,
  verifyToken,
} from "../controllers/auth.controller.js";
import { authRequired } from "../middlewares/validateToken.js";
import { validateShema } from "../middlewares/validator.widdlewares.js";
import { registrarSchema, loginSchema } from "../schemas/auth.schema.js";

const router = Router();

router.post("/register", validateShema(registrarSchema), register);

router.post("/login", validateShema(loginSchema), login);
router.post("/logout", logout);
router.get("/verify", verifyToken);
router.get("/profile", authRequired, profile);

export default router;
