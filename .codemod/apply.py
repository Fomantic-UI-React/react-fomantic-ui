"""Bake build-time handledProps into source.

babel-plugin-transform-react-handled-props derives `X.handledProps` from
`X.propTypes` at build time. This writes those arrays into source so the
plugin can be dropped and the bundler choice is no longer constrained.

Arrays come from .codemod/baseline.json, extracted from the plugin's own
output, so the values are exactly what shipped before. Empty arrays are
skipped: they were emitted for non-components and for inner classes that
delegate to their wrapper, and are never read.
"""
import json, pathlib, re, sys

baseline = json.loads(pathlib.Path('.codemod/baseline.json').read_text())
only = sys.argv[1] if len(sys.argv) > 1 else None

def fmt(name, arr):
    return f"{name}.handledProps = [" + ", ".join(f"'{p}'" for p in arr) + "]\n"

changed = skipped = 0
for rel, decls in sorted(baseline.items()):
    if only and rel != only:
        continue
    src = pathlib.Path('src') / rel
    if not src.exists():
        print(f"  MISSING SRC {rel}"); continue
    text = src.read_text()
    for name, arr in sorted(decls.items()):
        if not arr:
            skipped += 1; continue
        if re.search(rf'^{name}\.handledProps\s*=', text, re.M):
            continue
        # anchor: the closing brace of `Name.propTypes = { ... }` at column 0
        m = re.search(rf'^{name}\.propTypes = \{{$', text, re.M)
        if not m:
            print(f"  NO propTypes ANCHOR: {rel} :: {name}"); continue
        end = text.find('\n}\n', m.end())
        if end == -1:
            print(f"  UNTERMINATED propTypes: {rel} :: {name}"); continue
        ins = end + len('\n}\n')
        text = text[:ins] + '\n' + fmt(name, arr) + text[ins:]
        changed += 1
    src.write_text(text)
print(f"inserted {changed}, skipped {skipped} empty")
