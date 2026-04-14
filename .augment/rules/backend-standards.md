---
description: Backend development standards for the LTI Express/Prisma application using DDD architecture.
globs: ["backend/src/**/*.{ts,js}", "backend/prisma/**/*.prisma", "backend/jest.config.js", "backend/package.json", "backend/tsconfig.json"]
alwaysApply: true
---

# Backend Standards

## Technology Stack
- **Node.js + TypeScript 4.9.5**: Runtime with strict mode enabled
- **Express 4.x**: Web application framework
- **Prisma 5.x + PostgreSQL**: ORM and relational database (Docker)
- **Jest 29 + ts-jest + supertest**: Testing framework
- **ESLint + Prettier**: Code quality tools

## Target Project Structure (DDD)
```
backend/src/
├── domain/
│   ├── models/          # Domain entities
│   └── repositories/    # Repository interfaces
├── application/
│   ├── services/        # Business logic orchestration
│   └── validator.ts     # Input validation
├── presentation/
│   └── controllers/     # HTTP request handlers
├── infrastructure/
│   ├── logger.ts        # Logging utilities
│   └── prismaClient.ts  # Prisma client singleton
├── routes/              # Express route definitions
├── middleware/          # Express middleware
├── index.ts             # App entry point
└── tests/               # Test files (.test.ts)
```

## DDD Principles

### Entities
Objects with a distinct identity persisting over time. Encapsulate business logic; do not expose raw Prisma models to upper layers.

### Repositories
Define interfaces in the domain layer; implement with Prisma in the infrastructure layer. Always inject `PrismaClient` via constructor:
```typescript
export interface IEntityRepository<T> { findById(id: number): Promise<T | null>; save(entity: T): Promise<T>; }
export class EntityRepository implements IEntityRepository<Entity> {
    constructor(private prisma: PrismaClient) {}
}
```

### Services
Application services orchestrate domain operations. Keep business logic that does not belong to a single entity here.

## Coding Standards

### Naming
- `camelCase`: variables, functions, file names (`candidateService.ts`)
- `PascalCase`: classes, interfaces, types (`CandidateRepository`)
- `UPPER_SNAKE_CASE`: constants (`MAX_RESULTS_PER_PAGE`)
- **English only** for all code, comments, error messages, and logs

### TypeScript
- Strict mode always enabled in `tsconfig.json`
- Explicit types for all parameters and return values
- Avoid `any` — use `unknown` or specific types

### Error Handling
```typescript
export class NotFoundError extends Error {
    constructor(message: string) { super(message); this.name = 'NotFoundError'; }
}
// In controllers, always pass errors to Express error middleware via next(error)
```

### Validation
Centralize all input validation in `src/application/validator.ts` before executing business logic.

### Logging
Use a centralized logger in `src/infrastructure/logger.ts` with appropriate levels (info, warn, error, debug). Include structured context in log messages.

## API Standards

### REST Endpoints
```
GET    /resource        # List all
GET    /resource/:id    # Get one
POST   /resource        # Create
PUT    /resource/:id    # Update
DELETE /resource/:id    # Delete
```

### Response Format
```json
{ "success": true, "data": {} }
{ "success": false, "error": { "message": "...", "code": "ERROR_CODE" } }
```

### CORS
Configure CORS to allow the frontend origin (`http://localhost:3000` in development).

## Database (Prisma)
- `prisma/schema.prisma` is the single source of truth for the database schema
- All schema changes go through migrations: `npx prisma migrate dev --name <descriptive_name>`
- Never modify the database directly
- Use `include` for related data to avoid N+1 queries

## Testing Standards

### Structure
- Test files: `src/tests/<name>.test.ts` (picked up by `jest.config.js`)
- Always follow the Arrange-Act-Assert pattern
- Mock all external dependencies (Prisma, external APIs, services)
- Clear mocks in `beforeEach()` for test isolation

```typescript
describe('ServiceName - methodName', () => {
    beforeEach(() => { jest.clearAllMocks(); });
    it('should return result when valid input provided', async () => {
        // Arrange / Act / Assert
    });
});
```

### Coverage Requirements
- Target 90% for branches, functions, lines, and statements
- Cover: happy path, error handling, edge cases, validation, integration points
- Always mock Prisma client; never use real database connections in unit tests

## Development Scripts
```bash
npm run dev              # Dev server with hot reload (ts-node-dev)
npm run build            # Compile TypeScript to dist/
npm test                 # Run Jest tests
npm run prisma:generate  # Regenerate Prisma client after schema changes
npx prisma migrate dev   # Create and apply a database migration
```

## Security
- Validate all user inputs before processing
- Use environment variables for secrets — never commit `.env`
- Inject `PrismaClient` via constructor or middleware; avoid global mutable state

## Git Workflow
- Feature branches with suffix `-backend`
- Small, focused branches with descriptive English commit messages
- Code review required before merging
