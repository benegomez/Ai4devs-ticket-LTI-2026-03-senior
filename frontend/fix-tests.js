/**
 * Patches AddCandidateForm.test.tsx to add waitForFormIdle() after every
 * async-submit assertion, silencing the "not wrapped in act()" warnings.
 *
 * Run once from the frontend/ directory:
 *   node fix-tests.js
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'src/tests/AddCandidateForm.test.tsx');

const WAIT_HELPER = `
/** Wait for the form to settle after any async submit (loading → idle). */
async function waitForFormIdle() {
  await waitFor(() =>
    expect(screen.getByRole('button', { name: /add candidate/i })).not.toBeDisabled()
  );
}
`;

let src = fs.readFileSync(FILE, 'utf8');

// 1. Inject waitForFormIdle helper after the beforeEach line
src = src.replace(
  'beforeEach(() => mockCreate.mockReset());',
  `${WAIT_HELPER.trim()}\n\nbeforeEach(() => mockCreate.mockReset());`
);

// 2. "calls candidateService.create" — add waitForFormIdle before closing brace
src = src.replace(
  "    expect(mockCreate).toHaveBeenCalledWith(expect.any(FormData));\n  });",
  "    expect(mockCreate).toHaveBeenCalledWith(expect.any(FormData));\n    // Wait for setSuccess + setLoading(false) to settle before teardown\n    await waitForFormIdle();\n  });"
);

// 3. "disables submit button" — already has resolveCreate + waitFor; add waitForFormIdle
src = src.replace(
  "    await waitFor(() => expect(screen.getByRole('button', { name: /add candidate/i })).not.toBeDisabled());\n  });",
  "    await waitForFormIdle();\n  });"
);

// 4. success, 409, 500 tests — add waitForFormIdle after findByText assertions
const asyncTests = [
  { find: '/candidate added successfully/i', label: '201' },
  { find: '/candidate with this email already exists/i', label: '409' },
  { find: '/unexpected error occurred/i', label: '500' },
];
for (const { find } of asyncTests) {
  src = src.replace(
    new RegExp(
      `(expect\\(await screen\\.findByText\\(${find.replace(/\//g, '\\/')}\\)\\.toBeInTheDocument\\(\\);)(\\s*\\});`,
      'm'
    ),
    `$1\n    await waitForFormIdle();\n  });`
  );
}

fs.writeFileSync(FILE, src, 'utf8');
console.log('✅  AddCandidateForm.test.tsx patched — act() warnings eliminated.');
