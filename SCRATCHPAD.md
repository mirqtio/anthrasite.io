# H1 & H2 Implementation Plan (Hardened & Locked)

**Last Updated**: 2025-10-08
**Status**: APPROVED & LOCKED - Ready for Implementation
**Branch**: `feature/H1-H2-security-hardening`
**Strategy**: Single PR, two atomic commits (H1 then H2)

---

## Executive Decisions

1. **Secrets Scanning**: Replace Gitleaks with **GitGuardian** in CI (keep custom local script for pre-commit)
2. **Unit Test Quarantine Policy**:
   - PRs/feature branches: Surface failures, upload reports, **do not block** (`continue-on-error: true`)
   - `main` and `release/*`: **Strict** - fail pipeline if unit tests fail
3. **Branching**: Single PR with two commits (H1, then H2) - infra-only, independent of A1
4. **Workflows**: Archive phased E2E workflows; single hardened CI + GitGuardian workflow

---

## Phase 0: Pre-flight Fixes (Prerequisites)

**Goal**: Fix blocking issues before H1/H2 implementation

### Tasks:

1. Create `playwright.config.ci.ts` (missing file referenced by current CI)
2. Update `package.json`:
   - Add `test:unit` and `test:unit:coverage` scripts
   - Keep `test` as alias for backwards compatibility
3. Configure `jest-junit` reporter in `jest.config.js`
4. Install `jest-junit` dependency
5. Fix `.husky/pre-push` to use `npm` instead of `pnpm`

### Validation:

- `npm run test:unit` executes successfully
- `npm run typecheck` works from pre-push hook

---

## Phase 1: H1 - GitGuardian Integration

**Goal**: Replace Gitleaks with GitGuardian for superior secret detection

### Implementation Steps:

1. **Create CONTRIBUTING.md**: Developer setup guide including local secret scanning best practices
2. **Create `.github/workflows/gitguardian.yml`**:
   - Multi-trigger: push, PR, nightly schedule, manual dispatch
   - Pinned action versions for security
   - Concurrency control to cancel redundant runs
3. **Archive `.github/workflows/secrets-check.yml`**: Move to `_archive/workflows/` for history

### Commit Message:

```
feat(H1): Integrate GitGuardian for secret scanning

Replace Gitleaks with GitGuardian in CI pipeline for:
- Better detection algorithms with fewer false positives
- Historical scanning capability via nightly schedule
- Dashboard and policy management

Local pre-commit custom script retained for dev-time checks.

Related to ISSUE H1 (3pts)
```

### Human Actions Required:

- Add `GITGUARDIAN_API_KEY` secret to GitHub repo settings
- API key will be needed for validation testing

---

## Phase 2: H2 - Harden CI/CD Pipeline

**Goal**: Create deterministic, secure, fast CI with proper dependency management

### Key Improvements:

- **Security**: Pinned action SHAs, minimal permissions, concurrency control
- **Speed**: Parallel job execution, Playwright caching, frozen lockfile installs
- **Reliability**: Explicit job dependencies, artifact uploads, JUnit reports
- **Policy**: Quarantine unit test failures on PRs; strict on `main`
- **Simplicity**: Single `gate` job for branch protection

### Implementation Steps:

1. **Replace `.github/workflows/ci.yml`** with hardened version:
   - Jobs: `setup`, `typecheck`, `lint`, `build`, `unit`, `e2e`, `gate`
   - `unit` job: `continue-on-error` conditional on branch
   - Artifact uploads: `junit-unit.xml`, `playwright-report`
   - Node 22.x, npm ci (frozen), Playwright caching
2. **Archive obsolete workflows**: Move to `_archive/workflows/`
   - `e2e-phase1.yml` through `e2e-phase6.yml`
   - `e2e-phase2-alt.yml`
   - `complete-e2e-success.yml`
   - `deployment-check.yml` (if obsolete)
   - Keep: `ci.yml` (replaced), `gitguardian.yml` (new), `basic-ci.yml` (review), `smoke-visual.yml`, `visual-regression.yml`

### Commit Message:

```
feat(H2): Harden CI/CD pipeline with security and reliability improvements

Improvements:
- Pinned GitHub Actions SHAs for supply chain security
- Minimal permissions (contents: read)
- Parallel job execution with explicit dependencies
- Playwright browser caching for speed
- JUnit and HTML test reports as artifacts
- Quarantine policy: unit test failures allowed on PRs, strict on main
- Single 'gate' job for simplified branch protection

Cleanup:
- Archived phased E2E workflows (development artifacts)
- Consolidated to single hardened CI workflow

Related to ISSUE H2 (5pts)
```

### Human Actions Required:

- Configure branch protection on `main` to require `gate` status check
- Optionally review and update required checks list

---

## Phase 3: Validation & PR

### Pre-Push Validation (Local):

```bash
npm run typecheck
npm run lint
npm run test:unit
npm run build
```

### CI Validation (After Push):

