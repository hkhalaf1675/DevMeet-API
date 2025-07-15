import { Router } from "express";
import { cancelSlot, createSlot, getManySlots, getMySlots, getSLotById, updateSlot } from "../controllers/slots.controller";
import { validate } from "../utils/joi";
import { createSlotSchema, updateSlotSchema } from "../validations/slot.validation";
import { authGuard } from "../middlewares/auth.guard";

const router = Router();
router.use(authGuard)

router.post('/', validate(createSlotSchema), createSlot);

router.get('/me', getMySlots);

router.get('/', getManySlots);

router.get('/:id', getSLotById);

router.put('/:id', validate(updateSlotSchema), updateSlot);

router.delete('/:id', cancelSlot);

export default router;