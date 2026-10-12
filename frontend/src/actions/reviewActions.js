import axios from 'axios'
import { getErrorMessage } from '../Utils/helpers'
import {
    PRODUCT_REVIEWS_REQUEST,
    PRODUCT_REVIEWS_SUCCESS,
    PRODUCT_REVIEWS_FAIL,
    REVIEW_ELIGIBILITY_REQUEST,
    REVIEW_ELIGIBILITY_SUCCESS,
    REVIEW_ELIGIBILITY_FAIL,
    NEW_REVIEW_REQUEST,
    NEW_REVIEW_SUCCESS,
    NEW_REVIEW_FAIL,
    ALL_REVIEWS_REQUEST,
    ALL_REVIEWS_SUCCESS,
    ALL_REVIEWS_FAIL,
    DELETE_REVIEW_REQUEST,
    DELETE_REVIEW_SUCCESS,
    DELETE_REVIEW_FAIL,
    CLEAR_ERRORS
} from '../constants/reviewConstants'

const API = import.meta.env.VITE_API

export const getProductReviews = (productId) => async (dispatch) => {
    try {
        dispatch({ type: PRODUCT_REVIEWS_REQUEST })
        const { data } = await axios.get(`${API}/reviews`, { params: { productId } })
        dispatch({
            type: PRODUCT_REVIEWS_SUCCESS,
            payload: data.reviews
        })
    } catch (error) {
        dispatch({
            type: PRODUCT_REVIEWS_FAIL,
            payload: getErrorMessage(error)
        })
    }
}

// has this customer bought (delivered order) the product, and do they already have a review?
export const getReviewEligibility = (productId) => async (dispatch) => {
    try {
        dispatch({ type: REVIEW_ELIGIBILITY_REQUEST })
        const { data } = await axios.get(`${API}/review/eligibility`, { params: { productId } })
        dispatch({
            type: REVIEW_ELIGIBILITY_SUCCESS,
            payload: { canReview: data.canReview, review: data.review }
        })
    } catch (error) {
        dispatch({
            type: REVIEW_ELIGIBILITY_FAIL,
            payload: getErrorMessage(error)
        })
    }
}

// creates the review, or edits the customer's existing one
export const newReview = (reviewData) => async (dispatch) => {
    try {
        dispatch({ type: NEW_REVIEW_REQUEST })
        const { data } = await axios.put(`${API}/review`, reviewData)
        dispatch({
            type: NEW_REVIEW_SUCCESS,
            payload: data
        })
    } catch (error) {
        dispatch({
            type: NEW_REVIEW_FAIL,
            payload: getErrorMessage(error)
        })
    }
}

// ------------------------- admin -------------------------

export const getAllReviews = () => async (dispatch) => {
    try {
        dispatch({ type: ALL_REVIEWS_REQUEST })
        const { data } = await axios.get(`${API}/admin/reviews`)
        dispatch({
            type: ALL_REVIEWS_SUCCESS,
            payload: data.reviews
        })
    } catch (error) {
        dispatch({
            type: ALL_REVIEWS_FAIL,
            payload: getErrorMessage(error)
        })
    }
}

export const deleteReview = (id) => async (dispatch) => {
    try {
        dispatch({ type: DELETE_REVIEW_REQUEST })
        const { data } = await axios.delete(`${API}/admin/review/${id}`)
        dispatch({
            type: DELETE_REVIEW_SUCCESS,
            payload: data.success
        })
    } catch (error) {
        dispatch({
            type: DELETE_REVIEW_FAIL,
            payload: getErrorMessage(error)
        })
    }
}

export const clearErrors = () => async (dispatch) => {
    dispatch({
        type: CLEAR_ERRORS
    })
}
