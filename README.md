# react-fomantic-ui

React components that render [Semantic UI][sui] / [Fomantic-UI][fomantic]
markup. A community-maintained fork of [semantic-ui-react][upstream].

> **This is a fork, and it is not official.**
> It is not affiliated with, endorsed by, or maintained by the Semantic-Org
> team or the Fomantic-UI team. Please do not send issues about this package
> to either project. Report them [here][issues].

## Why this exists

`semantic-ui-react` is no longer maintained. Its last release was
`2.1.5` in December 2023, `3.0.0-beta.2` has sat on the `beta` tag since the
same month, and the last commit landed in November 2024 — while the package
is still downloaded around 370,000 times a week.

This fork exists to keep that work usable: to ship the stranded v3 line, to
modernise the toolchain, and to support current React versions.

## Status

Early. The library builds and its public API is unchanged from
`3.0.0-beta.2`, but the test suite is mid-migration and there is no published
release yet. See [PLAN.md](./PLAN.md) for the roadmap, the known landmines and
what is done so far.

Not yet ready to depend on in production unless you are comfortable tracking a
moving target.

## Installation

```sh
npm install react-fomantic-ui
# or
yarn add react-fomantic-ui
```

This package ships **no CSS**. It renders Semantic UI class names, so you
bring your own stylesheet — either the original [semantic-ui-css][suicss],
the maintained [Fomantic-UI][fomantic] fork, or a custom theme:

```sh
npm install fomantic-ui-css
```

```js
import 'fomantic-ui-css/semantic.min.css'
import { Button } from 'react-fomantic-ui'

const App = () => <Button primary>Click me</Button>
```

## Migrating from `semantic-ui-react`

`3.0.0-beta.3` is upstream's `3.0.0-beta.2` plus this fork's tooling work. **No
component API changed**, and the change was verified against a production
Next.js application: 1,206 unit tests, 3 snapshots and 9 accessibility tests
all stayed green with no source changes, alongside a clean typecheck and a
successful production build.

### Recommended: alias the old name

Keep every `import { Button } from 'semantic-ui-react'` exactly as it is and
repoint the name in `package.json`:

```sh
npm install semantic-ui-react@npm:react-fomantic-ui@3.0.0-beta.3
# yarn add semantic-ui-react@npm:react-fomantic-ui@3.0.0-beta.3
# pnpm add semantic-ui-react@npm:react-fomantic-ui@3.0.0-beta.3
```

which records:

```json
{
  "dependencies": {
    "semantic-ui-react": "npm:react-fomantic-ui@3.0.0-beta.3"
  }
}
```

No code changes, one copy on disk, and — importantly — third-party packages
keep working. See below.

### Why the alias matters

Companion libraries declare `semantic-ui-react` as a **peer dependency**:

| Package                      | Peer requirement              |
| ---------------------------- | ----------------------------- |
| `react-semantic-toasts`      | `semantic-ui-react: *`        |
| `semantic-ui-calendar-react` | `semantic-ui-react: >=0.84.0` |

A peer dependency is a contract with the host application, and a package
published under a different name cannot satisfy it. Installing
`react-fomantic-ui` under its own name leaves those peers unmet and the
libraries unable to resolve their imports. The alias satisfies them, because
the dependency really is called `semantic-ui-react` — it just resolves here.

> **`resolutions` / `overrides` will not fix this.** They override the version
> of a package already in the dependency graph, and an unmet peer is not in the
> graph. The dependency has to be declared.

### Alternative: rename your imports

If you would rather your imports name the package you are actually using:

```sh
npm install react-fomantic-ui@3.0.0-beta.3
```

```diff
-import { Button } from 'semantic-ui-react'
+import { Button } from 'react-fomantic-ui'
```

Deep imports move across unchanged, since the internal layout is identical:

```diff
-import { ButtonProps } from 'semantic-ui-react/dist/commonjs/elements/Button/Button'
+import { ButtonProps } from 'react-fomantic-ui/dist/commonjs/elements/Button/Button'
```

