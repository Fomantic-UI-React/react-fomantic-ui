# Fork plan: `semantic-ui-react` → `react-fomantic-ui`

Working document. Status as of 2026-08-24.

## Why

`semantic-ui-react` is unmaintained. Last commit 2024-11-22; last npm release
`2.1.5` (Dec 2023), with `3.0.0-beta.2` stranded on the `beta` tag since Dec

2023. Commit velocity collapsed from 1,377/yr (2016) to 11 (2024).

It is still downloaded ~370,000 times a week (week of 17–23 Aug 2026), so this
is an unmaintained package with a large install base, not a dead one.

Taking over the upstream repo is not possible — the maintainer does not grant
access, which is why the CSS layer was forked to Fomantic-UI in the first
place. A fork is the only route.

Strategic caveat: the CSS foundation is frozen too. `semantic-ui-css` sits at
2.5.0 (last modified Oct 2022). Fomantic-UI is maintained but small
(~11,900 downloads/week against our 370,000).

## Decisions taken

| Decision     | Choice                                                                   |
| ------------ | ------------------------------------------------------------------------ |
| Hosting      | Public GitHub **organisation** (not a personal account, not GitLab)      |
| Package name | `react-fomantic-ui`                                                      |
| History      | Fork with **full history**, delete tooling in commits — no `filter-repo` |

Notes on each:

- **GitHub org, 2+ owners.** The React ecosystem contributes on GitHub, the
  existing backlog and 20+ stranded branches live there, and an org avoids both
  the single-maintainer failure mode that killed the original and lock-in to
  one employer. Company OSS being on GitLab is the known tension here.
- **`react-fomantic-ui`** is available on npm. `fomantic-ui-react` is taken by
  a dormant alpha (`0.0.1-alpha.12`, Apr 2022, Gitee repo, ~2,300 downloads/wk)
  — real enough that an npm name dispute would likely fail.
  Caveat accepted by the user: the name implies a Fomantic affiliation the
  library does not have (it ships **no CSS** and works equally with
  `semantic-ui-css`). Mitigations: state non-affiliation prominently in the
  README, and give the Fomantic maintainers a courtesy heads-up so they do not
  inherit our bug reports.
- **No `filter-repo`.** Rewriting SHAs severs the lineage the 63KB CHANGELOG
  references and destroys the ability to inspect the old build config, which
  will be needed. Deleting in commits preserves everything and is reversible.

## Landmines — read before touching the build

### 1. `handledProps` is load-bearing at runtime

`.babel-preset.js` runs `babel-plugin-transform-react-handled-props`, which
injects a static `handledProps` array onto every component at build time,
derived from its `propTypes` keys. `src/lib/getUnhandledProps.js` reads it
across **315 call sites**:

```js
const { handledProps = [] } = Component // silently defaults to []
```

Build with esbuild/tsup and that plugin disappears. `handledProps` becomes
`[]`, `getUnhandledProps` filters nothing, and **every declared prop is spread
onto the DOM node** — `<Button primary size='large'>` renders
`<button primary="true" size="large">`. No build error; a silent runtime
regression across all ~50 components.

Verified in the current build output: 168 files carry injected `handledProps`,
and a server-render smoke test confirms props become classes, not attributes.

### 2. `propTypes` are build-time inputs, not dev warnings

Because `handledProps` derives from `propTypes` (declared in 164 source files),
stripping propTypes for React 19 **also** breaks `getUnhandledProps`. These two
migrations are coupled and must be solved together.

### 3. Enzyme is the long pole

`test/specs` has 669 `mount()`/`shallow()` call sites and 1,186 wrapper-API
assertions. Enzyme has no React 18/19 adapter and never will. The 54 `mount()`
files port to RTL fairly directly; the **93 `shallow()` files do not** — RTL
has no shallow rendering by design, so structural assertions must be rewritten
as behavioural ones. This phase decides whether the whole effort is viable.

### 4. Docs/test coupling (now resolved)

`test/specs/commonTests/isConformant.js` and `hasValidTypings.js` import
`componentInfoContext` from `docs/src/utils`, and the old `pretest` ran the
gulp docgen. The docs site was therefore not optional. Removing the old test
harness dissolves this, but the replacement conformance tests must not
reintroduce a dependency on a docs build.

## Progress

### Phase 0 — strip dead tooling ✅ done

Branch `fork/strip-tooling`, 10 commits, **403 files changed, 25,320
deletions**, devDependencies 100 → 39.

Removed: CircleCI, Cypress + Percy, size-limit, Vercel/codecov config,
react-static docs app and its gulp docgen plugins, Karma + Enzyme harness,
the UMD smoke test (puppeteer 13), and dead `config.js`/ignore-file entries.

