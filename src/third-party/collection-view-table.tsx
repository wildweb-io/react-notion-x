import * as React from 'react';
import {useNotionContext} from '../context';
import {cs} from '../utils';
import {CollectionColumnTitle} from './collection-column-title';
import {CollectionGroup} from './collection-group';
import {getCollectionGroups} from './collection-utils';
import {Property} from './property';
import type {CollectionViewProps} from '../types';

const defaultBlockIds = [];

export const CollectionViewTable: React.FC<CollectionViewProps> = ({
	collection,
	collectionView,
	collectionData,
	padding,
	width,
}) => {
	const isGroupedCollection = collectionView?.format?.collection_group_by;

	if (isGroupedCollection) {
		const collectionGroups = getCollectionGroups(
			collection,
			collectionView,
			collectionData,
			padding,
			width,
		);

		return collectionGroups.map((group, index) => (
			<CollectionGroup
				key={index}
				{...group}
				collectionViewComponent={props => (
					<Table {...props} padding={padding} width={width} />
				)}
				summaryProps={{
					style: {
						paddingLeft: padding,
						paddingRight: padding,
					},
				}}
			/>
		));
	}

	const blockIds =
		(collectionData.collection_group_results?.blockIds ??
			collectionData.blockIds) ||
		defaultBlockIds;

	return (
		<Table
			blockIds={blockIds}
			collection={collection}
			collectionView={collectionView}
			padding={padding}
			width={width}
		/>
	);
};

const Table = ({blockIds = [], collection, collectionView, width, padding}) => {
	const {recordMap, linkTableTitleProperties} = useNotionContext();

	const tableStyle = React.useMemo(
		() => ({
			maxWidth: width,
			width,
		}),
		[width],
	);

	const tableViewStyle = React.useMemo(
		() => ({
			paddingLeft: padding,
			paddingRight: padding,
		}),
		[padding],
	);

	let properties = [];

	if (collectionView.format?.table_properties) {
		properties = collectionView.format.table_properties.filter(
			p => p.visible && collection.schema[p.property],
		);
	} else {
		properties = [{property: 'title'}].concat(
			Object.keys(collection.schema)
				.filter(p => p !== 'title')
				.map(property => ({property})),
		);
	}

	return (
		<div className='notion-table' style={tableStyle}>
			<div className='notion-table-view' style={tableViewStyle}>
				{properties.length > 0 && (
					<>
						<div className='notion-table-header'>
							<div className='notion-table-header-inner'>
								{properties.map(p => {
									const schema = collection.schema?.[p.property];
									const isTitle = p.property === 'title';
									const style: React.CSSProperties = {};

									if (p.width) {
										style.width = p.width;
									} else if (isTitle) {
										style.width = 280;
									} else {
										style.width = 200;
										// style.width = `${100.0 / properties.length}%`
									}

									return (
										<div key={p.property} className='notion-table-th'>
											<div
												className='notion-table-view-header-cell'
												style={style}
											>
												<div className='notion-table-view-header-cell-inner'>
													<CollectionColumnTitle schema={schema} />
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>

						<div className='notion-table-header-placeholder' />

						<div className='notion-table-body'>
							{blockIds?.map(blockId => (
								<div key={blockId} className='notion-table-row'>
									{properties.map(p => {
										const schema = collection.schema?.[p.property];
										const block = recordMap.block[blockId]?.value;
										const data = block?.properties?.[p.property];
										const isTitle = p.property === 'title';
										const style: React.CSSProperties = {};

										if (p.width) {
											style.width = p.width;
										} else if (isTitle) {
											style.width = 280;
										} else {
											style.width = 200;
											// style.width = `${100.0 / properties.length}%`
										}

										return (
											<div
												key={p.property}
												className={cs(
													'notion-table-cell',
													`notion-table-cell-${schema.type}`,
												)}
												style={style}
											>
												<Property
													schema={schema}
													data={data}
													block={block}
													collection={collection}
													linkToTitlePage={linkTableTitleProperties}
												/>
											</div>
										);
									})}
								</div>
							))}
						</div>
					</>
				)}
			</div>
		</div>
	);
};
