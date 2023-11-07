import React, {createContext, memo, useContext, useMemo} from 'react';
import {AssetWrapper} from './components/asset-wrapper';
import {Checkbox as DefaultCheckbox} from './components/checkbox';
import {Header} from './components/header';
import {wrapNextImage, wrapNextLink} from './next';
import {defaultMapImageUrl, defaultMapPageUrl} from './utils';
import type {FC, ReactNode} from 'react';
import type {
	MapImageUrlFn,
	MapPageUrlFn,
	NotionComponents,
	SearchNotionFn,
} from './types';
import type {ExtendedRecordMap} from 'notion-types';

export type NotionContext = {
	recordMap: ExtendedRecordMap;
	components: NotionComponents;

	mapPageUrl: MapPageUrlFn;
	mapImageUrl: MapImageUrlFn;
	searchNotion?: SearchNotionFn;
	isShowingSearch?: boolean;
	onHideSearch?: () => void;

	rootPageId?: string;
	rootDomain?: string;

	fullPage: boolean;
	darkMode: boolean;
	previewImages: boolean;
	forceCustomImages: boolean;
	showCollectionViewDropdown: boolean;
	showTableOfContents: boolean;
	minTableOfContentsItems: number;
	linkTableTitleProperties: boolean;
	isLinkCollectionToUrlProperty: boolean;

	defaultPageIcon?: string;
	defaultPageCover?: string;
	defaultPageCoverPosition?: number;

	zoom: any;
};

export type PartialNotionContext = {
	readonly recordMap?: ExtendedRecordMap;
	readonly components?: Partial<NotionComponents>;

	readonly mapPageUrl?: MapPageUrlFn;
	readonly mapImageUrl?: MapImageUrlFn;
	readonly searchNotion?: SearchNotionFn;
	readonly isShowingSearch?: boolean;
	readonly onHideSearch?: () => void;

	readonly rootPageId?: string;
	readonly rootDomain?: string;

	readonly fullPage?: boolean;
	readonly darkMode?: boolean;
	readonly previewImages?: boolean;
	readonly forceCustomImages?: boolean;
	readonly showCollectionViewDropdown?: boolean;
	readonly linkTableTitleProperties?: boolean;
	readonly isLinkCollectionToUrlProperty?: boolean;

	readonly showTableOfContents?: boolean;
	readonly minTableOfContentsItems?: number;

	readonly defaultPageIcon?: string;
	readonly defaultPageCover?: string;
	readonly defaultPageCoverPosition?: number;

	readonly zoom?: any;
};

const DefaultLink: FC = props => (
	<a target='_blank' rel='noopener noreferrer' {...props} />
);
const DefaultLinkMemo = memo(DefaultLink);
const DefaultPageLink: FC = props => <a {...props} />;
const DefaultPageLinkMemo = memo(DefaultPageLink);

const DefaultEmbed = props => <AssetWrapper {...props} />;
const DefaultHeader = Header;

export const dummyLink = ({href, rel, target, title, ...rest}) => (
	<span {...rest} />
);

const dummyComponent = (name: string) => () => {
	console.warn(
		`Warning: using empty component "${name}" (you should override this in NotionRenderer.components)`,
	);

	return null;
};

/* TODO: should we use React.memo here?
   https://reactjs.org/docs/react-api.html#reactmemo */
const dummyOverrideFn = (_: any, defaultValueFn: () => ReactNode) =>
	defaultValueFn();

const defaultComponents: NotionComponents = {
	Callout: undefined, // use the built-in callout rendering by default
	Checkbox: DefaultCheckbox,
	Code: dummyComponent('Code'),
	Collection: dummyComponent('Collection'),
	Embed: DefaultEmbed,

	Equation: dummyComponent('Equation'),
	Header: DefaultHeader,

	Image: null, // disable custom images by default
	Link: DefaultLinkMemo,

	Modal: dummyComponent('Modal'),
	PageLink: DefaultPageLinkMemo,
	Pdf: dummyComponent('Pdf'),
	Property: undefined, // use the built-in property rendering by default
	Tweet: dummyComponent('Tweet'),
	propertyCheckboxValue: dummyOverrideFn,
	propertyCreatedTimeValue: dummyOverrideFn,
	propertyDateValue: dummyOverrideFn,
	propertyEmailValue: dummyOverrideFn,
	propertyFileValue: dummyOverrideFn,
	propertyFormulaValue: dummyOverrideFn,
	propertyLastEditedTimeValue: dummyOverrideFn,
	propertyNumberValue: dummyOverrideFn,
	propertyPersonValue: dummyOverrideFn,
	propertyPhoneNumberValue: dummyOverrideFn,

	propertyRelationValue: dummyOverrideFn,
	propertySelectValue: dummyOverrideFn,
	propertyTextValue: dummyOverrideFn,

	propertyTitleValue: dummyOverrideFn,
	propertyUrlValue: dummyOverrideFn,
};

const defaultNotionContext: NotionContext = {
	components: defaultComponents,

	darkMode: false,

	defaultPageCover: null,
	defaultPageCoverPosition: 0.5,
	defaultPageIcon: null,
	forceCustomImages: false,
	fullPage: false,

	isLinkCollectionToUrlProperty: false,
	isShowingSearch: false,
	linkTableTitleProperties: true,
	mapImageUrl: defaultMapImageUrl,
	mapPageUrl: defaultMapPageUrl(),
	minTableOfContentsItems: 3,
	onHideSearch: null,

	previewImages: false,
	recordMap: {
		block: {},
		collection: {},
		collection_query: {},
		collection_view: {},
		notion_user: {},
		signed_urls: {},
	},

	searchNotion: null,
	showCollectionViewDropdown: true,
	showTableOfContents: false,

	zoom: null,
};

const ctx = createContext<NotionContext>(defaultNotionContext);

export const NotionContextProvider: FC<PartialNotionContext> = ({
	components: themeComponents = {},
	children,
	mapPageUrl,
	mapImageUrl,
	rootPageId,
	...rest
}) => {
	for (const key of Object.keys(rest)) {
		if (rest[key] === undefined) {
			delete rest[key];
		}
	}

	const wrappedThemeComponents = useMemo(
		() => ({
			...themeComponents,
		}),
		[themeComponents],
	);

	if (wrappedThemeComponents.nextImage) {
		wrappedThemeComponents.Image = wrapNextImage(themeComponents.nextImage);
	}

	if (wrappedThemeComponents.nextLink) {
		wrappedThemeComponents.nextLink = wrapNextLink(themeComponents.nextLink);
	}

	/* ensure the user can't override default components with falsy values
	   since it would result in very difficult-to-debug react errors */
	for (const key of Object.keys(wrappedThemeComponents)) {
		if (!wrappedThemeComponents[key]) {
			delete wrappedThemeComponents[key];
		}
	}

	const value = useMemo(
		() => ({
			...defaultNotionContext,
			...rest,
			components: {...defaultComponents, ...wrappedThemeComponents},
			mapImageUrl: mapImageUrl ?? defaultMapImageUrl,
			mapPageUrl: mapPageUrl ?? defaultMapPageUrl(rootPageId),
			rootPageId,
		}),
		[mapImageUrl, mapPageUrl, wrappedThemeComponents, rootPageId, rest],
	);

	return <ctx.Provider value={value}>{children}</ctx.Provider>;
};

export const NotionContextConsumer = ctx.Consumer;

export const useNotionContext = (): NotionContext => {
	return useContext(ctx);
};
