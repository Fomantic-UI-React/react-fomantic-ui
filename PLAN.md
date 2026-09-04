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
| 2 | `views` (38 files, 964 LOC) | ✅ Smallest and simplest; shook out two harness gaps cheaply |
| 3 | `lib` (20 files, 2,112 LOC) | ✅ Nearly pure logic — and where the port tooling got built |
| 4 | `elements` — 37 of 42 files | ✅ First real shorthand/subcomponent surface |
| 4b | `elements` — Button, Input, List, ListItem, Label | ✅ The five heaviest: 94 Enzyme call sites between them |
| 5 | `collections` (32 files) | ✅ 26 shallow files; structural assertions become behavioural |
| 6 | `addons` — 8 of 10 files | ✅ Small but hard |
| 6b | `addons` — Portal, TransitionablePortal | ✅ Portal is 806 LOC and was the hardest file in the corpus |
| 7a | `modules` — 24 of 46 files | ✅ The half that needed no structural rewriting |
| 7b | `modules` — Dimmer, DimmerInner, ModalActions, RatingIcon, TransitionGroup, Embed | ✅ 6 files, plus three harness fixes |
| 7c | `modules` — Sidebar, plus the stale `resolutions` fix | ✅ |
| 7d | `modules` — AccordionAccordion, ModalDimmer, Progress | ✅ |
| 7e | `modules` — Checkbox, Rating | ✅ |
| 7f | `modules` — Modal | ✅ |
| 7g | `modules` — Sticky, Tab, Transition | 3 files of state and timing behaviour |
| 7h | `modules` — Dropdown (2,903 LOC), Search, Popup | The three largest and most interactive |
| 8 | Delete the frozen `commonTests` and `docs` originals | Phase 2 done when `test/specs` is empty |

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

**Ported in PR 2** (`views`): 23 of the 38 specs never rendered with Enzyme and
were codemodded mechanically — rewrite the `commonTests` import, drop `faker`
for fixed strings, move the file. The other 15 were rewritten by hand against
the markup the components actually produce, checked by rendering each one first
rather than guessing at class names.

Two harness gaps surfaced, both fixed here:

- `hasValidTypings` declared an empty `describe('shorthands')` for components
  with no shorthand props. Mocha allowed that; vitest fails it.
- The upstream directory was misspelt `test/specs/views/Stastistic`. Corrected
  to `Statistic` on the way across.

Assertions on element props rather than output are where the translation has to
be judged, not mechanical. `ItemImage` asserted the `wrapped` and `ui` props
that `Image` received; what those produce is a wrapper that carries `ui` only
once a size is given, so that is what the port asserts.
**Ported in PR 3** (`lib`): 15 of 20 by codemod, 5 by hand. This is where the
tooling in `scripts/phase2/` was built, because `lib` is the first area whose
specs carry real assertion bodies rather than lists of `common.*` calls —
`.should.equal`, `.should.have.property`, sinon spies — none of which the
`views` port had to touch.

Three patterns came out of it that the remaining areas will hit:

- **`shallow()` used only to reach `.props()`.** `factories-test.js` asserts on
  the element `createShorthand` returns, and an element carries its props
  directly, so the renderer drops out entirely and the assertion gets stronger.
- **Enzyme reading class state.** `ModernAutoControlledComponent-test.js`
  asserts internal state 29 times. The fixture is defined in the spec and is a
  real class, so a ref gives the instance and its actual state — lossless,
  unlike serialising state into the DOM.
- **Webpack loaders in test code.** `isBrowser-test.js` used `imports-loader` to
  inject `document = undefined` before the module evaluated. There is no bundler
  in the test path now, so it stubs the global and re-imports.

The codemod is deliberately loud rather than clever: anything it cannot map is
left with an `__UNMAPPED_*__` marker, so a bad translation fails the build
instead of silently asserting nothing.

**Ported in PR 4** (`elements`, 37 of 42): this is where the port tooling grew a
second stage. `scripts/phase2/enzyme2rtl.mjs` rewrites the mechanical Enzyme
wrapper reads — `tagName`, `className`, `attr`, `descendants`, and `prop` where
the prop is really a DOM attribute — onto two thin helpers in
`test/support/rtl`. It deliberately refuses anything needing the React element
tree, so component-prop assertions are left for a human rather than guessed at.

The five files held back are the ones where Enzyme was doing real work:
Button, Input, List, ListItem and Label have 94 call sites between them.

