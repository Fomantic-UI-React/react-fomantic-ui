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

### Phase 2 — Vitest + @testing-library/react ✅ done

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
| 7g | `modules` — Sticky | ✅ |
| 7h | `modules` — Tab, Transition | ✅ |
| 7i | `modules` — Popup, Search | ✅ Split from Dropdown: 1,293 LOC between them |
| 7j | `modules` — Dropdown (2,903 LOC) | ✅ The largest file in the corpus |
| 8 | Delete the frozen `commonTests` and `docs` originals | ✅ `test/specs` is empty |

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

**Ported in PR 7g** (`Sticky`): the hardest kind of file so far, because the
behaviour under test is driven entirely by layout measurements that jsdom does
not compute. The frozen spec already stubbed `getBoundingClientRect` on the
trigger and sticky elements; the port keeps that approach and reaches those
elements through the DOM rather than through an Enzyme wrapper.

It also forced a fix in `isConformant`. The `as`-prop fixtures rendered
`<div data-my-component />` and **dropped their children**, which is fine for a
component that only spreads props but not for one that measures what it puts
inside. Enzyme's `shallow()` never rendered deeply enough to notice. The
fixtures now render `children`, which is both what an `as` component should do
and what the assertion is really about.

**Ported in PR 7h** (`Tab`, `Transition`): the first pair where the frozen
assertions were mostly about *which component* was rendered where, and the two
translations are worth separating.

`Tab`'s structural tests walked the element tree — `childAt(0).should.match('Grid')`,
`childAt(0).shallow().childAt(1).should.match('GridColumn')` — six levels deep in
places. Every one of those components renders a class name of its own (`grid`,
`column`, `menu`, `tab`), so the DOM equivalent is a class selector, and unlike
the element tree it also proves the thing actually rendered. Its `activeIndex`
"is passed to the Menu" becomes "the item at that index carries `active`", which
is what passing it is for.

`Transition` renders nothing of its own — it clones its child — so the Enzyme
`wrapper` and its `wrapper.find('p')` were always the same node, and the port
collapses to one `child()` accessor. `data-test-status` is emitted by the
component outside production, so the status assertions carry over unchanged.

**Fake timers appear for the first time here**, in three tests, and deliberately.
The rest of the suite waits with `waitFor`, which is right when the assertion is
"eventually". These three assert the opposite — that a 200ms transition has *not*
completed at 100ms — and there is no non-flaky way to assert a negative against a
real clock. Each one was mutation-checked by shortening the duration and
confirming it fails.

Two frozen tests asserted something other than their name, and are corrected in
place with a comment rather than filed, following the `Checkbox` precedent:

- **`children` "returns null when UNMOUNTED"** passed `mountOnShow={false}
  unmountOnHide={false}`, which computes to `EXITED`, not `UNMOUNTED`. Its
  `blank()` assertion passed anyway, because the `<p>` it rendered holds no text.
  The port renders the props that actually produce `UNMOUNTED`.
- **`duration` "applies numeric value to style when EXITING"** was a copy of the
  ENTERING test — `transitionOnMount`, asserting `ENTERING` — so the exiting side
  of `normalizeTransitionDuration` was never covered. It is now.

One assertion was dropped: `onTabChange`'s frozen test injected a
`{ fake: 'event' }` object through Enzyme's `simulate()` and asserted it arrived.
React hands a DOM handler nothing but the event, so this is the same unreachable
case as `Form`'s "passes all args to onSubmit" in PR 5.

**Fifth bug found**: `Tab` mutates the caller's `menu` prop object —
`renderMenu` writes `menu.tabular = 'right'` when inferring from `menuPosition`.
Once written, the `tabular === true` guard never matches again, so a consumer
holding the object across renders is stuck with `right tabular` even after
switching `menuPosition` to `'left'`. Tracked as **issue #26**. Invisible to the
frozen suite because every test built a fresh object literal inside itself.
**Ported in PR 7i** (`Popup`, `Search`): 7i was planned as one PR for all three
of the remaining files. Dropdown alone is 2,903 LOC, so it is split out as 7j —
the same reasoning that made 4b and 6b their own PRs.

