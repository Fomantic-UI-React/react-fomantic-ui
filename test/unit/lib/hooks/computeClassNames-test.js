import { computeClassNames } from 'src/lib/hooks/useClassNamesOnNode'

describe('computeClassNames', () => {
  it('accepts Set as value', () => {
    const classNames = computeClassNames(new Set())

    expect(classNames).toBeInstanceOf(Array)
    expect(classNames).toHaveLength(0)
  })

  it('combines classNames', () => {
    const map = new Set([{ current: 'foo' }, { current: 'bar' }])

    expect(computeClassNames(map)).toEqual(expect.arrayContaining(['foo', 'bar']))
  })

  it('combines only unique classNames', () => {
    const map = new Set([{ current: 'foo' }, { current: 'bar' }, { current: 'foo bar baz' }])

    expect(computeClassNames(map)).toEqual(expect.arrayContaining(['foo', 'bar', 'baz']))
  })

  it('omits false, undefined and null classNames', () => {
    const map = new Set([
      { current: 'foo' },
      {},
      { current: false },
      { current: null },
      { current: undefined },
      { current: '0' },
      { current: 'false' },
    ])

    expect(computeClassNames(map)).toEqual(expect.arrayContaining(['foo', '0', 'false']))
  })

  it('trims classNames', () => {
    const map = new Set([{ current: ' foo     bar ' }, { current: '    baz qux' }])

    expect(computeClassNames(map)).toEqual(expect.arrayContaining(['foo', 'bar', 'baz', 'qux']))
  })

  it('skips "undefined" as input', () => {
    expect(computeClassNames([])).toHaveLength(0)
  })
})
