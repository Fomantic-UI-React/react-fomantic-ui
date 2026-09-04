import { NodeRegistry } from 'src/lib/hooks/useClassNamesOnNode'

describe('NodeRegistry', () => {
  it('is a class', () => {
    expect(NodeRegistry).toBeTypeOf('function')
  })

  describe('add', () => {
    it('adds different components to same node', () => {
      const handler = vi.fn()
      const registry = new NodeRegistry()

      registry.add('foo', 'FooComponent')
      registry.add('foo', 'BarComponent')

      registry.emit('foo', handler)
      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith(
        expect.stringContaining('foo'),
        new Set(['FooComponent', 'BarComponent']),
      )
    })

    it('adds components to different nodes node', () => {
      const handler = vi.fn()
      const registry = new NodeRegistry()

      registry.add('foo', 'FooComponent')
      registry.add('foo', 'BarComponent')
      registry.add('bar', 'BazComponent')
      registry.add('bar', 'QuxComponent')

      registry.emit('foo', handler)
      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith(
        expect.stringContaining('foo'),
        new Set(['FooComponent', 'BarComponent']),
      )
      handler.mockClear()

      registry.emit('bar', handler)
      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith(
        expect.stringContaining('bar'),
        new Set(['BazComponent', 'QuxComponent']),
      )
    })
  })

  describe('del', () => {
    it('deletes only specified component', () => {
      const handler = vi.fn()
      const registry = new NodeRegistry()

      registry.add('foo', 'FooComponent')
      registry.add('foo', 'BarComponent')
      registry.del('foo', 'FooComponent')

      registry.emit('foo', handler)
      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith(
        expect.stringContaining('foo'),
        new Set(['BarComponent']),
      )
    })

    it('deletes node when all components are deleted', () => {
      const handler = vi.fn()
      const registry = new NodeRegistry()

      registry.add('foo', 'FooComponent')
      registry.add('foo', 'BarComponent')
      registry.del('foo', 'FooComponent')
      registry.del('foo', 'BarComponent')

      registry.emit('foo', handler)
      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith(expect.stringContaining('foo'), undefined)
    })

    it('passes when unexisting nodeRef is passed', () => {
      const handler = vi.fn()
      const registry = new NodeRegistry()

      registry.del('foo', 'FooComponent')
      registry.emit('foo', handler)

      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith(expect.stringContaining('foo'), undefined)
    })
  })
})
