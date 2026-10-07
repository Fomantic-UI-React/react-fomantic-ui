import Item from './internal/Item'
import ItemContent from './ItemContent'
import ItemDescription from './ItemDescription'
import ItemExtra from './ItemExtra'
import ItemGroup from './ItemGroup'
import ItemHeader from './ItemHeader'
import ItemImage from './ItemImage'
import ItemMeta from './ItemMeta'

// Item is defined in internal/ so that ItemGroup can import it without importing
// this module back; that cycle broke `Item.Group` whenever the Group loaded first (#8).
//
// The statics are attached in the export itself, not as statements before it. Exporting
// the imported binding lets rollup point the package entry straight at internal/Item,
// leaving this module as a side-effect-only import that bundlers drop under
// "sideEffects": false, and `Item.Group` with it.
export default Object.assign(Item, {
  Content: ItemContent,
  Description: ItemDescription,
  Extra: ItemExtra,
  Group: ItemGroup,
  Header: ItemHeader,
  Image: ItemImage,
  Meta: ItemMeta,
})
