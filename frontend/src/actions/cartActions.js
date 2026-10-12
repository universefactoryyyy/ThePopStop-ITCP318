import axios from 'axios'
import { getErrorMessage } from '../Utils/helpers'
import { CART_REQUEST, CART_SUCCESS, CART_FAIL, SAVE_SHIPPING_INFO, CLEAR_CART } from '../constants/cartConstants'

const API = import.meta.env.VITE_API

// The cart lives in MongoDB (one row per product per user), so it follows the customer between devices.
// Every action resolves to { success, message } so the component can toast the result.

export const getCart = () => async (dispatch) => {
    try {
        dispatch({ type: CART_REQUEST })
        const { data } = await axios.get(`${API}/cart`)
        dispatch({ type: CART_SUCCESS, payload: data.cartItems })
    } catch (error) {
        dispatch({ type: CART_FAIL, payload: getErrorMessage(error) })
    }
}

const cartRequest = (request) => async (dispatch) => {
    try {
        const { data } = await request()
        dispatch({ type: CART_SUCCESS, payload: data.cartItems })
        return { success: true, message: data.message }
    } catch (error) {
        const message = getErrorMessage(error)
        return { success: false, message }
    }
}

export const addItemToCart = (productId, quantity = 1) =>
    cartRequest(() => axios.post(`${API}/cart`, { productId, quantity }))

export const updateCartItem = (id, quantity) =>
    cartRequest(() => axios.put(`${API}/cart/${id}`, { quantity }))

export const removeItemFromCart = (id) =>
    cartRequest(() => axios.delete(`${API}/cart/${id}`))

export const saveShippingInfo = (data) => async (dispatch) => {
    dispatch({
        type: SAVE_SHIPPING_INFO,
        payload: data
    })
    localStorage.setItem('shippingInfo', JSON.stringify(data))
}

// after logout / a successful order
export const clearCart = () => async (dispatch) => {
    dispatch({
        type: CLEAR_CART,
    })
}
