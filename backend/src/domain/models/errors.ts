export class ValidationError extends Error {
    constructor(public readonly details: string[]) {
        super('Validation failed');
        this.name = 'ValidationError';
        // Required for correct instanceof checks when TypeScript targets ES5
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}

export class CandidateAlreadyExistsError extends Error {
    constructor() {
        super('A candidate with this email already exists');
        this.name = 'CandidateAlreadyExistsError';
        Object.setPrototypeOf(this, CandidateAlreadyExistsError.prototype);
    }
}

export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NotFoundError';
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}
