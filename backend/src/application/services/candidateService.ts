import { Candidate } from '../../domain/models/Candidate';
import { ICandidateRepository } from '../../domain/repositories/ICandidateRepository';
import { CandidateAlreadyExistsError } from '../../domain/models/errors';
import { validateCandidateInput } from '../validator';
import logger from '../../infrastructure/logger';

export async function addCandidate(
    repository: ICandidateRepository,
    body: unknown,
    file?: Express.Multer.File,
): Promise<Candidate> {
    const dto = validateCandidateInput(body, file);

    const existing = await repository.findByEmail(dto.email);
    if (existing) {
        throw new CandidateAlreadyExistsError();
    }

    const candidate = new Candidate({
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        cvFileName: file?.originalname,
        cvFilePath: file?.path,
        educations: dto.educations,
        workExperiences: dto.workExperiences,
    });

    const saved = await repository.save(candidate);
    logger.info('Candidate created', { id: saved.id, email: saved.email });
    return saved;
}
