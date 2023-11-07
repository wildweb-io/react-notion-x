import React, {Component, createRef} from 'react';
import throttle from 'lodash.throttle';
import {getBlockParentPage, getBlockTitle} from 'notion-utils';
import {NotionContextConsumer, NotionContextProvider} from '../context';
import {ClearIcon} from '../icons/clear-icon';
import {LoadingIcon} from '../icons/loading-icon';
import {SearchIcon} from '../icons/search-icon';
import {cs} from '../utils';
import {PageTitle} from './page-title';
import type * as types from 'notion-types';

export class SearchDialog extends Component<{
	isOpen: boolean;
	rootBlockId: string;
	onClose: () => void;
	searchNotion: (params: types.SearchParams) => Promise<types.SearchResults>;
}> {
	constructor(props) {
		super(props);
		this._inputRef = createRef();
	}

	state = {
		isLoading: false,
		query: '',
		searchError: null,
		searchResult: null,
	};

	_inputRef: any;
	_search: any;

	componentDidMount() {
		this._search = throttle(this._searchImpl.bind(this), 1000);
		this._warmupSearch();
	}

	render() {
		const {isOpen, onClose} = this.props;
		const {isLoading, query, searchResult, searchError} = this.state;

		const hasQuery = !!query.trim();

		return (
			<NotionContextConsumer>
				{ctx => {
					const {components, defaultPageIcon, mapPageUrl} = ctx;

					return (
						<components.Modal
							isOpen={isOpen}
							contentLabel='Search'
							className='notion-search'
							overlayClassName='notion-search-overlay'
							onRequestClose={onClose}
							onAfterOpen={this._onAfterOpen}
						>
							<div className='quickFindMenu'>
								<div className='searchBar'>
									<div className='inlineIcon'>
										{isLoading ? (
											<LoadingIcon className='loadingIcon' />
										) : (
											<SearchIcon />
										)}
									</div>

									<input
										ref={this._inputRef}
										className='searchInput'
										placeholder='Search'
										value={query}
										onChange={this._onChangeQuery}
									/>

									{query ? (
										<div
											role='button'
											className='clearButton'
											onClick={this._onClearQuery}
										>
											<ClearIcon className='clearIcon' />
										</div>
									) : null}
								</div>

								{hasQuery && searchResult ? (
									<>
										{searchResult.results.length > 0 ? (
											<NotionContextProvider
												{...ctx}
												recordMap={searchResult.recordMap}
											>
												<div className='resultsPane'>
													{searchResult.results.map(result => (
														<components.PageLink
															key={result.id}
															className={cs('result', 'notion-page-link')}
															href={mapPageUrl(
																result.page.id,
																searchResult.recordMap,
															)}
														>
															<PageTitle
																block={result.page}
																defaultIcon={defaultPageIcon}
															/>

															{result.highlight?.html ? (
																<div
																	dangerouslySetInnerHTML={{
																		__html: result.highlight.html,
																	}}
																	className='notion-search-result-highlight'
																/>
															) : null}
														</components.PageLink>
													))}
												</div>

												<footer className='resultsFooter'>
													<div>
														<span className='resultsCount'>
															{searchResult.total}
														</span>

														{searchResult.total === 1 ? ' result' : ' results'}
													</div>
												</footer>
											</NotionContextProvider>
										) : (
											<div className='noResultsPane'>
												<div className='noResults'>No results</div>
												<div className='noResultsDetail'>
													Try different search terms
												</div>
											</div>
										)}
									</>
								) : null}

								{hasQuery && !searchResult && searchError ? (
									<div className='noResultsPane'>
										<div className='noResults'>Search error</div>
									</div>
								) : null}
							</div>
						</components.Modal>
					);
				}}
			</NotionContextConsumer>
		);
	}

	_onAfterOpen = () => {
		if (this._inputRef.current) {
			this._inputRef.current.focus();
		}
	};

	_onChangeQuery = e => {
		const query = e.target.value;

		this.setState({query});

		if (!query.trim()) {
			this.setState({isLoading: false, searchError: null, searchResult: null});
		} else {
			this._search();
		}
	};

	_onClearQuery = () => {
		this._onChangeQuery({target: {value: ''}});
	};

	_warmupSearch = async () => {
		const {searchNotion, rootBlockId} = this.props;

		/* search is generally implemented as a serverless function wrapping the notion
		   private API, upon opening the search dialog, so we eagerly invoke an empty
		   search in order to warm up the serverless lambda */
		await searchNotion({
			ancestorId: rootBlockId,
			query: '',
		});
	};

	_searchImpl = async () => {
		const {searchNotion, rootBlockId} = this.props;
		const {query} = this.state;

		if (!query.trim()) {
			this.setState({isLoading: false, searchError: null, searchResult: null});

			return;
		}

		this.setState({isLoading: true});
		const result: any = await searchNotion({
			ancestorId: rootBlockId,
			query,
		});

		console.log('search', query, result);

		let searchResult: any = null; // TODO
		let searchError: types.APIError = null;

		if (result.error || result.errorId) {
			searchError = result;
		} else {
			searchResult = {...result};

			const results = searchResult.results
				.map((result: any) => {
					const block = searchResult.recordMap.block[result.id]?.value;

					if (!block) return;

					const title = getBlockTitle(block, searchResult.recordMap);

					if (!title) {
						return;
					}

					result.title = title;
					result.block = block;
					result.recordMap = searchResult.recordMap;
					result.page =
						getBlockParentPage(block, searchResult.recordMap, {
							inclusive: true,
						}) || block;

					if (!result.page.id) {
						return;
					}

					if (result.highlight?.text) {
						result.highlight.html = result.highlight.text
							.replaceAll(/<gzknfouu>/gi, '<b>')
							.replaceAll(/<\/gzknfouu>/gi, '</b>');
					}

					return result;
				})
				.filter(Boolean);

			// dedupe results by page id
			const searchResultsMap = Object.fromEntries(
				results.map(result => [result.page.id, result]),
			);

			searchResult.results = Object.values(searchResultsMap);
		}

		if (this.state.query === query) {
			this.setState({isLoading: false, searchError, searchResult});
		}
	};
}
