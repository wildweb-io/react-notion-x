/* eslint-disable no-fallthrough */
/* eslint-disable max-lines */
/* eslint-disable complexity */
/* eslint-disable max-statements */
/* eslint-disable max-lines-per-function */
import React, {useState} from 'react';
import {
	getBlockCollectionId,
	getBlockIcon,
	getBlockParentPage,
	getPageTableOfContents,
	getTextContent,
	uuidToId,
} from 'notion-utils';
import {AssetWrapper} from './components/asset-wrapper';
import {Audio} from './components/audio';
import {EOI} from './components/eoi';
import {File} from './components/file';
import {LazyImage} from './components/lazy-image';
import {PageAside} from './components/page-aside';
import {PageIcon} from './components/page-icon';
import {PageTitle} from './components/page-title';
import {SyncPointerBlock} from './components/sync-pointer-block';
import {Text} from './components/text';
import {useNotionContext} from './context';
import {LinkIcon} from './icons/link-icon';
import {cs, getListNumber, isUrl} from './utils';
import type {FC, ReactNode} from 'react';
import type {
	AudioBlock,
	CodeBlock,
	EquationBlock,
	FileBlock,
	PageBlock,
	TableBlock,
} from 'notion-types';
import type {IBlock} from './types';

type BlockProps = {
	readonly block: IBlock;
	readonly level: number;

	readonly className?: string;
	readonly bodyClassName?: string;

	readonly header?: ReactNode;
	readonly footer?: ReactNode;
	readonly pageHeader?: ReactNode;
	readonly pageFooter?: ReactNode;
	readonly pageTitle?: ReactNode;
	readonly pageAside?: ReactNode;
	readonly pageCover?: ReactNode;

	readonly hideBlockId?: boolean;
	readonly disableHeader?: boolean;

	readonly children?: ReactNode;
};

// TODO: use react state instead of a global for this
const tocIndentLevelCache: {
	[blockId: string]: number;
} = {};

const pageCoverStyleCache: {[key: string]: {[key: string]: unknown}} = {};

const formatVimeoURL = (url: string) => {
	const match = url.match(
		/https:\/\/(?:www\.)?(?:player\.)?vimeo.com\/(?:video\/)?(\d+)/,
	);

	return match ? `https://player.vimeo.com/video/${match[1]}` : url;
};

const formatDailymotionURL = (url: string) => {
	const match = url.match(
		/https:\/\/(?:www\.)?(?:dailymotion\.com|dai\.ly)\/(?:embed\/)?(?:video\/)?([\dA-Za-z]+)/,
	);

	return match ? `https://www.dailymotion.com/embed/video/${match[1]}` : url;
};

const formatYouTubeURL = (url: string) => {
	const regex =
		/(?:https:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/)?([^\s&?]+)(?:.*?[&?]t=(\d+)|.*?[&?]start=(\d+))?/;
	const match = url.match(regex);

	if (match) {
		let formattedURL = `https://www.youtube.com/embed/${match[1]}`;
		const startTime = match[2] || match[3];

		if (startTime) {
			formattedURL += `?start=${startTime}`;
		}

		return formattedURL;
	}

	return url;
};

