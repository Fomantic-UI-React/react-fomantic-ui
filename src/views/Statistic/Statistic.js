import Statistic from './internal/Statistic'
import StatisticGroup from './StatisticGroup'
import StatisticLabel from './StatisticLabel'
import StatisticValue from './StatisticValue'

// Statistic is defined in internal/ so that StatisticGroup can import it without importing
// this module back. That cycle broke `Statistic.Group` whenever StatisticGroup loaded first (#8).
Statistic.Group = StatisticGroup
Statistic.Label = StatisticLabel
Statistic.Value = StatisticValue

export default Statistic
