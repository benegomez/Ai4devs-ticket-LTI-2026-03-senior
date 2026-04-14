import { addCandidate } from '../application/services/candidateService';
import { ICandidateRepository } from '../domain/repositories/ICandidateRepository';
import { Candidate } from '../domain/models/Candidate';
import { Education } from '../domain/models/Education';
import { WorkExperience } from '../domain/models/WorkExperience';
import { ValidationError, CandidateAlreadyExistsError } from '../domain/models/errors';

const mockRepository: jest.Mocked<ICandidateRepository> = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    save: jest.fn(),
};

const validBody = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    address: '123 Main St',
};

const savedCandidate = new Candidate({
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    educations: [],
    workExperiences: [],
});

describe('candidateService - addCandidate', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should save and return candidate when all required fields are valid', async () => {
        // Arrange
        mockRepository.findByEmail.mockResolvedValue(null);
        mockRepository.save.mockResolvedValue(savedCandidate);

        // Act
        const result = await addCandidate(mockRepository, validBody);

        // Assert
        expect(mockRepository.findByEmail).toHaveBeenCalledWith(validBody.email);
        expect(mockRepository.save).toHaveBeenCalledTimes(1);
        expect(result.id).toBe(1);
        expect(result.email).toBe('john.doe@example.com');
    });

    it('should throw ValidationError when email is missing', async () => {
        // Arrange
        const body = { firstName: 'John', lastName: 'Doe' };

        // Act & Assert
        await expect(addCandidate(mockRepository, body)).rejects.toThrow(ValidationError);
        expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when email format is invalid', async () => {
        // Arrange
        const body = { firstName: 'John', lastName: 'Doe', email: 'not-an-email' };

        // Act & Assert
        await expect(addCandidate(mockRepository, body)).rejects.toThrow(ValidationError);
        expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw CandidateAlreadyExistsError when email is already registered', async () => {
        // Arrange
        mockRepository.findByEmail.mockResolvedValue(savedCandidate);

        // Act & Assert
        await expect(addCandidate(mockRepository, validBody)).rejects.toThrow(
            CandidateAlreadyExistsError,
        );
        expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should persist educations and workExperiences as nested records', async () => {
        // Arrange
        mockRepository.findByEmail.mockResolvedValue(null);
        const withNested = new Candidate({
            id: 2,
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
            educations: [
                new Education({ institution: 'MIT', degree: 'Bachelor', startDate: new Date('2018-09-01'), current: false }),
            ],
            workExperiences: [
                new WorkExperience({ company: 'Acme', position: 'Engineer', startDate: new Date('2022-01-01'), current: true }),
            ],
        });
        mockRepository.save.mockResolvedValue(withNested);

        const bodyWithNested = {
            ...validBody,
            email: 'jane@example.com',
            educations: JSON.stringify([{ institution: 'MIT', degree: 'Bachelor', startDate: '2018-09-01', current: false }]),
            workExperiences: JSON.stringify([{ company: 'Acme', position: 'Engineer', startDate: '2022-01-01', current: true }]),
        };

        // Act
        const result = await addCandidate(mockRepository, bodyWithNested);

        // Assert
        expect(mockRepository.save).toHaveBeenCalledTimes(1);
        expect(result.educations).toHaveLength(1);
        expect(result.workExperiences).toHaveLength(1);
    });

    it('should set cvFileName and cvFilePath when a file is provided', async () => {
        // Arrange
        mockRepository.findByEmail.mockResolvedValue(null);
        const withFile = new Candidate({ ...savedCandidate, cvFileName: 'cv.pdf', cvFilePath: 'uploads/cvs/cv.pdf' });
        mockRepository.save.mockResolvedValue(withFile);
        const mockFile = { originalname: 'cv.pdf', path: 'uploads/cvs/cv.pdf' } as Express.Multer.File;

        // Act
        await addCandidate(mockRepository, validBody, mockFile);

        // Assert
        const savedArg = mockRepository.save.mock.calls[0][0];
        expect(savedArg.cvFileName).toBe('cv.pdf');
        expect(savedArg.cvFilePath).toBe('uploads/cvs/cv.pdf');
    });
});
