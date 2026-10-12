import { CART_REQUEST, CART_SUCCESS, CART_FAIL, SAVE_SHIPPING_INFO, CLEAR_CART, REMOVE_DISCOUNT } from '../constants/cartConstants'
import { APPLY_DISCOUNT_SUCCESS } from '../constants/discountConstants'

export const cartReducer = (state = { cartItems: [], shippingInfo: {}, discount: null }, action) => {
    switch (action.type) {
        case CART_REQUEST:
            return {
                ...state,
                loading: true
            }
        case CART_SUCCESS:
            return {
                ...state,
                loading: false,
                cartItems: action.payload,
                // an applied discount may no longer fit once the subtotal changes, so it is checked again at checkout
                discount: action.payload.length ? state.discount : null
            }
        case CART_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload
            }
        case SAVE_SHIPPING_INFO:
            return {
                ...state,
                shippingInfo: action.payload
            }
        case APPLY_DISCOUNT_SUCCESS:
            return {
                ...state,
                discount: action.payload
            }
        case REMOVE_DISCOUNT:
            return {
                ...state,
                discount: null
            }
        case CLEAR_CART:
            return {
                ...state,
                cartItems: [],
                shippingInfo: {},
                discount: null
            }
        default:
            return state
    }
}
