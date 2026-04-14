import { Education } from './Education';
import { WorkExperience } from './WorkExperience';

export class Candidate {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    cvFileName?: string;
    cvFilePath?: string;
    createdAt?: Date;
    updatedAt?: Date;
    educations: Education[];
    workExperiences: WorkExperience[];

    constructor(data: {
        id?: number;
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        address?: string;
        cvFileName?: string;
        cvFilePath?: string;
        createdAt?: Date;
        updatedAt?: Date;
        educations?: Education[];
        workExperiences?: WorkExperience[];
    }) {
        this.id = data.id;
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.email = data.email;
        this.phone = data.phone;
        this.address = data.address;
        this.cvFileName = data.cvFileName;
        this.cvFilePath = data.cvFilePath;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
        this.educations = data.educations ?? [];
        this.workExperiences = data.workExperiences ?? [];
    }
}
