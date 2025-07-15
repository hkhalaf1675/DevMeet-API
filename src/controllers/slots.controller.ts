import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { DateTime } from "luxon";
import { Prisma } from "@prisma/client";

export const createSlot = async(req: Request, res: Response) => {
    const mentorId = req.user.id;
    const { topic, startTime, endTime, description, location } = req.body;

    const startTimeUTC = (typeof startTime === 'string')
        ? DateTime.fromISO(startTime).toUTC().toJSDate()
        : DateTime.fromJSDate(startTime).toUTC().toJSDate();
    const endTimeUTC = (typeof endTime === 'string')
        ? DateTime.fromISO(endTime).toUTC().toJSDate()
        : DateTime.fromJSDate(endTime).toUTC().toJSDate();

    const slot = await prisma.slot.create({
        data: {
            topic,
            description,
            location,
            startTime: startTimeUTC,
            endTime: endTimeUTC,
            mentorId
        }
    });

    return res.status(201).json({
        success: true,
        message: 'Slot has been created successfully',
        data: { slot }
    })
}

export const getSLotById = async(req: Request, res: Response) => {
    const slotId = +req.params.id;

    const slot = await prisma.slot.findUnique({
        where: { id: slotId },
        include: {
            mentor: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        }
    });

    return res.status(200).json({
        success: true,
        message: 'Slot fetched successfully',
        data: { slot }
    });
}

export const getManySlots = async(req: Request, res: Response) => {
    const { page = '1', perPage = '10', search, startTime, endTime, mentorId, mentorName, location } = req.query;

    const where: Prisma.SlotWhereInput = {};
    //#region Filter conditions
    where.status = 'AVAILABLE';

    if(search && typeof search === 'string') {
        where.OR = [
            { topic: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
        ];
    }
    if(mentorName && typeof mentorName === 'string') {
        where.mentor = {
            name: { contains: mentorName, mode: 'insensitive' }
        };
    }
    if(location && typeof location === 'string') {
        where.location = { contains: location, mode: 'insensitive' };
    }
    if(mentorId && typeof mentorId === 'string') {
        where.mentorId = +mentorId;
    }
    if(startTime && typeof startTime === 'string') {
        const startTimeUtc = DateTime.fromISO(startTime).toUTC().toJSDate();
        
        where.startTime = { gte: startTimeUtc };
    }
    if(endTime && typeof endTime === 'string') {
        const endTimeUtc = DateTime.fromISO(endTime).toUTC().toJSDate();
        
        where.endTime = { lte: endTimeUtc };
    }
    //#endregion

    const select: Prisma.SlotSelect = {
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
    };

    const orderBy: Prisma.SlotOrderByWithRelationInput = { startTime: 'asc' };

    const data = await getSlots(where, select, orderBy, page, perPage);
    return res.status(200).json({
        success: true,
        message: 'Slots fetched successfully',
        data
    });
}

export const getMySlots = async(req: Request, res: Response) => {
    const mentorId = req.user.id;
    const { page = '1', perPage = '10' } = req.query;

    const where: Prisma.SlotWhereInput = {};
    where.mentorId = mentorId;

    const select: Prisma.SlotSelect = {
        id: true,
        topic: true,
        startTime: true,
        endTime: true,
        location: true
    };

    const orderBy: Prisma.SlotOrderByWithRelationInput = { id: 'desc' };

    const data = await getSlots(where, select, orderBy, page, perPage);
    return res.status(200).json({
        success: true,
        message: 'Slots fetched successfully',
        data
    });
}

export const updateSlot = async(req: Request, res: Response) => {
    const mentorId = req.user.id;
    const slotId = +req.params.id;
    const { topic, startTime, endTime, description, location, status } = req.body;

    //#region data needed to be updated
    let updateData: Prisma.SlotUpdateInput = {
        ...(topic && { topic }),
        ...(description) && { description },
        ...(location && { location }),
        ...(status && { status })
    };
    if(startTime){
        const startTimeUTC = (typeof startTime === 'string')
            ? DateTime.fromISO(startTime).toUTC().toJSDate()
            : DateTime.fromJSDate(startTime).toUTC().toJSDate();
        updateData.startTime = startTimeUTC;
    }
    if(endTime){
        const endTimeUTC = (typeof endTime === 'string')
            ? DateTime.fromISO(endTime).toUTC().toJSDate()
            : DateTime.fromJSDate(endTime).toUTC().toJSDate();
        updateData.endTime = endTimeUTC;
    }
    //#endregion

    const { responseStatusCode, response } = await editSlot(mentorId, slotId, updateData);

    return res.status(responseStatusCode).json(response);
}

export const cancelSlot = async(req: Request, res: Response) => {
    const mentorId = req.user.id;
    const slotId = +req.params.id;

    //#region data needed to be updated
    let updateData: Prisma.SlotUpdateInput = {
        status: 'CANCELLED'
    };
    //#endregion

    const { responseStatusCode, response } = await editSlot(mentorId, slotId, updateData);

    return res.status(responseStatusCode).json(response);
}

const getSlots = async(where: Prisma.SlotWhereInput, select: Prisma.SlotSelect, orderBy: Prisma.SlotOrderByWithRelationInput, page: any, perPage: any) => {
    const pageNumber = Number(page);
    const itemsPerPage = Number(perPage);

    const [slots, total] = await Promise.all([
        prisma.slot.findMany({
            where,
            select,
            skip: (pageNumber - 1) * itemsPerPage,
            take: itemsPerPage,
            orderBy
        }),
        prisma.slot.count({ where })
    ]);

    return {
        pageInfo: {
            totalItems: total,
            totalPages: Math.ceil(total / itemsPerPage),
            currentPage: pageNumber
        },
        slots
    };
}

const editSlot = async(mentorId: number, slotId: number, updateData: Prisma.SlotUpdateInput) => {
    const slot = await prisma.slot.findUnique({
        where: { id: slotId }
    });

    let response: object = {};
    let responseStatusCode = 200;
    if(!slot) {
        responseStatusCode = 404;
        response = {
            success: false,
            message: 'Validaton Error',
            errors: ['There is no slots with this id']
        };
    }
    else if(slot.mentorId !== mentorId) {
        responseStatusCode = 401;
        response = {
            success: false,
            messaage: 'Unauthorized User',
            errors: ['You do not have the permissions to update this slot']
        };
    }
    else if(slot.status === 'BOOKED') {
        responseStatusCode = 400;
        response = {
            success: false,
            messaage: 'Validation Error',
            errors: ['You can not edit in this slot because it aleady booked']
        };
    }
    else{
        await prisma.slot.update({
            where: { id: slotId },
            data: updateData
        });

        response = {
            success: true,
            message: 'Slot has been updated successfully',
            data: null
        };
    }

    return {
        responseStatusCode,
        response
    }
}