`Popup` is the first file whose assertions were about a *third party's*
configuration: eleven of them read props off `react-popper`'s `Popper`. Three of
those have a DOM trace and are asserted there — `position` resolves to a class
on the popup, `positionFixed` to `position: fixed` on the div Popper positions,
and `eventsEnabled` to a real `scroll`/`resize` subscription on `window`. The
rest — `pinned`, `offset`, `popperModifiers` — do not, because jsdom computes no
layout for Popper to act on. Those are read back through a probe modifier passed
via `popperModifiers`, which is a public prop, and Popper's own documented
modifier API. That is a different thing from reaching into Popup's internals,
and it survives Phase 3.

Two mechanics from `Popup` that the remaining interactive components will hit:

- **Portal's content node is not the element you rendered.** `closeOnPortalMouseLeave`
  only fires for a mouseleave whose target is Portal's own content root —
  `[data-suir-portal]`, above both `.ui.popup` and Popper's wrapping div. Firing
  on the popup itself does nothing, silently.
- **A close on a timer needs an act() flush.** Portal closes through a
  `setTimeout`, so the `setState` lands outside `act()` and the DOM does not
  catch up until something flushes it. `waitFor` does; a bare `await wait(n)`
  does not, and will report the popup still open however long it waits. This
  cost an hour of chasing a test that appeared to prove the opposite of the
  truth, because a later `fireEvent` was flushing the *previous* assertion's
  pending update.

`Search` came through almost mechanically once the class names were known —
`SearchResults`, `SearchCategory` and `SearchResult` are `.results`, `.category`
and `.result`, with the category query scoped to the menu because the root
carries `category` too. Its scroll test is the `Sticky` pattern again: jsdom
computes no layout, so `offsetTop` and `clientHeight` are stubbed and the
assertion is on the scroll position the component derives from them.

**Sixth bug found**: `popperModifiers` cannot re-enable a modifier `Popup`
disables. `Popup` hard-codes `enabled: !!offset` for `offset` and
`preventOverflow` and `enabled: false` for `arrow`, and Popper merges by name
with an object spread — so a user modifier in the shape Popper's own docs use,
`{ name, options }`, has its options merged in and stays disabled. Silently.
Tracked as **issue #28**; the frozen assertion was `deep.include(modifierOffset)`
against the raw array prop, where membership says nothing about effect, and its
`modifierOffset` was exactly the shape that does not work.

**Seventh bug found, and the most serious the port has turned up**: `Search`'s
keyboard navigation is one keypress behind under React 18. `moveSelectionBy`
calls `scrollSelectedItemIntoView()` and `handleSelectionChange()` synchronously
after `setState`, and both read what that `setState` was about to change — the
DOM's `.result.active` and `this.state.selectedIndex`. The keydown arrives on a
**native** document listener via `eventStack`, so React 17 flushed the update
before either ran. React 18 batches native listeners too, and now:

- `onSelectionChange` is handed the *previously* selected result, every time;
- the menu scrolls to the item you just left, so arrowing to an off-screen
  result never brings it into view — `scrollSelectedItemIntoView` has no other
  call site, `componentDidUpdate` does not call it.

Tracked as **issue #29**. The frozen spec asserted the correct result and passed,
on React 17 in Karma; its scroll assertion was
`scrollTop + clientHeight === scrollHeight`, true in a real browser and vacuously
true in jsdom where every measurement is 0. This is the clearest case yet of the
port earning its cost: a shipped regression that the old suite could not see
because it ran on the React version the bug predates.

