import Statistic from './internal/Statistic'
import StatisticGroup from './StatisticGroup'
import StatisticLabel from './StatisticLabel'
import StatisticValue from './StatisticValue'

// Statistic is defined in internal/ so that StatisticGroup can import it without importing
// this module back; that cycle broke `Statistic.Group` whenever the Group loaded first (#8).
//
// The statics are attached in the export itself, not as statements before it. Exporting
// the imported binding lets rollup point the package entry straight at internal/Statistic,
// leaving this module as a side-effect-only import that bundlers drop under
// "sideEffects": false, and `Statistic.Group` with it.
export default Object.assign(Statistic, {
  Group: StatisticGroup,
  Label: StatisticLabel,
  Value: StatisticValue,
})
