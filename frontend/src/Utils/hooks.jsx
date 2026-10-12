import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { addItemToCart } from '../actions/cartActions'
import { errMsg, successMsg } from './helpers'

// Shared "add to cart" behaviour: guests are sent to the login page, everyone else gets a toast
export const useAddToCart = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const { isAuthenticated } = useSelector(state => state.auth)

    return useCallback(async (product, quantity = 1) => {
        if (!isAuthenticated) {
            errMsg('Please login to add items to your cart')
            navigate('/login', { state: { from: location.pathname } })
            return false
        }
        const result = await dispatch(addItemToCart(product._id, quantity))
        if (result.success) successMsg(`${product.name} added to cart`)
        else errMsg(result.message)
        return result.success
    }, [dispatch, navigate, location.pathname, isAuthenticated])
}
