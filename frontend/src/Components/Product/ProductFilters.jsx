import { useEffect, useState } from 'react'
import { Form } from 'react-bootstrap'
import Slider from '@mui/material/Slider'
import Rating from '@mui/material/Rating'
import { formatPeso } from '../../Utils/helpers'

export const EMPTY_FILTERS = { price: null, series: [], brand: [], ratings: 0, reviews: 0 }

export const countActiveFilters = (filters) =>
    (filters.price ? 1 : 0) + filters.series.length + filters.brand.length + (filters.ratings ? 1 : 0) + (filters.reviews ? 1 : 0)

const toggle = (list, value) => (list.includes(value) ? list.filter(v => v !== value) : [...list, value])

const REVIEW_OPTIONS = [
    { value: 1, label: 'Has reviews' },
    { value: 5, label: '5 or more reviews' },
    { value: 10, label: '10 or more reviews' },
]

// Multi-criteria filters: price, category (series), ratings, and number of reviews
const ProductFilters = ({ filters, options, onChange }) => {
    const { minPrice, maxPrice, series, brands } = options
    const [priceDraft, setPriceDraft] = useState([minPrice, maxPrice])

    // follow the committed filter (also when it is cleared) and the price range of the catalog
    useEffect(() => {
        setPriceDraft(filters.price || [minPrice, maxPrice])
    }, [filters.price, minPrice, maxPrice])

    const commitPrice = (event, value) => {
        const isFullRange = value[0] <= minPrice && value[1] >= maxPrice
        onChange({ ...filters, price: isFullRange ? null : value })
    }

    return (
        <div className="card pop-filters">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Filters</h5>
                    <button
                        type="button"
                        className="btn btn-link p-0 text-decoration-none"
                        onClick={() => onChange({ ...EMPTY_FILTERS })}
                        disabled={countActiveFilters(filters) === 0}
                    >
                        Clear all
                    </button>
                </div>

                <section className="mb-4">
                    <h6>Price range</h6>
                    {maxPrice > minPrice ? (
                        <>
                            <Slider
                                value={priceDraft}
                                min={minPrice}
                                max={maxPrice}
                                step={5}
                                onChange={(e, value) => setPriceDraft(value)}
                                onChangeCommitted={commitPrice}
                                valueLabelDisplay="auto"
                                valueLabelFormat={formatPeso}
                                getAriaLabel={() => 'Price range'}
                                sx={{ mx: 1, width: 'calc(100% - 16px)' }}
                            />
                            <div className="d-flex justify-content-between small text-muted">
                                <span>{formatPeso(priceDraft[0])}</span>
                                <span>{formatPeso(priceDraft[1])}</span>
                            </div>
                        </>
                    ) : <small className="text-muted">Loading...</small>}
                </section>

                <section className="mb-4">
                    <h6>Category</h6>
                    {series.map(name => (
                        <Form.Check
                            key={name}
                            type="checkbox"
                            id={`series-${name}`}
                            label={name}
                            checked={filters.series.includes(name)}
                            onChange={() => onChange({ ...filters, series: toggle(filters.series, name) })}
                        />
                    ))}
                </section>

                <section className="mb-4">
                    <h6>Brand</h6>
                    {brands.map(name => (
                        <Form.Check
                            key={name}
                            type="checkbox"
                            id={`brand-${name}`}
                            label={name}
                            checked={filters.brand.includes(name)}
                            onChange={() => onChange({ ...filters, brand: toggle(filters.brand, name) })}
                        />
                    ))}
                </section>

                <section className="mb-4">
                    <h6>Rating</h6>
                    <Form.Check
                        type="radio"
                        name="ratings"
                        id="rating-any"
                        label="Any rating"
                        checked={!filters.ratings}
                        onChange={() => onChange({ ...filters, ratings: 0 })}
                    />
                    {[4, 3, 2, 1].map(stars => (
                        <Form.Check
                            type="radio"
                            name="ratings"
                            key={stars}
                            id={`rating-${stars}`}
                            checked={filters.ratings === stars}
                            onChange={() => onChange({ ...filters, ratings: stars })}
                            label={
                                <span className="d-inline-flex align-items-center gap-1">
                                    <Rating value={stars} readOnly size="small" /> &amp; up
                                </span>
                            }
                        />
                    ))}
                </section>

                <section>
                    <h6>Reviews</h6>
                    <Form.Check
                        type="radio"
                        name="reviews"
                        id="reviews-any"
                        label="Any number of reviews"
                        checked={!filters.reviews}
                        onChange={() => onChange({ ...filters, reviews: 0 })}
                    />
                    {REVIEW_OPTIONS.map(option => (
                        <Form.Check
                            type="radio"
                            name="reviews"
                            key={option.value}
                            id={`reviews-${option.value}`}
                            label={option.label}
                            checked={filters.reviews === option.value}
                            onChange={() => onChange({ ...filters, reviews: option.value })}
                        />
                    ))}
                </section>
            </div>
        </div>
    )
}

export default ProductFilters