export const Block: FC<BlockProps> = props => {
	const ctx = useNotionContext();
	const {
		components,
		fullPage,
		darkMode,
		recordMap,
		mapPageUrl,
		mapImageUrl,
		showTableOfContents,
		minTableOfContentsItems,
		defaultPageIcon,
		defaultPageCover,
		defaultPageCoverPosition,
	} = ctx;

	const [activeSection, setActiveSection] = useState(null);

	const {
		block,
		children,
		level,
		className,
		bodyClassName,
		header,
		footer,
		pageHeader,
		pageFooter,
		pageAside,
		pageCover,
		hideBlockId,
		disableHeader,
	} = props;

	if (!block) {
		return null;
	}

	/* ugly hack to make viewing raw collection views work properly
	   e.g., 6d886ca87ab94c21a16e3b82b43a57fb */
	if (level === 0 && block.type === 'collection_view') {
		(block as any).type = 'collection_view_page';
	}

	const blockId = hideBlockId
		? 'notion-block'
		: `notion-block-${uuidToId(block.id)}`;

	switch (block.type) {
		case 'collection_view_page':

		// fallthrough
		case 'page': {
			if (level === 0) {
				const {
					page_icon = defaultPageIcon,
					page_cover = defaultPageCover,
					page_cover_position = defaultPageCoverPosition,
					page_full_width,
					page_small_text,
				} = block.format || {};

				if (fullPage) {
					const properties =
						block.type === 'page'
							? block.properties
							: {
									title:
										recordMap.collection[getBlockCollectionId(block, recordMap)]
											?.value?.name,
							  };

					const coverPosition = (1 - (page_cover_position || 0.5)) * 100;
					const pageCoverObjectPosition = `center ${coverPosition}%`;
					let pageCoverStyle = pageCoverStyleCache[pageCoverObjectPosition];

					if (!pageCoverStyle) {
						pageCoverStyle = pageCoverStyleCache[pageCoverObjectPosition] = {
							objectPosition: pageCoverObjectPosition,
						};
					}

					const pageIcon = getBlockIcon(block, recordMap) ?? defaultPageIcon;
					const isPageIconUrl = pageIcon && isUrl(pageIcon);

					const toc = getPageTableOfContents(block as PageBlock, recordMap);

					const hasToc =
						showTableOfContents && toc.length >= minTableOfContentsItems;
					const hasAside = (hasToc || pageAside) && !page_full_width;
					const hasPageCover = pageCover || page_cover;

					return (
						<div
							className={cs(
								'notion',
								'notion-app',
								darkMode ? 'dark-mode' : 'light-mode',
								blockId,
								className,
							)}
						>
							<div className='notion-viewport' />

							<div className='notion-frame'>
								{!disableHeader && <components.Header block={block} />}
								{header}

								<div className='notion-page-scroller'>
									{hasPageCover
										? pageCover || (
												<div className='notion-page-cover-wrapper'>
													<LazyImage
														priority
														src={mapImageUrl(page_cover, block)}
														alt={getTextContent(properties?.title)}
														className='notion-page-cover'
														style={pageCoverStyle}
													/>
												</div>
										  )
										: null}

									<main
										className={cs(
											'notion-page',
											hasPageCover
												? 'notion-page-has-cover'
												: 'notion-page-no-cover',
											page_icon
												? 'notion-page-has-icon'
												: 'notion-page-no-icon',
											isPageIconUrl
												? 'notion-page-has-image-icon'
												: 'notion-page-has-text-icon',
											'notion-full-page',
											page_full_width && 'notion-full-width',
											page_small_text && 'notion-small-text',
											bodyClassName,
										)}
									>
										{page_icon ? (
											<PageIcon
												block={block}
												defaultIcon={defaultPageIcon}
												inline={false}
											/>
										) : null}

										{pageHeader}

										{/* <h1 className='notion-title'> */}
										{/*   {pageTitle ?? ( */}
										{/*     <Text value={properties?.title} block={block} /> */}
										{/*   )} */}
										{/* </h1> */}

										{(block.type === 'collection_view_page' ||
											(block.type === 'page' &&
												block.parent_table === 'collection')) && (
											<components.Collection block={block} ctx={ctx} />
										)}

										{block.type !== 'collection_view_page' && (
											<div
												className={cs(
													'notion-page-content',
													hasAside && 'notion-page-content-has-aside',
													hasToc && 'notion-page-content-has-toc',
												)}
											>
												<article className='notion-page-content-inner'>
													{children}
												</article>

												{hasAside ? (
													<PageAside
														toc={toc}
														activeSection={activeSection}
														setActiveSection={setActiveSection}
														hasToc={hasToc}
														hasAside={hasAside}
														pageAside={pageAside}
													/>
												) : null}
											</div>
										)}

										{pageFooter}
									</main>

									{footer}
								</div>
							</div>
						</div>
					);
				}

				return (
					<main
						className={cs(
							'notion',
							darkMode ? 'dark-mode' : 'light-mode',
							'notion-page',
							page_full_width && 'notion-full-width',
							page_small_text && 'notion-small-text',
							blockId,
							className,
							bodyClassName,
						)}
					>
						<div className='notion-viewport' />

						{pageHeader}

						{(block.type === 'collection_view_page' ||
							(block.type === 'page' &&
								block.parent_table === 'collection')) && (
							<components.Collection block={block} ctx={ctx} />
						)}

						{block.type !== 'collection_view_page' && children}

						{pageFooter}
					</main>
				);
			}

			const blockColor = block.format?.block_color;

			return (
				<components.PageLink
					className={cs(
						'notion-page-link',
						blockColor && `notion-${blockColor}`,
						blockId,
					)}
					href={mapPageUrl(block.id)}
				>
					<PageTitle block={block} />
				</components.PageLink>
			);
		}

		case 'header':
		// fallthrough
		case 'sub_header':

		// fallthrough
		case 'sub_sub_header': {
			if (!block.properties) return null;

			const blockColor = block.format?.block_color;
			const id = uuidToId(block.id);
			const title =
				getTextContent(block.properties.title) || `Notion Header ${id}`;

			// we use a cache here because constructing the ToC is non-trivial
			let indentLevel = tocIndentLevelCache[block.id];
			let indentLevelClass: string;

			if (indentLevel === undefined) {
				const page = getBlockParentPage(block, recordMap);

				if (page) {
					const toc = getPageTableOfContents(page, recordMap);
					const tocItem = toc.find(tocItem => tocItem.id === block.id);

					if (tocItem) {
						indentLevel = tocItem.indentLevel;
						tocIndentLevelCache[block.id] = indentLevel;
					}
				}
			}

			if (indentLevel !== undefined) {
				indentLevelClass = `notion-h-indent-${indentLevel}`;
			}

			const isH1 = block.type === 'header';
			const isH2 = block.type === 'sub_header';
			const isH3 = block.type === 'sub_sub_header';

			const classNameStr = cs(
				isH1 && 'notion-h notion-h1',
				isH2 && 'notion-h notion-h2',
				isH3 && 'notion-h notion-h3',
				blockColor && `notion-${blockColor}`,
				indentLevelClass,
				blockId,
			);

			const innerHeader = (
				<span>
					<div id={id} className='notion-header-anchor' />
					{!block.format?.toggleable && (
						<a className='notion-hash-link' href={`#${id}`} title={title}>
							<LinkIcon />
						</a>
					)}

					<span className='notion-h-title'>
						<Text value={block.properties.title} block={block} />
					</span>
				</span>
			);
			let headerBlock = null;

			// page title takes the h1 so all header blocks are greater
			if (isH1) {
				headerBlock = (
					<h2 className={classNameStr} data-id={id}>
						{innerHeader}
					</h2>
				);
			} else if (isH2) {
				headerBlock = (
					<h3 className={classNameStr} data-id={id}>
						{innerHeader}
					</h3>
				);
			} else {
				headerBlock = (
					<h4 className={classNameStr} data-id={id}>
						{innerHeader}
					</h4>
				);
			}

			if (block.format?.toggleable) {
				return (
					<details className={cs('notion-toggle', blockId)}>
						<summary>{headerBlock}</summary>
						<div>{children}</div>
					</details>
				);
			}

			return headerBlock;
		}

		case 'divider': {
			return <hr className={cs('notion-hr', blockId)} />;
		}

		case 'text': {
			if (!block.properties && !block.content?.length) {
				return <div className={cs('notion-blank', blockId)}>&nbsp;</div>;
			}

			// Google Slides
			if (
				block.properties &&
				block.properties.title &&
				block.properties.title[0] &&
				block.properties.title[0][0] &&
				block.properties.title[0][0].includes(
					'https://docs.google.com/presentation/d',
				)
			) {
				return (
					<components.Embed
						className={blockId}
						blockId={blockId}
						block={block}
					/>
				);
				// return /* @__PURE__ */ React28.createElement(components.Embed, {
				//   blockId,
				//   block,
				//   className: blockId
				// })
			}

			// Google Drive File
			if (
				block.properties &&
				block.properties.title &&
				block.properties.title[0] &&
				block.properties.title[0][0] &&
				block.properties.title[0][0].includes('https://drive.google.com/file/d')
			) {
				return (
					<components.Embed
						className={blockId}
						blockId={blockId}
						block={block}
					/>
				);
			}

			if (
				block.properties &&
				block.properties.title &&
				block.properties.title[0] &&
				block.properties.title[0][0] &&
				block.properties.title[0][0].includes(
					'https://docs.google.com/spreadsheets/d',
				)
			) {
				return (
					<components.Embed
						className={blockId}
						blockId={blockId}
						block={block}
					/>
				);
			}

			const blockColor = block.format?.block_color;

			return (
				<div
					className={cs(
						'notion-text',
						blockColor && `notion-${blockColor}`,
						blockId,
					)}
				>
					{block.properties?.title ? (
						<Text value={block.properties.title} block={block} />
					) : null}

					{children ? (
						<div className='notion-text-children'>{children}</div>
					) : null}
				</div>
			);
		}

		case 'bulleted_list':

		// fallthrough
		case 'numbered_list': {
			const wrapList = (content: ReactNode, start?: number) =>
				block.type === 'bulleted_list' ? (
					<ul className={cs('notion-list', 'notion-list-disc', blockId)}>
						{content}
					</ul>
				) : (
					<ol
						start={start}
						className={cs('notion-list', 'notion-list-numbered', blockId)}
					>
						{content}
					</ol>
				);

			let output: JSX.Element | null = null;

			if (block.content) {
				output = (
					<>
						{block.properties ? (
							<li>
								<Text value={block.properties.title} block={block} />
							</li>
						) : null}
						{wrapList(children)}
					</>
				);
			} else {
				output = block.properties ? (
					<li>
						<Text value={block.properties.title} block={block} />
					</li>
				) : null;
			}

			const isTopLevel =
				block.type !== recordMap.block[block.parent_id]?.value?.type;
			const start = getListNumber(block.id, recordMap.block);

			return isTopLevel ? wrapList(output, start) : output;
		}

		case 'embed': {
			return <components.Embed blockId={blockId} block={block} />;
		}

		case 'replit':
		// fallthrough
		case 'tweet':
		// fallthrough
		case 'maps':
		// fallthrough
		case 'pdf':
		// fallthrough
		case 'figma':
		// fallthrough
		case 'typeform':
		// fallthrough
		case 'codepen':
		// fallthrough
		case 'excalidraw':
		// fallthrough
		case 'image':
		// fallthrough
		case 'gist':

		// fallthrough
		case 'video': {
			if (
				block.properties &&
				block.properties.source &&
				block.properties.source[0] &&
				block.properties.source[0][0] &&
				block.properties.source[0][0].includes('genial.ly/')
			) {
				return (
					<components.Embed
						className={blockId}
						blockId={blockId}
						block={block}
					/>
				);
			}

			if (
				block.properties &&
				block.properties.source &&
				block.properties.source[0] &&
				block.properties.source[0][0] &&
				['dailymotion.com', 'dai.ly'].some(domain =>
					block.properties.source[0][0].includes(domain),
				)
			) {
				block.properties.source[0][0] = formatDailymotionURL(
					block.properties.source[0][0],
				);

				return (
					<components.Embed
						className={blockId}
						blockId={blockId}
						block={block}
					/>
				);
			}

			if (
				block.properties &&
				block.properties.source &&
				block.properties.source[0] &&
				block.properties.source[0][0] &&
				block.properties.source[0][0].includes('vimeo.com')
			) {
				block.properties.source[0][0] = formatVimeoURL(
					block.properties.source[0][0],
				);
			}

			if (
				block.properties &&
				block.properties.source &&
				block.properties.source[0] &&
				block.properties.source[0][0] &&
				block.properties.source[0][0].includes('youtu')
			) {
				block.properties.source[0][0] = formatYouTubeURL(
					block.properties.source[0][0],
				);
			}

			return <AssetWrapper blockId={blockId} block={block} />;
		}

		case 'drive': {
			return (
				<components.Embed className={blockId} blockId={blockId} block={block} />
			);
		}

		case 'audio': {
			return <Audio block={block as AudioBlock} className={blockId} />;
		}

		case 'file': {
			return <File block={block as FileBlock} className={blockId} />;
		}

		case 'equation': {
			return (
				<components.Equation
					block={block as EquationBlock}
					inline={false}
					className={blockId}
				/>
			);
		}

		case 'link_preview': {
			return (
				<components.Embed className={blockId} blockId={blockId} block={block} />
			);
		}

		case 'code': {
			return <components.Code block={block as CodeBlock} />;
		}

		case 'column_list': {
			return <div className={cs('notion-row', blockId)}>{children}</div>;
		}

		case 'column': {
			// note: notion uses 46px
			const spacerWidth = `min(32px, 4vw)`;
			const ratio = block.format?.column_ratio || 0.5;
			const parent = recordMap.block[block.parent_id]?.value;
			const columns =
				parent?.content?.length || Math.max(2, Math.ceil(1 / ratio));

			const width = `calc((100% - (${
				columns - 1
			} * ${spacerWidth})) * ${ratio})`;
			const style = {width};

			return (
				<>
					<div className={cs('notion-column', blockId)} style={style}>
						{children}
					</div>

					<div className='notion-spacer' />
				</>
			);
		}

		case 'quote': {
			if (!block.properties) return null;

			const blockColor = block.format?.block_color;

			return (
				<blockquote
					className={cs(
						'notion-quote',
						blockColor && `notion-${blockColor}`,
						blockId,
					)}
				>
					<div>
						<Text value={block.properties.title} block={block} />
					</div>
					{children}
				</blockquote>
			);
		}

		case 'collection_view': {
			return (
				<components.Collection block={block} className={blockId} ctx={ctx} />
			);
		}

		case 'callout': {
			if (components.Callout) {
				return <components.Callout block={block} className={blockId} />;
			}

			return (
				<div
					className={cs(
						'notion-callout',
						block.format?.block_color &&
							`notion-${block.format?.block_color}_co`,
						blockId,
					)}
				>
					<PageIcon block={block} />

					<div className='notion-callout-text'>
						<Text value={block.properties?.title} block={block} />
						{children}
					</div>
				</div>
			);
		}

		case 'bookmark': {
			if (!block.properties) return null;

			const link = block.properties.link;

			if (!link || !link[0]?.[0]) return null;

			let title = getTextContent(block.properties.title);

			if (!title) {
				title = getTextContent(link);
			}

			if (title && title.startsWith('http')) {
				try {
					const url = new URL(title);

					title = url.hostname;
				} catch {
					// ignore invalid links
				}
			}

			return (
				<div className='notion-row'>
					<components.Link
						target='_blank'
						rel='noopener noreferrer'
						className={cs(
							'notion-bookmark',
							block.format?.block_color && `notion-${block.format.block_color}`,
							blockId,
						)}
						href={link[0][0]}
					>
						<div>
							{title ? (
								<div className='notion-bookmark-title'>
									<Text value={[[title]]} block={block} />
								</div>
							) : null}

							{block.properties?.description ? (
								<div className='notion-bookmark-description'>
									<Text value={block.properties?.description} block={block} />
								</div>
							) : null}

							<div className='notion-bookmark-link'>
								{block.format?.bookmark_icon ? (
									<div className='notion-bookmark-link-icon'>
										<LazyImage
											src={mapImageUrl(block.format?.bookmark_icon, block)}
											alt={title}
										/>
									</div>
								) : null}

								<div className='notion-bookmark-link-text'>
									<Text value={link} block={block} />
								</div>
							</div>
						</div>

						{block.format?.bookmark_cover ? (
							<div className='notion-bookmark-image'>
								<LazyImage
									src={mapImageUrl(block.format?.bookmark_cover, block)}
									alt={getTextContent(block.properties?.title)}
									style={{
										objectFit: 'cover',
									}}
								/>
							</div>
						) : null}
					</components.Link>
				</div>
			);
		}

		case 'toggle': {
			return (
				<details className={cs('notion-toggle', blockId)}>
					<summary>
						<Text value={block.properties?.title} block={block} />
					</summary>

					<div>{children}</div>
				</details>
			);
		}

		case 'table_of_contents': {
			const page = getBlockParentPage(block, recordMap);

			if (!page) return null;

			const toc = getPageTableOfContents(page, recordMap);
			const blockColor = block.format?.block_color;

			return (
				<div
					className={cs(
						'notion-table-of-contents',
						blockColor && `notion-${blockColor}`,
						blockId,
					)}
				>
					{toc.map(tocItem => (
						<a
							key={tocItem.id}
							href={`#${uuidToId(tocItem.id)}`}
							className='notion-table-of-contents-item'
						>
							<span
								className='notion-table-of-contents-item-body'
								style={{
									display: 'inline-block',
									marginLeft: tocItem.indentLevel * 24,
								}}
							>
								{tocItem.text}
							</span>
						</a>
					))}
				</div>
			);
		}

		case 'to_do': {
			const isChecked = block.properties?.checked?.[0]?.[0] === 'Yes';

			return (
				<div className={cs('notion-to-do', blockId)}>
					<div className='notion-to-do-item'>
						<components.Checkbox blockId={blockId} isChecked={isChecked} />

						<div
							className={cs(
								'notion-to-do-body',
								isChecked && `notion-to-do-checked`,
							)}
						>
							<Text value={block.properties?.title} block={block} />
						</div>
					</div>

					<div className='notion-to-do-children'>{children}</div>
				</div>
			);
		}

		case 'transclusion_container': {
			return <div className={cs('notion-sync-block', blockId)}>{children}</div>;
		}

		case 'transclusion_reference': {
			return <SyncPointerBlock block={block} level={level + 1} {...props} />;
		}

		case 'alias': {
			const blockPointerId = block?.format?.alias_pointer?.id;
			const linkedBlock = recordMap.block[blockPointerId]?.value;

			if (!linkedBlock) {
				console.log('"alias" missing block', blockPointerId);

				return null;
			}

			return (
				<components.PageLink
					className={cs('notion-page-link', blockPointerId)}
					href={mapPageUrl(blockPointerId)}
				>
					<PageTitle block={linkedBlock} />
				</components.PageLink>
			);
		}

		case 'table': {
			return (
				<table className={cs('notion-simple-table', blockId)}>
					<tbody>{children}</tbody>
				</table>
			);
		}

		case 'table_row': {
			const tableBlock = recordMap.block[block.parent_id]?.value as TableBlock;
			const order = tableBlock.format?.table_block_column_order;
			const formatMap = tableBlock.format?.table_block_column_format;
			const backgroundColor = block.format?.block_color;

			if (!tableBlock || !order) {
				return null;
			}

			return (
				<tr
					className={cs(
						'notion-simple-table-row',
						backgroundColor && `notion-${backgroundColor}`,
						blockId,
					)}
				>
					{order.map(column => {
						const color = formatMap?.[column]?.color;

						return (
							<td
								key={column}
								className={color ? `notion-${color}` : ''}
								style={{
									width: formatMap?.[column]?.width || 120,
								}}
							>
								<div className='notion-simple-table-cell'>
									<Text
										value={block.properties?.[column] || [['ㅤ']]}
										block={block}
									/>
								</div>
							</td>
						);
					})}
				</tr>
			);
		}

		case 'external_object_instance': {
			return <EOI block={block} className={blockId} />;
		}

		default: {
			// eslint-disable-next-line no-process-env
			if (process.env.NODE_ENV !== 'production') {
				console.warn(
					`Unsupported type ${(block as any).type}`,
					JSON.stringify(block, null, 2),
				);
			}

			return <div />;
		}
	}
};
