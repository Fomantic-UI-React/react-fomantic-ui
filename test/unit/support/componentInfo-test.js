import { componentInfoContext } from 'test/support/componentInfo'

const { byDisplayName } = componentInfoContext

describe('componentInfo', () => {
  it('discovers every public component', () => {
    expect(Object.keys(byDisplayName).length).toBeGreaterThan(150)
  })

  it('describes a top-level component', () => {
    expect(byDisplayName.Button).toEqual({
      displayName: 'Button',
      filenameWithoutExt: 'Button',
      repoPath: 'src/elements/Button/Button.js',
      isChild: false,
      parentDisplayName: null,
      apiPath: 'Button',
    })
  })

  it('reads the api path from the parent statics', () => {
    expect(byDisplayName.ButtonGroup.apiPath).toBe('Button.Group')
    expect(byDisplayName.TableHeaderCell.apiPath).toBe('Table.HeaderCell')
    expect(byDisplayName.PortalInner.apiPath).toBe('Portal.Inner')
  })

  it('excludes hooks and implementation modules', () => {
    expect(byDisplayName.usePortalElement).toBeUndefined()
    expect(byDisplayName.createReferenceProxy).toBeUndefined()
  })
})
