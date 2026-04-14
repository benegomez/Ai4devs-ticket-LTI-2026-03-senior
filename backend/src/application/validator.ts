import { Education } from '../domain/models/Education';
import { WorkExperience } from '../domain/models/WorkExperience';
import { ValidationError } from '../domain/models/errors';

export interface CreateCandidateDTO {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    educations: Education[];
    workExperiences: WorkExperience[];
}

interface RawEducation {
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
}

interface RawWorkExperience {
    company: string;
    position: string;
    description?: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
}

function stripHtml(value: string): string {
    // eslint-disable-next-line prefer-string-replace-all -- ES5 target; /g flag replaces all
    return value.replace(/<[^>]*>/g, '').trim();
}

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
    return /^\+[1-9]\d{1,14}$/.test(phone);
}

function parseJson<T>(raw: unknown, fieldName: string): T[] {
    if (typeof raw === 'string') {
        try {
            return JSON.parse(raw) as T[];
        } catch {
            throw new ValidationError([`${fieldName} must be a valid JSON array`]);
        }
    }
    if (Array.isArray(raw)) return raw as T[];
    return [];
}

function validateScalarFields(data: Record<string, unknown>): string[] {
    const errors: string[] = [];

    if (!data.firstName || typeof data.firstName !== 'string' || data.firstName.trim() === '') {
        errors.push('firstName is required');
    } else if (data.firstName.length > 100) {
        errors.push('firstName must not exceed 100 characters');
    }

    if (!data.lastName || typeof data.lastName !== 'string' || data.lastName.trim() === '') {
        errors.push('lastName is required');
    } else if (data.lastName.length > 100) {
        errors.push('lastName must not exceed 100 characters');
    }

    if (!data.email || typeof data.email !== 'string' || data.email.trim() === '') {
        errors.push('email is required');
    } else if (!isValidEmail(data.email.trim())) {
        errors.push('email must be a valid email address');
    }

    if (data.phone && typeof data.phone === 'string' && data.phone.trim() !== '') {
        if (!isValidPhone(data.phone.trim())) {
            errors.push('phone must be in E.164 format (e.g. +1234567890)');
        }
    }

    if (data.address && typeof data.address === 'string' && data.address.length > 255) {
        errors.push('address must not exceed 255 characters');
    }

    return errors;
}

export function validateCandidateInput(
    body: unknown,
    _file?: Express.Multer.File,
): CreateCandidateDTO {
    if (typeof body !== 'object' || body === null) {
        throw new ValidationError(['Request body must be a JSON object']);
    }

    const data = body as Record<string, unknown>;
    const errors = validateScalarFields(data);
    if (errors.length > 0) throw new ValidationError(errors);

    // educations
    const rawEducations = parseJson<RawEducation>(data.educations, 'educations');
    const educations: Education[] = rawEducations.map((e, i) => {
        const edErrors: string[] = [];
        if (!e.institution || e.institution.trim() === '')
            edErrors.push(`educations[${i}].institution is required`);
        if (!e.degree || e.degree.trim() === '')
            edErrors.push(`educations[${i}].degree is required`);
        if (!e.startDate) edErrors.push(`educations[${i}].startDate is required`);
        if (edErrors.length > 0) throw new ValidationError(edErrors);

        return new Education({
            institution: stripHtml(e.institution),
            degree: stripHtml(e.degree),
            fieldOfStudy: e.fieldOfStudy ? stripHtml(e.fieldOfStudy) : undefined,
            startDate: new Date(e.startDate),
            endDate: e.endDate ? new Date(e.endDate) : undefined,
            current: e.current ?? false,
        });
    });

    // workExperiences
    const rawWorkExps = parseJson<RawWorkExperience>(data.workExperiences, 'workExperiences');
    const workExperiences: WorkExperience[] = rawWorkExps.map((w, i) => {
        const weErrors: string[] = [];
        if (!w.company || w.company.trim() === '')
            weErrors.push(`workExperiences[${i}].company is required`);
        if (!w.position || w.position.trim() === '')
            weErrors.push(`workExperiences[${i}].position is required`);
        if (!w.startDate) weErrors.push(`workExperiences[${i}].startDate is required`);
        if (weErrors.length > 0) throw new ValidationError(weErrors);

        return new WorkExperience({
            company: stripHtml(w.company),
            position: stripHtml(w.position),
            description: w.description ? stripHtml(w.description) : undefined,
            startDate: new Date(w.startDate),
            endDate: w.endDate ? new Date(w.endDate) : undefined,
            current: w.current ?? false,
        });
    });

    return {
        firstName: stripHtml(data.firstName as string),
        lastName: stripHtml(data.lastName as string),
        email: (data.email as string).trim().toLowerCase(),
        phone: data.phone ? (data.phone as string).trim() : undefined,
        address: data.address ? stripHtml(data.address as string) : undefined,
        educations,
        workExperiences,
    };
}
