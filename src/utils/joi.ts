import { NextFunction, Request, Response } from "express";
import { ObjectSchema } from "joi";

export const validate = (schema: ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if(!req.body || Object.keys(req.body).length === 0) {
            return res.status(422).json({
                success: false,
                message: 'Validation Error',
                errors: ['Request body is required']
            });
        }
        const { error, value }  = schema.validate(req.body, {
            abortEarly: false,
            allowUnknown: false,
            stripUnknown: true
        });

        if(error) {
            return res.status(422).json({
                success: false,
                message: 'Validation Error',
                errors: error.details.map(detail => detail.message)
            });
        }

        req.body = value;
        next();
    }
}