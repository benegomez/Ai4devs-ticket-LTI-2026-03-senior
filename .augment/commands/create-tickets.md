---
description: Splits an enriched user story into three standalone implementation tickets (database, backend, frontend) stored inside the story's tickets/ subfolder.
---

Please create implementation tickets from the enriched user story: $ARGUMENTS

Follow these steps:

## Step 1 -- Find the Enriched Story

- Scan `UserStories/` at the project root for a subfolder matching `$ARGUMENTS`.
  - `$ARGUMENTS` may be an exact folder name (e.g., `AddNewCandidate`), a feature keyword,
    or a status hint (e.g., "the one pending validation").
  - Match against the folder name or the story title inside the file.
- Read the story file inside the matched folder.
- Verify the file contains a `## [enhanced]` section. If it does not, stop and instruct
  the user to run `enrich-us` on this story first.
- If no folder matches, list all available folders under `UserStories/` and ask for
  clarification.

## Step 2 -- Parse the Enhanced Section by Layer

Extract all content from the `## [enhanced]` section and classify it into three layers:

| Layer    | Content to extract |
|----------|--------------------|
| Database | Prisma model definitions, field reference table, migration commands,
              data-integrity constraints (unique, cascade, nullable) |
| Backend  | API endpoint spec (method, path, request/response, error codes),
              DDD files to create/modify (domain/application/presentation/
              infrastructure/middleware/routes), entity class, repository interface,
              service function, validator function, upload middleware,
              backend unit tests, backend NFR (security, performance, error handling) |
| Frontend | Files to create/modify (components, services, App.tsx route update),
              component prop types, form field list and validation rules,
              API contract consumed (endpoint + expected response shapes),
              frontend unit tests, frontend NFR (accessibility, browsers, layout) |

## Step 3 -- Create the Folder Structure

Inside the matched story folder, create:

```
UserStories/<story-id>/
└── tickets/
    ├── database/
    │   └── ticket.md
    ├── backend/
    │   └── ticket.md
    └── frontend/
        └── ticket.md
```

If any of these files already exist, overwrite them.

## Step 4 -- Write the Database Ticket

Write `UserStories/<story-id>/tickets/database/ticket.md` using this template:

```markdown
---
status: To do
type: database
story: UserStories/<story-id>/<story-file>.md
---

# [DB] <Feature Name>

## Objective
<one-paragraph summary of what this ticket achieves at the data layer>

## Scope
Database schema only. No API routes, no business logic, no UI concerns.

## Prisma Schema Changes
<full Prisma model definitions to add/modify in backend/prisma/schema.prisma>

## Field Reference
| Model | Field | Type | Required | Constraints |
|-------|-------|------|----------|-------------|
<rows extracted from the enhanced story>

## Migration
After editing the schema, run:
1. `npx prisma migrate dev --name <descriptive_name>`
2. `npm run prisma:generate`

## Acceptance Criteria
<numbered list: each model exists in the DB, unique constraints enforced,
 cascade deletes applied, migration runs cleanly on a fresh database>

## Dependencies
None. This ticket must be completed and merged before backend work begins.
```

Rules for this ticket:
- Only database concerns. No service code, no HTTP handlers, no React components.
- Every constraint from the field reference table must be reflected in the schema.

## Step 5 -- Write the Backend Ticket

Write `UserStories/<story-id>/tickets/backend/ticket.md` using this template:

