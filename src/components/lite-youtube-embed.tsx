import React, {useCallback, useMemo, useState} from 'react';
import {cs} from '../utils';
import type {CSSProperties, FC} from 'react';

const qs = (params: {[key: string]: string}) => {
	return Object.keys(params)
		.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
		.join('&');
};

const emptyObject = {};

export const LiteYouTubeEmbed: FC<{
	readonly id: string;
	readonly defaultPlay?: boolean;
	readonly mute?: boolean;
	readonly lazyImage?: boolean;
	readonly iframeTitle?: string;
	readonly alt?: string;
	readonly params?: {[key: string]: string};
	readonly adLinksPreconnect?: boolean;
	readonly style?: CSSProperties;
	readonly className?: string;
}> = ({
	id,
	defaultPlay = false,
	mute = false,
	lazyImage = false,
	iframeTitle = 'YouTube video',
	alt = 'Video preview',
	params = emptyObject,
	adLinksPreconnect = true,
	style,
	className,
}) => {
	const muteParam = mute || defaultPlay ? '1' : '0'; // Default play must be muted
	const queryString = useMemo(
		() => qs({autoplay: '1', mute: muteParam, ...params}),
		[muteParam, params],
	);
	/* const mobileResolution = 'hqdefault'
	   const desktopResolution = 'maxresdefault' */
	const resolution = 'hqdefault';
	const posterUrl = `https://i.ytimg.com/vi/${id}/${resolution}.jpg`;
	const ytUrl = 'https://www.youtube-nocookie.com';
	const iframeSrc = `${ytUrl}/embed/${id}?${queryString}`;

	const [isPreconnected, setIsPreconnected] = useState(false);
	const [iframeInitialized, setIframeInitialized] = useState(defaultPlay);
	const [isIframeLoaded, setIsIframeLoaded] = useState(false);

	const warmConnections = useCallback(() => {
		if (isPreconnected) return;
		setIsPreconnected(true);
	}, [isPreconnected]);

	const onLoadIframe = useCallback(() => {
		if (iframeInitialized) return;
		setIframeInitialized(true);
	}, [iframeInitialized]);

	const onIframeLoaded = useCallback(() => {
		setIsIframeLoaded(true);
	}, []);

	return (
		<>
			<link rel='preload' href={posterUrl} as='image' />

			{isPreconnected ? (
				<>
					{/* The iframe document and most of its subresources come from youtube.com */}
					<link rel='preconnect' href={ytUrl} />

					{/* The botguard script is fetched off from google.com */}
					<link rel='preconnect' href='https://www.google.com' />
				</>
			) : null}

			{isPreconnected && adLinksPreconnect ? (
				<>
					{/* Not certain if these ad related domains are in the critical path. Could verify with domain-specific throttling. */}
					<link rel='preconnect' href='https://static.doubleclick.net' />
					<link rel='preconnect' href='https://googleads.g.doubleclick.net' />
				</>
			) : null}

			<div
				className={cs(
					'notion-yt-lite',
					isIframeLoaded && 'notion-yt-loaded',
					iframeInitialized && 'notion-yt-initialized',
					className,
				)}
				style={style}
				onClick={onLoadIframe}
				onPointerOver={warmConnections}
			>
				<img
					src={posterUrl}
					className='notion-yt-thumbnail'
					loading={lazyImage ? 'lazy' : undefined}
					alt={alt}
				/>

				<div className='notion-yt-playbtn' />

				{iframeInitialized ? (
					<iframe
						allowFullScreen
						width='560'
						height='315'
						frameBorder='0'
						allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture'
						title={iframeTitle}
						src={iframeSrc}
						onLoad={onIframeLoaded}
					/>
				) : null}
			</div>
		</>
	);
};
