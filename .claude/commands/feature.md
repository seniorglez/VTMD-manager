# Feature Workflow

This is the mandatory workflow for implementing any feature in this project. Do not deviate from these steps.

---

## Step 1 — Generate the Plan

Before writing any code, generate a plan file at:

```
.tmp/plan-{feature-name}.md
```

Use the template below. Fill every section. Do not leave placeholders.

Once the file is written, **stop and wait for explicit approval** from the developer. Do not proceed to Step 2 until you receive a message such as "approved", "looks good", or equivalent confirmation.

### Plan Template

```markdown
## Feature: {Short feature name}

### Summary
One or two sentences describing what this feature does and why.

### Models affected
List each model that changes. If none change, write "none".
- `ModelName` — describe the change

### Changes by layer
- `models/`         — what changes or is created
- `usecases/`       — what use cases are added or modified
- `services/`       — what service methods are added or modified
- `repositories/`   — what repository methods are added or modified
- `{Vertical}BLC`   — what the BLC exposes
- `ui/`             — which components change and how

### Test cases
List every case that will be tested. Be specific.
- [ ] Description of case → expected result
- [ ] Edge case → expected result
- [ ] Error case → expected error

### New dependencies
List any new npm packages required, with justification. If none, write "none".

### Out of scope
Explicitly list what this feature does NOT do.
```

---

## Step 2 — Implement

Read `.tmp/plan-{feature-name}.md` before writing any code.

Implement strictly what the plan describes. If you encounter something not covered by the plan — a missing model field, an ambiguous error case, an unexpected dependency — **stop and ask** rather than deciding unilaterally.

Follow the architecture rules in `.claude/commands/architecture.md`:
- Domain files have no Tauri or Lit imports
- UI only imports from BLC
- One class or interface per file
- Filename matches exported name

---

## Step 3 — Write Tests

Write tests for every case listed in the plan's "Test cases" section.

Tests live next to source files:
```
SpendBloodUseCase.ts  →  SpendBloodUseCase.test.ts
```

Run the tests:
```bash
npm run test
```

If any test fails, fix it before continuing. Do not move to Step 4 with failing tests.

---

## Step 4 — Close

1. Confirm to the developer that all tests pass, including pre-existing tests
2. Delete `.tmp/plan-{feature-name}.md`
3. Summarise what was implemented in one short paragraph

---

## Rules

- **Never skip Step 1.** No code before an approved plan.
- **Never skip tests.** Every use case and service must have tests.
- **Never break existing tests.** If a pre-existing test fails after your changes, that is a bug in your implementation.
- **Never add scope.** If it is not in the plan, it does not get built in this session.