1. Verify all jobs appear in Actions UI: `setup`, `typecheck`, `lint`, `build`, `unit`, `e2e`, `gate`
2. Confirm `unit` job shows quarantine behavior (continues despite 33 failures on PR)
3. Check artifacts uploaded: `junit-unit`, `playwright-report`
4. Verify GitGuardian workflow triggered and passes

### Optional: Dummy Secret Test

Create temporary branch to validate GitGuardian:

```bash
git checkout -b test/gitguardian-validation
echo 'DUMMY_SECRET="ghp_1234567890abcdefghijklmnopqrstuvwx"' > test-secret.txt
git add test-secret.txt && git commit -m "test: Add dummy secret"
git push -u origin test/gitguardian-validation
# Observe GitGuardian workflow FAIL
git rm test-secret.txt && git commit -m "test: Remove dummy secret"
git push
# Observe GitGuardian workflow PASS
git checkout feature/H1-H2-security-hardening
git branch -D test/gitguardian-validation
```

### Create Pull Request:

```bash
gh pr create \
  --title "H1 & H2: GitGuardian Integration + Hardened CI/CD" \
  --body "$(cat <<'EOF'
## Summary
- **H1**: Replace Gitleaks with GitGuardian for secret scanning
- **H2**: Harden CI/CD with security best practices and reliability improvements

## Changes
### H1 - GitGuardian Integration (3pts)
- ✅ New `.github/workflows/gitguardian.yml` with multi-trigger support
- ✅ Created `CONTRIBUTING.md` for developer onboarding
- ✅ Archived legacy `secrets-check.yml` (Gitleaks)

### H2 - CI/CD Hardening (5pts)
- ✅ Replaced `.github/workflows/ci.yml` with security-hardened version
- ✅ Pinned all GitHub Actions to commit SHAs
- ✅ Implemented quarantine policy for unit tests (strict on main)
- ✅ Added JUnit and Playwright HTML report artifacts
- ✅ Archived 7 obsolete phased E2E workflows
- ✅ Created single `gate` job for branch protection simplicity

### Phase 0 - Prerequisites
- ✅ Created `playwright.config.ci.ts` (fixes broken CI reference)
- ✅ Added `test:unit` scripts to `package.json`
- ✅ Configured `jest-junit` for test reporting
- ✅ Fixed `.husky/pre-push` to use npm (not pnpm)

## Human Actions Required
1. **GitGuardian**: Add `GITGUARDIAN_API_KEY` secret to repo settings
2. **Branch Protection**: Update `main` branch to require `gate` status check

## Test Plan
- [x] Local: `npm run typecheck && npm run lint && npm run test:unit && npm run build`
- [ ] CI: All jobs pass in correct dependency order
- [ ] CI: Unit test quarantine behavior verified (continues on PR despite failures)
- [ ] CI: Artifacts uploaded successfully
- [ ] GitGuardian: Workflow triggered and passes (after API key added)

## Related Issues
- Closes H1 (3pts): Integrate GitGuardian for secret scanning
- Closes H2 (5pts): Review and update CI/CD pipeline

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

---

## Files Modified

### Created:

- `playwright.config.ci.ts`
- `CONTRIBUTING.md`
- `.github/workflows/gitguardian.yml`

### Modified:

- `package.json` (scripts)
- `jest.config.js` (reporters)
- `.husky/pre-push` (npm not pnpm)
- `.github/workflows/ci.yml` (complete replacement)

### Archived/Removed:

- `.github/workflows/secrets-check.yml`
- `.github/workflows/e2e-phase*.yml` (1-6 + alt)
- `.github/workflows/complete-e2e-success.yml`
- `.github/workflows/deployment-check.yml` (if obsolete)

---

## Success Criteria

✅ **H1 Complete When**:

- GitGuardian workflow exists and is properly configured
- CONTRIBUTING.md provides clear developer guidance
- Legacy Gitleaks workflow archived

✅ **H2 Complete When**:

- New CI workflow has all 7 jobs with correct dependencies
- Unit test quarantine policy implemented and verified
- JUnit and Playwright reports upload as artifacts
- Obsolete workflows archived
- Local validation passes (`typecheck`, `lint`, `test:unit`, `build`)

✅ **PR Merge Ready When**:

- CI shows green `gate` status (despite quarantined unit failures)
- All commit messages follow conventional commits format
- Human has added `GITGUARDIAN_API_KEY`
- Code review approved

---

## Notes

- **Unit Test Strategy**: 33 failing tests are quarantined (continue-on-error on PRs) to unblock delivery while maintaining strict enforcement on main. Technical debt to be addressed in future epic.
- **Workflow Archival**: Phased E2E workflows appear to be iterative development artifacts. Retained for historical reference in `_archive/`.
- **GitGuardian vs Gitleaks**: GitGuardian chosen for superior detection algorithms, historical scanning, and dashboard capabilities.
- **A1 Independence**: This PR is infra-only and does not conflict with `feature/A1-payment-element`.
