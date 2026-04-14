import { Request, Response, NextFunction } from 'express';
import { addCandidate } from '../../application/services/candidateService';
import { CandidateRepository } from '../../infrastructure/repositories/candidateRepository';
import { ValidationError, CandidateAlreadyExistsError } from '../../domain/models/errors';
import prismaClient from '../../infrastructure/prismaClient';
import logger from '../../infrastructure/logger';

export async function createCandidate(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const repository = new CandidateRepository(prismaClient);
        const candidate = await addCandidate(repository, req.body, req.file);
        res.status(201).json({ success: true, data: candidate });
    } catch (error) {
        if (error instanceof ValidationError) {
            res.status(400).json({
                success: false,
                error: {
                    message: error.message,
                    code: 'VALIDATION_ERROR',
                    details: error.details,
                },
            });
            return;
        }
        if (error instanceof CandidateAlreadyExistsError) {
            res.status(409).json({
                success: false,
                error: {
                    message: error.message,
                    code: 'CANDIDATE_ALREADY_EXISTS',
                },
            });
            return;
        }
        logger.error('Unexpected error in createCandidate', {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
        });
        next(error);
    }
}
