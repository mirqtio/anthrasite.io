# Merge Strategy for H1-H2 Security Hardening Branch

## Current Situation

Attempted to merge `feature/H1-H2-security-hardening` to `main` but encountered unrelated git histories with 70+ file conflicts.

### Branch Status

**Feature Branch** (`feature/H1-H2-security-hardening`):
- ✅ CI Gate: GREEN (Run #18358987682)
- ✅ Unit Tests: 36/36 suites passing (0 failures)
- ⚠️ E2E Tests: 11 failures (quarantined, non-blocking on PRs)
- 12 commits of test cleanup and CI hardening
- Latest commit: `8f4a191` - "docs: update H2 story points (5→13) to reflect actual effort"

**Main Branch** (`origin/main`):
- Purchase page design and mobile layout work
- 5 recent commits
- Latest commit: `b8a39c4` - "fix: Mobile layout issues on purchase page"

### Technical Blocker

```bash
$ git merge-base feature/H1-H2-security-hardening origin/main
# No common ancestor found
```

The branches have completely unrelated histories - they don't share a single commit. This results in:
- 70+ merge conflicts (every file)
- Git refusing standard merge without `--allow-unrelated-histories`
- Manual conflict resolution required for all files

## Merge Options

### Option 1: Replace Main (Fast, Loses Purchase Work)

**When to use**: Test fixes are higher priority than purchase page work

```bash
git checkout main
git reset --hard feature/H1-H2-security-hardening
git push origin main --force
```

**Pros**:
- Immediate green CI
- No conflicts to resolve
- Clean history

**Cons**:
- ❌ Loses all purchase page work from main
- ❌ Force push required

### Option 2: Cherry-Pick to Main (Preserves Both)

**When to use**: Both sets of changes are important

```bash
git checkout main
git pull origin main

# Cherry-pick test fix commits one by one
git cherry-pick cde9375  # test(e2e): harden runner
git cherry-pick f7e1b03  # test(e2e): aggressive deduplication
git cherry-pick a239200  # test(e2e): fix waitlist modal visibility
# ... continue for all 12 commits
# Resolve conflicts as they arise

git push origin main
```

**Pros**:
- ✅ Preserves purchase page work
- ✅ Preserves test fixes
- ✅ No force push

**Cons**:
- Requires manual conflict resolution for some commits
- Time-consuming (12 commits)
- May introduce merge errors

### Option 3: Merge with Conflicts (Most Complete)

**When to use**: Need to carefully review all differences

```bash
git checkout feature/H1-H2-security-hardening
git merge origin/main --allow-unrelated-histories
# Manually resolve 70+ conflicts
git commit
git push origin feature/H1-H2-security-hardening
git checkout main
git merge feature/H1-H2-security-hardening
git push origin main
```

**Pros**:
- ✅ Most thorough
- ✅ Complete history
- ✅ Explicit conflict resolution

**Cons**:
- Extremely time-consuming (70+ files)
- High risk of introducing bugs
- Complex merge commit

## Recommended Approach

**Recommendation**: Option 2 (Cherry-pick)

**Rationale**:
1. Preserves both feature branch test fixes and main branch purchase work
2. Allows selective application of commits
3. Conflicts can be resolved incrementally
4. Safer than mass conflict resolution

**Implementation**:
1. Checkout main and pull latest
2. Cherry-pick commits in chronological order
3. Resolve conflicts commit-by-commit
4. Test after each cherry-pick
5. Push to main when complete

## Post-Merge Actions

Once merge is complete (via any option):

1. ✅ Verify CI passes on main
2. ✅ Run full test suite locally
3. ✅ Delete feature branch (if no longer needed)
4. ✅ Address deferred E2E issues (see ISSUE_RECOMMENDATIONS.md)
