---
status: To do
type: frontend
story: UserStories/AddNewCandidate/AddnewCandidate.md
depends-on: UserStories/AddNewCandidate/Tickets/BackEnd/ticket.md
---

# [FE] Add New Candidate to ATS

## Objective

Build the `<AddCandidateForm />` React component and its supporting service layer, then wire
them into the application router at `/candidates/new`. The form lets a recruiter enter
candidate details (personal info, education, work experience) and upload a CV, with immediate
visual feedback for validation errors, success, and API failures.

## Scope

React components, service layer (API client), and routing only.
No Prisma schema, no Express middleware, no DDD layer internals.

## Dependency

`UserStories/AddNewCandidate/Tickets/BackEnd/ticket.md` must be deployed with the
`POST /candidates` endpoint reachable before integration testing begins.

## API Contract (consumed)

**Endpoint:** `POST /candidates`
**Content-Type:** `multipart/form-data`
**Base URL:** read from `REACT_APP_API_BASE_URL` env variable (default: `http://localhost:4010`)

### Request fields

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

### Success -- 201 Created

```json
{ "success": true, "data": { "id": 1, "firstName": "John", "lastName": "Doe", ... } }
```

### Errors the UI must handle

| Code | HTTP | Required UI behaviour |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Show inline error beneath each affected field |
| `CANDIDATE_ALREADY_EXISTS` | 409 | Highlight email field: _"A candidate with this email already exists."_ |
| `FILE_TOO_LARGE` | 413 | Show error on CV input: _"File must be smaller than 5 MB."_ |
| `UNSUPPORTED_FILE_TYPE` | 415 | Show error on CV input: _"Only PDF and DOCX files are accepted."_ |
| 5xx | 500+ | Show generic banner: _"An unexpected error occurred. Please try again."_ |

## Files to Create / Modify

```
frontend/src/
├── components/
│   └── AddCandidateForm.tsx       CREATE  form component
├── services/
│   └── candidateService.ts        CREATE  API client for POST /candidates
├── tests/
│   └── AddCandidateForm.test.tsx  CREATE  component unit tests
└── App.tsx                        MODIFY  add route /candidates/new
```

## Component Details

**File:** `frontend/src/components/AddCandidateForm.tsx`

```typescript
type AddCandidateFormProps = {
    onSuccess?: () => void;
};

// Internal state shape
const [loading, setLoading]         = useState(false);
const [success, setSuccess]         = useState(false);
const [globalError, setGlobalError] = useState('');
const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
```

### Form fields and client-side validation rules

| Field | Input type | Required | Validation rule |
|---|---|---|---|
| firstName | text | **Yes** | Non-empty; max 100 chars |
| lastName | text | **Yes** | Non-empty; max 100 chars |
| email | email | **Yes** | Non-empty; valid RFC 5322 format |
| phone | tel | No | If provided, must match `/^\+[1-9]\d{1,14}$/` |
| address | text | No | Max 255 chars |
| educations | dynamic list | No | Each entry: institution (**req**), degree (**req**), startDate (**req**) |
| workExperiences | dynamic list | No | Each entry: company (**req**), position (**req**), startDate (**req**) |
| cv (file input) | file | No | Client-side: PDF/DOCX only; < 5 MB before submit |

Validate all required fields **before** any network request. Show errors inline beneath each field.
While the request is in flight, disable the submit button and display a loading indicator.

## Service Layer

**File:** `frontend/src/services/candidateService.ts`

```typescript
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:4010';

export type Candidate = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    cvFileName?: string;
    educations: Education[];
    workExperiences: WorkExperience[];
    createdAt: string;
};

export const candidateService = {
    create: async (formData: FormData): Promise<Candidate> => {
        const response = await fetch(`${API_BASE_URL}/candidates`, {
            method: 'POST',
            body: formData,         // Do NOT set Content-Type header manually
        });
        if (!response.ok) {
            const err = await response.json();
            throw err;              // Re-throw the full error object for the component
        }
        const result = await response.json();
        return result.data as Candidate;
    },
};
```

## Unit Tests

**File:** `frontend/src/tests/AddCandidateForm.test.tsx`

- Renders all form fields: firstName, lastName, email, phone, address, cv
- Shows inline error on `firstName` when form is submitted empty
- Shows inline error on `lastName` when form is submitted empty
- Shows inline error on `email` when form is submitted empty
- Shows inline error on `email` when format is invalid (e.g. `notanemail`)
- Shows CV file error when selected file exceeds 5 MB (client-side, before submit)
- Shows CV file error when selected file type is not PDF or DOCX (client-side)
- Calls `candidateService.create()` with a `FormData` containing correct values on valid submit
- Disables submit button and shows spinner while request is in flight
- Displays success banner _"Candidate added successfully."_ after a `201` response
- Displays `CANDIDATE_ALREADY_EXISTS` message on the email field after a `409` response
- Displays generic error banner after a `500` response

Follow **Arrange-Act-Assert** with React Testing Library.
Mock `candidateService` at the module level with `jest.mock('../services/candidateService')`.

## Non-Functional Requirements

- Every input must have an associated `<label>` element or an `aria-label` attribute.
- The submit button must be `disabled` and show a visible loading indicator while the request
  is in flight.
- Success and error banners must use `role="alert"` so screen readers announce them
  immediately without requiring focus.
- All async state transitions (loading, success, error) must produce a visually distinct UI
  state (colour, icon, or text change).
- Compatible with **Chrome 120+**, **Firefox 120+**, **Safari 17+**.
- Responsive and usable on viewports **>= 320 px wide**.

## Git Branch

`feature/add-candidate-frontend`
