---
description: Implements the code for a user story ticket by executing its plan.md phase by phase, following the layer-specific coding standards. Marks each task complete as it finishes.
---

Please implement the development plan: $ARGUMENTS

## Argument parsing

`$ARGUMENTS` must include a story identifier and a layer:

| Format | Examples |
|---|---|
| `<story> <layer>` | `AddNewCandidate backend` |
| `<story> <alias>` | `AddNewCandidate db`, `AddNewCandidate be`, `AddNewCandidate fe` |

Accepted layer values: `database` / `db`, `backend` / `be`, `frontend` / `fe`.
If the layer is missing or ambiguous, list the available layers for the matched story and ask.

## Step 1 — Load context

1. **Find the story folder** — scan `UserStories/` for a subfolder matching the story identifier.
   If no match, list available folders and ask for clarification.

2. **Resolve the ticket folder** — map the layer to its subfolder:
   - `database` / `db` → `Tickets/DataBase/`
   - `backend`  / `be` → `Tickets/BackEnd/`
   - `frontend` / `fe` → `Tickets/FrontEnd/`

3. **Read required files** (all must exist before proceeding):
   - `<ticket-folder>/plan.md` — the ordered task checklist to execute
   - `<ticket-folder>/ticket.md` — the full specification (API contract, code snippets, NFR)
   - `.augment/rules/base.md` — universal coding principles
   - Layer-specific standards:
     - database or backend → `.augment/rules/backend-standards.md`
     - frontend → `.augment/rules/frontend-standards.md`

4. **Scan the codebase** — before writing any file, inspect what already exists in `backend/src/`
   or `frontend/src/` so you never overwrite existing code without first merging carefully.

5. **Guard clause** — if `plan.md` has no unchecked tasks (`- [ ]`), report that the plan is
   already fully complete and stop.

## Step 2 — Establish working rules

Apply the following non-negotiable constraints for **every** file you write or modify:

### Universal (all layers)
- English only: all code, comments, variable names, error messages, log messages.
- Explicit TypeScript types on every parameter and return value — no `any`.
- No uncommitted secrets or hard-coded credentials.
- One logical concern per file; keep files focused.

### Database layer
- `backend/prisma/schema.prisma` is the **only** place for schema changes.
- Never run raw SQL; all changes go through `npx prisma migrate dev`.
- After schema edits always regenerate the client: `npm run prisma:generate`.

### Backend layer (DDD order — always follow this sequence)
1. **Domain** (`src/domain/`) — entities and repository interfaces. Zero Prisma imports here.
2. **Infrastructure** (`src/infrastructure/`) — Prisma repository implementations.
   Inject `PrismaClient` via constructor; never import it directly in the class body.
3. **Application** (`src/application/`) — services and validator.
   Services call repositories through their interfaces. Validator centralised in `validator.ts`.
4. **Presentation** (`src/presentation/controllers/`) — HTTP handlers only.
   Delegate all logic to services; pass every error to `next(error)`.
5. **Middleware** (`src/middleware/`) — Express middleware (e.g. multer upload).
6. **Routes** (`src/routes/`) — wire middleware and controller; register in `src/index.ts`.
7. **Tests** (`src/tests/`) — mock all Prisma calls; never connect to a real database.
   Use Arrange-Act-Assert. Call `jest.clearAllMocks()` in `beforeEach`.

### Frontend layer
- Functional components with hooks only; no class components.
- Explicit `React.FC<Props>` type with a named `Props` type defined above the component.
- All API calls live in `src/services/`; never `fetch` directly from a component.
- Always handle `loading`, `error`, and `success` states for every async operation.
- Every input must have a `<label>` or `aria-label`; async state banners must use `role="alert"`.
- Tests use React Testing Library + Jest; mock the service layer with `jest.mock(...)`.

## Step 3 — Execute the plan, one phase at a time

Work through the plan **phase by phase**. Within each phase, complete tasks **one at a time**:

1. Read the next unchecked task (`- [ ]`) in the current phase.
2. Implement it fully — write or modify the file(s) required by that task.
3. After the implementation is confirmed correct, mark the task done in `plan.md`:
   - Change `- [ ]` to `- [x]` for the completed task.
   - Increment the `progress` counter in the frontmatter (e.g. `3 / 23 tasks completed`).
