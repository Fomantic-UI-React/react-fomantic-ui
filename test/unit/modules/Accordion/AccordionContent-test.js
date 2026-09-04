import AccordionContent from 'src/modules/Accordion/AccordionContent'
import * as common from 'test/support/commonTests'

describe('AccordionContent', () => {
  common.isConformant(AccordionContent)
  common.forwardsRef(AccordionContent)
  common.rendersChildren(AccordionContent)

  common.implementsCreateMethod(AccordionContent)

  common.propKeyOnlyToClassName(AccordionContent, 'active')
})
