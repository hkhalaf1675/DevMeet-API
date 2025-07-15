import { SlotStatus } from "@prisma/client";
import Joi from "joi";

export const createSlotSchema = Joi.object({
    topic: Joi.string().required(),
    startTime: Joi.date().iso().min('now').required().messages({'date.min': 'Start time must be in the future'}),
    endTime: Joi.date().iso().greater(Joi.ref('startTime')).required().messages({'date.greater': 'End time must be after start time'}),
    description: Joi.string().optional(),
    location: Joi.string().optional()
});

export const updateSlotSchema = Joi.object({
    topic: Joi.string().optional(),
    startTime: Joi.date().iso().min('now').optional().messages({'date.min': 'Start time must be in the future'}),
    endTime: Joi.date().iso().when(
        'startTime', {
            is: Joi.exist(),
            then: Joi.date().greater(Joi.ref('startTime')).messages({'date.greater': 'End time must be after start time'}),
            otherwise: Joi.date()
        }
    ).optional(),
    description: Joi.string().optional(),
    location: Joi.string().optional(),
    status: Joi.string().valid(...Object.values(SlotStatus)).optional()
});