/**
 * Minimal ESTree walker with parent tracking.
 *
 * Rollup's `this.parse()` hands back a plain acorn AST, so the build plugins in
 * this directory only need enough of a walker to find identifiers, imports and
 * assignments. Everything runs after `rollup-plugin-esbuild` has stripped JSX,
 * so the tree is always plain ES.
 */
const SKIP_KEYS = new Set(['type', 'start', 'end', 'loc', 'range', 'parent'])

export function walk(node, visit, parent = null) {
  if (node === null || typeof node !== 'object') return

  if (Array.isArray(node)) {
    for (const child of node) walk(child, visit, parent)
    return
  }

  if (typeof node.type !== 'string') return

  visit(node, parent)

  for (const key of Object.keys(node)) {
    if (SKIP_KEYS.has(key)) continue
    walk(node[key], visit, node)
  }
}

/**
 * True when `node` is an Identifier being *referenced*, rather than appearing
 * as a non-computed member property or object key.
 */
export function isReference(node, parent) {
  if (!parent) return true
  if (parent.type === 'MemberExpression' && parent.property === node && !parent.computed) return false
  if (parent.type === 'Property' && parent.key === node && !parent.computed) return false
  if (parent.type === 'MethodDefinition' && parent.key === node && !parent.computed) return false
  return true
}
