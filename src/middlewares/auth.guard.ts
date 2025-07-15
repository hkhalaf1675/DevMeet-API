import { NextFunction, Request, Response } from "express";
import { verifyJwtToken } from "../utils/jwt";
import prisma from "../lib/prisma";

export const authGuard = async(req: Request, res: Response, next: NextFunction) => {
    try {
        let token: string | undefined;
        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if(!token) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized User',
                errors: ['Token is required']
            });
        }

        const decoded = verifyJwtToken(token);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });
        
        if(!user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized User',
                errors: ['The user belonging to this token no longer exists']
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth Guard Error: ', error);

        return res.status(401).json({
            success: false,
            message: 'Unauthorized User',
            errors: ['Token is invalid or expired']
        });
    }
}