# Phase 2 port tooling

Temporary migration aids for the Enzyme/mocha → Vitest/RTL port. **Delete these
once `test/specs` is empty** — they exist to make the remaining area PRs
reproducible, not to be maintained.

- `chai2vitest.mjs` — rewrites chai/sinon assertions to vitest. Walks backwards
  over balanced brackets to find each assertion's subject, and skips string,
  template and regex literals so a comma or paren inside one is never mistaken
  for syntax. Anything it cannot map is left with an `__UNMAPPED_*__` marker
  rather than silently mistranslated.
- `portspec.mjs <area>` — ports a whole area, skipping files that render with
  Enzyme or use a webpack loader. Those need a behavioural rewrite by hand.
- `port-factories.mjs`, `port-macc.mjs` — one-off ports for the two `lib` specs
  that needed structural changes, kept as worked examples of the two patterns
  that recur: unwrapping `shallow()` where only the element was ever needed, and
  reaching a class instance by ref where Enzyme read internal state.

Usage: `node scripts/phase2/portspec.mjs elements`, then run the suite and fix
what it reports.
