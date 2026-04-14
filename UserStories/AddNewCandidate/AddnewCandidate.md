---
status: Pending refinement validation
---

## [original]

Añadir Candidato al Sistema
Como reclutador,
Quiero tener la capacidad de añadir candidatos al sistema ATS,
Para que pueda gestionar sus datos y procesos de selección de manera eficiente.

Criterios de Aceptación:

Accesibilidad de la función: Debe haber un botón o enlace claramente visible para añadir un nuevo candidato desde la página principal del dashboard del reclutador.

Formulario de ingreso de datos: Al seleccionar la opción de añadir candidato, se debe presentar un formulario que incluya los campos necesarios para capturar la información del candidato como nombre, apellido, correo electrónico, teléfono, dirección, educación y experiencia laboral.

Validación de datos: El formulario debe validar los datos ingresados para asegurar que son completos y correctos. Por ejemplo, el correo electrónico debe tener un formato válido y los campos obligatorios no deben estar vacíos.

Carga de documentos: El reclutador debe tener la opción de cargar el CV del candidato en formato PDF o DOCX.

Confirmación de añadido: Una vez completado el formulario y enviada la información, debe aparecer un mensaje de confirmación indicando que el candidato ha sido añadido exitosamente al sistema.

Errores y manejo de excepciones: En caso de error (por ejemplo, fallo en la conexión con el servidor), el sistema debe mostrar un mensaje adecuado al usuario para informarle del problema.

Accesibilidad y compatibilidad: La funcionalidad debe ser accesible y compatible con diferentes dispositivos y navegadores web.

Notas:

La interfaz debe ser intuitiva y fácil de usar para minimizar el tiempo de entrenamiento necesario para los nuevos reclutadores.

Considerar la posibilidad de integrar funcionalidades de autocompletado para los campos de educación y experiencia laboral, basados en datos preexistentes en el sistema.

Tareas Técnicas:

Implementar la interfaz de usuario para el formulario de añadir candidato.

Desarrollar el backend necesario para procesar la información ingresada en el formulario.

Asegurar la seguridad y privacidad de los datos del candidato.

---

---

---

---

## [enhanced]

# US: Add New Candidate to ATS

**As a** recruiter,
**I want** to add a new candidate to the ATS,
**So that** I can manage their profile and selection process efficiently.

---

## Completeness Assessment

| Criterion | Status | Gap |
|---|---|---|
| Functional description | Partial | Present but vague; written in Spanish |
| Data fields | Missing | No types, constraints, required vs optional |
| API endpoint | Missing | No URL, method, request/response schema |
| Files to modify (DDD) | Missing | No layer references |
| Acceptance criteria | Partial | High-level only |
| Unit tests | Missing | Not mentioned |
| Non-functional requirements | Partial | Only a vague security mention |

---

## Context

The LTI ATS backend uses **Node.js + TypeScript** with **Express**, **Prisma 5.x**, and
**PostgreSQL** following a DDD architecture. The current Prisma schema only contains a `User`
model -- the `Candidate`, `Education`, and `WorkExperience` models must be added.
The frontend is **React 18 + TypeScript** (Create React App 5).

---

## Data Model

### New Prisma Models

File: `backend/prisma/schema.prisma`

```prisma
model Candidate {
  id              Int              @id @default(autoincrement())
  firstName       String
  lastName        String
  email           String           @unique
  phone           String?
  address         String?
  cvFileName      String?
  cvFilePath      String?
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  educations      Education[]
  workExperiences WorkExperience[]
}

model Education {
  id           Int       @id @default(autoincrement())
  institution  String
  degree       String
  fieldOfStudy String?
  startDate    DateTime
  endDate      DateTime?
  current      Boolean   @default(false)
  candidateId  Int
  candidate    Candidate @relation(fields: [candidateId], references: [id], onDelete: Cascade)
}

model WorkExperience {
  id          Int       @id @default(autoincrement())
  company     String
  position    String
  description String?
  startDate   DateTime
  endDate     DateTime?
  current     Boolean   @default(false)
  candidateId Int
  candidate   Candidate @relation(fields: [candidateId], references: [id], onDelete: Cascade)
}
```

### Field Reference

