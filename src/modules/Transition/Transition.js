import Transition from './internal/Transition'
import TransitionGroup from './TransitionGroup'

// Transition is defined in internal/ so that TransitionGroup (through utils/wrapChild) can
// import it without importing this module back; that cycle broke `Transition.Group`
// whenever the Group loaded first (#8).
//
// The statics are attached in the export itself, not as statements before it. Exporting
// the imported binding lets rollup point the package entry straight at internal/Transition,
// leaving this module as a side-effect-only import that bundlers drop under
// "sideEffects": false, and `Transition.Group` with it.
export default Object.assign(Transition, {
  Group: TransitionGroup,
})
