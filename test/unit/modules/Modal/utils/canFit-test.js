import { canFit } from 'src/modules/Modal/utils'

describe('canFit', () => {
  const innerHeight = window.innerHeight

  beforeAll(() => {
    window.innerHeight = 1000
  })

  afterAll(() => {
    window.innerHeight = innerHeight
  })

  it('computes proper result', () => {
    ;[
      // { rect: { height: 1000 }, fit: false },
      // { rect: { height: 950 }, fit: false },
      { rect: { height: 900 }, fit: false },
      { rect: { height: 850 }, fit: true },
      { rect: { height: 800 }, fit: true },
    ].forEach((check) => {
      expect(canFit(check.rect)).toBe(check.fit)
    })
  })
})
