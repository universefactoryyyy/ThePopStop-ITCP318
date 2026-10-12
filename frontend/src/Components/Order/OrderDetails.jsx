import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import { getOrderDetails, clearErrors, downloadReceipt } from '../../actions/orderActions'
import {
    errMsg, formatDateTime, formatPeso, orderNumber, orderStatusClass, productImage, getErrorMessage, ORDER_STATUSES,
} from '../../Utils/helpers'
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'

const STEPS = ORDER_STATUSES.filter(s => s !== 'Cancelled')

// Order progress: Pending > Processing > Shipped > Delivered (or Cancelled)
export const OrderProgress = ({ status }) => {
    if (status === 'Cancelled') return <span className="badge bg-danger">Cancelled</span>
    const current = STEPS.indexOf(status)
    return (
        <ol className="pop-steps">
            {STEPS.map((step, index) => (
                <li key={step} className={index <= current ? 'done' : ''} aria-current={index === current ? 'step' : undefined}>
                    <span className="pop-step-dot">{index + 1}</span>
                    <span className="pop-step-label">{step}</span>
                </li>
            ))}
        </ol>
    )
}

// One order: items, shipping, payment, totals (with discount) and the PDF receipt
const OrderDetails = () => {
    const { id } = useParams()
    const dispatch = useDispatch()
    const { loading, error, order } = useSelector(state => state.orderDetails)

    useEffect(() => {
        dispatch(getOrderDetails(id))
    }, [dispatch, id])

    useEffect(() => {
        if (error) {
            errMsg(error)
            dispatch(clearErrors())
        }
    }, [error, dispatch])

    const handleReceipt = async () => {
        try {
            await downloadReceipt(order)
        } catch (e) {
            errMsg(getErrorMessage(e))
        }
    }

    const isCurrent = order && order._id === id
    if (!isCurrent) {
        if (loading) return <Loader />
        return (
            <div className="container-xl pop-page">
                <MetaData title="Order not found" />
                <div className="pop-empty">
                    <h4>Order not found</h4>
                    <Link to="/orders/me" className="btn btn-primary">Back to my orders</Link>
                </div>
            </div>
        )
    }

    const { shippingInfo = {}, paymentInfo = {}, orderItems = [] } = order

    return (
        <div className="container-xl pop-page">
            <MetaData title={`Order ${orderNumber(order)}`} />
            <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-4">
                <div>
                    <h2 className="mb-1">Order #{orderNumber(order)}</h2>
                    <p className="text-muted mb-0">Placed on {formatDateTime(order.createdAt)}</p>
                </div>
                <div className="d-flex gap-2">
                    <button type="button" className="btn btn-primary" onClick={handleReceipt}>Download receipt (PDF)</button>
                    <Link to="/orders/me" className="btn btn-outline-primary">My orders</Link>
                </div>
            </div>

            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="mb-3">Status</h5>
                    <OrderProgress status={order.orderStatus} />
                    {order.deliveredAt && <p className="text-muted mt-3 mb-0">Delivered on {formatDateTime(order.deliveredAt)}</p>}
                </div>
            </div>

            <div className="row g-4">
                <div className="col-lg-8">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="mb-3">Items</h5>
                            {orderItems.map(item => (
                                <div className="d-flex align-items-center gap-3 mb-3" key={item._id || item.product}>
                                    <img src={item.image || productImage(null)} alt="" className="pop-cart-img" />
                                    <div className="flex-grow-1">
                                        <Link to={`/product/${item.product}`} className="pop-product-title fw-semibold">{item.name}</Link>
                                        <div className="text-muted small">{item.series}</div>
                                        <div className="small">{item.quantity} &times; {formatPeso(item.price)}</div>
                                        {order.orderStatus === 'Delivered' && (
                                            <Link to={`/product/${item.product}`} className="small">Rate this product</Link>
                                        )}
                                    </div>
                                    <strong>{formatPeso(item.price * item.quantity)}</strong>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card mb-3">
                        <div className="card-body">
                            <h5 className="mb-3">Shipping</h5>
                            <p className="mb-1"><strong>{order.user && order.user.name}</strong></p>
                            <p className="mb-1">{shippingInfo.address}{shippingInfo.postalCode ? `, ${shippingInfo.postalCode}` : ''}</p>
                            <p className="mb-0 text-muted">{shippingInfo.phoneNo}</p>
                        </div>
                    </div>
                    <div className="card pop-summary">
                        <div className="card-body">
                            <h5 className="mb-3">Payment</h5>
                            <p className="text-muted">{paymentInfo.method}</p>
                            <div className="d-flex justify-content-between mb-1"><span>Subtotal</span><span>{formatPeso(order.itemsPrice)}</span></div>
                            {order.discountAmount > 0 && (
                                <div className="d-flex justify-content-between mb-1 text-success">
                                    <span>Discount ({order.discountCode})</span><span>&minus;{formatPeso(order.discountAmount)}</span>
                                </div>
                            )}
                            <hr />
                            <h5 className="d-flex justify-content-between mb-2"><span>Total</span><span>{formatPeso(order.totalPrice)}</span></h5>
                            <span className={`badge ${orderStatusClass(order.orderStatus)}`}>{order.orderStatus}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderDetails
