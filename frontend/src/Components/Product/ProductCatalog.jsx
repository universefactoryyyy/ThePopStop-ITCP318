import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Form } from 'react-bootstrap'
import FilterListIcon from '@mui/icons-material/FilterList'
import { getProducts, getFilterOptions } from '../../actions/productActions'
import { errMsg } from '../../Utils/helpers'
import Product from './Product'
import ProductFilters, { EMPTY_FILTERS, countActiveFilters } from './ProductFilters'

const PAGE_SIZE = 8

// The product list with filters + sorting and INFINITE SCROLL:
// a sentinel under the grid asks for the next page as soon as it scrolls into view.
const ProductCatalog = ({ keyword = '' }) => {
    const dispatch = useDispatch()
    const { products, loading, error, hasMore, filteredProductsCount, page: loadedPage } = useSelector(state => state.products)
    const filterOptions = useSelector(state => state.filterOptions)

    const [filters, setFilters] = useState({ ...EMPTY_FILTERS })
    const [sort, setSort] = useState('newest')
    const [showFilters, setShowFilters] = useState(false)

    // the page number belongs to one query: when the filters / search / sort change it starts again at 1
    const queryKey = JSON.stringify({ filters, sort, keyword })
    const [pageState, setPageState] = useState({ key: queryKey, page: 1 })
    const page = pageState.key === queryKey ? pageState.page : 1

    // forget the page number whenever the query changes, so coming back to an earlier query starts at page 1
    const resetPaging = useCallback(() => setPageState({ key: null, page: 1 }), [])
    const updateFilters = (next) => { resetPaging(); setFilters(next) }
    const updateSort = (next) => { resetPaging(); setSort(next) }
    useEffect(() => {
        resetPaging()
    }, [keyword, resetPaging])

    useEffect(() => {
        dispatch(getFilterOptions())
    }, [dispatch])

    useEffect(() => {
        dispatch(getProducts({ ...filters, sort, keyword, page, limit: PAGE_SIZE }))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, queryKey, page])

    useEffect(() => {
        if (error) errMsg(error)
    }, [error])

    const loadMore = useCallback(() => setPageState({ key: queryKey, page: page + 1 }), [queryKey, page])

    // infinite scroll sentinel
    const sentinelRef = useRef(null)
    const canLoadMore = hasMore && !loading && loadedPage === page
    useEffect(() => {
        const node = sentinelRef.current
        if (!node || !canLoadMore) return
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) loadMore()
        }, { rootMargin: '400px' })
        observer.observe(node)
        return () => observer.disconnect()
    }, [canLoadMore, loadMore])

    const activeFilters = countActiveFilters(filters)
    const firstLoad = loading && products.length === 0

    return (
        <div className="row g-4">
            <div className="col-lg-3">
                <button
                    type="button"
                    className="btn btn-outline-primary w-100 d-lg-none mb-2 d-inline-flex justify-content-center align-items-center gap-2"
                    onClick={() => setShowFilters(!showFilters)}
                    aria-expanded={showFilters}
                >
                    <FilterListIcon fontSize="small" /> Filters {activeFilters > 0 && <span className="badge bg-primary">{activeFilters}</span>}
                </button>
                {/* one copy of the filters: always visible on large screens, toggled by the Filters button on small ones */}
                <div className={`pop-filters-wrap ${showFilters ? 'open' : ''}`}>
                    <ProductFilters filters={filters} options={filterOptions} onChange={updateFilters} />
                </div>
            </div>

            <div className="col-lg-9">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                    <p className="mb-0 text-muted" aria-live="polite">
                        {keyword && <>Results for <strong>&ldquo;{keyword}&rdquo;</strong> &middot; </>}
                        {filteredProductsCount !== undefined
                            ? `Showing ${products.length} of ${filteredProductsCount} products`
                            : 'Loading products...'}
                    </p>
                    <Form.Select
                        size="sm"
                        value={sort}
                        onChange={(e) => updateSort(e.target.value)}
                        style={{ width: 'auto' }}
                        aria-label="Sort products"
                    >
                        <option value="newest">Newest</option>
                        <option value="price_asc">Price: low to high</option>
                        <option value="price_desc">Price: high to low</option>
                        <option value="rating_desc">Top rated</option>
                        <option value="name_asc">Name: A to Z</option>
                    </Form.Select>
                </div>

                {firstLoad ? (
                    <div className="text-center py-5"><div className="spinner-border" role="status" /></div>
                ) : products.length === 0 && !loading ? (
                    <div className="pop-empty">
                        <h5>No products found</h5>
                        <p className="text-muted mb-3">Try a different search or clear some filters.</p>
                        {activeFilters > 0 && (
                            <button type="button" className="btn btn-primary" onClick={() => updateFilters({ ...EMPTY_FILTERS })}>Clear filters</button>
                        )}
                    </div>
                ) : (
                    <div className="row row-cols-2 row-cols-md-3 g-3">
                        {products.map(product => (
                            <div className="col" key={product._id}>
                                <Product product={product} />
                            </div>
                        ))}
                    </div>
                )}

                <div ref={sentinelRef} style={{ height: 1 }} />
                {loading && products.length > 0 && (
                    <div className="text-center py-4"><div className="spinner-border" role="status" aria-label="Loading more products" /></div>
                )}
                {canLoadMore && (
                    <div className="text-center py-3">
                        <button type="button" className="btn btn-outline-primary" onClick={loadMore}>Load more</button>
                    </div>
                )}
                {!hasMore && !loading && products.length > 0 && (
                    <p className="text-center text-muted py-4 mb-0">You have seen all {products.length} products</p>
                )}
            </div>
        </div>
    )
}

export default ProductCatalog
