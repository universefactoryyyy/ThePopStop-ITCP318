import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import Rating from '@mui/material/Rating'
import DeleteIcon from '@mui/icons-material/DeleteOutlined'
import {
    getProductReviews,
    getReviewEligibility,
    newReview,
    deleteReview,
    clearErrors,
} from '../../actions/reviewActions'
import { getProductDetails } from '../../actions/productActions'
import { NEW_REVIEW_RESET, DELETE_REVIEW_RESET } from '../../constants/reviewConstants'
import { errMsg, successMsg, formatDate } from '../../Utils/helpers'
import ReviewForm from './ReviewForm'

const Avatar = ({ user }) => (
    user && user.avatar && user.avatar.url
        ? <img src={user.avatar.url} alt="" className="pop-avatar" />
        : <span className="pop-avatar pop-avatar-fallback">{(user && user.name ? user.name : '?').charAt(0).toUpperCase()}</span>
)

// Ratings & reviews of one product:
//  - only customers with a DELIVERED order containing the product can write a review (and later edit it)
//  - the admin can delete any review
const ProductReviews = ({ product }) => {
    const dispatch = useDispatch()
    const { user, isAuthenticated } = useSelector(state => state.auth)
    const { reviews, loading, error } = useSelector(state => state.reviews)
    const { canReview, review: myReview } = useSelector(state => state.reviewEligibility)
    const { loading: saving, success, isEdit, error: saveError } = useSelector(state => state.newReview)
    const { isDeleted, error: deleteError } = useSelector(state => state.review)

    const isAdmin = Boolean(user && user.role === 'admin')
    const userId = user && user._id

    const refresh = () => {
        dispatch(getProductReviews(product._id))
        dispatch(getProductDetails(product._id))
        if (isAuthenticated) dispatch(getReviewEligibility(product._id))
    }

    useEffect(() => {
        dispatch(getProductReviews(product._id))
        if (isAuthenticated) dispatch(getReviewEligibility(product._id))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, product._id, isAuthenticated])

    useEffect(() => {
        if (error) { errMsg(error); dispatch(clearErrors()) }
        if (saveError) { errMsg(saveError); dispatch(clearErrors()) }
        if (deleteError) { errMsg(deleteError); dispatch(clearErrors()) }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error, saveError, deleteError])

    useEffect(() => {
        if (success) {
            successMsg(isEdit ? 'Review updated' : 'Thanks for your review!')
            dispatch({ type: NEW_REVIEW_RESET })
            refresh()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [success])

    useEffect(() => {
        if (isDeleted) {
            successMsg('Review deleted')
            dispatch({ type: DELETE_REVIEW_RESET })
            refresh()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDeleted])

    const submitReview = (values) => {
        dispatch(newReview({ productId: product._id, rating: values.rating, comment: values.comment }))
    }

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

    return (
        <section className="mt-5" aria-labelledby="reviews-heading">
            <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                <h3 id="reviews-heading" className="mb-0">Ratings &amp; Reviews</h3>
                <span className="d-inline-flex align-items-center gap-1">
                    <Rating value={product.ratings || 0} precision={0.1} readOnly />
                    <strong>{(product.ratings || 0).toFixed(1)}</strong>
                    <span className="text-muted">({product.numOfReviews || 0} review{product.numOfReviews === 1 ? '' : 's'})</span>
                </span>
            </div>

            {!isAuthenticated ? (
                <div className="alert alert-light border">
                    <Link to="/login" state={{ from: `/product/${product._id}` }}>Login</Link> to review this product after you have received it.
                </div>
            ) : isAdmin ? null : canReview ? (
                <ReviewForm initialReview={myReview} onSubmit={submitReview} submitting={saving} />
            ) : (
                <div className="alert alert-light border">
                    Only customers who received this product (a delivered order) can review it.
                </div>
            )}

            {loading && reviews.length === 0 ? (
                <div className="text-center py-3"><div className="spinner-border" role="status" /></div>
            ) : reviews.length === 0 ? (
                <p className="text-muted">No reviews yet. Be the first to share your thoughts!</p>
            ) : (
                <ul className="list-unstyled pop-review-list">
                    {reviews.map(review => (
                        <li key={review._id} className="card mb-3">
                            <div className="card-body d-flex gap-3">
                                <Avatar user={review.user} />
                                <div className="flex-grow-1">
                                    <div className="d-flex flex-wrap justify-content-between align-items-start">
                                        <div>
                                            <strong>{review.user ? review.user.name : 'Former customer'}</strong>
                                            {userId && review.user && review.user._id === userId && <span className="pop-chip ms-2">You</span>}
                                            <div><Rating value={review.rating} readOnly size="small" /></div>
                                        </div>
                                        <small className="text-muted">
                                            {formatDate(review.updatedAt || review.createdAt)}
                                            {review.updatedAt && review.createdAt && new Date(review.updatedAt) - new Date(review.createdAt) > 1000 ? ' (edited)' : ''}
                                        </small>
                                    </div>
                                    {review.comment && <p className="mb-0 mt-2">{review.comment}</p>}
                                </div>
                                {isAdmin && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger btn-sm align-self-start"
                                        onClick={() => confirmDelete(review)}
                                        aria-label="Delete review"
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}

export default ProductReviews
