import * as React from 'react';
import {useNotionContext} from '../context';
import {CollectionGroup} from './collection-group';
import {getCollectionGroups} from './collection-utils';
import {Property} from './property';
import type {CollectionViewProps} from '../types';
import type {PageBlock} from 'notion-types';

const defaultBlockIds = [];

export const CollectionViewList: React.FC<CollectionViewProps> = ({
	collection,
	collectionView,
	collectionData,
}) => {
	const isGroupedCollection = collectionView?.format?.collection_group_by;

	if (isGroupedCollection) {
		const collectionGroups = getCollectionGroups(
			collection,
			collectionView,
			collectionData,
		);

		return collectionGroups.map((group, key) => (
			<CollectionGroup key={key} {...group} collectionViewComponent={List} />
		));
	}

	const blockIds =
		(collectionData.collection_group_results?.blockIds ??
			collectionData.blockIds) ||
		defaultBlockIds;

	return (
		<List
			blockIds={blockIds}
			collection={collection}
			collectionView={collectionView}
		/>
	);
};

const List = ({blockIds, collection, collectionView}) => {
	const {components, recordMap, mapPageUrl} = useNotionContext();

	return (
		<div className='notion-list-collection'>
			<div className='notion-list-view'>
				<div className='notion-list-body'>
					{blockIds?.map(blockId => {
						const block = recordMap.block[blockId]?.value as PageBlock;

						if (!block) return null;

						const titleSchema = collection.schema.title;
						const titleData = block?.properties?.title;

						return (
							<components.PageLink
								key={blockId}
								className='notion-list-item notion-page-link'
								href={mapPageUrl(block.id)}
							>
								<div className='notion-list-item-title'>
									<Property
										schema={titleSchema}
										data={titleData}
										block={block}
										collection={collection}
									/>
								</div>

								<div className='notion-list-item-body'>
									{collectionView.format?.list_properties
										?.filter(p => p.visible)
										.map(p => {
											const schema = collection.schema[p.property];
											const data = block && block.properties?.[p.property];

											if (!schema) {
												return null;
											}

											return (
												<div
													key={p.property}
													className='notion-list-item-property'
												>
													<Property
														schema={schema}
														data={data}
														block={block}
														collection={collection}
													/>
												</div>
											);
										})}
								</div>
							</components.PageLink>
						);
					})}
				</div>
			</div>
		</div>
	);
};
