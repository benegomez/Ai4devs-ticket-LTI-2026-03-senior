---
ticket: UserStories/AddNewCandidate/Tickets/FrontEnd/ticket.md
layer: frontend
depends-on: UserStories/AddNewCandidate/Tickets/BackEnd/ticket.md
progress: 0 / 55 tasks completed
---

# Development Plan — [FE] Add New Candidate to ATS

> Mark each task `- [x]` when done. Update `progress` in the frontmatter accordingly.

## Phase 1 · Prerequisites

- [ ] Backend API is running and `POST /candidates` returns 201 on a test request
- [ ] `REACT_APP_API_BASE_URL` is set in `frontend/.env` (e.g. `http://localhost:4010`)
- [ ] Pull latest changes from the default branch
- [ ] Create git branch: `git checkout -b feature/add-candidate-frontend`

## Phase 2 · Service layer

_`frontend/src/services/candidateService.ts`_

- [ ] Create `candidateService.ts` with `create(formData: FormData): Promise<Candidate>`
- [ ] Throw the full parsed error object on non-OK responses (do not swallow errors)
- [ ] Do NOT set `Content-Type` header manually when sending `FormData`

## Phase 3 · Component implementation

_`frontend/src/components/AddCandidateForm.tsx`_

- [ ] Scaffold component with `AddCandidateFormProps` and state shape from the ticket
- [ ] Render `firstName` text input with `<label>`
- [ ] Render `lastName` text input with `<label>`
- [ ] Render `email` email input with `<label>`
- [ ] Render `phone` tel input with `<label>` (optional)
- [ ] Render `address` text input with `<label>` (optional)
- [ ] Render dynamic `educations` list with add/remove capability
- [ ] Render dynamic `workExperiences` list with add/remove capability
- [ ] Render `cv` file input with `<label>` (optional)
- [ ] Validate `firstName`: non-empty, max 100 chars
- [ ] Validate `lastName`: non-empty, max 100 chars
- [ ] Validate `email`: non-empty, valid RFC 5322 format
- [ ] Validate `phone`: if provided, must match `/^\+[1-9]\d{1,14}$/`
- [ ] Validate `address`: if provided, max 255 chars
- [ ] Validate `educations` entries: institution, degree, startDate required per entry
- [ ] Validate `workExperiences` entries: company, position, startDate required per entry
- [ ] Validate CV client-side: PDF or DOCX only, file size < 5 MB before submit
- [ ] Show inline error messages beneath each invalid field
- [ ] Disable submit button and show loading indicator while request is in flight
- [ ] Display success banner _"Candidate added successfully."_ on 201 (use `role="alert"`)
- [ ] Handle `VALIDATION_ERROR` (400): map `details` array to per-field `fieldErrors`
- [ ] Handle `CANDIDATE_ALREADY_EXISTS` (409): show _"A candidate with this email already exists."_ on the email field
- [ ] Handle `FILE_TOO_LARGE` (413): show _"File must be smaller than 5 MB."_ on the CV input
- [ ] Handle `UNSUPPORTED_FILE_TYPE` (415): show _"Only PDF and DOCX files are accepted."_ on the CV input
- [ ] Handle 5xx: show generic error banner _"An unexpected error occurred. Please try again."_ with `role="alert"`

## Phase 4 · Routing

_`frontend/src/App.tsx`_

- [ ] Add route `/candidates/new` pointing to `<AddCandidateForm />`

## Phase 5 · Unit tests

_`frontend/src/tests/AddCandidateForm.test.tsx`_

- [ ] Renders all form fields: firstName, lastName, email, phone, address, cv
- [ ] Shows inline error on `firstName` when form is submitted empty
- [ ] Shows inline error on `lastName` when form is submitted empty
- [ ] Shows inline error on `email` when form is submitted empty
- [ ] Shows inline error on `email` when format is invalid (e.g. `notanemail`)
- [ ] Shows CV file error when selected file exceeds 5 MB (client-side, before submit)
- [ ] Shows CV file error when selected file type is not PDF or DOCX (client-side)
- [ ] Calls `candidateService.create()` with a `FormData` containing correct values on valid submit
- [ ] Disables submit button and shows spinner while request is in flight
- [ ] Displays success banner _"Candidate added successfully."_ after a `201` response
- [ ] Displays `CANDIDATE_ALREADY_EXISTS` message on the email field after a `409` response
- [ ] Displays generic error banner after a `500` response
- [ ] Run `npm test` — all tests pass

## Phase 6 · Accessibility & NFR checks

- [ ] Every input has an associated `<label>` element or `aria-label` attribute
- [ ] Submit button is `disabled` and shows a visible loading indicator while the request is in flight
- [ ] Success and error banners use `role="alert"` so screen readers announce them without requiring focus
- [ ] All async state transitions (loading, success, error) produce a visually distinct UI state
- [ ] Manual check: compatible with Chrome 120+, Firefox 120+, Safari 17+
- [ ] Manual check: responsive and usable on a 320 px wide viewport

## Phase 7 · Handoff

- [ ] Push branch and open pull request
- [ ] Link this plan in the PR description
- [ ] Request review from a peer before merging
