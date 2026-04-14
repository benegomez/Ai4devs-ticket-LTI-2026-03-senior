---
ticket: UserStories/AddNewCandidate/Tickets/DataBase/ticket.md
layer: database
progress: 23 / 23 tasks completed
---

# Development Plan — [DB] Add New Candidate to ATS

> Mark each task `- [x]` when done. Update `progress` in the frontmatter accordingly.

## Phase 1 · Prerequisites

- [x] Confirm PostgreSQL Docker container is running (`docker ps`)
- [x] Pull latest changes from the default branch
- [x] Create git branch: `git checkout -b feature/add-candidate-database` _(skipped — working on current branch)_

## Phase 2 · Schema changes

_File: `backend/prisma/schema.prisma`_

- [x] Add the `Candidate` model (copy block from ticket)
- [x] Add the `Education` model (copy block from ticket)
- [x] Add the `WorkExperience` model (copy block from ticket)
- [x] Verify every field constraint from the Field Reference table is reflected in the schema
- [x] Verify `@unique` index is declared on `Candidate.email`
- [x] Verify `onDelete: Cascade` on `Education.candidate` and `WorkExperience.candidate`

## Phase 3 · Migration

- [x] Run `npx prisma migrate dev --name add_candidate_model`
- [x] Confirm migration file was created under `backend/prisma/migrations/`
- [x] Run `npm run prisma:generate`
- [x] Confirm TypeScript compilation succeeds: `npm run build`

## Phase 4 · Acceptance-criteria verification

- [x] The `Candidate`, `Education`, and `WorkExperience` tables exist in PostgreSQL after migration
- [x] `Candidate.email` unique index enforced — inserting two rows with the same email fails with a constraint violation
- [x] Deleting a `Candidate` cascades and removes all related `Education` and `WorkExperience` rows
- [x] All non-nullable fields (`firstName`, `lastName`, `email`, `institution`, `degree`, `startDate`, `company`, `position`) reject NULL at the database level
- [x] `Education.current` and `WorkExperience.current` default to `false` when not supplied
- [x] `npx prisma migrate dev` completes without errors on a fresh database
- [x] `npm run prisma:generate` regenerates the Prisma client without TypeScript errors

## Phase 5 · Handoff

- [x] Push branch and open pull request
- [x] Link this plan in the PR description
- [x] Request review from a peer before merging
