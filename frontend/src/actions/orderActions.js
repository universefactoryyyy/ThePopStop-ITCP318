import axios from 'axios'
import { getErrorMessage } from '../Utils/helpers'
import {
    CREATE_ORDER_REQUEST,
    CREATE_ORDER_SUCCESS,
    CREATE_ORDER_FAIL,
    MY_ORDERS_REQUEST,
    MY_ORDERS_SUCCESS,
    MY_ORDERS_FAIL,
    ORDER_DETAILS_REQUEST,
    ORDER_DETAILS_SUCCESS,
    ORDER_DETAILS_FAIL,
    ALL_ORDERS_REQUEST,
    ALL_ORDERS_SUCCESS,
    ALL_ORDERS_FAIL,
    UPDATE_ORDER_REQUEST,
    UPDATE_ORDER_SUCCESS,
    UPDATE_ORDER_FAIL,
    DELETE_ORDER_REQUEST,
    DELETE_ORDER_SUCCESS,
    DELETE_ORDER_FAIL,
    CLEAR_ERRORS
} from '../constants/orderConstants'

const API = import.meta.env.VITE_API

// Checkout. order = { shippingInfo, paymentMethod, discountCode } - the server builds the order from the saved cart
export const createOrder = (order) => async (dispatch) => {
    try {
        dispatch({ type: CREATE_ORDER_REQUEST })
        const { data } = await axios.post(`${API}/order/new`, order)
        dispatch({
            type: CREATE_ORDER_SUCCESS,
            payload: data
        })
    } catch (error) {
        dispatch({
            type: CREATE_ORDER_FAIL,
            payload: getErrorMessage(error)
        })
    }
}

export const myOrders = () => async (dispatch) => {
    try {
        dispatch({ type: MY_ORDERS_REQUEST })
        const { data } = await axios.get(`${API}/orders/me`)
        dispatch({
            type: MY_ORDERS_SUCCESS,
            payload: data.orders
        })
    } catch (error) {
        dispatch({
            type: MY_ORDERS_FAIL,
            payload: getErrorMessage(error)
        })
    }
}

export const getOrderDetails = (id) => async (dispatch) => {
    try {
        dispatch({ type: ORDER_DETAILS_REQUEST })
        const { data } = await axios.get(`${API}/order/${id}`)
        dispatch({
            type: ORDER_DETAILS_SUCCESS,
            payload: data.order
        })
    } catch (error) {
        dispatch({
            type: ORDER_DETAILS_FAIL,
            payload: getErrorMessage(error)
        })
    }
}

// downloads the PDF receipt through the authenticated API (the cookie is needed, so a plain link would not work)
export const downloadReceipt = async (order) => {
    const { data } = await axios.get(`${API}/order/${order._id}/receipt`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `receipt-order-${String(order._id).slice(-8).toUpperCase()}.pdf`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
}

// ------------------------- admin -------------------------

export const allOrders = () => async (dispatch) => {
    try {
        dispatch({ type: ALL_ORDERS_REQUEST })
        const { data } = await axios.get(`${API}/admin/orders`)
        dispatch({
            type: ALL_ORDERS_SUCCESS,
            payload: data
        })
    } catch (error) {
        dispatch({
            type: ALL_ORDERS_FAIL,
            payload: getErrorMessage(error)
        })
    }
}

// changes the status; the server emails the customer (items, totals, PDF receipt attached)
export const updateOrder = (id, status) => async (dispatch) => {
    try {
        dispatch({ type: UPDATE_ORDER_REQUEST })
        const { data } = await axios.put(`${API}/admin/order/${id}`, { status })
        dispatch({
            type: UPDATE_ORDER_SUCCESS,
            payload: data
        })
    } catch (error) {
        dispatch({
            type: UPDATE_ORDER_FAIL,
            payload: getErrorMessage(error)
        })
    }
}

export const deleteOrder = (id) => async (dispatch) => {
    try {
        dispatch({ type: DELETE_ORDER_REQUEST })
        const { data } = await axios.delete(`${API}/admin/order/${id}`)
        dispatch({
            type: DELETE_ORDER_SUCCESS,
            payload: data.success
        })
    } catch (error) {
        dispatch({
            type: DELETE_ORDER_FAIL,
            payload: getErrorMessage(error)
        })
    }
}

export const clearErrors = () => async (dispatch) => {
    dispatch({
        type: CLEAR_ERRORS
    })
}