`Dropdown` should be checked for the same shape before #29 is closed.
**Ported in PR 7j** (`Dropdown`): 2,903 LOC and 217 tests, the largest file in
the corpus, plus its three remaining subcomponents. It came across in eight
passes, each run green before the next was written.

The structural translation is the same one `Tab` needed — `DropdownMenu`,
`DropdownItem`, `DropdownText` and `DropdownSearchInput` are `.menu`, `.item`,
`[role="alert"]` and `input.search` — and most of the file follows from that.
Three things did not.

**`fireEvent` is the wrong tool for a user interaction, and this is the file
that proves it.** `Dropdown` reads the events a browser sends *around* a click:
`isMouseDown` is set from `mousedown`, and it gates the `openOnFocus` branch in
`componentDidUpdate`. Under a bare click the focus that selection moves back to
the dropdown reads as a *fresh* focus and the menu reopens the moment it closes
— a working component looking broken. That was mistaken for a shipped React 18
regression twice before the cause was found, and the first fix was a helper
sending mousedown, click and mouseup by hand, which is `user-event` reinvented
badly. Every interaction in the file now goes through `user-event`; the general
rule and the gesture-by-gesture mapping are in their own section below.

Two assertions changed shape as a result. `preventDefault` is read from the kept
event once the interaction resolves, because a listener on the element runs
before React's handler on the container and would always see `false`. And the
search dropdown's "focused but closed" state is reached by tabbing in and
pressing escape, which is how a user gets there — the input keeps focus after
the menu closes.

**Popper-style config with no DOM trace** appears once more, in `upward`.
`setOpenDirection` compares the dropdown's rect against the viewport height,
neither of which jsdom computes, so both are stubbed as in `Sticky` and the
assertion is on the direction the component derives. Mutation-checked by
swapping the two stubbed positions and confirming both tests fail.

Assertions that got *stronger*, not weaker:

- **Three `TODO: try reenable after Enzyme update` comments are now live code.**
  `dropdownMenuIsClosed()` in "is not called when value is not changed on item
  click" (twice) and in "sets focus to the dropdown after selection" were
  commented out in 2019 waiting on an Enzyme fix that never came. A real click
  makes all three hold.
- **`allowAdditions`' label tests** picked apart the React elements inside the
  addition item's `text` prop — `text[1].type`, `text[1].key`. What those
  produce is `Add <b>boo</b>`, which is what the port asserts, and what a user
  sees.
- **The three "does not display if value is ''/null/undefined" tests** asserted
  `should.contain.text('')`, which every string satisfies — including the text
  of an element that is not there. They now assert the text element is absent.

Two assertions were dropped, both deliberately. `options` "handles keys
correctly" read React keys off the elements, and keys are never rendered — the
port asserts what the key derivation is *for* instead: three options render, and
React does not warn about duplicates. And `describe('render')` was an empty block
left over from a commented-out test; mocha allowed that, vitest does not.

**Eighth bug found**: `DropdownText` renders the `divider` class. The line is
copy-pasted from `DropdownDivider`, so every selection dropdown's selected-value
node comes out as `class="divider default text"` and picks up the border and
spacing SUI gives menu dividers. Tracked as **issue #31**. The frozen
`DropdownText-test.js` was 18 lines and never looked at a class name — and
`isConformant` cannot, since its `componentClassName` assertion was dropped in
PR 1 as underivable.

**`Dropdown` does not have Search's #29 bug.** It calls
`scrollSelectedItemIntoView` from `componentDidUpdate` when `selectedIndex`
changes, not inline after `setState`, so it sees the item that is actually
selected. The ported scroll test asserts the correct positions and passes.

### `user-event`, not `fireEvent`, for anything a user does

Applied across `Tab`, `Popup` and `Search` after the `modules` ports landed, and
to `Dropdown` in 7j.

