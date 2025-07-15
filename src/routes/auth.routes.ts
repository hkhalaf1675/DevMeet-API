import { Router } from "express";
import { login, register } from "../controllers/users.controller";
import { validate } from "../utils/joi";
import { loginSchema, registerSchema } from "../validations/user.validation";

const router = Router();

router.post('/register', validate(registerSchema), register);

router.post('/login', validate(loginSchema), login);

export default router;