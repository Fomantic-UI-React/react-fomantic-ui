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

## Documentation

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
[suicss]: https://www.npmjs.com/package/semantic-ui-css
[issues]: https://github.com/Fomantic-UI-React/react-fomantic-ui/issues
[levi]: https://github.com/levithomason
[jlukic]: https://github.com/jlukic
[contributors]: https://github.com/Semantic-Org/Semantic-UI-React/graphs/contributors