`fireEvent` dispatches exactly one event, deliberately — `fireEvent.click` sends
a `click` and nothing else. Components that read the events a browser sends
*around* an interaction then behave differently under test than in a browser,
and the difference reads as a component bug. `Dropdown` and `Search` both track
an `isMouseDown` flag set from `mousedown`, and both gate an `openOnFocus`
branch on it; under a bare click the focus that selection moves back to the
control looks like a *fresh* focus, and the menu reopens the moment it closes.
That was mistaken for a shipped React 18 regression twice before the cause was
found, and the first fix — a helper sending mousedown, click and mouseup by
hand — was `user-event` reinvented badly.

`@testing-library/user-event` was already a devDependency and unused.
`userEvent.setup()` is called per test in `beforeEach`, before anything renders,
and every method is awaited. The frozen spec's constructions map onto real
gestures:

| frozen spec | user gesture |
| --- | --- |
| `simulate('click')` on an item | `await user.click(item)` |
| `mousedown` + `focus`, to focus without opening | `user.pointer({ keys: '[MouseLeft>]' })` — the button held down |
| `simulate('focus')` / `simulate('blur')` | `await user.tab()` in, and again out |
| `simulate('change', { target: { value } })` | `await user.clear(input)` then `await user.type(input, value)` |
| `domEvent.keyDown(document, { key })` | `await user.keyboard('{Escape}')` |
| `.blur()` by hand, wrapped in `act()` | `await user.tab()` |

Four things fell out of it:

- **`user.click` focuses.** `fireEvent.click` never did, so assertions about
  where focus ends up were only ever true by accident.
- **The `act()` trap mostly disappears.** `user-event` wraps its own dispatches
  and awaits them, so the pending-`setState` problem that cost an hour on
  `Popup`'s hover tests does not arise for anything it drives. It remains for
  timers, which is where `Transition` still needs it.
- **`preventDefault` must be read after the interaction.** A listener on the
  element runs before React's handler on the container, so it always sees
  `defaultPrevented` as `false`. Keep the event, read it once the interaction
  resolves.
- **A real pointer hovers before it clicks.** `Popup`'s `on={['click','hover']}`
  test only passed because `simulate('click')` sent no hover: with a real
  pointer the hover opens the popup and the click that follows toggles it shut.
  The port asserts that sequence instead, which is what a user gets.

`fireEvent` is still right where there is no user gesture — `scroll` on `window`
is the only use left in these files.

Swept across the whole of `test/unit` afterwards: 32 files, ~200 call sites.
What is left on `fireEvent` is left deliberately, and each site says why:

| where | why it stays |
| --- | --- |
| `Sticky` (12), `Popup` (4) | `scroll` — no gesture produces it, and jsdom does not scroll |
| `isConformant` / `syntheticEvent` | dispatches a *listener list* by name, to prove every declared event prop is passed through |
| `Portal`'s trigger loop | same shape — one dispatch per handler name, chosen at run time |
| `Checkbox`'s native-comparison matrix | the exact event sequence per target *is* the fixture; a click would substitute its own |

Four things the sweep turned up that are worth knowing:

- **`user.click(document)` does not work** — user-event needs an element. Use
  `document.body`; it reaches a document listener just the same.
- **A drag out of a component is `user.pointer` with two steps**, press on one
  target and release on another. `Modal` and `Portal` both have a "mousedown
  inside, mouseup outside" test, and converting those to `user.click` on the
  outside target quietly destroys them — the click sends its own mousedown
  there, which is the case being excluded.
- **`unhover` needs a `hover` first**, and it takes the pointer all the way out
  to the body. `Portal`'s "does not close on a mouseleave from a child" is about
  moving *within* the portal, which is `user.pointer({ target: parent })`.
- **Releasing Tab fires a keyup on the element that just received focus.** A
  `keyup` handler will count it, so `RatingIcon` takes focus by clicking.

`expect(() => fireEvent.click(x)).not.toThrow()` has no async equivalent worth
having; those became a bare `await user.click(x)`, which fails the test if it
throws and reads better.

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

### Phase 2 closed (PR 8)

