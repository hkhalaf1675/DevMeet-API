import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { compareText, hashText } from "../utils/bcrypt";
import { createJwtToken } from "../utils/jwt";

export const register = async(req: Request, res: Response) => {
    const { name, email, password, nationality, spokenLanguages = [] } = req.body;

    const oldUserWithSameEmail = await prisma.user.findUnique({
        where: { email }
    });

    if(oldUserWithSameEmail) {
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: ['There is already a user with this email address']
        });
    }

    const hashedPassword = await hashText(password);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            nationality,
            spokenLanguages
        },
        select: {
            id: true,
            name: true,
            email: true,
            nationality: true,
            spokenLanguages: true
        }
    });

    const token = createJwtToken({ userId: user.id, email: user.email });

    return res.status(200).json({
        success: true,
        message: 'You have been registered successfully',
        data: { user, token }
    });
}

export const login = async(req: Request, res: Response) => {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            id: true,
            email: true,
            password: true
        }
    });

    if(!user) {
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: ['Invalid email or password']
        });
    }

    const isPasswordValid = await compareText(password, user.password);
    if(!isPasswordValid) {
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: ['Invalid email or password']
        });
    }

    const token = createJwtToken({userId: user.id, email });
    const { password: _, ...userWithoutPassowrd } = user;

    return res.status(200).json({
        success: true,
        message: 'You have been logged in successfully',
        data: {
            user: userWithoutPassowrd,
            token
        }
    });
}