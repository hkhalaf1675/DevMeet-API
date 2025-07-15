import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { Prisma } from "@prisma/client";

export const createRequest = async(req: Request, res: Response) => {
    const developerId = req.user.id;
    const { slotId } = req.body;

    const slot = await prisma.slot.findUnique({
        where: { id: slotId },
        include: { requests: true }
    });

    if(!slot){
        return res.status(404).json({
            success: false,
            message: 'Validation Error',
            errors: ['There is no slots exists with this id']
        });
    }
    
    if(slot.status === 'BOOKED' || slot.status === 'CANCELLED'){
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: ['This time slot is not open for requests']
        });
    }

    const existingRequest = await prisma.request.findFirst({
        where: {
            developerId,
            slotId
        }
    });

    if(existingRequest) {
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: ['You have already requested this slot']
        });
    }

    const conflictRequest = await prisma.request.findFirst({
        where: {
            developerId,
            slot: {
                startTime: { lt: slot.endTime },
                endTime: { gt: slot.startTime }
            },
            status: { in: ['ACCEPTED', 'PENDING']},
        }
    });

    if(conflictRequest) {
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: ['You cannot book overlapping slots']
        });
    }

    const request = await prisma.request.create({
        data: {
            developerId,
            slotId
        }
    });

    return res.status(201).json({
        success: true,
        message: 'Request has been added successfully',
        data: { request }
    });
}

export const getMyRequests = async(req: Request, res: Response) => {
    const developerId = req.user.id;
    const { page = '1', perPage = '10' } = req.query;

    const where: Prisma.RequestWhereInput = {
        developerId
    };

    const select: Prisma.RequestSelect = {
        id: true,
        status: true,
        slot: {
            select: {
                id: true,
                topic: true,
                startTime: true,
                endTime: true,
                location: true,
                mentor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        nationality: true,
                        spokenLanguages: true
                    }
                }
            }
        }
    };

    const data = await getRequests(page, perPage, where, select);

    return res.status(200).json({
        success: true,
        message: 'Requests fetched successfully',
        data
    });
}

export const getUpcomingSlotRequests = async(req: Request, res: Response) => {
    const mentorId = req.user.id;
    const { page = '1', perPage = '10' } = req.query;

    const where: Prisma.RequestWhereInput = {
        status: { not: 'CANCELLED' },
        slot: {
            mentorId
        }
    };

    const select: Prisma.RequestSelect = {
        id: true,
        status: true,
        developer: {
            select: {
                id: true,
                name: true,
                email: true,
                nationality: true,
                spokenLanguages: true
            }
        },
        slot: {
            select: {
                id: true,
                topic: true,
                startTime: true,
                endTime: true,
                location: true,
                status: true
            }
        }
    };

    const data = await getRequests(page, perPage, where, select);

    return res.status(200).json({
        success: true,
        message: 'Requests fetched successfully',
        data
    });
}

export const getRequestById = async(req: Request, res: Response) => {
    const requestId = +req.params.id;

    const request = await prisma.request.findUnique({
        where: { id: requestId },
        select: {
            id: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            developer: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    spokenLanguages: true,
                    nationality: true
                }
            },
            slot: {
                select: {
                    id: true,
                    status: true,
                    topic: true,
                    description: true,
                    location: true,
                    startTime: true,
                    endTime: true,
                    createdAt: true,
                    updatedAt: true,
                    mentor: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            nationality: true,
                            spokenLanguages: true,
                        }
                    }
                }
            }
        }
    });

    return res.status(200).json({
        success: true,
        message: 'Request fetched successfully',
        data: { request }
    });
}

export const updateRequestStatus = async(req: Request, res: Response) => {
    const requestId = +req.params.id;
    const { status } = req.body;
    const userId = req.user.id;

    const request = await prisma.request.findUnique({
        where: { id: requestId },
        include: { slot: true }
    });

    if(!request) {
        return res.status(404).json({
            success: false,
            message: 'Validation Error',
            errors: ['There is no requests exists with this id']
        });
    }

    const isDeveloper = request.developerId === userId;
    const isMentor = request.slot.mentorId === userId;

    if(isDeveloper && ['ACCEPTED', 'DECLINED'].includes(status)) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized User',
            errors: ['You do not have the premissions to accept to decline the request']
        });
    }

    if(isMentor && status === 'CANCELLED'){
        return res.status(401).json({
            success: false,
            message: 'Unauthorized User',
            errors: ['You do not have the premissions to cancel the request']
        });
    }

    await prisma.request.update({
        where: { id: requestId },
        data: { status }
    });

    if(status === 'ACCEPTED'){
        await prisma.slot.update({
            where: { id: request.slotId },
            data: { status: 'BOOKED' }
        });
    }
    else if(status === 'PENDING'){
        await prisma.slot.update({
            where: { id: request.slotId },
            data: { status: 'AVAILABLE' }
        });
    }

    return res.status(200).json({
        success: true,
        message: 'Request status has been changed successfully',
        data: null
    });
}

const getRequests = async(page: any, perPage: any, where: Prisma.RequestWhereInput, select: Prisma.RequestSelect) => {
    const pageNumber = Number(page);
    const itemsPerPage = Number(perPage);

    const [requests, total] = await Promise.all([
        prisma.request.findMany({
            where,
            select,
            orderBy: { id: 'desc' },
            skip: (pageNumber - 1) * itemsPerPage,
            take: itemsPerPage
        }),
        prisma.request.count({ where })
    ]);

    return {
        pageInfo: {
            totalItems: total,
            totalPages: Math.ceil(total / itemsPerPage),
            currentPage: pageNumber
        },
        requests
    };
}