---
status: To do
type: backend
story: UserStories/AddNewCandidate/AddnewCandidate.md
depends-on: UserStories/AddNewCandidate/Tickets/DataBase/ticket.md
---

# [BE] Add New Candidate to ATS

## Objective

Implement the `POST /candidates` REST endpoint and all supporting DDD layers: domain entity
classes, a repository interface with its Prisma implementation, an application service
(`addCandidate`), an input validator, a CV upload middleware, and the Express route and
controller. This ticket exposes the data schema (created in the database ticket) as a
functional API that the frontend can consume.

## Scope

Express API, DDD layers, and file-upload middleware only.
Database schema changes are handled in the database ticket.

## Dependency

`UserStories/AddNewCandidate/Tickets/DataBase/ticket.md` must be merged and the migration
applied before starting this ticket.

## API Endpoint

**Method & path:** `POST /candidates`
**Content-Type:** `multipart/form-data`

### Request fields

| Field | Type | Required | Notes |
|---|---|---|---|
| firstName | string | **Yes** | |
| lastName | string | **Yes** | |
| email | string | **Yes** | Valid email format |
| phone | string | No | E.164 format |
| address | string | No | |
| educations | JSON string | No | Array of Education objects |
| workExperiences | JSON string | No | Array of WorkExperience objects |
| cv | file | No | PDF or DOCX only; max 5 MB |

### Success response -- 201 Created

```json
{
  "success": true,
  "data": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "address": "123 Main St",
    "cvFileName": "john_doe_cv.pdf",
    "educations": [
      {
        "id": 1,
        "institution": "MIT",
        "degree": "Bachelor",
        "fieldOfStudy": "Computer Science",
        "startDate": "2018-09-01T00:00:00Z",
        "endDate": "2022-06-01T00:00:00Z",
        "current": false
      }
    ],
    "workExperiences": [],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Error responses

| HTTP | Code | Trigger |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Missing required fields or invalid format |
| 409 | `CANDIDATE_ALREADY_EXISTS` | Email already registered |
| 413 | `FILE_TOO_LARGE` | CV exceeds 5 MB |
| 415 | `UNSUPPORTED_FILE_TYPE` | File is not PDF or DOCX |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": ["email is required", "firstName must not be empty"]
  }
}
```

## Files to Create / Modify

```
backend/
├── src/
│   ├── domain/
│   │   ├── models/
│   │   │   ├── Candidate.ts              CREATE  Candidate entity class
│   │   │   ├── Education.ts              CREATE  Education entity class
│   │   │   └── WorkExperience.ts         CREATE  WorkExperience entity class
│   │   └── repositories/
│   │       └── ICandidateRepository.ts   CREATE  repository interface
│   ├── application/
│   │   ├── services/
│   │   │   └── candidateService.ts       CREATE  addCandidate() business logic
│   │   └── validator.ts                  MODIFY  add validateCandidateInput()
│   ├── presentation/
│   │   └── controllers/
│   │       └── candidateController.ts    CREATE  POST /candidates handler
│   ├── infrastructure/
│   │   └── repositories/
│   │       └── candidateRepository.ts    CREATE  Prisma impl of ICandidateRepository
│   ├── middleware/
│   │   └── upload.ts                     CREATE  multer config for CV upload
│   ├── routes/
│   │   └── candidateRoutes.ts            CREATE  Express router for /candidates
│   └── index.ts                          MODIFY  register candidateRoutes at /candidates
└── package.json                          MODIFY  add multer + @types/multer
```

## Key Implementation Details

### ICandidateRepository -- `domain/repositories/ICandidateRepository.ts`

```typescript
export interface ICandidateRepository {
    findById(id: number): Promise<Candidate | null>;
    findByEmail(email: string): Promise<Candidate | null>;
    save(candidate: Candidate): Promise<Candidate>;
}
```

### Candidate Entity -- `domain/models/Candidate.ts`

```typescript
export class Candidate {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    cvFileName?: string;
    cvFilePath?: string;
    educations: Education[];
    workExperiences: WorkExperience[];

    constructor(data: Partial<Candidate>) {
        this.id = data.id;
        this.firstName = data.firstName!;
        this.lastName = data.lastName!;
        this.email = data.email!;
        this.phone = data.phone;
        this.address = data.address;
        this.cvFileName = data.cvFileName;
        this.cvFilePath = data.cvFilePath;
        this.educations = data.educations ?? [];
        this.workExperiences = data.workExperiences ?? [];
    }
}
```

### Validator -- `application/validator.ts` (add function)

```typescript
// Returns typed CreateCandidateDTO; throws ValidationError on any failure.
export function validateCandidateInput(
    body: unknown,
    file?: Express.Multer.File
): CreateCandidateDTO {
    // firstName: required, non-empty string, max 100 chars
    // lastName:  required, non-empty string, max 100 chars
    // email:     required, valid RFC 5322 format
    // phone:     optional; if present must match /^\+[1-9]\d{1,14}$/
    // address:   optional; max 255 chars
    // educations: optional JSON array; each item needs institution, degree, startDate
    // workExperiences: optional JSON array; each item needs company, position, startDate
}
```

### CV Upload Middleware -- `middleware/upload.ts`

```typescript
import multer from 'multer';

const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const upload = multer({
    dest: process.env.CV_UPLOAD_DIR ?? 'uploads/cvs',
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (_req, file, cb) => {
        ALLOWED_MIME_TYPES.includes(file.mimetype)
            ? cb(null, true)
            : cb(new Error('UNSUPPORTED_FILE_TYPE'));
    },
});
```

## Unit Tests

**File:** `backend/src/tests/candidateService.test.ts`

- `addCandidate()` saves and returns candidate when all required fields are valid
- `addCandidate()` throws `ValidationError` when `email` is missing
- `addCandidate()` throws `ValidationError` when `email` format is invalid
- `addCandidate()` throws `CandidateAlreadyExistsError` when email is already registered
- `addCandidate()` persists `educations` and `workExperiences` as nested records
- `addCandidate()` sets `cvFileName` and `cvFilePath` when a file is provided

**File:** `backend/src/tests/candidateController.test.ts`

- `POST /candidates` returns `201` with full candidate data on valid input
- `POST /candidates` returns `400 VALIDATION_ERROR` on missing `firstName`
- `POST /candidates` returns `409 CANDIDATE_ALREADY_EXISTS` on duplicate email
- `POST /candidates` returns `413 FILE_TOO_LARGE` when file exceeds 5 MB
- `POST /candidates` returns `415 UNSUPPORTED_FILE_TYPE` for non-PDF/DOCX files

Use **Arrange-Act-Assert**. Call `jest.clearAllMocks()` in `beforeEach`.
Mock all Prisma calls; never connect to a real database in unit tests.

## Non-Functional Requirements

### Security
- Strip HTML tags from all text fields before persistence.
- Validate MIME type **server-side** (never rely on file extension alone).
- Store CV files at the path from `CV_UPLOAD_DIR` env variable; never serve from a
  web-accessible directory.
- Enforce email uniqueness at both the service layer and the database level.

### Performance
- `POST /candidates` (no file) must respond within **500 ms**.
- File upload must complete within **10 seconds** for files up to 5 MB.

### Error Handling
- All unexpected errors must be caught by the global Express error middleware.
- Log errors via `src/infrastructure/logger.ts`; never expose stack traces to the client.

## Git Branch

`feature/add-candidate-backend`
