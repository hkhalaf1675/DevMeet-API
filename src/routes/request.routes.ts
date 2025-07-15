import { Router } from "express";
import { authGuard } from "../middlewares/auth.guard";
import { validate } from "../utils/joi";
import { createRequestSchema, updateRequestStatusSchema } from "../validations/request.validation";
import { createRequest, getMyRequests, getRequestById, getUpcomingSlotRequests, updateRequestStatus } from "../controllers/requests.controller";

const router = Router();
router.use(authGuard);

router.post('/add-request', validate(createRequestSchema), createRequest);

router.get('/my-requests', getMyRequests);

router.get('/upcoming-slots-requests', getUpcomingSlotRequests);

router.get('/:id', getRequestById);

router.put('/:id/change-status', validate(updateRequestStatusSchema), updateRequestStatus);

export default router;