**It found a shipped bug.** `<Image content='...' />` throws — `content` is
rendered into a void `<img>` because `getComponentType` switches to a `div` for
`children` and `wrapped` but not for `content`. `common.rendersChildren(Image)`
covered exactly this and passed for years, because Enzyme's `shallow()` builds
the element tree without ever rendering it. Tracked as **issue #11**; the port
passes `rendersContent: false` with a pointer, and that option is the
regression test to remove with the fix.

That is now twice the port has surfaced something the old suite structurally
could not see — see also issue #8.

**Ported in PR 4b**: the five files where Enzyme was doing real work. Three
translations are worth knowing because they recur:

- **Ordering.** `wrapper.childAt(0).childAt(1)` becomes the root's element
  children in document order — Button's `labelPosition`, Input's icon index.
- **Handler props.** Enzyme read `onKeyDown` straight off the element. RTL
  cannot, so a spy is passed and the event dispatched instead. Input's
  `htmlInputProps` loop splits into handlers and value props for this reason.
- **Spying on a static.** `sandbox.spy(ListContent, 'create')` becomes
  `vi.spyOn`, which still works because the shorthand factory is a real static.

`isConformant` also gained an event init: React ignores a `change` that does not
change a value, so the conformance check reported every form component's
`onChange` as never called.

Two jsdom differences to remember: `window.getSelection()` does not reflect an
input's selection (assert `selectionStart`/`selectionEnd`), and React writes
`defaultValue` out as the `value` attribute.

**Ported in PR 5** (`collections`): the pre-pass did most of it — only 17 of 32
files needed a hand, and 7 of those shared one pattern (`FormButton` and
friends asserting `control={X}` on the FormField they render, which becomes the
markup that control produces).

Two things were dropped rather than translated, both deliberately:

- **`Form`'s "passes all args to onSubmit".** Enzyme's `simulate(event, ...args)`
  could inject extra arguments into a handler. React never passes more than the
  event to a DOM handler, so the test asserted something unreachable in a
  browser.
- **`Menu`'s shared wrapper.** The `items` block mounted once outside its tests
  and shared the result, so the click assertions depended on execution order.
  Each test renders its own now, which is why there are two more of them.

**Ported in PR 6** (`addons`, 8 of 10): the harness learned about portals here.
`isConformant` and `implementsShorthandProp` both assumed a component renders
inside its own container; a portal renders into `document.body` and renders
nothing at all until it is open. Both now take `rendersPortal` seriously —
querying the document, and rendering with `open` — which the Enzyme harness did
via `setProps({ open: true })` and the first port had quietly dropped.

`Confirm` is the clearest example of what that changes: its tests `shallow()`d a
Modal and asserted on the element tree, so nothing was ever rendered. They now
open the Confirm and assert against the modal in the document, which is what a
user sees.

**Ported in PR 6b**: `Portal` asked `wrapper.should.have.descendants(PortalInner)`
59 times — a question about the element tree. The DOM equivalent is whether the
portal's child is in the document, so the ported spec marks its children and
asks that instead. Everything else falls out of it: `setProps` becomes
`rerender`, `domEvent.click(document)` becomes `fireEvent.click(document)`, and
the mouse-delay tests keep real timers because that is what they are testing.

One assertion changed shape rather than target. "does not call this.setState()
if portal is unmounted" spied on the Enzyme wrapper's `setState`; there is no
wrapper now, so it asserts the observable symptom instead — React's warning
about updating an unmounted component.

**Third bug found**: `TransitionablePortal` never spreads user props to the DOM.
Its unhandled props go to `Portal`, which renders no element of its own. The
Enzyme check passed because it read the element tree, where the prop sits
plainly on the `Portal` element. Tracked as **issue #16**; `isConformant` gained
a `spreadsUserProps` option so the exception is explicit rather than silent.

**Ported in PR 7a** (`modules`, 24 of 46): 18 files came through the codemod
untouched and six needed small rewrites. The remainder are held back because
they test state machines and timing — Dropdown's keyboard navigation, Transition's
animation lifecycle, Sticky's scroll handling — rather than rendered output.

One harness bug surfaced: `implementsShorthandProp`'s `alwaysPresent` check built
its selector from a shorthand carrying an arbitrary value, so it looked for
`i.x.icon` when `AccordionTitle` renders `i.dropdown.icon` by default. It now
takes the signature from the bare shorthand component, which is what "has a
default" actually means.

**Ported in PR 7b**: six files, and three fixes to the shared harness that the
area forced out:

- `implementsShorthandProp` ignored `assertExactMatch`. Where a component adds
  props of its own on top of the shorthand — `Embed` does — the rendered markup
  is a superset, not a match, and the exact comparison was wrong.
