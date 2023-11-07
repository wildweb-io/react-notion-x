import * as React from 'react'

import { ExtendedRecordMap, SearchParams, SearchResults, Collection, CollectionView, CollectionQueryResult, PageBlock, CollectionCardCover, CollectionCardCoverSize, CollectionCardCoverAspect, PropertyID,BaseContentBlock,  Block as Block_1, PropertyType as PropertyType_1 } from 'notion-types'

export type MapPageUrlFn = (
  pageId: string,
  recordMap?: ExtendedRecordMap | undefined
) => string
export type MapImageUrlFn = (url: string, block: IBlock) => string
export type SearchNotionFn = (
  params: SearchParams
) => Promise<SearchResults>

export type ComponentOverrideFn = (
  props: any,
  defaultValueFn: () => React.ReactNode
) => any

export interface NotionComponents {
  // TODO: better typing for arbitrary react components
  Image: any
  Link: any
  PageLink: any
  Checkbox: React.FC<{ isChecked: boolean; blockId: string }>

  // blocks
  Code: any
  Equation: any
  Callout?: any

  // collection
  Collection: any
  Property?: any

  propertyTextValue: ComponentOverrideFn
  propertySelectValue: ComponentOverrideFn
  propertyRelationValue: ComponentOverrideFn
  propertyFormulaValue: ComponentOverrideFn
  propertyTitleValue: ComponentOverrideFn
  propertyPersonValue: ComponentOverrideFn
  propertyFileValue: ComponentOverrideFn
  propertyCheckboxValue: ComponentOverrideFn
  propertyUrlValue: ComponentOverrideFn
  propertyEmailValue: ComponentOverrideFn
  propertyPhoneNumberValue: ComponentOverrideFn
  propertyNumberValue: ComponentOverrideFn
  propertyLastEditedTimeValue: ComponentOverrideFn
  propertyCreatedTimeValue: ComponentOverrideFn
  propertyDateValue: ComponentOverrideFn

  // assets
  Pdf: any
  Tweet: any
  Modal: any
  Embed: any

  // page navigation
  Header: any

  // optional next.js-specific overrides
  nextImage?: any
  nextLink?: any
}

export interface CollectionViewProps {
  collection: Collection
  collectionView: CollectionView
  collectionData: CollectionQueryResult
  padding?: number
  width?: number
}

export interface CollectionCardProps {
  collection: Collection
  block: PageBlock
  cover: CollectionCardCover
  coverSize: CollectionCardCoverSize
  coverAspect: CollectionCardCoverAspect
  properties?: Array<{
    property: PropertyID
    visible: boolean
  }>
  className?: string
}
export interface CollectionGroupProps {
  collection: Collection
  collectionViewComponent: React.ElementType
  collectionGroup: any
  hidden: boolean
  schema: any
  value: any
  summaryProps: any
  detailsProps: any
}



interface ReplitBlock extends BaseContentBlock {
  type: 'replit';
}
interface LinkPreviewBlock extends BaseContentBlock {
  type: 'link_preview';
}

export type IBlock = Block_1 | ReplitBlock|LinkPreviewBlock

export type PropertyType =PropertyType_1| 'status'
