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

### Phase 1 — rebrand + modern build

`handledProps` codemod ✅ done (PR #2): 163 arrays baked into source, Babel
plugin dropped, verified against a pre-change baseline with 0 value mismatches.

- Re-run the identity sweep (a stash exists at `stash@{0}` but predates the
  deletions; re-run rather than pop). Covers `package.json`, the UMD global
  `semanticUIReact` → `reactFomanticUI`, the `unpkg` path, the debug
  namespace, and remaining module specifiers.
- `LICENSE.md`: **retain the existing `Copyright (c) 2016 TechnologyAdvice`
  notice** as MIT requires, and add ours alongside. (Levi Thomason is the
  package `author`, not the copyright holder.)
- README: community fork of an unmaintained project, not affiliated with
  Semantic-Org or Fomantic-UI. Do not reuse the logo or `react.semantic-ui.com`.
- Replace gulp + webpack 4 with tsup/rollup. **Unblocked** — the
  `handledProps` constraint is resolved.
- Port CircleCI → GitHub Actions on Node 22.
- Decide the first published version (continuing the v3 line vs starting fresh).

### Phase 2 — Vitest + @testing-library/react

Port `test/specs` component by component. The long pole; see landmine 3.

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
4. **First version number.**
5. **Which components you actually use.** If it is eight of ~50, extracting
   those into your own design system may beat maintaining 22,340 LOC.

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