| Model | Field | Type | Required | Constraints |
|---|---|---|---|---|
| Candidate | firstName | String | **Yes** | Non-empty, max 100 chars |
| Candidate | lastName | String | **Yes** | Non-empty, max 100 chars |
| Candidate | email | String | **Yes** | Valid RFC 5322 format; unique |
| Candidate | phone | String | No | E.164 format if provided |
| Candidate | address | String | No | Max 255 chars |
| Candidate | cvFileName | String | No | Set server-side on upload |
| Candidate | cvFilePath | String | No | Set server-side on upload |
| Education | institution | String | **Yes** | Non-empty |
| Education | degree | String | **Yes** | Non-empty |
| Education | fieldOfStudy | String | No | -- |
| Education | startDate | DateTime | **Yes** | ISO 8601 string |
| Education | endDate | DateTime | No | Must be after startDate |
| Education | current | Boolean | **Yes** | Default: false |
| WorkExperience | company | String | **Yes** | Non-empty |
| WorkExperience | position | String | **Yes** | Non-empty |
| WorkExperience | description | String | No | Max 500 chars |
| WorkExperience | startDate | DateTime | **Yes** | ISO 8601 string |
| WorkExperience | endDate | DateTime | No | Must be after startDate |
| WorkExperience | current | Boolean | **Yes** | Default: false |

---

## API Endpoint

### POST /candidates

**Content-Type:** `multipart/form-data`

**Request fields:**

| Field | Type | Required | Notes |
|---|---|---|---|
| firstName | string | **Yes** | |
| lastName | string | **Yes** | |
| email | string | **Yes** | Must be a valid email |
| phone | string | No | E.164 format |
| address | string | No | |
| educations | JSON string | No | Array of Education objects |
| workExperiences | JSON string | No | Array of WorkExperience objects |
| cv | file | No | PDF or DOCX only; max 5 MB |

**Success response -- 201 Created:**

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

**Error responses:**

| HTTP Status | Code | Trigger |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Missing required fields or invalid format |
| 409 | `CANDIDATE_ALREADY_EXISTS` | Email already registered |
| 413 | `FILE_TOO_LARGE` | CV file exceeds 5 MB |
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

---

## Files to Create / Modify

### Backend

```
backend/
├── prisma/
│   └── schema.prisma                           MODIFY  add Candidate, Education, WorkExperience
├── src/
│   ├── domain/
│   │   ├── models/
│   │   │   ├── Candidate.ts                    CREATE  Candidate entity class
│   │   │   ├── Education.ts                    CREATE  Education entity class
│   │   │   └── WorkExperience.ts               CREATE  WorkExperience entity class
│   │   └── repositories/
│   │       └── ICandidateRepository.ts         CREATE  repository interface
│   ├── application/
│   │   ├── services/
│   │   │   └── candidateService.ts             CREATE  addCandidate() business logic
│   │   └── validator.ts                        MODIFY  add validateCandidateInput()
│   ├── presentation/
│   │   └── controllers/
│   │       └── candidateController.ts          CREATE  POST /candidates handler
│   ├── infrastructure/
│   │   └── repositories/
│   │       └── candidateRepository.ts          CREATE  Prisma implementation of ICandidateRepository
│   ├── middleware/
│   │   └── upload.ts                           CREATE  multer config for CV upload
│   └── routes/
│       └── candidateRoutes.ts                  CREATE  Express router for /candidates
```

**Additional backend changes:**
- `backend/src/index.ts` -- register `candidateRoutes` under `/candidates`
- `backend/package.json` -- add `multer` and `@types/multer` as dependencies
- Run: `npx prisma migrate dev --name add_candidate_model`
- Run: `npm run prisma:generate`

### Frontend

```
frontend/src/
├── components/
│   └── AddCandidateForm.tsx                    CREATE  form component
├── services/
│   └── candidateService.ts                     CREATE  API client for POST /candidates
└── tests/
    └── AddCandidateForm.test.tsx               CREATE  component unit tests
```

**Additional frontend changes:**
- `frontend/src/App.tsx` -- add route `/candidates/new` pointing to `<AddCandidateForm />`

---

## Key Implementation Details

### ICandidateRepository

File: `backend/src/domain/repositories/ICandidateRepository.ts`

```typescript
export interface ICandidateRepository {
    findById(id: number): Promise<Candidate | null>;
    findByEmail(email: string): Promise<Candidate | null>;
    save(candidate: Candidate): Promise<Candidate>;
}
```

