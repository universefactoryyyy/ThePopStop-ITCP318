import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import { getOrderDetails, updateOrder, clearErrors, downloadReceipt } from '../../actions/orderActions'
import { UPDATE_ORDER_RESET } from '../../constants/orderConstants'
import {
    errMsg, successMsg, formatDateTime, formatPeso, orderNumber, orderStatusClass, productImage, getErrorMessage, ORDER_STATUSES,
} from '../../Utils/helpers'
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import { OrderProgress } from '../Order/OrderDetails'

// Admin: change the order status. The customer gets an email with the order + PDF receipt on every change.
const ProcessOrder = () => {
    const { id } = useParams()
    const dispatch = useDispatch()
    const { order, error: detailsError } = useSelector(state => state.orderDetails)
    const { loading, error, isUpdated, emailSent, emailError } = useSelector(state => state.order)
    const [status, setStatus] = useState('')

    useEffect(() => {
        dispatch(getOrderDetails(id))
    }, [dispatch, id])

    useEffect(() => {
        if (order && order._id === id) setStatus(order.orderStatus)
    }, [order, id])

    useEffect(() => {
        if (detailsError) { errMsg(detailsError); dispatch(clearErrors()) }
        if (error) { errMsg(error); dispatch(clearErrors()) }
    }, [detailsError, error, dispatch])

    useEffect(() => {
        if (isUpdated) {
            successMsg('Order status updated')
            if (emailSent) successMsg('The customer was notified by email')
            else errMsg(`Status saved, but the email could not be sent${emailError ? `: ${emailError}` : ''}`)
            dispatch({ type: UPDATE_ORDER_RESET })
            dispatch(getOrderDetails(id))
        }
    }, [isUpdated, emailSent, emailError, dispatch, id])

    const handleReceipt = async () => {
        try {
            await downloadReceipt(order)
        } catch (e) {
            errMsg(getErrorMessage(e))
        }
    }

    if (!order || order._id !== id) return <Loader />

    const { shippingInfo = {}, paymentInfo = {}, orderItems = [] } = order
    const locked = order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled'

    return (
        <div>
            <MetaData title={`Process Order ${orderNumber(order)}`} />
            <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-4">
                <div>
                    <h2 className="mb-1">Order #{orderNumber(order)}</h2>
                    <p className="text-muted mb-0">Placed on {formatDateTime(order.createdAt)}</p>
                </div>
                <div className="d-flex gap-2">
                    <button type="button" className="btn btn-outline-primary" onClick={handleReceipt}>Receipt (PDF)</button>
                    <Link to="/admin/orders" className="btn btn-outline-primary">Back to orders</Link>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-xl-8">
                    <div className="card mb-4">
                        <div className="card-body">
                            <h5 className="mb-3">Progress</h5>
                            <OrderProgress status={order.orderStatus} />
                        </div>
                    </div>
                    <div className="card">
                        <div className="card-body">
                            <h5 className="mb-3">Items</h5>
                            {orderItems.map(item => (
                                <div className="d-flex align-items-center gap-3 mb-3" key={item._id || item.product}>
                                    <img src={item.image || productImage(null)} alt="" className="pop-cart-img" />
                                    <div className="flex-grow-1">
                                        <div className="fw-semibold">{item.name}</div>
                                        <div className="text-muted small">{item.series}</div>
                                        <div className="small">{item.quantity} &times; {formatPeso(item.price)}</div>
                                    </div>
                                    <strong>{formatPeso(item.price * item.quantity)}</strong>
                                </div>
                            ))}
                            <hr />
                            <div className="d-flex justify-content-between mb-1"><span>Subtotal</span><span>{formatPeso(order.itemsPrice)}</span></div>
                            {order.discountAmount > 0 && (
                                <div className="d-flex justify-content-between mb-1 text-success">
                                    <span>Discount ({order.discountCode})</span><span>&minus;{formatPeso(order.discountAmount)}</span>
                                </div>
                            )}
                            <h5 className="d-flex justify-content-between mt-2 mb-0"><span>Total</span><span>{formatPeso(order.totalPrice)}</span></h5>
                        </div>
                    </div>
                </div>

                <div className="col-xl-4">
                    <div className="card mb-4">
                        <div className="card-body">
                            <h5 className="mb-3">Update status</h5>
                            <p className="mb-2">Current: <span className={`badge ${orderStatusClass(order.orderStatus)}`}>{order.orderStatus}</span></p>
                            <label htmlFor="order-status" className="form-label">New status</label>
                            <select
                                id="order-status"
                                className="form-select mb-3"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                disabled={locked}
                            >
                                {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <button
                                type="button"
                                className="btn btn-primary w-100"
                                disabled={loading || locked || status === order.orderStatus}
                                onClick={() => dispatch(updateOrder(order._id, status))}
                            >
                                {loading ? 'Updating...' : 'Update status'}
                            </button>
                            <p className="form-text mt-2 mb-0">
                                {locked
                                    ? `This order is ${order.orderStatus.toLowerCase()} and can no longer change.`
                                    : 'The customer is emailed the order details and a PDF receipt.'}
                            </p>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-body">
                            <h5 className="mb-3">Customer</h5>
                            <p className="mb-1"><strong>{order.user ? order.user.name : 'Deleted user'}</strong></p>
                            <p className="mb-1 text-muted">{order.user && order.user.email}</p>
                            <hr />
                            <p className="mb-1">{shippingInfo.address}{shippingInfo.postalCode ? `, ${shippingInfo.postalCode}` : ''}</p>
                            <p className="mb-1 text-muted">{shippingInfo.phoneNo}</p>
                            <p className="mb-0 text-muted">Payment: {paymentInfo.method}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProcessOrder
