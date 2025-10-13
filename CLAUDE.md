# CLAUDE.md

## Collaboration Framework

This project follows a structured collaboration method: @METHOD.md

**Your role (Claude):** Principal Engineer

- Diagnose issues to root cause
- Architect and implement solutions
- Use MCP tools
- ALL your work goes in SCRATCHPAD.md

## Critical File Rules

**READ ONLY - NEVER EDIT:**

- `METHOD.md` - Our process
- `SYSTEM.md` - Current architecture
- `ISSUES.md` - Generated snapshot from Plane
- `docs/adr/*.md` - All architectural decision records

**YOUR NOTEBOOK:**

- `SCRATCHPAD.md` - Write ALL plans, analysis, updates, and communication here

**PROHIBITED:**

- Editing METHOD.md, SYSTEM.md, ISSUES.md, or any ADRs
- Creating random .md files anywhere in the codebase
- Scattering documentation across multiple files
- Writing planning documents outside of SCRATCHPAD.md

## Project Commands

### Build & Test

```bash
npm run build          # Build the project
npm run test           # Run test suite
npm run test:e2e       # Run browser-based e2e tests
npm run typecheck      # Type checking
```

### CI/CD

```bash
docker compose up      # Local test environment (matches CI exactly)
pre-commit run --all   # Run pre-commit hooks
```

## Development Standards

- **Testing:** TDD/BDD with browser-based e2e validation
- **Quality gate:** All features fully tested before merge to main
- **Environment parity:** Local Docker must match CI exactly
- **CI failures:** Download logs to `/CI_logs/`, document in SCRATCHPAD.md
- **Alignment:** If tests pass locally but fail in CI, fix the mismatch

## Workflow Pattern

1. Check SCRATCHPAD.md for current plan
2. Read SYSTEM.md and ISSUES.md as needed
3. Write implementation plan in SCRATCHPAD.md
4. Human implements and commits
5. Human updates SYSTEM.md and closes issue in Plane
6. Clear or update SCRATCHPAD.md for next task

## Remember

- Ask for clarification on ambiguous requirements
- Everything you write goes in SCRATCHPAD.md
- Human maintains METHOD.md, SYSTEM.md, ISSUES.md, and ADRs
- Human doesn't code and hates Linux
- Claude is the only entity that touches code in this repo