### Candidate Entity

File: `backend/src/domain/models/Candidate.ts`

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

### Validator addition

File: `backend/src/application/validator.ts`

```typescript
// Validates and returns typed CreateCandidateDTO; throws ValidationError on failure.
export function validateCandidateInput(
    body: unknown,
    file?: Express.Multer.File
): CreateCandidateDTO {
    // firstName: required, non-empty, max 100 chars
    // lastName:  required, non-empty, max 100 chars
    // email:     required, valid RFC 5322 format
    // phone:     optional; if present must match E.164 /^\+[1-9]\d{1,14}$/
    // address:   optional; max 255 chars
    // educations: optional JSON array; each item needs institution, degree, startDate
    // workExperiences: optional JSON array; each item needs company, position, startDate
}
```

### CV Upload Middleware

File: `backend/src/middleware/upload.ts`

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

---

## Acceptance Criteria

1. An **"Add Candidate"** button is visible and keyboard-accessible from the recruiter dashboard (`/`).
2. Clicking the button navigates to `/candidates/new` and renders `<AddCandidateForm />`.
3. The form displays all fields defined in the Data Model section, clearly labelled.
4. Submitting with a **missing required field** shows an inline validation error before any network request.
5. Submitting with an **invalid email format** shows an inline error on the email field.
6. Submitting with a **CV file > 5 MB** shows an error message before upload.
7. Submitting with an **unsupported file type** shows an error before upload.
8. A successful submission calls `POST /candidates`, receives `201`, and displays: _"Candidate added successfully."_
9. After success, the form resets and the user can navigate back to the dashboard.
10. If the API returns `409 CANDIDATE_ALREADY_EXISTS`, the email field shows: _"A candidate with this email already exists."_
11. If the API returns a `5xx` error, a generic banner shows: _"An unexpected error occurred. Please try again."_
12. All inputs have associated `<label>` elements or `aria-label` attributes.

---

## Unit Tests

### Backend -- `backend/src/tests/candidateService.test.ts`

- `addCandidate()` saves and returns a candidate when all required fields are valid
- `addCandidate()` throws `ValidationError` when email is missing
- `addCandidate()` throws `ValidationError` when email format is invalid
- `addCandidate()` throws `CandidateAlreadyExistsError` when email is already registered
- `addCandidate()` persists educations and workExperiences as nested records
- `addCandidate()` sets cvFileName and cvFilePath when a file is provided

### Backend -- `backend/src/tests/candidateController.test.ts`

- `POST /candidates` returns `201` with candidate data on valid input
- `POST /candidates` returns `400 VALIDATION_ERROR` on missing firstName
- `POST /candidates` returns `409 CANDIDATE_ALREADY_EXISTS` on duplicate email
- `POST /candidates` returns `413 FILE_TOO_LARGE` when file exceeds 5 MB
- `POST /candidates` returns `415 UNSUPPORTED_FILE_TYPE` for non-PDF/DOCX files

### Frontend -- `frontend/src/tests/AddCandidateForm.test.tsx`

- Renders all form fields correctly
- Shows validation error when submitting with empty required fields
- Shows email format error for invalid email
- Calls `candidateService.create()` with correct payload on valid submission
- Displays success banner after a `201` API response
- Displays error banner when API returns a `5xx` response

---

## Non-Functional Requirements

### Security
- Strip HTML tags from all text fields before persistence.
- Validate MIME type **server-side** (never rely on file extension alone).
- Store CV files in the path defined by `CV_UPLOAD_DIR` env variable; never serve from a public path.
- Enforce email uniqueness at both application layer and database level.

### Performance
- `POST /candidates` (no file) must respond within **500 ms**.
- File upload must complete within **10 seconds** for files up to 5 MB.

### Error Handling
- Catch all unexpected errors in the global Express error middleware.
- Log errors via `src/infrastructure/logger.ts`; never expose stack traces to the client.

### Browser / Device Compatibility
- Functional on Chrome 120+, Firefox 120+, Safari 17+.
- Responsive and usable on viewports >= 320 px wide.

---

## Git Branches

- Backend: `feature/add-candidate-backend`
- Frontend: `feature/add-candidate-frontend`
