import React, {memo} from 'react';
import isEqual from 'react-fast-compare';
import type {FC} from 'react';

export const wrapNextImage = (NextImage: any): FC<any> => {
	return memo(function ReactNotionXNextImage({
		src,
		alt,

		width,
		height,

		className,
		style,

		layout,

		...rest
	}) {
		if (!layout) {
			layout = width && height ? 'intrinsic' : 'fill';
		}

		return (
			<NextImage
				className={className}
				src={src}
				alt={alt}
				width={layout === 'intrinsic' && width}
				height={layout === 'intrinsic' && height}
				objectFit={style?.objectFit}
				objectPosition={style?.objectPosition}
				layout={layout}
				{...rest}
			/>
		);
	}, isEqual);
};

export const wrapNextLink = (NextLink: any): FC<any> =>
	function ReactNotionXNextLink({
		href,
		as,
		passHref,
		prefetch,
		replace,
		scroll,
		shallow,
		locale,
		...linkProps
	}) {
		return (
			<NextLink
				href={href}
				as={as}
				passHref={passHref}
				prefetch={prefetch}
				replace={replace}
				scroll={scroll}
				shallow={shallow}
				locale={locale}
			>
				<a {...linkProps} />
			</NextLink>
		);
	};
