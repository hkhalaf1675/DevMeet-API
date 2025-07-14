import { Router } from "express";
import { register } from "../controllers/users.controller";
import { validate } from "../utils/joi";
import { registerSchema } from "../validations/user.validation";

const router = Router();

//#region register user
router.post('/register', validate(registerSchema), register);
//#endregion

export default router;