import { useEffect, useMemo } from 'react'
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
            <div className="pop-grid-wrap">
                <DataGrid
                    rows={reviews}
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