4. Move to the next task. Do **not** skip ahead or batch multiple tasks into one edit.

**Do not start the next phase until all tasks in the current phase are marked `[x]`.**

### Phase gate for backend

After completing **Phase 2 (Domain layer)**:
- Verify no Prisma types appear in any `src/domain/` file.
- Only then proceed to Phase 3 (Infrastructure).

After completing **Phase 6 (Middleware)**:
- Run `npm run build` mentally (check for obvious TypeScript errors) before writing tests.

### Phase gate for frontend

After completing **Phase 2 (Service layer)**:
- Confirm `candidateService.ts` does not set `Content-Type` when sending `FormData`.

After completing **Phase 3 (Component)**:
- All form fields render; all inline error messages fire on submit with invalid input.
- Only then add the route (Phase 4) and write tests (Phase 5).

## Step 4 — Layer-specific implementation guidance

### Database

When editing `backend/prisma/schema.prisma`:
- Copy the exact model blocks from `ticket.md § Prisma Schema Changes`.
- Place new models **after** existing models; never delete existing ones.
- After saving, output the two migration commands from the ticket so the developer can run them.
- Verify acceptance criteria by listing what each criterion checks and confirming the schema
  satisfies it. Do **not** run migrations yourself — instruct the developer to run them.

### Backend

**Error classes** — define custom errors at `src/domain/models/errors.ts` if they do not exist:
```typescript
export class ValidationError extends Error {
    constructor(public details: string[]) {
        super('Validation failed');
        this.name = 'ValidationError';
    }
}
export class CandidateAlreadyExistsError extends Error {
    constructor() { super('Candidate already exists'); this.name = 'CandidateAlreadyExistsError'; }
}
```

**Response helper** — use the standard shape from `backend-standards.md`:
```typescript
res.status(201).json({ success: true, data: candidate });
res.status(400).json({ success: false, error: { message, code, details } });
```

**Test structure** — each test file must open with:
```typescript
jest.mock('../../infrastructure/repositories/candidateRepository');
describe('CandidateService - addCandidate', () => {
    beforeEach(() => { jest.clearAllMocks(); });
    it('should ...', async () => { /* Arrange / Act / Assert */ });
});
```

### Frontend

**Service pattern** (from `frontend-standards.md`):
```typescript
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:4010';
export const candidateService = {
    create: async (formData: FormData): Promise<Candidate> => {
        const response = await fetch(`${API_BASE_URL}/candidates`, { method: 'POST', body: formData });
        if (!response.ok) { const err = await response.json(); throw err; }
        return (await response.json()).data as Candidate;
    },
};
```

**Test pattern**:
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
jest.mock('../services/candidateService');
describe('AddCandidateForm', () => {
    beforeEach(() => { jest.clearAllMocks(); });
    it('should show error when firstName is empty', async () => { /* AAA */ });
});
```

## Step 5 — Final verification

After all phases are marked complete:

### Database
- Output the two migration commands the developer must run:
  1. `npx prisma migrate dev --name <name>`
  2. `npm run prisma:generate`
- Summarize which acceptance criteria are satisfied by the schema.

### Backend
- Output: `cd backend && npm run build` — instruct the developer to run it and confirm zero errors.
- Output: `cd backend && npm test` — instruct the developer to confirm all tests pass.

### Frontend
- Output: `cd frontend && npm test` — instruct the developer to confirm all tests pass.
- Remind the developer to set `REACT_APP_API_BASE_URL` in `frontend/.env` before manual testing.

## Step 6 — Completion report

Once all tasks in `plan.md` are `[x]`, output:

```
Plan complete: [<LAYER>] <Feature Name>

  plan.md progress: <N> / <N> tasks completed

Files created:
  <list each new file with its DDD layer or role>

Files modified:
  <list each modified file and what changed>

Next step:
  <database>  Run migrations, then start the backend ticket.
  <backend>   Run `npm run build && npm test`, then start the frontend ticket.
  <frontend>  Run `npm test`, verify UI manually, then open the pull request.
```
