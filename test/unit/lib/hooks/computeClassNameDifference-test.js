import { computeClassNamesDifference } from 'src/lib/hooks/useClassNamesOnNode'

const fixtures = [
  {
    prevClasses: [],
    currentClasses: [],
    forAdd: [],
    forRemoval: [],
  },
  {
    prevClasses: ['foo', 'bar'],
    currentClasses: ['bar', 'baz'],
    forAdd: ['baz'],
    forRemoval: ['foo'],
  },
  {
    prevClasses: ['foo', 'bar'],
    currentClasses: ['foo', 'bar'],
    forAdd: [],
    forRemoval: [],
  },
]

describe('computeClassNamesDifference', () => {
  it('computes className difference', () => {
    fixtures.forEach((fixture) => {
      expect(computeClassNamesDifference(fixture.prevClasses, fixture.currentClasses)).toEqual(
        expect.arrayContaining([fixture.forAdd, fixture.forRemoval]),
      )
    })
  })
})
