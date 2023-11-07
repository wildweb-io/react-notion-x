import React, {useEffect, useMemo} from 'react';
import throttle from 'lodash.throttle';
import {uuidToId} from 'notion-utils';
import {cs} from '../utils';
import type {FC, ReactNode} from 'react';
import type {TableOfContentsEntry} from 'notion-utils';

export const PageAside: FC<{
	readonly toc: TableOfContentsEntry[];
	readonly activeSection: string | null;
	readonly setActiveSection: (activeSection: string | null) => unknown;
	readonly hasToc: boolean;
	readonly hasAside: boolean;
	readonly pageAside?: ReactNode;
	readonly className?: string;
}> = ({
	toc,
	activeSection,
	setActiveSection,
	pageAside,
	hasToc,
	hasAside,
	className,
}) => {
	const throttleMs = 100;
	const actionSectionScrollSpy = useMemo(
		() =>
			throttle(() => {
				const sections = document.querySelectorAll('.notion-h');

				let prevBBox: DOMRect = null;
				let currentSectionId = activeSection;

				for (const section of sections) {
					if (!section || !(section instanceof Element)) continue;

					if (!currentSectionId) {
						currentSectionId = section.dataset.id;
					}

					const bbox = section.getBoundingClientRect();
					const prevHeight = prevBBox ? bbox.top - prevBBox.bottom : 0;
					const offset = Math.max(150, prevHeight / 4);

					// GetBoundingClientRect returns values relative to the viewport
					if (bbox.top - offset < 0) {
						currentSectionId = section.dataset.id;

						prevBBox = bbox;

						continue;
					}

					// No need to continue loop, if last element has been detected
					break;
				}

				setActiveSection(currentSectionId);
			}, throttleMs),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[
			// explicitly not taking a dependency on activeSection
			setActiveSection,
		],
	);

	useEffect(() => {
		if (!hasToc) {
			return;
		}

		window.addEventListener('scroll', actionSectionScrollSpy);

		actionSectionScrollSpy();

		return () => {
			window.removeEventListener('scroll', actionSectionScrollSpy);
		};
	}, [hasToc, actionSectionScrollSpy]);

	if (!hasAside) {
		return null;
	}

	return (
		<aside className={cs('notion-aside', className)}>
			{hasToc ? (
				<div className='notion-aside-table-of-contents'>
					<div className='notion-aside-table-of-contents-header'>
						Table of Contents
					</div>

					<nav className='notion-table-of-contents'>
						{toc.map(tocItem => {
							const id = uuidToId(tocItem.id);

							return (
								<a
									key={id}
									href={`#${id}`}
									className={cs(
										'notion-table-of-contents-item',
										`notion-table-of-contents-item-indent-level-${tocItem.indentLevel}`,
										activeSection === id &&
											'notion-table-of-contents-active-item',
									)}
								>
									<span
										className='notion-table-of-contents-item-body'
										style={{
											display: 'inline-block',
											marginLeft: tocItem.indentLevel * 16,
										}}
									>
										{tocItem.text}
									</span>
								</a>
							);
						})}
					</nav>
				</div>
			) : null}

			{pageAside}
		</aside>
	);
};
