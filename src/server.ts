import express from 'express';
import cors from 'cors';
import { CorsOptions } from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import appConfig from './config/app.config';
import globalErrorHandler from './middlewares/global-error-handler.middleware';

const app = express();

//#region app configuration
const corsOptions: CorsOptions = {
    origin: appConfig.allowedOrigins,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(helmet());

const morganMode = process.env.NODE_ENV === 'development' ? 'dev' : 'combined';
app.use(morgan(morganMode));

app.use(express.json());
//#endregion

//#region Routes
import welcomeRoute from './routes/index.route'; 
app.use('/api', welcomeRoute);

// auth routes 
import authRoutes from './routes/auth.routes';
app.use('/api/auth', authRoutes);

// user routes
import userRoutes from './routes/user.routes';
app.use('/api/users', userRoutes);

// slot routes
import slotRoutes from './routes/slot.routes';
app.use('/api/slots', slotRoutes);

// request routes 
import requestRoutes from './routes/request.routes';
app.use('/api/requests', requestRoutes);
//#endregion

//#region handle routes
// handle not found routes
app.use((req: express.Request, res: express.Response) => {
    res.status(404).json({
        success: false,
        message: 'API not found',
        errors: [`Can not find ${req.method} ${req.originalUrl}`]
    });
});

// handle errors
app.use(globalErrorHandler);
//#endregion

app.listen(appConfig.port, () => {
    console.log(`Server is running on port ${appConfig.port}`);
});