Kept: `src/`, all 213 `.d.ts`, `test/specs` (frozen), 961 self-contained
example components, prose docs (Usage, Theming, ShorthandProps, Augmentation,
both migration guides), and the **Babel/gulp dist build** — deliberately, per
landmine 1.

Fixed two pre-existing Node-version breakages (upstream CI was pinned to
Node 16): top-level `await import()` in `gulp/tasks/dist.mjs`, and webpack 4's
MD4 hashing under OpenSSL 3 (`--openssl-legacy-provider`).

Added `.talismanrc` using `scopeconfig: node` to exclude lockfiles, mirroring
`dt/site`, plus the `key`/`onKeyDown`/`KeyboardEvent` allowlist this library
needs.

Verified: `yarn build:dist` green (257 files each to commonjs and es, UMD
258KB, 213 `.d.ts` copied); `yarn ci` green (0 errors, 33 pre-existing
warnings); server-render smoke test confirms correct prop filtering,
passthrough props and shorthand factories.

**`test/specs` is intentionally not runnable** between here and phase 2.

### Phase 1 — rebrand + modern build ✅ done

`handledProps` codemod (PR #2): 163 arrays baked into source, Babel plugin
dropped, verified against a pre-change baseline with 0 value mismatches.

Identity sweep, `LICENSE.md`, README and CircleCI → GitHub Actions on Node 22
landed in PR #3. Migration guide in PR #4.

Build swap (PR #5): gulp + webpack 4 → rollup + esbuild.

**`.babel-preset.js` was doing five jobs, not one.** Dropping Babel dropped
four behaviours silently and shipped a fifth broken. Each is reimplemented in
`build/plugins.mjs` against the ESTree AST `this.parse()` returns, and each is
asserted by `scripts/verify-build.js`:

| Old Babel plugin                         | Replacement                       |
| ---------------------------------------- | --------------------------------- |
| `babel-plugin-lodash`                    | `lodashCherryPick()`              |
| `babel-plugin-transform-rename-import`   | `lodashCherryPick({ moduleName })` |
| `transform-react-remove-prop-types`      | `guardPropTypes()`                |
| `babel-plugin-filter-imports`            | `stripDebug()`                    |
| `babel-plugin-transform-next-use-client` | `useClientDirective()`            |

The UMD build also lost webpack's `DefinePlugin`, leaving 33 unguarded
`process.env.NODE_ENV` references. A `<script>` tag has no `process`, so the
bundle threw `ReferenceError: process is not defined` before exporting
anything; `@rollup/plugin-replace` restores the substitution.

**This shipped.** `3.0.0-beta.4` went to npm from the unfixed pipeline with a
UMD bundle that could not load, zero `'use client'` directives, lodash
namespace imports in 83 files and unguarded propTypes in 163. It remains
published but unreferenced; `3.0.0-beta.5` supersedes it and holds `latest`.
The lesson is in `scripts/verify-build.js` — none of the four regressions
produced a build error, and `yarn ci` was green throughout.

Also fixed: `dist/es` emitted extensionless `lodash-es/invoke` specifiers,
which bundlers resolve and node does not. Present since beta.3, so `dist/es`
had never been loadable outside a bundler. Only an install of the packed
tarball surfaced it, which is why verification now imports `dist/es` through
node rather than testing against the repo.

Open follow-ups, neither blocking:

- `dist/es` has no `"type": "module"`, so node reparses it via a fallback
  heuristic and warns. The canonical fix is a `dist/es/package.json`
  containing `{"type":"module"}`, unverified against webpack and vite.
- Bundle is ~12–14% above the beta.3 baseline (UMD gzip 83.3KB vs 73.1KB),
  from esbuild inlining helpers per-file where Babel imported them from
  `@babel/runtime` — no longer a dependency, so roughly a wash for consumers.
- `target: 'es2017'` replaces the old browserslist (`safari > 8`,
  `not ie < 11`). Deliberate, but it is a change in published output for
  anyone excluding `node_modules` from their own transpile.

### Phase 2 — Vitest + @testing-library/react

The long pole; see landmine 3. Delivered as a sequence of PRs, each one green
on its own — never a single mega-branch.

**Measured shape of the corpus** (203 files, 18,833 LOC):

| Area          | files | shallow | mount | both |    LOC |
| ------------- | ----- | ------- | ----- | ---- | ------ |
| `lib`         |    20 |       3 |     1 |    0 |  2,112 |
| `views`       |    38 |      13 |     3 |    1 |    964 |
| `collections` |    32 |      26 |     7 |    7 |  1,580 |
| `elements`    |    42 |      21 |     8 |    8 |  2,062 |
| `addons`      |    10 |       6 |     6 |    3 |  1,647 |
| `modules`     |    46 |      20 |    21 |   13 |  8,820 |
| `commonTests` |    14 |       — |     — |    — |  1,627 |

Two numbers reframe the job. **163 of 203 files import `commonTests`** and 162
call `isConformant`, so the shared harness is the keystone — porting it unblocks
everything. And **85 of 189 component specs never call `shallow()` or `mount()`
at all**; they are conformance or pure logic, and port mechanically once the
harness lands. The genuinely hard rewrites are concentrated in `modules`, which
is 47% of the corpus by LOC.

**Mechanics.** Ported specs move to `test/unit/**`, mirroring the source tree;
`test/specs/**` stays frozen and untouched until it is empty. Vitest only ever
globs `test/unit`, so every PR is green and progress is legible as files
remaining in `test/specs` — no growing include-list in the config.

| PR | Scope | Why here |
| -- | ----- | -------- |
| 1 | Harness: vitest + jsdom + RTL, `componentInfo`, conformance core, 3 proving components | ✅ Make-or-break, and it holds — 124 tests green on Button/Card/Divider |
| 1b | Remaining `commonTests`: `rendersChildren`, `classNameHelpers`, `implementsClassNameProps`, `implementsShorthandProp`, `implementsCommonProps` | ✅ 5 helpers, ~790 LOC, all Enzyme-bearing. 482 tests green across 7 components |
| 2 | `views` (38 files, 964 LOC) | Smallest and simplest; shakes out harness gaps cheaply |
| 3 | `lib` (20 files, 2,112 LOC) | Nearly pure logic — 3 shallow, 1 mount |
| 4 | `elements` (42 files) | First real shorthand/subcomponent surface |
| 5 | `collections` (32 files) | 26 shallow files; structural assertions become behavioural |
| 6 | `addons` (10 files) | Small but hard — Portal alone is 806 LOC |
| 7+ | `modules`, split further | 8,820 LOC. Dropdown-test.js is 2,903 of them and gets its own PR |

**`componentInfoContext` must be replaced first.** `isConformant.js` and
`hasValidTypings.js` import it from `docs/src/utils`, which Phase 0 deleted —
so those two files currently import a module that does not exist. They need
`filenameWithoutExt`, `apiPath`, `displayName`, `isChild`, `parentDisplayName`
and `repoPath`, all of which can be derived by walking `src/` and reading
`src/index.js` at test time. Deriving it any other way reintroduces the docs
build that landmine 4 exists to prevent.

**Ported in PR 1**: `isConformant`, `hasValidTypings`, `tsHelpers`, `forwardsRef`,
`hasUIClassName`, `hasSubcomponents`, `implementsCreateMethod`, `commonHelpers`.
New harness lives in `test/support/**`; `test/specs/**` and `test/utils/**` stay
frozen. `sinon` became `vi`, `chai` became `expect`, and `faker` became fixed
strings — random test data was never worth the nondeterminism.

Two assertions did not survive the port, both deliberately:

- **`componentClassName`** — `isConformant` asserted each component's Semantic
  UI class name from a value react-docgen produced. It cannot be derived from
  source without guessing (`ButtonGroup` renders `buttons`, not `button-group`),
  and a wrong derivation would fail across 162 components. `hasUIClassName` and
  `implementsClassNameProps` carry the specific per-component coverage.
- **Undispatchable events** — Enzyme's `simulate()` called React's handler
  directly, so it could exercise listeners for events jsdom cannot raise. RTL
  dispatches real DOM events, so the listener list is filtered at run time to
  what `fireEvent` supports, and `onFocus`/`onBlur` are fired as
  `focusIn`/`focusOut` because React 17+ delegates through those.

**Ported in PR 1b**: the five remaining helpers. `implementsShorthandProp` was
the hard one — Enzyme compared the shorthand's *React element* against one built
by `createShorthand` directly, which RTL cannot do. The behavioural equivalent
asserts both routes produce the same markup, which is what consumers observe.
Its `key` assertion is dropped outright: React keys are never rendered, so there
is no DOM to assert against.

`implementsMultipleProp`, `labelImplementsHtmlForProp`, `implementsHTMLIFrameProp`
and `implementsHTMLLabelProp` have no call site outside `collections` and
`modules`, so they are ported but first exercised in PRs 5 and 7.

**`shallow()` has no RTL equivalent, by design.** The 93 shallow files cannot be
ported mechanically: structural assertions (`should.have.descendants`) have to
become behavioural ones against rendered output. Expect the assertion count to
fall — 1,186 wrapper assertions will not map 1:1, and forcing them to would
reproduce Enzyme's coupling to internals in a library that is about to change
its internals in Phase 3.

### Landmine 5 — circular imports break static subcomponents

Found while porting `ButtonGroup-test.js`. `Button.js` imports `ButtonGroup.js`
and back again — one of seven such cycles rollup reports — so
`Button.Group = ButtonGroup` resolves only when the parent module initialises
first. Deep-import the child before the parent and it breaks:

```js
// CommonJS: silent
const ButtonGroup = require('react-fomantic-ui/dist/commonjs/elements/Button/ButtonGroup').default
const Button = require('react-fomantic-ui/dist/commonjs/elements/Button/Button').default
Button.Group // => undefined

// ESM: hard failure
import ButtonGroup from 'react-fomantic-ui/dist/es/elements/Button/ButtonGroup.js'
import Button from 'react-fomantic-ui/dist/es/elements/Button/Button.js'
// ReferenceError: Cannot access 'ButtonGroup' before initialization
```

**Pre-existing, not a build regression** — `3.0.0-beta.3` behaves identically in
CommonJS. It went unnoticed because the Karma harness bundled all 203 specs into
one module graph, so some other spec always loaded the parent first. Vitest gives
each file its own graph, which exposes it.

Deep-importing a subcomponent for tree-shaking is a normal thing to do, so this
is worth a fix of its own — breaking the cycle in source, not papering over it.
Until then `test/setup.js` imports `src/index` so specs see the load order a
consumer importing the package gets.

### Phase 3 — React 19

Convert `defaultProps` on the 21 function-component files (49 occurrences
total across 26 files; the 5 remaining class components are unaffected).
Resolve the propTypes/`handledProps` coupling. Needs phase 2 to verify safely.

### Phase 4 — Storybook docs

The 961 retained examples become stories. `dt/site` already runs Storybook, so
this lands in tooling the team knows.

## Open decisions

1. ~~**`handledProps` strategy**~~ — **resolved**: option (b). 163 arrays
   codemodded into source, Babel plugin dropped, bundler choice now
   unconstrained.
2. ~~**GitHub org name**~~ — **resolved**: `Fomantic-UI-React`, owned by the
   personal account `aphenine`. Repo at
   `github.com/Fomantic-UI-React/react-fomantic-ui`.
3. **npm org/scope** — even publishing unscoped, reserving a scope is cheap.
4. ~~**First version number.**~~ — **resolved**: continue the v3 beta line.
   `3.0.0-beta.5` is the first release off the new pipeline and holds `latest`.
   Prereleases take `latest` because no stable release of this package name
   exists; revisit when 3.0.0 ships.
5. **Which components you actually use.** If it is eight of ~50, extracting
   those into your own design system may beat maintaining 22,340 LOC.
   Still open, and phase 2 is where it starts to cost real money — see below.

## Upstream backlog worth harvesting

`Semantic-Org/Semantic-UI-React` has **35 open PRs**, with submissions as recent
as Aug 2026 — people still contribute to a repo that has merged nothing since

2024. `upstream` is configured as a remote, so these can be cherry-picked.

| PR           | Why                                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| #4540, #4539 | "Refactor components for React 19.2 compatibility" (+1498/-1359, +787/-685) — substantial Phase 3 work |
| #4513        | Widen react/react-dom peerDeps to v19                                                                  |
| #4525, #4520 | Two independent fixes for the same Popup/Popper wrapper bug                                            |
| #4504        | Portal Escape handling via addEventListener instead of event-stack                                     |

None are reviewed or verified — treat as leads, not trusted patches. They also
predate the tooling strip and the codemod, so expect conflicts.

> **Before merging any harvested work: temporarily re-enable merge commits.**
> The repo is squash-only, which collapses every commit in a PR into one
> authored by the merger. That is right for our own PRs and wrong for upstream
> contributions — it would erase the original authors from the history of a
> fork whose legitimacy rests on respecting their work. Settings → General →
> Pull Requests → tick "Allow merge commits", merge, then untick it.

## Reference numbers

|                            |                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------- |
| Source                     | 22,340 LOC across 257 files                                                     |
| Frozen specs               | 203 files, ~19,000 LOC                                                          |
| Type definitions           | 213 `.d.ts` + `index.d.ts` (756 lines) + `generic.d.ts` (2,158)                 |
| Public exports             | 164                                                                             |
| Components                 | ~50 across elements/collections/views/modules/addons                            |
| Class components remaining | 5 (Dropdown, Search, Transition, AccordionPanel, ModernAutoControlledComponent) |
| Legacy React APIs          | 0 `findDOMNode`, 0 `UNSAFE_` lifecycles                                         |