If you use any companion library, you still need the alias **as well**, so that
their peer dependency resolves. Declaring both installs the code twice, which
risks duplicate module instances and split React context — so prefer the alias
alone unless you have a reason not to.

### If you load the UMD build

The global and the filename follow the package name:

```diff
-<script src="https://cdn.jsdelivr.net/npm/semantic-ui-react/dist/umd/semantic-ui-react.min.js"></script>
+<script src="https://cdn.jsdelivr.net/npm/react-fomantic-ui/dist/umd/react-fomantic-ui.min.js"></script>
```

```diff
-const { Button } = semanticUIReact
+const { Button } = reactFomanticUI
```

The `debug` namespace changed from `semanticUIReact:` to `reactFomanticUI:`
too, if you filter on it.

### CSS

Nothing to do. This package ships no CSS, so whatever stylesheet you already
load — `semantic-ui-css`, `fomantic-ui-css` or a custom theme — keeps working.

## Documentation

### Component explorer

**[Browse every component and example →][storybook]**

909 live examples covering the whole public API, published from `main` on
every build — every component, in every documented variation, rendered rather
than described. The source for each one is a single self-contained file under
[`docs/src/examples`](./docs/src/examples), laid out to match the sidebar.

It is styled with [`fomantic-ui-css`][fomanticcss] pinned at `2.4.4` — the
first Fomantic release, and the closest point on the maintained lineage to
where it split from Semantic-UI in 2018. That version is deliberate and moves
forward one minor at a time; see [PLAN.md](./PLAN.md) for why.

### Prose documentation

This fork does not host its own documentation site yet. Upstream's
[react.semantic-ui.com][upstreamdocs] still documents the same component API
and remains broadly accurate — with the caveat that it describes the
unmaintained package, not this one, and predates any changes made here.

## Principles

Inherited from the original project and still the intent:

- No animation dependencies
- Simple declarative component APIs over brittle HTML markup
- Complete keyboard support
- Complete Semantic UI component definition support
- Completely documented
- Completely tested
- Accessible

## FAQ

<details>
  <summary><b>Can I use custom icons?</b></summary>

Yes. Use `<Icon className='my-icon' />` instead of `<Icon name='my-icon' />`.

</details>

<details>
  <summary><b>Can I use a custom CSS theme?</b></summary>

Yes. These components render valid Semantic UI markup and include no CSS of
their own, so any Semantic UI or Fomantic-UI theme can be loaded on top.

</details>

<details>
  <summary><b>Does it work with the original semantic-ui-css?</b></summary>

Yes. The markup is unchanged, so `semantic-ui-css` and `fomantic-ui-css` both
work. Fomantic-UI is the actively maintained option.

</details>

## Credit

Created by [@levithomason][levi] and a large community of
[contributors][contributors], under the copyright of TechnologyAdvice. Made
possible by [@jlukic][jlukic] authoring [Semantic UI][sui], and continued by
the [Fomantic-UI][fomantic] team.

This fork stands entirely on their work. The full commit history is preserved
here, and the original MIT licence and copyright notice are retained.

## Licence

MIT — see [LICENSE.md](./LICENSE.md).

[sui]: https://semantic-ui.com/
[fomantic]: https://fomantic-ui.com/
[upstream]: https://github.com/Semantic-Org/Semantic-UI-React
[upstreamdocs]: https://react.semantic-ui.com/
[storybook]: https://main--6a9c61f6208335e5084aec99.chromatic.com
[fomanticcss]: https://www.npmjs.com/package/fomantic-ui-css
[suicss]: https://www.npmjs.com/package/semantic-ui-css
[issues]: https://github.com/Fomantic-UI-React/react-fomantic-ui/issues
[levi]: https://github.com/levithomason
[jlukic]: https://github.com/jlukic
[contributors]: https://github.com/Semantic-Org/Semantic-UI-React/graphs/contributors