`test/specs` and `test/utils` are gone — 15 frozen `commonTests` files, the docs
spec, and 11 Enzyme/sinon/chai helpers that had been unrunnable since Phase 0
took their packages out of `devDependencies`. `scripts/phase2/` goes with them,
as its own README said it should.

**The corpus, start to finish:** 203 files and ~19,000 LOC of Enzyme/mocha
became 189 files and 10,603 passing tests. The assertion count went *up*, not
down, which was not the expectation — landmine 3 predicted 1,186 wrapper
assertions would not map 1:1 and that the count would fall. It rose because
behavioural assertions are usually several DOM facts where a structural one was
a single `should.have.descendants`, and because the port kept finding tests that
asserted nothing.

**Eight bugs found**, none of them visible to the suite that was replaced:

| issue | what |
| --- | --- |
| #8 | circular imports leave `Parent.Group` undefined |
| #11 | `<Image content='...' />` throws |
| #16 | `TransitionablePortal` does not spread user props |
| #19 | `Embed` builds its iframe URL with `&amp;` |
| #26 | `Tab` mutates the caller's `menu` prop object |
| #28 | `popperModifiers` cannot re-enable a modifier `Popup` disables |
| #29 | `Search` keyboard navigation is a keypress behind on React 18 |
| #31 | `DropdownText` renders the `divider` class |

Plus **#35**, which the revived examples test found within a minute of running.

**The docs examples test came back rather than being deleted.** The frozen
version reached its fixtures through webpack's `require.context`, which is why
it stopped working when the docs app went; `import.meta.glob` does the same job
under Vite. It renders all 909 examples and asserts no console activity, in
about six seconds — the whole public API exercised the way a consumer writes it,
and the same files Phase 4 turns into stories. Sixteen are skipped because they
still import `faker`, detected by reading their source rather than by a list, so
the skips disappear when those examples are rewritten.

That test immediately earned itself: `SidebarExampleVisible` is the only failure,
and it is `@fluentui/react-component-event-listener` setting `defaultProps` on a
function component. React 18 warns; **React 19 removes it**, so this is a Phase 3
blocker sitting in a dependency rather than in our own code. Tracked as
**issue #35**, and allow-listed narrowly enough in the test that any other
warning still fails it.


### Phases 3 and 4 are swapped — Storybook first

**Decided.** Storybook and visual regression testing come before React 19.

The reason is that Phase 3's central change is deleting `defaultProps` from 21
function components, and a lost default is a *rendering* difference: a class
that stops being applied, a shorthand that stops being built. Unit tests catch
the ones somebody thought to assert. A visual diff catches the rest, and there
is no way to diff against a baseline that was never taken. Baselines have to
exist before the change that might move them, which puts Storybook first.

The examples smoke test added in PR 8 is the weak version of this — it proves
909 examples still render and say nothing on the console. It cannot see a
button that lost its colour.

Nothing in Storybook depends on React 19: Storybook 10 supports React 18 and 19
both, so it is set up once on 18 and re-verified on 19 with baselines already
in hand.

### Phase 3 — Storybook + visual regression

**The stories are already written.** `docs/src/examples` holds 909
zero-prop default-exported components laid out as
`area/Component/Section/ComponentExampleName.js`, which is Storybook's
hierarchy with different punctuation:

```
docs/src/examples/elements/Button/Types/ButtonExampleEmphasis.js
                  → Elements/Button/Types → "Emphasis"
```

So this phase generates story files, it does not author them. One `.stories.js`
per component directory, re-exporting each example as a named story.

**Generate static files; do not glob at run time.** `import.meta.glob` would be
shorter and is how PR 8's smoke test reaches the same files, but Chromatic's
TurboSnap decides what changed by walking the builder's dependency graph. A
dynamic glob gives it one edge from every story to every example, so either
everything looks changed or nothing does, and the snapshot budget below stops
working. Committed files with real imports also stay greppable and can be
hand-edited where an example needs a decorator.

