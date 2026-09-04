import isBrowser from 'src/lib/isBrowser'

describe('isBrowser', () => {
  describe('browser', () => {
    it('returns true in a browser', () => {
      expect(isBrowser()).toBe(true)
    })

    // isBrowser captures `hasDocument`/`hasWindow` at module-eval time, so the
    // global has to be stubbed before a fresh copy of the module is imported.
    // The Karma suite did this with webpack's imports-loader, which no longer
    // exists in the test path.
    for (const [name, value] of [
      ['document', undefined],
      ['document', null],
      ['window', undefined],
      ['window', null],
    ]) {
      it(`returns false when ${name} is ${value}`, async () => {
        vi.resetModules()
        vi.stubGlobal(name, value)

        const { default: fresh } = await import('src/lib/isBrowser')

        expect(fresh()).toBe(false)

        vi.unstubAllGlobals()
        vi.resetModules()
      })
    }
  })

  describe('server-side', () => {
    beforeAll(() => {
      isBrowser.override = false
    })

    afterAll(() => {
      isBrowser.override = null
    })

    it('returns the override value', () => {
      expect(isBrowser()).toBe(false)
    })
  })
})
