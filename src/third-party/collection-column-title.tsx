import * as React from 'react';
import {PropertyIcon} from '../icons/property-icon';
import type {CollectionPropertySchema} from 'notion-types';

export const CollectionColumnTitle: React.FC<{
	readonly schema: CollectionPropertySchema;
}> = ({schema}) => {
	return (
		<div className='notion-collection-column-title'>
			<PropertyIcon
				className='notion-collection-column-title-icon'
				type={schema.type}
			/>

			<div className='notion-collection-column-title-body'>{schema.name}</div>
		</div>
	);
};
