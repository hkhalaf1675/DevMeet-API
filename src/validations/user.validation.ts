import Joi from "joi";

export const registerSchema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    nationality: Joi.string().optional(),
    spokenLanguages: Joi.array().items(Joi.string()).optional()
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

export const updateProfileSchema = Joi.object({
    name: Joi.string().optional(),
    nationality: Joi.string().optional(),
    spokenLanguages: Joi.array().items(Joi.string()).optional()
});

export const userPassword = Joi.object({
    password: Joi.string().required()
});