import * as React from 'react';
import Katex from '@matejmazur/react-katex';
import {getBlockTitle} from 'notion-utils';
import {useNotionContext} from '../context';
import {cs} from '../utils';
import type {EquationBlock} from 'notion-types';

const katexSettings = {
	strict: false,
	throwOnError: false,
};

export const Equation: React.FC<{
	readonly block: EquationBlock;
	readonly math?: string;
	readonly inline?: boolean;
	readonly className?: string;
}> = ({block, math, inline = false, className, ...rest}) => {
	const {recordMap} = useNotionContext();

	math = math || getBlockTitle(block, recordMap);

	if (!math) return null;

	return (
		<span
			role='button'
			tabIndex={0}
			className={cs(
				'notion-equation',
				inline ? 'notion-equation-inline' : 'notion-equation-block',
				className,
			)}
		>
			<Katex math={math} settings={katexSettings} {...rest} />
		</span>
	);
};
