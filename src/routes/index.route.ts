import { Request, Response, Router } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
    return res.status(200).json({
        success: true,
        message: 'Welcome to DevMeet API',
        data: null
    });
}); 

export default router;