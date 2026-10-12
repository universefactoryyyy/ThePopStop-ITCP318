import { Formik, Form as FormikForm } from 'formik'
import * as Yup from 'yup'
import Rating from '@mui/material/Rating'

const reviewSchema = Yup.object({
    rating: Yup.number().min(1, 'Please select a rating').max(5).required('Please select a rating'),
    comment: Yup.string().trim().max(1000, 'Review cannot exceed 1000 characters'),
})

// Create a review - or edit the customer's existing one (initialReview)
const ReviewForm = ({ initialReview, onSubmit, submitting }) => {
    const isEdit = Boolean(initialReview)

    return (
        <Formik
            enableReinitialize
            initialValues={{
                rating: initialReview ? initialReview.rating : 0,
                comment: initialReview ? initialReview.comment : '',
            }}
            validationSchema={reviewSchema}
            onSubmit={(values) => onSubmit(values)}
        >
            {({ values, errors, touched, handleChange, handleBlur, setFieldValue, setFieldTouched }) => (
                <FormikForm noValidate className="card pop-review-form mb-4">
                    <div className="card-body">
                        <h5 className="mb-3">{isEdit ? 'Edit your review' : 'Write a review'}</h5>

                        <div className="mb-3">
                            <label className="form-label d-block" id="rating-label">Your rating</label>
                            <Rating
                                name="rating"
                                value={values.rating}
                                size="large"
                                aria-labelledby="rating-label"
                                onChange={(e, value) => {
                                    setFieldValue('rating', value || 0)
                                    setFieldTouched('rating', true, false)
                                }}
                            />
                            {touched.rating && errors.rating && <div className="text-danger small">{errors.rating}</div>}
                        </div>

                        <div className="mb-3">
                            <label htmlFor="comment" className="form-label">Your comment</label>
                            <textarea
                                id="comment"
                                name="comment"
                                rows={3}
                                className={`form-control ${touched.comment && errors.comment ? 'is-invalid' : ''}`}
                                value={values.comment}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Tell other collectors what you think..."
                            />
                            {touched.comment && errors.comment && <div className="invalid-feedback">{errors.comment}</div>}
                            <div className="form-text">Inappropriate words are automatically masked.</div>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Saving...' : isEdit ? 'Update review' : 'Submit review'}
                        </button>
                    </div>
                </FormikForm>
            )}
        </Formik>
    )
}

export default ReviewForm
