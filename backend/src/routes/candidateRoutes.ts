import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { upload } from '../middleware/upload';
import { createCandidate } from '../presentation/controllers/candidateController';

export const candidateRouter = Router();

candidateRouter.post(
    '/',
    (req: Request, res: Response, next: NextFunction) => {
        upload.single('cv')(req, res, (err: unknown) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    res.status(413).json({
                        success: false,
                        error: { message: 'File exceeds the 5 MB limit', code: 'FILE_TOO_LARGE' },
                    });
                    return;
                }
                next(err);
                return;
            }
            if (err instanceof Error && err.message === 'UNSUPPORTED_FILE_TYPE') {
                res.status(415).json({
                    success: false,
                    error: {
                        message: 'Only PDF and DOCX files are accepted',
                        code: 'UNSUPPORTED_FILE_TYPE',
                    },
                });
                return;
            }
            if (err) {
                next(err);
                return;
            }
            next();
        });
    },
    createCandidate,
);
