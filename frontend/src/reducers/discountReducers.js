import {
    ALL_DISCOUNTS_REQUEST,
    ALL_DISCOUNTS_SUCCESS,
    ALL_DISCOUNTS_FAIL,
    APPLICABLE_DISCOUNTS_REQUEST,
    APPLICABLE_DISCOUNTS_SUCCESS,
    APPLICABLE_DISCOUNTS_FAIL,
    SAVE_DISCOUNT_REQUEST,
    SAVE_DISCOUNT_SUCCESS,
    SAVE_DISCOUNT_RESET,
    SAVE_DISCOUNT_FAIL,
    DELETE_DISCOUNT_REQUEST,
    DELETE_DISCOUNT_SUCCESS,
    DELETE_DISCOUNT_RESET,
    DELETE_DISCOUNT_FAIL,
    CLEAR_ERRORS
} from '../constants/discountConstants'

export const discountsReducer = (state = { discounts: [] }, action) => {
    switch (action.type) {
        case ALL_DISCOUNTS_REQUEST:
        case APPLICABLE_DISCOUNTS_REQUEST:
            return {
                ...state,
                loading: true
            }
        case ALL_DISCOUNTS_SUCCESS:
        case APPLICABLE_DISCOUNTS_SUCCESS:
            return {
                loading: false,
                discounts: action.payload
            }
        case ALL_DISCOUNTS_FAIL:
        case APPLICABLE_DISCOUNTS_FAIL:
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

// admin create / update / delete
export const discountReducer = (state = {}, action) => {
    switch (action.type) {
        case SAVE_DISCOUNT_REQUEST:
        case DELETE_DISCOUNT_REQUEST:
            return {
                ...state,
                loading: true
            }
        case SAVE_DISCOUNT_SUCCESS:
            return {
                ...state,
                loading: false,
                isSaved: action.payload
            }
        case DELETE_DISCOUNT_SUCCESS:
            return {
                ...state,
                loading: false,
                isDeleted: action.payload
            }
        case SAVE_DISCOUNT_RESET:
            return {
                ...state,
                isSaved: false
            }
        case DELETE_DISCOUNT_RESET:
            return {
                ...state,
                isDeleted: false
            }
        case SAVE_DISCOUNT_FAIL:
        case DELETE_DISCOUNT_FAIL:
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
