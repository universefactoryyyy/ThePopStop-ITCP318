import { legacy_createStore as createStore, combineReducers, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';

import {
    productsReducer,
    filterOptionsReducer,
    productDetailsReducer,
    adminProductsReducer,
    newProductReducer,
    productReducer,
} from './reducers/productReducers'
import {
    authReducer,
    userReducer,
    forgotPasswordReducer,
    allUsersReducer,
    userDetailsReducer,
} from './reducers/userReducers'

import { cartReducer } from './reducers/cartReducers';

import {
    newOrderReducer,
    myOrdersReducer,
    orderDetailsReducer,
    allOrdersReducer,
    orderReducer,
} from './reducers/orderReducers';

import {
    reviewsReducer,
    reviewEligibilityReducer,
    newReviewReducer,
    reviewReducer,
} from './reducers/reviewReducers';

import { discountsReducer, discountReducer } from './reducers/discountReducers';

let initialState = {
    cart: {
        cartItems: [],
        shippingInfo: localStorage.getItem('shippingInfo')
            ? JSON.parse(localStorage.getItem('shippingInfo'))
            : {},
        discount: null
    },
}

const reducer = combineReducers({
    products: productsReducer,
    filterOptions: filterOptionsReducer,
    productDetails: productDetailsReducer,
    adminProducts: adminProductsReducer,
    newProduct: newProductReducer,
    product: productReducer,
    auth: authReducer,
    user: userReducer,
    forgotPassword: forgotPasswordReducer,
    allUsers: allUsersReducer,
    userDetails: userDetailsReducer,
    cart: cartReducer,
    newOrder: newOrderReducer,
    myOrders: myOrdersReducer,
    orderDetails: orderDetailsReducer,
    allOrders: allOrdersReducer,
    order: orderReducer,
    reviews: reviewsReducer,
    reviewEligibility: reviewEligibilityReducer,
    newReview: newReviewReducer,
    review: reviewReducer,
    discounts: discountsReducer,
    discount: discountReducer,
})

const middlware = [thunk]
const store = createStore(reducer, initialState, applyMiddleware(...middlware))
export default store;
