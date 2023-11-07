import React, {useMemo} from 'react';
import mediumZoom from '@fisch0920/medium-zoom';
import {Block} from './block';
import {NotionContextProvider, useNotionContext} from './context';
import type {FC, ReactNode} from 'react';
import type {ExtendedRecordMap} from 'notion-types';
import type {
	MapImageUrlFn,
	MapPageUrlFn,
	NotionComponents,
	SearchNotionFn,
} from './types';

export const NotionRenderer: FC<{
	readonly recordMap: ExtendedRecordMap;
	readonly components?: Partial<NotionComponents>;

	readonly mapPageUrl?: MapPageUrlFn;
	readonly mapImageUrl?: MapImageUrlFn;
	readonly searchNotion?: SearchNotionFn;
	readonly isShowingSearch?: boolean;
	readonly onHideSearch?: () => void;

	readonly rootPageId?: string;
	readonly rootDomain?: string;

	/* set fullPage to false to render page content only
	   this will remove the header, cover image, and footer */
	readonly fullPage?: boolean;

	readonly darkMode?: boolean;
	readonly previewImages?: boolean;
	readonly forceCustomImages?: boolean;
	readonly showCollectionViewDropdown?: boolean;
	readonly linkTableTitleProperties?: boolean;
	readonly isLinkCollectionToUrlProperty?: boolean;
	readonly isImageZoomable?: boolean;

	readonly showTableOfContents?: boolean;
	readonly minTableOfContentsItems?: number;

	readonly defaultPageIcon?: string;
	readonly defaultPageCover?: string;
	readonly defaultPageCoverPosition?: number;

	readonly className?: string;
	readonly bodyClassName?: string;

	readonly header?: ReactNode;
	readonly footer?: ReactNode;
	readonly pageHeader?: ReactNode;
	readonly pageFooter?: ReactNode;
	readonly pageTitle?: ReactNode;
	readonly pageAside?: ReactNode;
	readonly pageCover?: ReactNode;

	readonly blockId?: string;
	readonly hideBlockId?: boolean;
	readonly disableHeader?: boolean;
}> = ({
	components,
	recordMap,
	mapPageUrl,
	mapImageUrl,
	searchNotion,
	isShowingSearch,
	onHideSearch,
	fullPage,
	rootPageId,
	rootDomain,
	darkMode,
	previewImages,
	forceCustomImages,
	showCollectionViewDropdown,
	linkTableTitleProperties,
	isLinkCollectionToUrlProperty,
	isImageZoomable = true,
	showTableOfContents,
	minTableOfContentsItems,
	defaultPageIcon,
	defaultPageCover,
	defaultPageCoverPosition,
	...rest
}) => {
	const zoom = useMemo(
		() =>
			typeof window !== 'undefined' &&
			mediumZoom({
				background: 'rgba(0, 0, 0, 0.8)',
				margin: getMediumZoomMargin(),
				minZoomScale: 2,
			}),
		[],
	);

	return (
		<NotionContextProvider
			components={components}
			recordMap={recordMap}
			mapPageUrl={mapPageUrl}
			mapImageUrl={mapImageUrl}
			searchNotion={searchNotion}
			isShowingSearch={isShowingSearch}
			fullPage={fullPage}
			rootPageId={rootPageId}
			rootDomain={rootDomain}
			darkMode={darkMode}
			previewImages={previewImages}
			forceCustomImages={forceCustomImages}
			showCollectionViewDropdown={showCollectionViewDropdown}
			linkTableTitleProperties={linkTableTitleProperties}
			isLinkCollectionToUrlProperty={isLinkCollectionToUrlProperty}
			showTableOfContents={showTableOfContents}
			minTableOfContentsItems={minTableOfContentsItems}
			defaultPageIcon={defaultPageIcon}
			defaultPageCover={defaultPageCover}
			defaultPageCoverPosition={defaultPageCoverPosition}
			zoom={isImageZoomable ? zoom : null}
			onHideSearch={onHideSearch}
		>
			<NotionBlockRenderer {...rest} />
		</NotionContextProvider>
	);
};

export const NotionBlockRenderer: FC<{
	readonly className?: string;
	readonly bodyClassName?: string;
	readonly header?: ReactNode;
	readonly footer?: ReactNode;
	readonly disableHeader?: boolean;

	readonly blockId?: string;
	readonly hideBlockId?: boolean;
	readonly level?: number;
}> = ({level = 0, blockId, ...props}) => {
	const {recordMap} = useNotionContext();
	const id = blockId || Object.keys(recordMap.block)[0];
	const block = recordMap.block[id]?.value;

	if (!block) {
		if (process.env.NODE_ENV !== 'production') {
			console.warn('missing block', blockId);
		}

		return null;
	}

	return (
		<Block key={id} level={level} block={block} {...props}>
			{block?.content?.map(contentBlockId => (
				<NotionBlockRenderer
					key={contentBlockId}
					blockId={contentBlockId}
					level={level + 1}
					{...props}
				/>
			))}
		</Block>
	);
};

function getMediumZoomMargin() {
	const width = window.innerWidth;

	if (width < 500) {
		return 8;
	}

	if (width < 800) {
		return 20;
	}

	if (width < 1280) {
		return 30;
	}

	if (width < 1600) {
		return 40;
	}

	if (width < 1920) {
		return 48;
	}

	return 72;
}
