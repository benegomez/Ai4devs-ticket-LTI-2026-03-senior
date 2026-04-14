import request from 'supertest';
import multer from 'multer';
import { app } from '../index';
import * as candidateService from '../application/services/candidateService';
import { Candidate } from '../domain/models/Candidate';
import { ValidationError, CandidateAlreadyExistsError } from '../domain/models/errors';

// Mock the service so no real DB calls are made
jest.mock('../application/services/candidateService');

// Mock the upload middleware with an explicit factory so the shape is always predictable
jest.mock('../middleware/upload', () => ({
    upload: { single: jest.fn() },
}));

const mockedAddCandidate = candidateService.addCandidate as jest.MockedFunction<
    typeof candidateService.addCandidate
>;

// Helper: make the upload middleware act as a transparent pass-through
function mockUploadPassThrough(): void {
    const uploadModule = jest.requireMock('../middleware/upload') as {
        upload: { single: jest.Mock };
    };
    uploadModule.upload.single.mockReturnValue(
        (_req: unknown, _res: unknown, cb: (err?: unknown) => void) => cb(),
    );
}

const savedCandidate = new Candidate({
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    educations: [],
    workExperiences: [],
});

describe('candidateController - POST /candidates', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUploadPassThrough();
    });

    it('should return 201 with full candidate data on valid input', async () => {
        // Arrange
        mockedAddCandidate.mockResolvedValue(savedCandidate);

        // Act
        const response = await request(app)
            .post('/candidates')
            .send({ firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' });

        // Assert
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.email).toBe('john.doe@example.com');
    });

    it('should return 400 VALIDATION_ERROR on missing firstName', async () => {
        // Arrange
        mockedAddCandidate.mockRejectedValue(new ValidationError(['firstName is required']));

        // Act
        const response = await request(app)
            .post('/candidates')
            .send({ lastName: 'Doe', email: 'john.doe@example.com' });

        // Assert
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('VALIDATION_ERROR');
        expect(response.body.error.details).toContain('firstName is required');
    });

    it('should return 409 CANDIDATE_ALREADY_EXISTS on duplicate email', async () => {
        // Arrange
        mockedAddCandidate.mockRejectedValue(new CandidateAlreadyExistsError());

        // Act
        const response = await request(app)
            .post('/candidates')
            .send({ firstName: 'John', lastName: 'Doe', email: 'existing@example.com' });

        // Assert
        expect(response.status).toBe(409);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('CANDIDATE_ALREADY_EXISTS');
    });

    it('should return 413 FILE_TOO_LARGE when multer reports file size exceeded', async () => {
        // Arrange — make upload middleware signal a multer size error
        const uploadModule = jest.requireMock('../middleware/upload') as {
            upload: { single: jest.Mock };
        };
        uploadModule.upload.single.mockReturnValue(
            (_req: unknown, _res: unknown, cb: (err?: unknown) => void) =>
                cb(Object.assign(new multer.MulterError('LIMIT_FILE_SIZE'), {})),
        );

        // Act
        const response = await request(app)
            .post('/candidates')
            .send({ firstName: 'John', lastName: 'Doe', email: 'john@example.com' });

        // Assert
        expect(response.status).toBe(413);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('FILE_TOO_LARGE');
    });

    it('should return 415 UNSUPPORTED_FILE_TYPE for disallowed MIME types', async () => {
        // Arrange — make upload middleware signal an unsupported-type error
        const uploadModule = jest.requireMock('../middleware/upload') as {
            upload: { single: jest.Mock };
        };
        uploadModule.upload.single.mockReturnValue(
            (_req: unknown, _res: unknown, cb: (err?: unknown) => void) =>
                cb(new Error('UNSUPPORTED_FILE_TYPE')),
        );

        // Act
        const response = await request(app)
            .post('/candidates')
            .send({ firstName: 'John', lastName: 'Doe', email: 'john@example.com' });

        // Assert
        expect(response.status).toBe(415);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('UNSUPPORTED_FILE_TYPE');
    });
});
