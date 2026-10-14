import axios from 'axios'
import { getErrorMessage } from '../Utils/helpers'
import {
    ALL_PRODUCTS_REQUEST,
    ALL_PRODUCTS_SUCCESS,
    ALL_PRODUCTS_FAIL,
    PRODUCT_DETAILS_REQUEST,
    PRODUCT_DETAILS_SUCCESS,
    PRODUCT_DETAILS_FAIL,
    FILTER_OPTIONS_REQUEST,
    FILTER_OPTIONS_SUCCESS,
    FILTER_OPTIONS_FAIL,
    ADMIN_PRODUCTS_REQUEST,
    ADMIN_PRODUCTS_SUCCESS,
    ADMIN_PRODUCTS_FAIL,
    NEW_PRODUCT_REQUEST,
    NEW_PRODUCT_SUCCESS,
    NEW_PRODUCT_FAIL,
    UPDATE_PRODUCT_REQUEST,
    UPDATE_PRODUCT_SUCCESS,
    UPDATE_PRODUCT_FAIL,
    DELETE_PRODUCT_REQUEST,
    DELETE_PRODUCT_SUCCESS,
    DELETE_PRODUCT_FAIL,
    BULK_DELETE_PRODUCTS_REQUEST,
    BULK_DELETE_PRODUCTS_SUCCESS,
    BULK_DELETE_PRODUCTS_FAIL,
    RESTORE_PRODUCT_REQUEST,
    RESTORE_PRODUCT_SUCCESS,
    RESTORE_PRODUCT_FAIL,
    CLEAR_ERRORS
} from '../constants/productConstants'

const API = import.meta.env.VITE_API

// only the response of the newest request may update the list (fast filter changes / scrolling)
let latestProductsRequest = 0

// filters: { keyword, page, limit, sort, price: [min, max], series: [], brand: [], ratings, reviews }
export const getProducts = (filters = {}) => async (dispatch) => {
    const requestId = ++latestProductsRequest
    const page = filters.page || 1
    try {
        dispatch({ type: ALL_PRODUCTS_REQUEST, payload: { page } })

        const params = { page, limit: filters.limit || 8 }
        if (filters.keyword) params.keyword = filters.keyword
        if (filters.sort) params.sort = filters.sort
        if (filters.price) {
            params['price[gte]'] = filters.price[0]
            params['price[lte]'] = filters.price[1]
        }
        if (filters.series && filters.series.length) params.series = filters.series.join(',')
        if (filters.brand && filters.brand.length) params.brand = filters.brand.join(',')
        if (filters.ratings) params['ratings[gte]'] = filters.ratings
        if (filters.reviews) params['numOfReviews[gte]'] = filters.reviews

        const { data } = await axios.get(`${API}/products`, { params })
        if (requestId !== latestProductsRequest) return

        dispatch({
            type: ALL_PRODUCTS_SUCCESS,
            payload: { ...data, page }
        })
    } catch (error) {
        if (requestId !== latestProductsRequest) return
        dispatch({
            type: ALL_PRODUCTS_FAIL,
            payload: getErrorMessage(error)
        })
    }
}

export const getFilterOptions = () => async (dispatch) => {
    try {
        dispatch({ type: FILTER_OPTIONS_REQUEST })
        const { data } = await axios.get(`${API}/products/filters`)
        dispatch({
            type: FILTER_OPTIONS_SUCCESS,
            payload: data
        })
    } catch (error) {
        dispatch({
            type: FILTER_OPTIONS_FAIL,
            payload: getErrorMessage(error)
        })
    }
}

export const getProductDetails = (id) => async (dispatch) => {
    try {
        dispatch({ type: PRODUCT_DETAILS_REQUEST })
        const { data } = await axios.get(`${API}/product/${id}`)
        dispatch({
            type: PRODUCT_DETAILS_SUCCESS,
            payload: data.product
        })
    } catch (error) {
        dispatch({
            type: PRODUCT_DETAILS_FAIL,
            payload: getErrorMessage(error)
        })
    }
}

// ------------------------- admin -------------------------

export const getAdminProducts = () => async (dispatch) => {
    try {
        dispatch({ type: ADMIN_PRODUCTS_REQUEST })
        const { data } = await axios.get(`${API}/admin/products`)
        dispatch({
            type: ADMIN_PRODUCTS_SUCCESS,
            payload: data.products
        })
    } catch (error) {
        dispatch({
            type: ADMIN_PRODUCTS_FAIL,
            payload: getErrorMessage(error)
        })
    }
}

// productData = FormData (fields + several `images` files)
export const newProduct = (productData) => async (dispatch) => {
    try {
        dispatch({ type: NEW_PRODUCT_REQUEST })
        const { data } = await axios.post(`${API}/admin/product/new`, productData)
        dispatch({
            type: NEW_PRODUCT_SUCCESS,
            payload: data
        })
    } catch (error) {
        dispatch({
            type: NEW_PRODUCT_FAIL,
            payload: getErrorMessage(error)
        })
    }
}

export const updateProduct = (id, productData) => async (dispatch) => {
    try {
        dispatch({ type: UPDATE_PRODUCT_REQUEST })
        const { data } = await axios.put(`${API}/admin/product/${id}`, productData)
        dispatch({
            type: UPDATE_PRODUCT_SUCCESS,
            payload: data.success
        })
    } catch (error) {
        dispatch({
            type: UPDATE_PRODUCT_FAIL,
            payload: getErrorMessage(error)
        })
    }
}

export const deleteProduct = (id) => async (dispatch) => {
    try {
        dispatch({ type: DELETE_PRODUCT_REQUEST })
        const { data } = await axios.delete(`${API}/admin/product/${id}`)
        dispatch({
            type: DELETE_PRODUCT_SUCCESS,
            payload: data.success
        })
    } catch (error) {
        dispatch({
            type: DELETE_PRODUCT_FAIL,
            payload: getErrorMessage(error)
        })
    }
}

// bulk delete from the datatable checkboxes
export const bulkDeleteProducts = (ids) => async (dispatch) => {
    try {
        dispatch({ type: BULK_DELETE_PRODUCTS_REQUEST })
        const { data } = await axios.delete(`${API}/admin/products`, { data: { ids } })
        dispatch({
            type: BULK_DELETE_PRODUCTS_SUCCESS,
            payload: data.deletedCount
        })
    } catch (error) {
        dispatch({
            type: BULK_DELETE_PRODUCTS_FAIL,
            payload: getErrorMessage(error)
        })
    }
}

export const restoreProduct = (id) => async (dispatch) => {
    try {
        dispatch({ type: RESTORE_PRODUCT_REQUEST })
        const { data } = await axios.put(`${API}/admin/product/${id}/restore`)
        dispatch({
            type: RESTORE_PRODUCT_SUCCESS,
            payload: data.success
        })
    } catch (error) {
        dispatch({
            type: RESTORE_PRODUCT_FAIL,
            payload: getErrorMessage(error)
        })
    }
}

export const clearErrors = () => async (dispatch) => {
    dispatch({
        type: CLEAR_ERRORS
    })
}
