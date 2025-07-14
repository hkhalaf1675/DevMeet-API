import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { hashText } from "../utils/bcrypt";
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