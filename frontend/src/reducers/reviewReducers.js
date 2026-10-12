import {
    PRODUCT_REVIEWS_REQUEST,
    PRODUCT_REVIEWS_SUCCESS,
    PRODUCT_REVIEWS_FAIL,
    REVIEW_ELIGIBILITY_REQUEST,
    REVIEW_ELIGIBILITY_SUCCESS,
    REVIEW_ELIGIBILITY_FAIL,
    NEW_REVIEW_REQUEST,
    NEW_REVIEW_SUCCESS,
    NEW_REVIEW_RESET,
    NEW_REVIEW_FAIL,
    ALL_REVIEWS_REQUEST,
    ALL_REVIEWS_SUCCESS,
    ALL_REVIEWS_FAIL,
    DELETE_REVIEW_REQUEST,
    DELETE_REVIEW_SUCCESS,
    DELETE_REVIEW_RESET,
    DELETE_REVIEW_FAIL,
    CLEAR_ERRORS
} from '../constants/reviewConstants'

// public reviews of one product, or all reviews for the admin table
export const reviewsReducer = (state = { reviews: [] }, action) => {
    switch (action.type) {
        case PRODUCT_REVIEWS_REQUEST:
        case ALL_REVIEWS_REQUEST:
            return {
                ...state,
                loading: true
            }
        case PRODUCT_REVIEWS_SUCCESS:
        case ALL_REVIEWS_SUCCESS:
            return {
                loading: false,
                reviews: action.payload
            }
        case PRODUCT_REVIEWS_FAIL:
        case ALL_REVIEWS_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload
            }
        case CLEAR_ERRORS:
            return {
                ...state,
                error: null
            }
        default:
            return state
    }
}

export const reviewEligibilityReducer = (state = { canReview: false, review: null }, action) => {
    switch (action.type) {
        case REVIEW_ELIGIBILITY_REQUEST:
            return {
                ...state,
                loading: true
            }
        case REVIEW_ELIGIBILITY_SUCCESS:
            return {
                loading: false,
                canReview: action.payload.canReview,
                review: action.payload.review
            }
        case REVIEW_ELIGIBILITY_FAIL:
            return {
                ...state,
                loading: false,
                canReview: false,
                error: action.payload
            }
        default:
            return state
    }
}

export const newReviewReducer = (state = {}, action) => {
    switch (action.type) {
        case NEW_REVIEW_REQUEST:
            return {
                ...state,
                loading: true
            }
        case NEW_REVIEW_SUCCESS:
            return {
                loading: false,
                success: action.payload.success,
                isEdit: action.payload.isEdit
            }
        case NEW_REVIEW_RESET:
            return {
                ...state,
                success: false
            }
        case NEW_REVIEW_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload
            }
        case CLEAR_ERRORS:
            return {
                ...state,
                error: null
            }
        default:
            return state
    }
}

export const reviewReducer = (state = {}, action) => {
    switch (action.type) {
        case DELETE_REVIEW_REQUEST:
            return {
                ...state,
                loading: true
            }
        case DELETE_REVIEW_SUCCESS:
            return {
                ...state,
                loading: false,
                isDeleted: action.payload
            }
        case DELETE_REVIEW_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload
            }
        case DELETE_REVIEW_RESET:
            return {
                ...state,
                isDeleted: false
            }
        case CLEAR_ERRORS:
            return {
                ...state,
                error: null
            }
        default:
            return state
    }
}
