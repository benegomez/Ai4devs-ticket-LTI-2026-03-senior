---
description: Generates a detailed, checkable development plan (plan.md) for each ticket of a user story. Developers mark tasks complete with [x]. Accepts an optional layer filter (database | backend | frontend).
---

Please create a development plan from the ticket(s) of the user story: $ARGUMENTS

## Argument parsing

`$ARGUMENTS` is one of:

| Format | Behaviour |
|---|---|
| `<story>` | Generate plans for all three layers |
| `<story> database` or `<story> db` | Database plan only |
| `<story> backend` or `<story> be` | Backend plan only |
| `<story> frontend` or `<story> fe` | Frontend plan only |

Extract the story identifier (first word/token) and the optional layer filter (second token).

## Step 1 — Find the story tickets

- Scan `UserStories/` for a subfolder matching the story identifier.
  - Match against the folder name or story title inside the files.
  - If no match, list available folders and ask for clarification.
- Inside the matched folder locate `Tickets/` with subfolders `DataBase/`, `BackEnd/`,
  `FrontEnd/` (casing may vary). Read the `ticket.md` inside each relevant subfolder.
- If a ticket file is missing for the requested layer, warn the user and skip that layer.

## Step 2 — Determine which plans to generate

- If no layer filter was given, generate all three plans.
- If a filter was given, generate only that plan.

## Step 3 — Write each plan file

Save the plan as `plan.md` **next to** `ticket.md` in the same subfolder.
If `plan.md` already exists, overwrite it.

Each `plan.md` must follow the layer-specific template below. Use `- [ ]` checkboxes for
every individual task so developers can mark progress with `- [x]`.

---

## Database plan template

```markdown
---
ticket: <path to DataBase/ticket.md>
layer: database
progress: 0 / <total-tasks> tasks completed
---

# Development Plan — [DB] <Feature Name>

> Mark each task `- [x]` when done. Update `progress` in the frontmatter accordingly.

## Phase 1 · Prerequisites
- [ ] Confirm PostgreSQL Docker container is running (`docker ps`)
- [ ] Pull latest changes from the default branch
- [ ] Create git branch: `git checkout -b <branch-name>` (see ticket for branch name)

## Phase 2 · Schema changes
_File: `backend/prisma/schema.prisma`_
- [ ] Add the `<Model1>` model (copy block from ticket)
- [ ] Add the `<Model2>` model (copy block from ticket)
- [ ] Add any additional models listed in the ticket
- [ ] Verify every field constraint from the Field Reference table is present
- [ ] Verify `@unique` indices are declared
- [ ] Verify `onDelete: Cascade` on all foreign keys that require it

## Phase 3 · Migration
- [ ] Run `npx prisma migrate dev --name <migration_name>`
- [ ] Confirm migration file was created under `backend/prisma/migrations/`
- [ ] Run `npm run prisma:generate`
- [ ] Confirm TypeScript compilation succeeds: `npm run build`

## Phase 4 · Acceptance-criteria verification
<one checkbox per acceptance criterion extracted from the ticket>

## Phase 5 · Handoff
- [ ] Push branch and open pull request
- [ ] Link this plan in the PR description
- [ ] Request review from a peer before merging
```

---

## Backend plan template

```markdown
---
ticket: <path to BackEnd/ticket.md>
layer: backend
depends-on: <path to DataBase/ticket.md>
progress: 0 / <total-tasks> tasks completed
---

# Development Plan — [BE] <Feature Name>

> Mark each task `- [x]` when done. Update `progress` in the frontmatter accordingly.

## Phase 1 · Prerequisites
- [ ] Database ticket merged and migration applied (`npx prisma migrate dev` runs cleanly)
- [ ] Pull latest changes from the default branch
- [ ] Create git branch: `git checkout -b <branch-name>`
- [ ] Install new dependencies listed in the ticket (e.g. `npm install multer @types/multer`)

## Phase 2 · Domain layer
_`backend/src/domain/`_
- [ ] Create entity file(s) listed in the ticket (one checkbox per file)
- [ ] Create `ICandidateRepository.ts` interface with all methods from the ticket
- [ ] Verify no Prisma imports leak into the domain layer

## Phase 3 · Infrastructure layer
_`backend/src/infrastructure/repositories/`_
- [ ] Create `candidateRepository.ts` implementing `ICandidateRepository`
- [ ] Inject `PrismaClient` via constructor (never use a global instance)
- [ ] Use `include` for nested relations to avoid N+1 queries

## Phase 4 · Application layer
_`backend/src/application/`_
- [ ] Create `candidateService.ts` with the `addCandidate()` function
- [ ] Add `validateCandidateInput()` to `validator.ts`
- [ ] Validate all required fields; throw typed errors on failure
- [ ] Sanitize text fields (strip HTML) before passing to repository

## Phase 5 · Presentation layer
_`backend/src/presentation/` and `backend/src/routes/`_
- [ ] Create `candidateController.ts` with the POST handler
- [ ] Return `{ success: true, data: ... }` on 201 and `{ success: false, error: ... }` on errors
- [ ] Create `candidateRoutes.ts` and wire controller + upload middleware
- [ ] Register route in `backend/src/index.ts`

## Phase 6 · Middleware
_`backend/src/middleware/`_
- [ ] Create `upload.ts` with multer config (allowed MIME types, max size from ticket)
- [ ] Read upload destination from `CV_UPLOAD_DIR` env variable

## Phase 7 · Unit tests
- [ ] Create `backend/src/tests/candidateService.test.ts`
<one checkbox per test case listed in the ticket>
- [ ] Create `backend/src/tests/candidateController.test.ts`
<one checkbox per test case listed in the ticket>
- [ ] Run `npm test` — all tests pass, no real DB connections

## Phase 8 · Non-functional checks
<one checkbox per security / performance / error-handling rule listed in the ticket>

## Phase 9 · Handoff
- [ ] Push branch and open pull request
- [ ] Verify `npm run build` produces no TypeScript errors
- [ ] Link this plan in the PR description
- [ ] Request review from a peer before merging
```

