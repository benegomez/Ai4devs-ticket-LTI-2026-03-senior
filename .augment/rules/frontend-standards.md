---
description: Frontend development standards for the LTI React/TypeScript application.
globs: ["frontend/src/**/*.{js,jsx,ts,tsx}", "frontend/tsconfig.json", "frontend/package.json", "frontend/jest.config.js"]
alwaysApply: true
---

# Frontend Standards

## Technology Stack
- **React 18.3.1**: Functional components and hooks
- **TypeScript 4.9.5**: Strict mode enabled
- **Create React App 5.0.1**: Build tooling and development server
- **Jest + React Testing Library**: Unit and component testing

## Current Project Structure
```
frontend/src/
├── App.tsx              # Main application component
├── App.css              # Application styles
├── index.tsx            # Application entry point
├── index.css            # Base styles
├── reportWebVitals.ts   # Performance monitoring
├── setupTests.ts        # Test setup
└── tests/               # Test files
```

## Target Structure (as features are built)
```
frontend/src/
├── components/          # Reusable UI components (PascalCase files)
├── services/            # API service layer (camelCase files)
├── pages/               # Page-level route components
├── assets/              # Images, fonts, static resources
├── App.tsx
├── index.tsx
└── tests/
```

## Coding Standards

### Naming Conventions
- `PascalCase`: components, types, interfaces, component files (`CandidateCard.tsx`)
- `camelCase`: variables, functions, hooks, utility files (`candidateService.ts`)
- `UPPER_SNAKE_CASE`: constants (`API_BASE_URL`)
- `use` prefix for custom hooks (`useCandidate`, `useFormValidation`)
- `kebab-case`: CSS class names
- **English only** for all code, comments, and error messages

### Components
- Always use functional components with hooks; no class components
- New components in TypeScript with explicit prop types:
```typescript
type CandidateCardProps = {
    candidateId: number;
    name: string;
    onClick: (id: number) => void;
};
const CandidateCard: React.FC<CandidateCardProps> = ({ candidateId, name, onClick }) => { ... };
```

### State Management
- `useState` for local state; `useEffect` for side effects and data fetching
- Extract reusable stateful logic into custom hooks
- Always handle loading and error states for async operations:
```typescript
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');
try {
    setLoading(true);
    await apiCall();
} catch (err) {
    setError('Operation failed. Please try again.');
} finally {
    setLoading(false);
}
```

### Service Layer
Centralize all API calls in `src/services/` files. Use async/await with explicit error handling:
```typescript
export const candidateService = {
    getAll: async (): Promise<Candidate[]> => {
        const response = await fetch(`${API_BASE_URL}/candidates`);
        if (!response.ok) throw new Error('Failed to fetch candidates');
        return response.json();
    }
};
```

## Testing Standards

### Framework
- **Jest + React Testing Library** for unit and component tests (configured via `jest.config.js`)
- Test files: `src/tests/<ComponentName>.test.tsx`
- Follow Arrange-Act-Assert pattern

```typescript
describe('ComponentName', () => {
    it('should render correctly when valid props provided', () => {
        // Arrange / Act / Assert
    });
});
```

### Coverage
Target 90% for branches, functions, lines, and statements.

## TypeScript Configuration
- Strict mode enabled in `tsconfig.json`
- `baseUrl: "."` for cleaner imports

## Development Scripts
```bash
npm start        # Dev server on http://localhost:3000
npm test         # Run Jest tests
npm run build    # Production build
```

## Git Workflow
- Feature branches with suffix `-frontend`
- Descriptive English commit messages
- Code review required before merging
