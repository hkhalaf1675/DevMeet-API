import * as dotenv from 'dotenv';
dotenv.config();

export default {
    port: Number(process.env.PORT || '7001'),
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    jwt: {
        secret: process.env.JWT_SECRET || 'jwt secret',
        expiresIn: Number(process.env.JWT_EXPIRES_IN || '3')
    }
}