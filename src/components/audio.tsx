import * as React from 'react';
import {useNotionContext} from '../context';
import {cs} from '../utils';
import type {AudioBlock} from 'notion-types';

export const Audio: React.FC<{
	readonly block: AudioBlock;
	readonly className?: string;
}> = ({block, className}) => {
	const {recordMap} = useNotionContext();
	const source =
		recordMap.signed_urls[block.id] || block.properties?.source?.[0]?.[0];

	return (
		<div className={cs('notion-audio', className)}>
			<audio controls preload='none' src={source} />
		</div>
	);
};
