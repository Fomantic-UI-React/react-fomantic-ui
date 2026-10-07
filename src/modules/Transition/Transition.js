import Transition from './internal/Transition'
import TransitionGroup from './TransitionGroup'

// Transition is defined in internal/ so that TransitionGroup (through utils/wrapChild) can
// import it without importing this module back. That cycle broke `Transition.Group`
// whenever TransitionGroup loaded first (#8).
Transition.Group = TransitionGroup

export default Transition
