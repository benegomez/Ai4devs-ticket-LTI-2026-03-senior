export class Education {
    id?: number;
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    startDate: Date;
    endDate?: Date;
    current: boolean;
    candidateId?: number;

    constructor(data: {
        id?: number;
        institution: string;
        degree: string;
        fieldOfStudy?: string;
        startDate: Date;
        endDate?: Date;
        current?: boolean;
        candidateId?: number;
    }) {
        this.id = data.id;
        this.institution = data.institution;
        this.degree = data.degree;
        this.fieldOfStudy = data.fieldOfStudy;
        this.startDate = data.startDate;
        this.endDate = data.endDate;
        this.current = data.current ?? false;
        this.candidateId = data.candidateId;
    }
}
