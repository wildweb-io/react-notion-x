import type {ElementType, FC, ReactNode} from 'react';
import type {
	BaseContentBlock,
	Block as Block1,
	Collection,
	CollectionCardCover,
	CollectionCardCoverAspect,
	CollectionCardCoverSize,
	CollectionQueryResult,
	CollectionView,
	ExtendedRecordMap,
	PageBlock,
	PropertyID,
	PropertyType as PropertyType1,
	SearchParams,
	SearchResults,
} from 'notion-types';

export type MapPageUrlFn = (
	pageId: string,
	recordMap?: ExtendedRecordMap | undefined,
) => string;
export type MapImageUrlFn = (url: string, block: IBlock) => string;
export type SearchNotionFn = (params: SearchParams) => Promise<SearchResults>;

export type ComponentOverrideFn = (
	props: any,
	defaultValueFn: () => ReactNode,
) => any;

export type NotionComponents = {
	// TODO: better typing for arbitrary react components
	Image: any;
	Link: any;
	PageLink: any;
	Checkbox: FC<{isChecked: boolean; blockId: string}>;

	// blocks
	Code: any;
	Equation: any;
	Callout?: any;

	// collection
	Collection: any;
	Property?: any;

	propertyTextValue: ComponentOverrideFn;
	propertySelectValue: ComponentOverrideFn;
	propertyRelationValue: ComponentOverrideFn;
	propertyFormulaValue: ComponentOverrideFn;
	propertyTitleValue: ComponentOverrideFn;
	propertyPersonValue: ComponentOverrideFn;
	propertyFileValue: ComponentOverrideFn;
	propertyCheckboxValue: ComponentOverrideFn;
	propertyUrlValue: ComponentOverrideFn;
	propertyEmailValue: ComponentOverrideFn;
	propertyPhoneNumberValue: ComponentOverrideFn;
	propertyNumberValue: ComponentOverrideFn;
	propertyLastEditedTimeValue: ComponentOverrideFn;
	propertyCreatedTimeValue: ComponentOverrideFn;
	propertyDateValue: ComponentOverrideFn;

	// assets
	Pdf: any;
	Tweet: any;
	Modal: any;
	Embed: any;

	// page navigation
	Header: any;

	// optional next.js-specific overrides
	nextImage?: any;
	nextLink?: any;
};

export type CollectionViewProps = {
	collection: Collection;
	collectionView: CollectionView;
	collectionData: CollectionQueryResult;
	padding?: number;
	width?: number;
};

export type CollectionCardProps = {
	collection: Collection;
	block: PageBlock;
	cover: CollectionCardCover;
	coverSize: CollectionCardCoverSize;
	coverAspect: CollectionCardCoverAspect;
	properties?: Array<{
		property: PropertyID;
		visible: boolean;
	}>;
	className?: string;
};
export type CollectionGroupProps = {
	collection: Collection;
	collectionViewComponent: ElementType;
	collectionGroup: any;
	hidden: boolean;
	schema: any;
	value: any;
	summaryProps: any;
	detailsProps: any;
};

type ReplitBlock = {
	type: 'replit';
} & BaseContentBlock;
type LinkPreviewBlock = {
	type: 'link_preview';
} & BaseContentBlock;

export type IBlock = Block1 | ReplitBlock | LinkPreviewBlock;

export type PropertyType = PropertyType1 | 'status';
