import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { candidateRouter } from './routes/candidateRoutes';
import logger from './infrastructure/logger';

dotenv.config();

export const app = express();

const ALLOWED_ORIGIN = process.env.FRONTEND_URL ?? 'http://localhost:3000';
app.use(cors({ origin: ALLOWED_ORIGIN }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req: Request, res: Response) => {
    res.send('Hello World!');
});

app.use('/candidates', candidateRouter);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error('Unhandled error', { message: err.message });
    res.status(500).json({
        success: false,
        error: { message: 'An unexpected error occurred', code: 'INTERNAL_ERROR' },
    });
});

const port = 3010;
if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        logger.info(`Server running at http://localhost:${port}`);
    });
}