- Its `alwaysPresent` check built a selector from an arbitrary value.
- `signatureOf` produced invalid CSS when a class name starts with a digit
  (`<Icon name={123} />`), which the selector now escapes.

**Fourth bug found**: `Embed` builds its iframe URL with `&amp;` rather than
`&`. React sets attributes verbatim, so the parameters come out named
`amp;autoplay`, `amp;color` and so on, and every option after the first is
silently ignored by the provider. Tracked as **issue #19**; the ported spec
keeps the escaped expectations, with a comment, because they describe what the
component actually does today.

**Ported in PR 7c**: `Sidebar` — and a dependency bug it exposed that mattered
far more than the file.

`package.json` carried a `resolutions` block pinning `react`, `react-dom`,
`react-is` and `react-test-renderer` to 17, alongside `react-router` and
`react-universal-component` entries left over from the docs app Phase 0 deleted.
Narrowing devDependencies to React 18 did not touch it, so yarn kept forcing 17
for transitive dependents — and `@fluentui/react-component-event-listener` ended
up with its own nested copy of React 17.

Two copies of React means hooks resolve against the wrong dispatcher:

```
Invalid hook call. Hooks can only be called inside of the body of a function component.
  at resolveDispatcher (@fluentui/react-component-event-listener/node_modules/react/...)
```

`Sidebar` is the only component that uses that package, which is why nothing
caught it until now. The whole block is dead and is removed; `react-is` now
resolves to 18 alongside React itself.

**Ported in PR 7d**: AccordionAccordion, ModalDimmer and Progress — the three
that turned out to be mechanical once the Enzyme wrapper reads were rewritten as
DOM queries.

`AccordionAccordion` is the **third** spec found rendering once *outside* its
tests and sharing the result, after `Menu` and `ModalActions`. In all three the
click assertions depended on execution order. It is worth assuming this pattern
exists in the remaining files rather than discovering it each time.

**Ported in PR 7e** (`Checkbox`, `Rating`): the first files where the frozen
tests asserted things that were true of Enzyme rather than of the component.

- `Checkbox`'s "onClick is not called when id is passed" only held because
  Enzyme's `simulate()` on a label does not forward the click to the associated
  input. A real DOM does, and the component's `id` handling exists precisely so
  the click is handled once rather than twice. The port asserts one call.
- Its two controlled-component tests asserted the toggle had **not** happened,
  contradicting their own names. The Enzyme wrapper was never re-rendered, so it
  could not see the update; the DOM is live and the toggle is visible.

Neither is a library bug — the component is right and the tests were wrong — so
they are corrected in place with a comment rather than filed.

`isConformant` gained `ignoredEvents` for `Checkbox`, whose `onChange` fires on
a click rather than on a DOM change event, so the event-transparency check
cannot exercise it. `fireEventInit` also now checks the target actually has a
value setter before setting one, which firing `change` on a wrapper element does
not.

**Ported in PR 7f** (`Modal`): a portal component, so every assertion moves from
the container to `document.body`. The frozen spec's helpers map cleanly —
`assertBodyContains(sel)` is a query, `domEvent.click(sel)` is `fireEvent`, and
`assertWithTimeout(fn, done)` is `await waitFor(fn)`, which is both shorter and
not sensitive to CI load.

Two things needed thought rather than translation. `Modal`'s `open` prop drives
the Portal and must not appear on the modal element, so the test renders and
unmounts explicitly rather than relying on a stale wrapper. And `ModalDimmer`'s
`blurring`, `inverted` and `scrolling` are props that become *classes* — some on
the dimmer, some on the mount node — so asserting them as attributes was wrong
in three places.

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

`src` has **7 cycles**; **5 break a static assignment**, all the same shape —
`Button.Group`, `Step.Group`, `Card.Group`, `Item.Group`, `Statistic.Group`, each
confirmed broken at runtime. The other two (`Label` ↔ `Image`, and
`Transition` → `TransitionGroup` → `wrapChild`) break no static and are lower
priority.

Tracked as **issue #8**. Until then `test/setup.js` imports `src/index` so specs
see the load order a consumer importing the package gets — that makes the suite
correct, it does not fix the shipped bug.

> **Working rule: no source changes until Phase 2 and Phase 4 are in place.**
> Restructuring five components' modules is exactly the kind of change that
> needs tests and Storybook underneath it. This is why the Phase ordering is
> what it is, and it applies to the whole upstream backlog below as well —
> those are unreviewed patches against code with no coverage yet.

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
