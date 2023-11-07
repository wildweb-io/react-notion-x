export const defaultMapPageUrl = (rootPageId?: string) => (pageId: string) => {
	pageId = (pageId || '').replaceAll('-', '');

	if (rootPageId && pageId === rootPageId) {
		return '/';
	}

	return `/${pageId}`;
};
