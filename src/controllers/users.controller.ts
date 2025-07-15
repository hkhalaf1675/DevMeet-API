import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { compareText, hashText } from "../utils/bcrypt";
import { createJwtToken } from "../utils/jwt";
import { Prisma } from "@prisma/client";

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

export const updateProfile = async(req: Request, res: Response) => {
    const userId = req.user.id;
    const { name, nationality, spokenLanguages } = req.body;

    const user = await prisma.user?.update({
        where: { id: userId },
        data: {
            name,
            nationality,
            spokenLanguages
        }
    });

    return res.status(200).json({
        success: true,
        message: 'User profile has been updated successfully',
        data: null
    });
}

export const getProfile = async(req: Request, res: Response) => {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        omit: {
            password: true
        }
    });

    return res.status(200).json({
        success: true,
        message: 'User profile fetched successfully',
        data: { user }
    });
}

export const getManyUsers = async(req: Request, res: Response) => {
    const { page = '1', perPage = '10', name, nationality, language } = req.query;
    const pageNumber = Number(page);
    const itemsPerPage = Number(perPage);

    const where: Prisma.UserWhereInput = {};
    if(name && typeof name === 'string') {
        where.name = {
            contains: name,
            mode: 'insensitive'
        };
    }
    if(nationality && typeof nationality === 'string') {
        where.nationality = {
            equals: nationality,
            mode: 'insensitive'
        };
    }
    if(language && typeof language === 'string') {
        where.spokenLanguages = {
            has: language
        };
    }

    const [ users, total ] = await Promise.all([
        prisma.user.findMany({
            where,
            omit: { password: true },
            skip: (pageNumber - 1) * itemsPerPage,
            take: itemsPerPage
        }),
        prisma.user.count({ where })
    ]);

    return res.status(200).json({
        success: true,
        message: 'Users fetched successfully',
        data: {
            pageInfo: {
                totelItems: total,
                totalPages: Math.ceil(total / itemsPerPage),
                currentPage: page
            },
            users
        }
    });
}

export const deleteUser = async(req: Request, res: Response) => {
    const userId = req.user.id;
    const { password } = req.body;

    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    const isPasswordValid = await compareText(password, user.password);
    if(!isPasswordValid) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized',
            errors: ['Invalid password']
        });
    }

    await prisma.user.delete({ 
        where: { id: userId }
    });

    return res.status(200).json({
        success: true,
        message: 'User has been deleted successfully',
        data: null
    });
}