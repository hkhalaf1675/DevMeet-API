import { RequestStatus } from "@prisma/client";
import Joi from "joi";

export const createRequestSchema = Joi.object({
    slotId: Joi.number().required()
});

export const updateRequestStatusSchema = Joi.object({
    status: Joi.string().valid(...Object.values(RequestStatus)).required()
});