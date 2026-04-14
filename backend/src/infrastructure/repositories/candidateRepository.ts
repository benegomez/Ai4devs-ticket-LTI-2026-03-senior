import {
    PrismaClient,
    Candidate as PrismaCandidate,
    Education as PrismaEducation,
    WorkExperience as PrismaWorkExperience,
} from '@prisma/client';
import { ICandidateRepository } from '../../domain/repositories/ICandidateRepository';
import { Candidate } from '../../domain/models/Candidate';
import { Education } from '../../domain/models/Education';
import { WorkExperience } from '../../domain/models/WorkExperience';

type CandidateWithRelations = PrismaCandidate & {
    educations: PrismaEducation[];
    workExperiences: PrismaWorkExperience[];
};

export class CandidateRepository implements ICandidateRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async findById(id: number): Promise<Candidate | null> {
        const row = await this.prisma.candidate.findUnique({
            where: { id },
            include: { educations: true, workExperiences: true },
        });
        return row ? this.toEntity(row) : null;
    }

    async findByEmail(email: string): Promise<Candidate | null> {
        const row = await this.prisma.candidate.findUnique({
            where: { email },
            include: { educations: true, workExperiences: true },
        });
        return row ? this.toEntity(row) : null;
    }

    async save(candidate: Candidate): Promise<Candidate> {
        const row = await this.prisma.candidate.create({
            data: {
                firstName: candidate.firstName,
                lastName: candidate.lastName,
                email: candidate.email,
                phone: candidate.phone,
                address: candidate.address,
                cvFileName: candidate.cvFileName,
                cvFilePath: candidate.cvFilePath,
                educations: {
                    create: candidate.educations.map((e) => ({
                        institution: e.institution,
                        degree: e.degree,
                        fieldOfStudy: e.fieldOfStudy,
                        startDate: e.startDate,
                        endDate: e.endDate,
                        current: e.current,
                    })),
                },
                workExperiences: {
                    create: candidate.workExperiences.map((w) => ({
                        company: w.company,
                        position: w.position,
                        description: w.description,
                        startDate: w.startDate,
                        endDate: w.endDate,
                        current: w.current,
                    })),
                },
            },
            include: { educations: true, workExperiences: true },
        });
        return this.toEntity(row);
    }

    private toEntity(row: CandidateWithRelations): Candidate {
        return new Candidate({
            id: row.id,
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email,
            phone: row.phone ?? undefined,
            address: row.address ?? undefined,
            cvFileName: row.cvFileName ?? undefined,
            cvFilePath: row.cvFilePath ?? undefined,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            educations: row.educations.map(
                (e) =>
                    new Education({
                        id: e.id,
                        institution: e.institution,
                        degree: e.degree,
                        fieldOfStudy: e.fieldOfStudy ?? undefined,
                        startDate: e.startDate,
                        endDate: e.endDate ?? undefined,
                        current: e.current,
                        candidateId: e.candidateId,
                    }),
            ),
            workExperiences: row.workExperiences.map(
                (w) =>
                    new WorkExperience({
                        id: w.id,
                        company: w.company,
                        position: w.position,
                        description: w.description ?? undefined,
                        startDate: w.startDate,
                        endDate: w.endDate ?? undefined,
                        current: w.current,
                        candidateId: w.candidateId,
                    }),
            ),
        });
    }
}
