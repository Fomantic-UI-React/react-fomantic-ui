import makeDebugger from './makeDebugger'

export { default as ModernAutoControlledComponent } from './ModernAutoControlledComponent';
export * as childrenUtils from './childrenUtils'

export {
  getKeyOnly,
  getKeyOrValueAndKey,
  getValueAndKey,
  getMultipleProp,
  getTextAlignProp,
  getVerticalAlignProp,
  getWidthProp,
} from './classNameBuilders'

export * as customPropTypes from './customPropTypes'
export { default as eventStack } from './eventStack';
export * from './factories'
export { default as getComponentType } from './getComponentType';
export { default as getUnhandledProps } from './getUnhandledProps';
export {
  htmlInputAttrs,
  htmlInputEvents,
  htmlInputProps,
  htmlImageProps,
  partitionHTMLProps,
} from './htmlPropsUtils'

export { default as isBrowser } from './isBrowser';
export { default as doesNodeContainClick } from './doesNodeContainClick';
export { default as leven } from './leven';
export { default as createPaginationItems } from './createPaginationItems';
export * as SUI from './SUI'

export { numberToWordMap, numberToWord } from './numberToWord'
export { default as normalizeTransitionDuration } from './normalizeTransitionDuration';
export { default as objectDiff } from './objectDiff';
export { default as isRefObject } from './isRefObject';
// Heads up! We import/export for this module to safely remove it with "babel-plugin-filter-imports"
export { makeDebugger }

//
// Hooks
//

export { default as useAutoControlledValue } from './hooks/useAutoControlledValue';
export { default as useClassNamesOnNode } from './hooks/useClassNamesOnNode';
export { default as useEventCallback } from './hooks/useEventCallback';
export { default as useForceUpdate } from './hooks/useForceUpdate';
export { default as useIsomorphicLayoutEffect } from './hooks/useIsomorphicLayoutEffect';
export { default as useMergedRefs, setRef } from './hooks/useMergedRefs'
export { default as usePrevious } from './hooks/usePrevious';