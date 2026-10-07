import Step from './internal/Step'
import StepContent from './StepContent'
import StepDescription from './StepDescription'
import StepGroup from './StepGroup'
import StepTitle from './StepTitle'

// Step is defined in internal/ so that StepGroup can import it without importing
// this module back. That cycle broke `Step.Group` whenever StepGroup loaded first (#8).
Step.Content = StepContent
Step.Description = StepDescription
Step.Group = StepGroup
Step.Title = StepTitle

export default Step
