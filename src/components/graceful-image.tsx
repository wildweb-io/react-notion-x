import * as React from 'react';
import {Img} from 'react-image';
import {isBrowser} from '../utils';
import type {ImgProps} from 'react-image';

export const GracefulImage = (props: ImgProps) => {
	if (isBrowser) {
		return <Img {...props} />;
	}

	// @ts-expect-error (must use the appropriate subset of props for <img> if using SSR)
	return <img {...props} />;
};
