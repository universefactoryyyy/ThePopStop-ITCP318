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
    NEW_PRODUCT_RESET,
    NEW_PRODUCT_FAIL,
    UPDATE_PRODUCT_REQUEST,
    UPDATE_PRODUCT_SUCCESS,
    UPDATE_PRODUCT_RESET,
    UPDATE_PRODUCT_FAIL,
    DELETE_PRODUCT_REQUEST,
    DELETE_PRODUCT_SUCCESS,
    DELETE_PRODUCT_RESET,
    DELETE_PRODUCT_FAIL,
    BULK_DELETE_PRODUCTS_REQUEST,
    BULK_DELETE_PRODUCTS_SUCCESS,
    BULK_DELETE_PRODUCTS_RESET,
    BULK_DELETE_PRODUCTS_FAIL,
    RESTORE_PRODUCT_REQUEST,
    RESTORE_PRODUCT_SUCCESS,
    RESTORE_PRODUCT_RESET,
    RESTORE_PRODUCT_FAIL,
    CLEAR_ERRORS
} from '../constants/productConstants'

// Public catalog. Page 1 replaces the list, later pages are appended (infinite scroll).
export const productsReducer = (state = { products: [], hasMore: false, page: 0 }, action) => {
    switch (action.type) {
        case ALL_PRODUCTS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            }
        case ALL_PRODUCTS_SUCCESS: {
            const { products, page } = action.payload
            let merged = products
            if (page > 1) {
                const known = new Set(state.products.map(p => p._id))
                merged = [...state.products, ...products.filter(p => !known.has(p._id))]
            }
            return {
                loading: false,
                products: merged,
                page,
                hasMore: action.payload.hasMore,
                productsCount: action.payload.productsCount,
                filteredProductsCount: action.payload.filteredProductsCount,
                resPerPage: action.payload.resPerPage,
            }
        }
        case ALL_PRODUCTS_FAIL:
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

export const filterOptionsReducer = (state = { series: [], brands: [], minPrice: 0, maxPrice: 0 }, action) => {
    switch (action.type) {
        case FILTER_OPTIONS_REQUEST:
            return { ...state, loading: true }
        case FILTER_OPTIONS_SUCCESS:
            return {
                loading: false,
                series: action.payload.series,
                brands: action.payload.brands,
                minPrice: action.payload.minPrice,
                maxPrice: action.payload.maxPrice,
            }
        case FILTER_OPTIONS_FAIL:
            return { ...state, loading: false, error: action.payload }
        default:
            return state
    }
}

export const productDetailsReducer = (state = { product: {} }, action) => {
    switch (action.type) {
        case PRODUCT_DETAILS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null
            }
        case PRODUCT_DETAILS_SUCCESS:
            return {
                loading: false,
                product: action.payload
            }
        case PRODUCT_DETAILS_FAIL:
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

// admin datatable (includes soft deleted products)
export const adminProductsReducer = (state = { products: [] }, action) => {
    switch (action.type) {
        case ADMIN_PRODUCTS_REQUEST:
            return {
                ...state,
                loading: true
            }
        case ADMIN_PRODUCTS_SUCCESS:
            return {
                loading: false,
                products: action.payload
            }
        case ADMIN_PRODUCTS_FAIL:
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

export const newProductReducer = (state = { product: {} }, action) => {
    switch (action.type) {
        case NEW_PRODUCT_REQUEST:
            return {
                ...state,
                loading: true
            }
        case NEW_PRODUCT_SUCCESS:
            return {
                loading: false,
                success: action.payload.success,
                product: action.payload.product
            }
        case NEW_PRODUCT_RESET:
            return {
                ...state,
                success: false
            }
        case NEW_PRODUCT_FAIL:
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

// update / delete / bulk delete / restore
export const productReducer = (state = {}, action) => {
    switch (action.type) {
        case UPDATE_PRODUCT_REQUEST:
        case DELETE_PRODUCT_REQUEST:
        case BULK_DELETE_PRODUCTS_REQUEST:
        case RESTORE_PRODUCT_REQUEST:
            return {
                ...state,
                loading: true
            }
        case UPDATE_PRODUCT_SUCCESS:
            return {
                ...state,
                loading: false,
                isUpdated: action.payload
            }
        case DELETE_PRODUCT_SUCCESS:
            return {
                ...state,
                loading: false,
                isDeleted: action.payload
            }
        case BULK_DELETE_PRODUCTS_SUCCESS:
            return {
                ...state,
                loading: false,
                bulkDeleted: action.payload
            }
        case RESTORE_PRODUCT_SUCCESS:
            return {
                ...state,
                loading: false,
                isRestored: action.payload
            }
        case UPDATE_PRODUCT_FAIL:
        case DELETE_PRODUCT_FAIL:
        case BULK_DELETE_PRODUCTS_FAIL:
        case RESTORE_PRODUCT_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload
            }
        case UPDATE_PRODUCT_RESET:
            return {
                ...state,
                isUpdated: false
            }
        case DELETE_PRODUCT_RESET:
            return {
                ...state,
                isDeleted: false
            }
        case BULK_DELETE_PRODUCTS_RESET:
            return {
                ...state,
                bulkDeleted: undefined
            }
        case RESTORE_PRODUCT_RESET:
            return {
                ...state,
                isRestored: false
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
