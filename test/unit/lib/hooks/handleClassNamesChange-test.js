import { handleClassNamesChange } from 'src/lib/hooks/useClassNamesOnNode'

const fooRef = { current: 'foo' }
const barRef = { current: 'bar' }

const nodes = new Set()
const createNodeMock = (add, remove) => {
  const node = {
    classList: { add, remove },
    reset: () => {
      add.mockClear()
      remove.mockClear()
    },
  }
  nodes.add(node)

  return node
}

describe('handleClassNamesChange', () => {
  afterEach(() => {
    nodes.forEach((node) => handleClassNamesChange(node, new Set()))
  })

  it('adds new classes to node', () => {
    const add = vi.fn()
    const remove = vi.fn()

    const refs = new Set([fooRef, barRef])
    const node = createNodeMock(add, remove)

    handleClassNamesChange(node, refs)
    expect(add).toHaveBeenCalledTimes(2)
    expect(add).toHaveBeenCalledWith('foo')
    expect(add).toHaveBeenCalledWith('bar')
    expect(remove).not.toHaveBeenCalled()
  })

  it('removes nonexistent classes', () => {
    const add = vi.fn()
    const remove = vi.fn()

    const refs = new Set([fooRef, barRef])
    const node = createNodeMock(add, remove)

    handleClassNamesChange(node, refs)
    expect(add).toHaveBeenCalledTimes(2)
    expect(add).toHaveBeenCalledWith('foo')
    expect(add).toHaveBeenCalledWith('bar')
    expect(remove).not.toHaveBeenCalled()

    node.reset()
    refs.delete(barRef)

    handleClassNamesChange(node, refs)
    expect(add).not.toHaveBeenCalled()
    expect(remove).toHaveBeenCalledTimes(1)
    expect(remove).toHaveBeenCalledWith('bar')
  })

  it('handles different nodes', () => {
    const fooAdd = vi.fn()
    const fooRemove = vi.fn()
    const fooNode = createNodeMock(fooAdd, fooRemove)
    const fooRefs = new Set([fooRef])

    const barAdd = vi.fn()
    const barRemove = vi.fn()
    const barNode = createNodeMock(barAdd, barRemove)
    const barRefs = new Set([barRef])

    handleClassNamesChange(fooNode, fooRefs)
    expect(barAdd).not.toHaveBeenCalled()
    expect(barRemove).not.toHaveBeenCalled()
    fooNode.reset()

    handleClassNamesChange(barNode, barRefs)
    expect(fooAdd).not.toHaveBeenCalled()
    expect(fooRemove).not.toHaveBeenCalled()
  })
})
