export class WorkExperience {
    id?: number;
    company: string;
    position: string;
    description?: string;
    startDate: Date;
    endDate?: Date;
    current: boolean;
    candidateId?: number;

    constructor(data: {
        id?: number;
        company: string;
        position: string;
        description?: string;
        startDate: Date;
        endDate?: Date;
        current?: boolean;
        candidateId?: number;
    }) {
        this.id = data.id;
        this.company = data.company;
        this.position = data.position;
        this.description = data.description;
        this.startDate = data.startDate;
        this.endDate = data.endDate;
        this.current = data.current ?? false;
        this.candidateId = data.candidateId;
    }
}
