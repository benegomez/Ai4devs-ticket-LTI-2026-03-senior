import { Candidate } from '../models/Candidate';

export interface ICandidateRepository {
    findById(id: number): Promise<Candidate | null>;
    findByEmail(email: string): Promise<Candidate | null>;
    save(candidate: Candidate): Promise<Candidate>;
}
