---
status: To do
type: database
story: UserStories/AddNewCandidate/AddnewCandidate.md
---

# [DB] Add New Candidate to ATS

## Objective

Add three new Prisma models -- `Candidate`, `Education`, and `WorkExperience` -- to the
LTI ATS PostgreSQL database. This ticket establishes the full data schema for storing
candidate profiles, including personal details, CV file references, educational history,
and work experience records. All backend and frontend work depends on this ticket being
merged and the migration applied first.

## Scope

Database schema only. No API routes, no business logic, no UI concerns.

## Prisma Schema Changes

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

## Field Reference

| Model | Field | Type | Required | Constraints |
|---|---|---|---|---|
| Candidate | firstName | String | **Yes** | Non-empty, max 100 chars |
| Candidate | lastName | String | **Yes** | Non-empty, max 100 chars |
| Candidate | email | String | **Yes** | Valid RFC 5322 format; unique index |
| Candidate | phone | String | No | E.164 format if provided |
| Candidate | address | String | No | Max 255 chars |
| Candidate | cvFileName | String | No | Set server-side on upload |
| Candidate | cvFilePath | String | No | Set server-side on upload |
| Education | institution | String | **Yes** | Non-empty |
| Education | degree | String | **Yes** | Non-empty |
| Education | fieldOfStudy | String | No | -- |
| Education | startDate | DateTime | **Yes** | ISO 8601 |
| Education | endDate | DateTime | No | Must be after startDate |
| Education | current | Boolean | **Yes** | Default: false |
| WorkExperience | company | String | **Yes** | Non-empty |
| WorkExperience | position | String | **Yes** | Non-empty |
| WorkExperience | description | String | No | Max 500 chars |
| WorkExperience | startDate | DateTime | **Yes** | ISO 8601 |
| WorkExperience | endDate | DateTime | No | Must be after startDate |
| WorkExperience | current | Boolean | **Yes** | Default: false |

## Migration

After editing `backend/prisma/schema.prisma`, run in order:

1. `npx prisma migrate dev --name add_candidate_model`
2. `npm run prisma:generate`

## Acceptance Criteria

1. The `Candidate`, `Education`, and `WorkExperience` tables exist in PostgreSQL after migration.
2. `Candidate.email` has a unique index -- inserting two candidates with the same email must
   fail with a unique-constraint violation.
3. Deleting a `Candidate` cascades and removes all related `Education` and `WorkExperience` rows.
4. All non-nullable fields (`firstName`, `lastName`, `email`, `institution`, `degree`,
   `startDate`, `company`, `position`) reject NULL at the database level.
5. `Education.current` and `WorkExperience.current` default to `false` when not supplied.
6. `npx prisma migrate dev` completes without errors on a fresh database.
7. `npm run prisma:generate` regenerates the Prisma client without TypeScript errors.

## Dependencies

None. This ticket must be completed and merged before backend work begins.