**A CSS baseline has to be pinned.** The library ships no CSS, which is fine for
unit tests and impossible for visual ones — every snapshot is of unstyled markup
otherwise. See open decision 6.

**Snapshot budget.** Chromatic bills per snapshot per browser per viewport.
909 stories, Chrome only, one viewport:

| | billed snapshots |
| --- | --- |
| first build (baselines) | 909 |
| later build, TurboSnap on, one component touched | ~200 (changed stories at 1, the rest at 0.2) |

Against the **free commercial tier of 5,000/month** that is the baseline build
plus roughly 20 PR builds, with no overage — builds stop at the cap. Workable at
this repo's velocity, but it is a real constraint, so: Chrome only, one viewport,
TurboSnap on from the first build, and CI runs on pull requests and `main`
rather than on every push.

**Apply for the open-source sponsorship** — 35,000 snapshots/month, Chrome only,
which removes the constraint entirely. Chromatic's community-led tier wants over
100 contributors, over 40k weekly npm downloads, or over 10k GitHub stars.
`react-fomantic-ui` has no downloads and no stars yet, but `git shortlog -sn`
counts **352 contributors** in the history the fork deliberately kept — which is
the one criterion it meets, and a good argument for having kept it. Applying is
via in-app chat; worth doing before the first build rather than after.

**Storybook 10 with the Vitest addon**, because this repo already runs Vitest and
the addon turns stories into component tests in a real browser — interaction,
accessibility and coverage from the same files. That is a second payoff for
writing the stories, independent of Chromatic.

Order of work:

1. Storybook 10 + Vite builder + the pinned CSS, one component's stories by hand
   to prove the shape.
2. The generator, and the other 900.
3. Chromatic in CI on pull requests and `main`, TurboSnap on.
4. The Vitest addon, once the stories are stable.

### Phase 4 — React 19

Convert `defaultProps` on the 21 function-component files (49 occurrences
total across 26 files; the 5 remaining class components are unaffected).
Resolve the propTypes/`handledProps` coupling. Verified against Phase 2's
10,603 tests *and* Phase 3's visual baselines, which is the combination this
reordering exists to produce.

Two known items waiting here, both found by the port:

- **#35** — `@fluentui/react-component-event-listener` uses `defaultProps` on a
  function component. It is a dependency, so the codemod cannot reach it, and
  `Sidebar` is its only consumer. Dropping the package looks cheaper than
  patching it, and would also close the transitive-React hazard from PR #21.
  Storybook first means `Sidebar` has a baseline before this is touched.
- **#29** — `Search` reads state in the same tick as the `setState` that changes
  it. That is already broken on React 18 and should be fixed before anything
  else changes underneath it.

## Open decisions

1. ~~**`handledProps` strategy**~~ — **resolved**: option (b). 163 arrays
   codemodded into source, Babel plugin dropped, bundler choice now
   unconstrained.
2. ~~**GitHub org name**~~ — **resolved**: `Fomantic-UI-React`, owned by the
   personal account `aphenine`. Repo at
   `github.com/Fomantic-UI-React/react-fomantic-ui`.
3. **npm org/scope** — even publishing unscoped, reserving a scope is cheap.
6. **Which CSS the visual baselines are taken against.** The library ships none
   and works with either, so this picks itself once and then every snapshot is
   relative to it. `semantic-ui-css` is frozen at 2.5.0 (Oct 2022) and is what
   the ~370k weekly downloads actually have installed, so regressions caught
   against it are the ones that reach real users. `fomantic-ui-css` is
   maintained and matches the package name, but is a smaller install base and
   its own releases would show up as diffs in ours. Recommendation:
   **`semantic-ui-css` as the baseline**, pinned exactly, with Fomantic added as
   a second Storybook theme later if it earns its snapshot cost. Not yet
   decided.
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
