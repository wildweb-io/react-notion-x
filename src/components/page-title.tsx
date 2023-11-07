import React, {memo} from 'react';
import {getBlockTitle} from 'notion-utils';
import {useNotionContext} from '../context';
import {cs} from '../utils';
import {PageIcon} from './page-icon';
import {Text} from './text';
import type {FC} from 'react';
import type {Block, Decoration} from 'notion-types';

export const PageTitleImpl: FC<{
	readonly block: Block;
	readonly className?: string;
	readonly defaultIcon?: string;
}> = ({block, className, defaultIcon, ...rest}) => {
	const {recordMap} = useNotionContext();

	if (!block) return null;

	if (
		block.type === 'collection_view_page' ||
		block.type === 'collection_view'
	) {
		const title = getBlockTitle(block, recordMap);

		if (!title) {
			return null;
		}

		const titleDecoration: Decoration[] = [[title]];

		return (
			<span className={cs('notion-page-title', className)} {...rest}>
				<PageIcon
					block={block}
					defaultIcon={defaultIcon}
					className='notion-page-title-icon'
				/>

				<span className='notion-page-title-text'>
					<Text value={titleDecoration} block={block} />
				</span>
			</span>
		);
	}

	if (!block.properties?.title) {
		return null;
	}

	return (
		<span className={cs('notion-page-title', className)} {...rest}>
			<PageIcon
				block={block}
				defaultIcon={defaultIcon}
				className='notion-page-title-icon'
			/>

			<span className='notion-page-title-text'>
				<Text value={block.properties?.title} block={block} />
			</span>
		</span>
	);
};

export const PageTitle = memo(PageTitleImpl);
