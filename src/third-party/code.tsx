import * as React from 'react';
import copyToClipboard from 'clipboard-copy';
import {getBlockTitle} from 'notion-utils';
import {highlightElement} from 'prismjs';
import 'prismjs/components/prism-clike.min.js';
import 'prismjs/components/prism-css-extras.min.js';
import 'prismjs/components/prism-css.min.js';
import 'prismjs/components/prism-javascript.min.js';
import 'prismjs/components/prism-js-extras.min.js';
import 'prismjs/components/prism-json.min.js';
import 'prismjs/components/prism-jsx.min.js';
import 'prismjs/components/prism-tsx.min.js';
import 'prismjs/components/prism-typescript.min.js';

import {Text} from '../components/text';
import {useNotionContext} from '../context';
import CopyIcon from '../icons/copy';
import {cs} from '../utils';
import type {CodeBlock} from 'notion-types';

export const Code: React.FC<{
	readonly block: CodeBlock;
	readonly defaultLanguage?: string;
	readonly className?: string;
}> = ({block, defaultLanguage = 'typescript', className}) => {
	const [isCopied, setIsCopied] = React.useState(false);
	const copyTimeout = React.useRef<number>();
	const {recordMap} = useNotionContext();
	const content = getBlockTitle(block, recordMap);
	const language = (
		block.properties?.language?.[0]?.[0] || defaultLanguage
	).toLowerCase();
	const caption = block.properties.caption;

	const codeRef = React.useRef();

	React.useEffect(() => {
		if (codeRef.current) {
			try {
				highlightElement(codeRef.current);
			} catch (error) {
				console.warn('prismjs highlight error', error);
			}
		}
	}, [codeRef]);

	const onClickCopyToClipboard = React.useCallback(() => {
		copyToClipboard(content);
		setIsCopied(true);

		if (copyTimeout.current) {
			clearTimeout(copyTimeout.current);
			copyTimeout.current = null;
		}

		copyTimeout.current = setTimeout(() => {
			setIsCopied(false);
		}, 1200) as unknown as number;
	}, [content, copyTimeout]);

	const copyButton = (
		<div className='notion-code-copy-button' onClick={onClickCopyToClipboard}>
			<CopyIcon />
		</div>
	);

	return (
		<>
			<pre className={cs('notion-code', className)}>
				<div className='notion-code-copy'>
					{copyButton}

					{isCopied ? (
						<div className='notion-code-copy-tooltip'>
							<div>{isCopied ? 'Copied' : 'Copy'}</div>
						</div>
					) : null}
				</div>

				<code ref={codeRef} className={`language-${language}`}>
					{content}
				</code>
			</pre>

			{caption ? (
				<figcaption className='notion-asset-caption'>
					<Text value={caption} block={block} />
				</figcaption>
			) : null}
		</>
	);
};