---

## Frontend plan template

```markdown
---
ticket: <path to FrontEnd/ticket.md>
layer: frontend
depends-on: <path to BackEnd/ticket.md>
progress: 0 / <total-tasks> tasks completed
---

# Development Plan — [FE] <Feature Name>

> Mark each task `- [x]` when done. Update `progress` in the frontmatter accordingly.

## Phase 1 · Prerequisites
- [ ] Backend API is running and the endpoint responds (`POST /candidates` returns 201)
- [ ] `REACT_APP_API_BASE_URL` is set in `frontend/.env`
- [ ] Pull latest changes from the default branch
- [ ] Create git branch: `git checkout -b <branch-name>`

## Phase 2 · Service layer
_`frontend/src/services/candidateService.ts`_
- [ ] Create `candidateService.ts` with the `create(formData)` function from the ticket
- [ ] Throw the full error object on non-OK responses (do not swallow errors)
- [ ] Do NOT set `Content-Type` header manually when sending `FormData`

## Phase 3 · Component implementation
_`frontend/src/components/AddCandidateForm.tsx`_
- [ ] Scaffold component with prop types and state shape from the ticket
- [ ] Render all form fields listed in the ticket (one checkbox per field)
- [ ] Implement client-side validation for each field (one checkbox per rule)
- [ ] Show inline error messages beneath each invalid field
- [ ] Disable submit button and show loading indicator while request is in flight
- [ ] Handle success response: display success banner and call `onSuccess` if provided
- [ ] Handle `VALIDATION_ERROR` (400): map `details` array to per-field errors
- [ ] Handle `CANDIDATE_ALREADY_EXISTS` (409): show message on email field
- [ ] Handle `FILE_TOO_LARGE` (413): show error on CV file input
- [ ] Handle `UNSUPPORTED_FILE_TYPE` (415): show error on CV file input
- [ ] Handle 5xx: show generic error banner with `role="alert"`

## Phase 4 · Routing
_`frontend/src/App.tsx`_
- [ ] Add route `/candidates/new` pointing to `AddCandidateForm`

## Phase 5 · Unit tests
_`frontend/src/tests/<ComponentName>.test.tsx`_
<one checkbox per test case listed in the ticket>
- [ ] Run `npm test` — all tests pass

## Phase 6 · Accessibility & NFR checks
<one checkbox per non-functional requirement listed in the ticket>
- [ ] Every input has a `<label>` or `aria-label`
- [ ] Success/error banners use `role="alert"`
- [ ] Manual check: responsive on a 320 px wide viewport

## Phase 7 · Handoff
- [ ] Push branch and open pull request
- [ ] Link this plan in the PR description
- [ ] Request review from a peer before merging
```

---

## Step 4 — Populate placeholders

Before saving each file, replace **all** `<placeholder>` tokens with real values extracted
from the ticket:

- `<Feature Name>` → exact feature name from the ticket's `#` heading
- `<branch-name>` → branch name from the ticket's **Git Branch** section
- `<migration_name>` → infer from the ticket's migration command
- `<total-tasks>` → count the `- [ ]` checkboxes in the generated plan
- Test-case checkboxes → one `- [ ]` per bullet in the ticket's **Unit Tests** section
- Acceptance-criteria checkboxes → one `- [ ]` per item in the **Acceptance Criteria** section
- NFR checkboxes → one `- [ ]` per rule in the **Non-Functional Requirements** section
- Model names and file names → extract from the ticket's **Files to Create / Modify** section

## Step 5 — Confirm completion

After writing all requested plan files, output:

```
Plans created for: <story-id>
<for each generated plan:>
  <path/to/plan.md>  -- [<LAYER>] <Feature Name>  (<N> tasks)
```
