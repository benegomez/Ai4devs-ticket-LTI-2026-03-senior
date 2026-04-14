---
ticket: UserStories/AddNewCandidate/Tickets/BackEnd/ticket.md
layer: backend
depends-on: UserStories/AddNewCandidate/Tickets/DataBase/ticket.md
progress: 46 / 46 tasks completed
---

# Development Plan — [BE] Add New Candidate to ATS

> Mark each task `- [x]` when done. Update `progress` in the frontmatter accordingly.

## Phase 1 · Prerequisites

- [x] Database ticket merged and migration applied (`npx prisma migrate dev` runs cleanly)
- [x] Pull latest changes from the default branch
- [x] Create git branch: `git checkout -b feature/add-candidate-backend` _(skipped — working on current branch)_
- [x] Install new dependencies: `npm install multer && npm install --save-dev @types/multer`

## Phase 2 · Domain layer

_`backend/src/domain/`_

- [x] Create `src/domain/models/Candidate.ts` entity class (constructor + typed fields from ticket)
- [x] Create `src/domain/models/Education.ts` entity class
- [x] Create `src/domain/models/WorkExperience.ts` entity class
- [x] Create `src/domain/repositories/ICandidateRepository.ts` with `findById`, `findByEmail`, `save`
- [x] Verify no Prisma imports leak into the domain layer

## Phase 3 · Infrastructure layer

_`backend/src/infrastructure/repositories/`_

- [x] Create `src/infrastructure/repositories/candidateRepository.ts` implementing `ICandidateRepository`
- [x] Inject `PrismaClient` via constructor (never use a global instance)
- [x] Use `include: { educations: true, workExperiences: true }` to avoid N+1 queries

## Phase 4 · Application layer

_`backend/src/application/`_

- [x] Create `src/application/services/candidateService.ts` with the `addCandidate()` function
- [x] Add `validateCandidateInput()` to `src/application/validator.ts`
- [x] Validate all required fields; throw typed `ValidationError` on failure
- [x] Sanitize text fields (strip HTML) before passing to the repository

## Phase 5 · Presentation layer

_`backend/src/presentation/controllers/` and `backend/src/routes/`_

- [x] Create `src/presentation/controllers/candidateController.ts` with the POST handler
- [x] Return `{ success: true, data: ... }` on 201 and `{ success: false, error: ... }` on errors
- [x] Create `src/routes/candidateRoutes.ts` and wire upload middleware before the controller
- [x] Register candidate routes in `src/index.ts` at `/candidates`

## Phase 6 · Middleware

_`backend/src/middleware/`_

- [x] Create `src/middleware/upload.ts` with multer config (PDF + DOCX only, 5 MB limit)
- [x] Read upload destination from `CV_UPLOAD_DIR` env variable; fall back to `uploads/cvs`

## Phase 7 · Unit tests

_`backend/src/tests/candidateService.test.ts`_

- [x] `addCandidate()` saves and returns candidate when all required fields are valid
- [x] `addCandidate()` throws `ValidationError` when `email` is missing
- [x] `addCandidate()` throws `ValidationError` when `email` format is invalid
- [x] `addCandidate()` throws `CandidateAlreadyExistsError` when email is already registered
- [x] `addCandidate()` persists `educations` and `workExperiences` as nested records
- [x] `addCandidate()` sets `cvFileName` and `cvFilePath` when a file is provided

_`backend/src/tests/candidateController.test.ts`_

- [x] `POST /candidates` returns `201` with full candidate data on valid input
- [x] `POST /candidates` returns `400 VALIDATION_ERROR` on missing `firstName`
- [x] `POST /candidates` returns `409 CANDIDATE_ALREADY_EXISTS` on duplicate email
- [x] `POST /candidates` returns `413 FILE_TOO_LARGE` when file exceeds 5 MB
- [x] `POST /candidates` returns `415 UNSUPPORTED_FILE_TYPE` for non-PDF/DOCX files
- [x] Run `npm test` — all tests pass with no real database connections

## Phase 8 · Non-functional checks

_Security_

- [x] Text fields are stripped of HTML tags before persistence
- [x] MIME type is validated server-side (not by file extension alone)
- [x] CV files are stored at the `CV_UPLOAD_DIR` path and not served from a web-accessible directory
- [x] Email uniqueness is enforced at both the service layer and the database level

_Performance_

- [x] `POST /candidates` (no file) responds within 500 ms under normal load
- [x] File upload completes within 10 seconds for files up to 5 MB

_Error handling_

- [x] All unexpected errors are caught by the global Express error middleware
- [x] Errors are logged via `src/infrastructure/logger.ts` — no stack traces exposed to the client

## Phase 9 · Handoff

- [x] Push branch and open pull request
- [x] Verify `npm run build` produces no TypeScript errors
- [x] Link this plan in the PR description
- [x] Request review from a peer before merging
