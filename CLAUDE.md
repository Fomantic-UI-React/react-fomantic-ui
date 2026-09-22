# CLAUDE.md

`PLAN.md` is the working document for the fork — read it before changing the
build, the tests or the React version.

## Closing issues from a pull request

Put a closing keyword **in the PR description**, one per issue, each with its
own keyword:

```
Fixes #19
Fixes #26
Fixes #31
```

- `Fixes #19, #26, #31` closes only #19 — the keyword applies to the number
  right after it.
- An issue number in the title, e.g. `fix: four bugs (#11, #19, #26, #31)`,
  closes nothing. That is how #19, #26 and #31 stayed open after #46 merged
  them.
- PRs are squash-merged, and the description becomes the commit body, so the
  keywords land on `main` too.
