import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

const globalErrorHandler = async (
    err: Error,
    req: Request, 
    res: Response, 
    next: NextFunction
) => {
    if(err) {
        console.error(err);
        try {
            
            let error:any = err;
            if(err instanceof TypeError) {
                error = { message: err.message, stack: err.stack };
            }
            await prisma.errorLogs.create({
                data: {
                    error
                }
            });
        } catch (error) {
            console.error('Error while handling error:', error);
        }
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            errors: ['Something went wrong']
        });
    }
    next(err);
}

export default globalErrorHandler;