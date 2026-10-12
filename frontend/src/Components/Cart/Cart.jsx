import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import DeleteIcon from '@mui/icons-material/DeleteOutlined'
import { getCart, updateCartItem, removeItemFromCart } from '../../actions/cartActions'
import { errMsg, successMsg, formatPeso, productImage } from '../../Utils/helpers'
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'

export const cartSubtotal = (cartItems) =>
    Math.round(cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0) * 100) / 100

const Cart = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { cartItems, loading } = useSelector(state => state.cart)
    const [busyId, setBusyId] = useState(null)

    useEffect(() => {
        dispatch(getCart())
    }, [dispatch])

    const changeQuantity = async (item, quantity) => {
        setBusyId(item._id)
        const result = await dispatch(updateCartItem(item._id, quantity))
        if (!result.success) errMsg(result.message)
        setBusyId(null)
    }

    const remove = async (item) => {
        setBusyId(item._id)
        const result = await dispatch(removeItemFromCart(item._id))
        if (result.success) successMsg(`${item.product.name} removed from cart`)
        else errMsg(result.message)
        setBusyId(null)
    }

    if (loading && cartItems.length === 0) return <Loader />

    const subtotal = cartSubtotal(cartItems)
    const unitCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
    const hasProblem = cartItems.some(item => item.product.stock < item.quantity)

    return (
        <div className="container-xl pop-page">
            <MetaData title="Your Cart" />
            <div className="pop-page-header">
                <h2>Your Cart</h2>
                <p className="text-muted mb-0">{cartItems.length ? `${unitCount} item${unitCount === 1 ? '' : 's'}` : 'Nothing here yet'}</p>
            </div>

            {cartItems.length === 0 ? (
                <div className="pop-empty">
                    <h4>Your cart is empty</h4>
                    <p className="text-muted">Find a new buddy to take home!</p>
                    <Link to="/products" className="btn btn-primary">Start shopping</Link>
                </div>
            ) : (
                <div className="row g-4">
                    <div className="col-lg-8">
                        {cartItems.map(item => {
                            const { product } = item
                            const tooMany = product.stock < item.quantity
                            return (
                                <div className="card mb-3" key={item._id}>
                                    <div className="card-body">
                                        <div className="row align-items-center g-3">
                                            <div className="col-3 col-md-2">
                                                <img src={productImage(product)} alt={product.name} className="pop-cart-img" />
                                            </div>
                                            <div className="col-9 col-md-4">
                                                <Link to={`/product/${product._id}`} className="pop-product-title fw-semibold">{product.name}</Link>
                                                <div className="text-muted small">{product.series}</div>
                                                <div>{formatPeso(product.price)}</div>
                                                {tooMany && (
                                                    <div className="text-danger small">
                                                        {product.stock > 0 ? `Only ${product.stock} left in stock` : 'Out of stock'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="col-6 col-md-3">
                                                <div className="input-group input-group-sm pop-qty">
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-primary"
                                                        disabled={busyId === item._id || item.quantity <= 1}
                                                        onClick={() => changeQuantity(item, item.quantity - 1)}
                                                        aria-label={`Decrease quantity of ${product.name}`}
                                                    >&minus;</button>
                                                    <input
                                                        type="number"
                                                        className="form-control text-center"
                                                        value={item.quantity}
                                                        readOnly
                                                        aria-label={`Quantity of ${product.name}`}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-primary"
                                                        disabled={busyId === item._id || item.quantity >= product.stock}
                                                        onClick={() => changeQuantity(item, item.quantity + 1)}
                                                        aria-label={`Increase quantity of ${product.name}`}
                                                    >+</button>
                                                </div>
                                            </div>
                                            <div className="col-4 col-md-2 text-end fw-semibold">
                                                {formatPeso(product.price * item.quantity)}
                                            </div>
                                            <div className="col-2 col-md-1 text-end">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger btn-sm"
                                                    disabled={busyId === item._id}
                                                    onClick={() => remove(item)}
                                                    aria-label={`Remove ${product.name}`}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="col-lg-4">
                        <div className="card pop-summary">
                            <div className="card-body">
                                <h5 className="mb-3">Order Summary</h5>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Subtotal ({unitCount} units)</span>
                                    <strong>{formatPeso(subtotal)}</strong>
                                </div>
                                <p className="text-muted small">Discount codes can be applied at checkout.</p>
                                {hasProblem && <div className="alert alert-warning py-2 small">Please fix the highlighted items before checking out.</div>}
                                <button
                                    type="button"
                                    className="btn btn-primary w-100"
                                    disabled={hasProblem}
                                    onClick={() => navigate('/checkout')}
                                >
                                    Proceed to checkout
                                </button>
                                <Link to="/products" className="btn btn-link w-100 mt-2">Continue shopping</Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Cart