```markdown
---
status: To do
type: backend
story: UserStories/<story-id>/<story-file>.md
depends-on: UserStories/<story-id>/tickets/database/ticket.md
---

# [BE] <Feature Name>

## Objective
<one-paragraph summary of what this ticket achieves at the API/business-logic layer>

## Scope
Express API, DDD layers, and file-upload middleware only.
Schema changes are in the database ticket.

## Dependency
The database ticket must be merged and the migration applied before starting.

## API Endpoint
**Method & path:** `POST /candidates`
**Content-Type:** `multipart/form-data`

Request fields:
| Field | Type | Required | Notes |
<rows extracted from the enhanced story>

Success response (201):
```json
<extracted JSON example>
```

Error responses:
| HTTP | Code | Trigger |
<rows extracted from the enhanced story>

## Files to Create / Modify
<annotated directory tree showing backend files per DDD layer with CREATE/MODIFY labels>

## Key Implementation Details
<TypeScript code snippets: entity class skeleton, ICandidateRepository interface,
 service function signature, validator function signature, upload middleware config>

## Unit Tests
File: `backend/src/tests/candidateService.test.ts`
<bullet list of named test cases>

File: `backend/src/tests/candidateController.test.ts`
<bullet list of named test cases>

Use Arrange-Act-Assert. Call `jest.clearAllMocks()` in `beforeEach`.
Mock all Prisma calls; never use a real database in unit tests.

## Non-Functional Requirements
<security rules, response-time SLAs, error handling constraints -- backend only>

## Git Branch
`feature/<feature-name>-backend`
```

Rules for this ticket:
- Do not repeat Prisma model definitions (they belong to the database ticket).
- The API contract section must be complete; the frontend ticket will reference it.
- Map every file to its correct DDD layer.

## Step 6 -- Write the Frontend Ticket

Write `UserStories/<story-id>/tickets/frontend/ticket.md` using this template:

```markdown
---
status: To do
type: frontend
story: UserStories/<story-id>/<story-file>.md
depends-on: UserStories/<story-id>/tickets/backend/ticket.md
---

# [FE] <Feature Name>

## Objective
<one-paragraph summary of what this ticket achieves at the UI layer>

## Scope
React components, service layer, and routing only.
No Prisma schema, no Express middleware, no DDD internals.

## Dependency
The backend ticket must be deployed with the API reachable before integration testing.

## API Contract (consumed)
**Endpoint:** `POST /candidates` (multipart/form-data)

Request fields:
| Field | Type | Required | Notes |
<same table as in the backend ticket -- frontend needs it self-contained>

Success (201): `{ "success": true, "data": { ... } }`
Errors the UI must handle:
| Code | UI behaviour |
| VALIDATION_ERROR | show inline field errors |
| CANDIDATE_ALREADY_EXISTS | highlight email field with message |
| FILE_TOO_LARGE / UNSUPPORTED_FILE_TYPE | show file input error |
| 5xx | show generic error banner |

## Files to Create / Modify
<annotated frontend file tree with CREATE/MODIFY labels>

## Component Details
```typescript
// Prop types
type <ComponentName>Props = { ... };

// State shape
const [loading, setLoading] = useState(false);
const [error, setError]     = useState('');
```

Form fields and client-side validation rules:
| Field | Input type | Required | Validation rule |
<rows extracted from the enhanced story>

## Service Layer
```typescript
// frontend/src/services/candidateService.ts
export const candidateService = {
    create: async (formData: FormData): Promise<Candidate> => { ... }
};
```

## Unit Tests
File: `frontend/src/tests/<ComponentName>.test.tsx`
<bullet list of named test cases>

Follow Arrange-Act-Assert with React Testing Library.

## Non-Functional Requirements
- All inputs must have `<label>` elements or `aria-label` attributes.
- Loading, success, and error state transitions must be visually distinct.
- Compatible with Chrome 120+, Firefox 120+, Safari 17+.
- Responsive on viewports >= 320 px wide.

## Git Branch
`feature/<feature-name>-frontend`
```

Rules for this ticket:
- The API Contract section must be fully self-contained (copy from backend ticket).
- List every client-side validation rule explicitly; developers must not need to guess.
- Accessibility: screen-reader announcements required for all async state changes.

## Step 7 -- Confirm Completion

After writing all three files, output this summary:

```
Tickets created for: <story-id>

  UserStories/<story-id>/tickets/database/ticket.md  -- [DB] <Feature Name>
  UserStories/<story-id>/tickets/backend/ticket.md   -- [BE] <Feature Name>
  UserStories/<story-id>/tickets/frontend/ticket.md  -- [FE] <Feature Name>

Recommended completion order:
  1. [DB] Complete database ticket and run migrations.
  2. [BE] Complete backend ticket once DB is merged.
  3. [FE] Complete frontend ticket once the API endpoint is available.
```
