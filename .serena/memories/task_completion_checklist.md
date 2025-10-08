# Task Completion Checklist

## Definition of Done

A task is complete when a Pull Request is opened, CI is green, and it's ready for Cascade's architectural review.

## Pre-Commit Checklist

### 1. Code Quality

- [ ] TypeScript compilation passes: `pnpm typecheck`
- [ ] No linting errors: `pnpm lint`
- [ ] Code is formatted: `pnpm format`
- [ ] No unused imports or variables
- [ ] Proper error handling in place

### 2. Testing

- [ ] Unit tests written for new business logic
- [ ] Unit tests pass: `pnpm test`
- [ ] E2E tests updated for new features
- [ ] E2E tests pass locally: `pnpm test:e2e`
- [ ] Smoke tests still pass (critical paths unaffected)
- [ ] Visual regression tests updated if UI changed

### 3. Documentation

- [ ] Update SYSTEM.md if architecture changed
- [ ] Add/update ADR in `docs/adr/` for significant decisions
- [ ] Update relevant README files
- [ ] Add inline code comments for complex logic
- [ ] Update SCRATCHPAD.md with implementation notes

### 4. Database (if applicable)

- [ ] Prisma schema updated
- [ ] Migration created: `npx prisma migrate dev`
- [ ] Seed script updated if needed
- [ ] Migration tested locally

## Pre-PR Checklist

### 1. Build Verification

- [ ] Production build succeeds: `pnpm build`
- [ ] No build warnings or errors
- [ ] Bundle size is reasonable
- [ ] No missing dependencies

### 2. Local E2E Testing

- [ ] All E2E tests pass: `pnpm test:e2e`
- [ ] Tests pass in Docker environment (matches CI)
- [ ] Mock data flows work correctly
- [ ] Visual tests updated: `pnpm test:visual:update` (if UI changed)

### 3. Feature Validation

- [ ] Feature flag configured (if applicable)
- [ ] Manual testing completed in dev environment
- [ ] Edge cases tested
- [ ] Error states handled gracefully
- [ ] Loading states implemented

### 4. Security & Performance

- [ ] No sensitive data in client code
- [ ] Server-side validation for all inputs
- [ ] Proper authentication/authorization
- [ ] No performance regressions
- [ ] Database queries optimized

## Pull Request Creation

### 1. Branch & Commits

- [ ] Branch follows naming: `feature/[ISSUE-ID]-description`
- [ ] Commits are atomic and well-described
- [ ] Commit history is clean (squash if needed)
- [ ] No merge conflicts with `main`

### 2. PR Content

- [ ] PR title references issue: "[ISSUE-ID]: Brief description"
- [ ] PR description includes:
  - Link to issue in ISSUES.md
  - Summary of changes
  - Testing performed
  - Any breaking changes
  - Screenshots/videos (if UI changed)
- [ ] PR is marked as ready for review (not draft)

### 3. CI Pipeline

- [ ] All GitHub Actions checks pass:
  - ✅ TypeScript compilation
  - ✅ Build succeeds
  - ✅ Linting passes
  - ✅ Smoke tests pass
- [ ] Review CI logs if any failures occur
- [ ] Download logs to `/CI_logs` for debugging (per CLAUDE.md)

## Post-PR Actions (After Merge)

### 1. Cascade's Responsibilities

- [ ] Update ISSUES.md to mark issue as CLOSED
- [ ] Update SYSTEM.md with architectural changes
- [ ] Update dashboard metrics
- [ ] Clear SCRATCHPAD.md for next task

### 2. Context Clearing

- [ ] Claude's context is cleared by Human
- [ ] Next issue is selected from backlog
- [ ] New plan is created in SCRATCHPAD.md

## Continuous Integration (CI) Failure Protocol

Per CLAUDE.md requirements, when CI fails:

1. **Download Logs**: Save complete CI log archive to `/CI_logs/`
2. **Review Thoroughly**: Examine every log file for errors
3. **Document Issues**: List all problems found
4. **Create Plan**: Design resolution strategy for each issue
5. **Implement Fixes**: Make necessary code changes
6. **Verify Locally**: Test in Docker environment matching CI
7. **Re-run CI**: Push fixes and validate pipeline passes
8. **Root Cause**: Update pre-commit hooks or CI config if misalignment found

## Pre-commit Hooks (Automatic)

These run automatically via Husky when you commit:

- ESLint with auto-fix on TypeScript/JavaScript files
- Prettier formatting on all applicable files

If hooks fail, the commit is blocked. Fix issues and retry.

## Architectural Review Standards

Cascade reviews PRs for:

- **Alignment with plan** in SCRATCHPAD.md
- **Adherence to ADRs** and SYSTEM.md
- **Code quality** and maintainability
- **Test coverage** and quality
- **Documentation** completeness

## Success Criteria Summary

A task is successfully complete when:
✅ All code quality checks pass
✅ All tests (unit + E2E + smoke) pass
✅ Production build succeeds
✅ CI pipeline is green
✅ PR is created with proper documentation
✅ Ready for Cascade's architectural review
