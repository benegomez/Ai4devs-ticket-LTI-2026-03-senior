---
description: Analyzes and enriches a user story file from the UserStories folder, producing a comprehensive, implementation-ready specification following product best practices.
---

Please analyze and enrich the user story: $ARGUMENTS

Follow these steps:

## Step 1 — Find the User Story

- Look inside `.augment/rules/UserStories/` for a subfolder that matches `$ARGUMENTS`.
  - `$ARGUMENTS` may be an exact folder name (e.g., `US-001`), a ticket ID, a feature keyword, or a status hint like "the one in progress" or "the login story".
  - If the argument is a keyword or status hint, scan all story files in `.augment/rules/UserStories/` and select the best match based on title, description, or a `status` field in the file's frontmatter.
- Each user story lives in its own subfolder: `.augment/rules/UserStories/<story-id>/story.md`.
- Read the full content of the matched story file.
- If no match is found, list all available story folders and ask the user to clarify which one to process.

## Step 2 — Assume the Product Expert Role

- Act as a product expert with technical knowledge of the project's codebase, architecture, and engineering best practices.
- Use the context from `.augment/rules/` (backend standards, frontend standards, base rules) to inform your evaluation.

## Step 3 — Understand the Problem

- Carefully read the user story to understand:
  - What the user or system needs to accomplish.
  - The business value or goal behind the story.
  - Any constraints, dependencies, or acceptance criteria already stated.

## Step 4 — Evaluate Completeness

Decide whether the story is fully detailed enough for a developer to work autonomously. A complete user story must include:

- [ ] A clear description of the functionality from the user's perspective.
- [ ] A comprehensive list of all data fields involved (inputs, outputs, persisted state).
- [ ] The structure and URLs of any API endpoints required (method, path, request/response shape).
- [ ] The specific files and layers to be created or modified, aligned with the project's DDD architecture.
- [ ] Step-by-step acceptance criteria that define when the task is complete.
- [ ] Unit test requirements: which scenarios to cover and where the test files should live.
- [ ] Non-functional requirements: security constraints, input validation, error handling, performance considerations.

## Step 5 — Enrich the User Story

If the story lacks technical or specific detail, produce an enhanced version that is:

- **Clearer**: unambiguous language, no undefined terms.
- **More specific**: concrete field names, endpoint paths, file paths, and code patterns from the actual codebase.
- **Implementation-ready**: a developer reading it can start coding without needing further clarification.
- **Aligned with the architecture**: references the correct layers (domain, application, presentation, infrastructure) and follows the conventions in `.augment/rules/backend-standards.md` and `.augment/rules/frontend-standards.md`.

Format the enhanced story in Markdown, using headers, bullet lists, and code snippets where appropriate.

## Step 6 — Update the Story File

Overwrite `.augment/rules/UserStories/<story-id>/story.md` with the following structure:

```markdown
## [original]

<exact original content, unchanged>

---

## [enhanced]

<enriched story content>
```

Apply proper formatting throughout:
- Use bullet lists for field inventories and acceptance criteria.
- Use fenced code blocks for endpoint definitions, request/response examples, and file paths.
- Use bold text to highlight key decisions or constraints.

## Step 7 — Update the Story Status

- Read the `status` field in the story's frontmatter (if present).
- If the status is `To refine`, update it to `Pending refinement validation` in the frontmatter of the saved file.
- If no frontmatter exists, add a `status` field set to `Pending refinement validation` at the top of the file.
