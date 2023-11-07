import CollectionViewBoardIcon from './collection-view-board';
import CollectionViewCalendarIcon from './collection-view-calendar';
import CollectionViewGalleryIcon from './collection-view-gallery';
import CollectionViewListIcon from './collection-view-list';
import CollectionViewTableIcon from './collection-view-table';
import type {CollectionViewType} from 'notion-types';
import type * as React from 'react';

type CollectionViewIconProps = {
	readonly className?: string;
	readonly type: CollectionViewType;
};

const iconMap = {
	board: CollectionViewBoardIcon,
	calendar: CollectionViewCalendarIcon,
	gallery: CollectionViewGalleryIcon,
	list: CollectionViewListIcon,
	table: CollectionViewTableIcon,
};

export const CollectionViewIcon: React.FC<CollectionViewIconProps> = ({
	type,
	...rest
}) => {
	const icon = iconMap[type] as any;

	if (!icon) {
		return null;
	}

	return icon(rest);
};
