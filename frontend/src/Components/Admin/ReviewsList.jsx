import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { DataGrid } from '@mui/x-data-grid'
import Rating from '@mui/material/Rating'
import Swal from 'sweetalert2'
import { getAllReviews, deleteReview, clearErrors } from '../../actions/reviewActions'
import { DELETE_REVIEW_RESET } from '../../constants/reviewConstants'
import { errMsg, successMsg, formatDate } from '../../Utils/helpers'
import MetaData from '../Layout/MetaData'

// Admin: moderate reviews (delete any review)
const ReviewsList = () => {
    const dispatch = useDispatch()
    const { loading, error, reviews } = useSelector(state => state.reviews)
    const { error: actionError, isDeleted } = useSelector(state => state.review)
    const [ratingFilter, setRatingFilter] = useState(0)
    const [search, setSearch] = useState('')

    useEffect(() => {
        dispatch(getAllReviews())
    }, [dispatch])

    useEffect(() => {
        if (error) { errMsg(error); dispatch(clearErrors()) }
        if (actionError) { errMsg(actionError); dispatch(clearErrors()) }
    }, [error, actionError, dispatch])

    useEffect(() => {
        if (isDeleted) {
            successMsg('Review deleted')
            dispatch({ type: DELETE_REVIEW_RESET })
            dispatch(getAllReviews())
        }
    }, [isDeleted, dispatch])

    const rows = useMemo(() => {
        const term = search.trim().toLowerCase()
        return reviews.filter(review => {
            if (ratingFilter && review.rating !== ratingFilter) return false
            if (!term) return true
            const productName = review.product ? review.product.name : ''
            const userName = review.user ? review.user.name : ''
            return [productName, userName, review.comment].some(value => String(value || '').toLowerCase().includes(term))
        })
    }, [reviews, ratingFilter, search])

    const confirmDelete = async (review) => {
        const result = await Swal.fire({
            title: 'Delete this review?',
            text: 'This cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
        })
        if (result.isConfirmed) dispatch(deleteReview(review._id))
    }

    const columns = useMemo(() => [
        {
            field: 'product',
            headerName: 'Product',
            flex: 1,
            minWidth: 180,
            valueGetter: (value) => (value ? value.name : 'Deleted product'),
            renderCell: (params) => (
                params.row.product
                    ? <Link to={`/product/${params.row.product._id}`}>{params.value}</Link>
                    : params.value
            ),
        },
        { field: 'user', headerName: 'Customer', width: 170, valueGetter: (value) => (value ? value.name : 'Deleted user') },
        {
            field: 'rating',
            headerName: 'Rating',
            width: 140,
            type: 'number',
            renderCell: (params) => <Rating value={params.value} readOnly size="small" />,
        },
        { field: 'comment', headerName: 'Comment', flex: 1.5, minWidth: 220 },
        { field: 'createdAt', headerName: 'Date', width: 130, valueFormatter: (value) => formatDate(value) },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 110,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <div className="d-flex align-items-center h-100">
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => confirmDelete(params.row)}>Delete</button>
                </div>
            ),
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
    ], [dispatch])

    return (
        <div>
            <MetaData title="Reviews" />
            <h2 className="mb-3">Reviews</h2>
            <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                <input
                    type="search"
                    className="form-control"
                    style={{ maxWidth: 280 }}
                    placeholder="Search product, customer or comment"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Search reviews"
                />
                <select
                    className="form-select"
                    style={{ maxWidth: 180 }}
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(Number(e.target.value))}
                    aria-label="Filter reviews by rating"
                >
                    <option value={0}>All ratings</option>
                    {[5, 4, 3, 2, 1].map(stars => (
                        <option key={stars} value={stars}>{stars} star{stars === 1 ? '' : 's'}</option>
                    ))}
                </select>
            </div>
            <div className="pop-grid-wrap">
                <DataGrid
                    rows={rows}
                    columns={columns}
                    getRowId={(row) => row._id}
                    loading={loading}
                    autoHeight
                    disableRowSelectionOnClick
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } },
                        sorting: { sortModel: [{ field: 'createdAt', sort: 'desc' }] },
                    }}
                />
            </div>
        </div>
    )
}

export default ReviewsList
