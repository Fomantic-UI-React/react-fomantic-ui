import Step from './internal/Step'
import StepContent from './StepContent'
import StepDescription from './StepDescription'
import StepGroup from './StepGroup'
import StepTitle from './StepTitle'

// Step is defined in internal/ so that StepGroup can import it without importing
// this module back; that cycle broke `Step.Group` whenever the Group loaded first (#8).
//
// The statics are attached in the export itself, not as statements before it. Exporting
// the imported binding lets rollup point the package entry straight at internal/Step,
// leaving this module as a side-effect-only import that bundlers drop under
// "sideEffects": false, and `Step.Group` with it.
export default Object.assign(Step, {
  Content: StepContent,
  Description: StepDescription,
  Group: StepGroup,
  Title: StepTitle,
})
