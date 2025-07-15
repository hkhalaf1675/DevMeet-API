import { Router } from "express";
import { authGuard } from "../middlewares/auth.guard";
import { validate } from "../utils/joi";
import { updateProfileSchema, userPassword } from "../validations/user.validation";
import { deleteUser, getManyUsers, getProfile, updateProfile } from "../controllers/users.controller";

const router = Router();
router.use(authGuard);

router.put('/update', validate(updateProfileSchema), updateProfile);

router.get('/my-profile', getProfile);

router.get('/', getManyUsers);

router.delete('/my-account', validate(userPassword), deleteUser);

export default router;