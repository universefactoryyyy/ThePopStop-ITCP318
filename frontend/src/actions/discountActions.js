import axios from 'axios'
import { getErrorMessage } from '../Utils/helpers'
import { REMOVE_DISCOUNT } from '../constants/cartConstants'
import {
    ALL_DISCOUNTS_REQUEST,
    ALL_DISCOUNTS_SUCCESS,
    ALL_DISCOUNTS_FAIL,
    APPLICABLE_DISCOUNTS_REQUEST,
    APPLICABLE_DISCOUNTS_SUCCESS,
    APPLICABLE_DISCOUNTS_FAIL,
    APPLY_DISCOUNT_REQUEST,
    APPLY_DISCOUNT_SUCCESS,
    APPLY_DISCOUNT_FAIL,
    SAVE_DISCOUNT_REQUEST,
    SAVE_DISCOUNT_SUCCESS,
    SAVE_DISCOUNT_FAIL,
    DELETE_DISCOUNT_REQUEST,
    DELETE_DISCOUNT_SUCCESS,
    DELETE_DISCOUNT_FAIL,
    CLEAR_ERRORS
} from '../constants/discountConstants'

const API = import.meta.env.VITE_API

// codes the customer qualifies for at this subtotal (checkout dropdown)
export const getApplicableDiscounts = (subtotal) => async (dispatch) => {
    try {
        dispatch({ type: APPLICABLE_DISCOUNTS_REQUEST })
        const { data } = await axios.get(`${API}/discounts/applicable`, { params: { subtotal } })
        dispatch({
            type: APPLICABLE_DISCOUNTS_SUCCESS,
            payload: data.discounts
        })
    } catch (error) {
        dispatch({
            type: APPLICABLE_DISCOUNTS_FAIL,
            payload: getErrorMessage(error)
        })
    }
}

// validates the code on the server and keeps it in the cart state for the order summary
export const applyDiscount = (code, subtotal) => async (dispatch) => {
    try {
        dispatch({ type: APPLY_DISCOUNT_REQUEST })
        const { data } = await axios.post(`${API}/discount/validate`, { code, subtotal })
        dispatch({
            type: APPLY_DISCOUNT_SUCCESS,
            payload: data
        })
        return { success: true }
    } catch (error) {
        const message = getErrorMessage(error)
        dispatch({
            type: APPLY_DISCOUNT_FAIL,
            payload: message
        })
        return { success: false, message }
    }
}

export const removeDiscount = () => (dispatch) => {
    dispatch({ type: REMOVE_DISCOUNT })
}

// ------------------------- admin -------------------------

export const getAllDiscounts = () => async (dispatch) => {
    try {
        dispatch({ type: ALL_DISCOUNTS_REQUEST })
        const { data } = await axios.get(`${API}/admin/discounts`)
        dispatch({
            type: ALL_DISCOUNTS_SUCCESS,
            payload: data.discounts
        })
    } catch (error) {
        dispatch({
            type: ALL_DISCOUNTS_FAIL,
            payload: getErrorMessage(error)
        })
    }
}

// id = null creates a new discount, otherwise updates it
export const saveDiscount = (id, discountData) => async (dispatch) => {
    try {
        dispatch({ type: SAVE_DISCOUNT_REQUEST })
        const { data } = id
            ? await axios.put(`${API}/admin/discount/${id}`, discountData)
            : await axios.post(`${API}/admin/discount/new`, discountData)
        dispatch({
            type: SAVE_DISCOUNT_SUCCESS,
            payload: data.success
        })
        return { success: true }
    } catch (error) {
        const message = getErrorMessage(error)
        dispatch({
            type: SAVE_DISCOUNT_FAIL,
            payload: message
        })
        return { success: false, message }
    }
}

export const deleteDiscount = (id) => async (dispatch) => {
    try {
        dispatch({ type: DELETE_DISCOUNT_REQUEST })
        const { data } = await axios.delete(`${API}/admin/discount/${id}`)
        dispatch({
            type: DELETE_DISCOUNT_SUCCESS,
            payload: data.success
        })
    } catch (error) {
        dispatch({
            type: DELETE_DISCOUNT_FAIL,
            payload: getErrorMessage(error)
        })
    }
}

export const clearErrors = () => async (dispatch) => {
    dispatch({
        type: CLEAR_ERRORS
    })
}
