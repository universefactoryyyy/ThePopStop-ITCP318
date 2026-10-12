import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import { getCart, saveShippingInfo } from '../../actions/cartActions'
import { getApplicableDiscounts, applyDiscount, removeDiscount } from '../../actions/discountActions'
import { createOrder, clearErrors } from '../../actions/orderActions'
import { errMsg, successMsg, formatPeso, productImage } from '../../Utils/helpers'
import { PHONE_REGEX } from '../../Utils/validation'
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import FormField from '../Layout/FormField'
import { cartSubtotal } from './Cart'

export const PAYMENT_METHODS = ['Cash on Delivery', 'GCash', 'Credit Card']

const checkoutSchema = Yup.object({
    phoneNo: Yup.string().trim().required('Phone number is required').matches(PHONE_REGEX, 'Enter a valid phone number'),
    address: Yup.string().trim().required('Shipping address is required').max(250, 'Max 250 characters'),
    postalCode: Yup.string().trim().max(10, 'Max 10 characters'),
    paymentMethod: Yup.string().oneOf(PAYMENT_METHODS, 'Select a payment method').required('Payment method is required'),
})

const Checkout = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user } = useSelector(state => state.auth)
    const { cartItems, shippingInfo, discount, loading } = useSelector(state => state.cart)
    const { discounts: applicable } = useSelector(state => state.discounts)
    const { loading: placing, error, order, emailSent } = useSelector(state => state.newOrder)

    const [codeInput, setCodeInput] = useState('')
    const [applying, setApplying] = useState(false)
    const submitted = useRef(false)

    const subtotal = cartSubtotal(cartItems)

    useEffect(() => {
        dispatch(getCart())
    }, [dispatch])

    // codes the customer qualifies for at this subtotal; a code applied earlier is checked again against it
    useEffect(() => {
        if (!cartItems.length) return
        dispatch(getApplicableDiscounts(subtotal))
        if (discount) {
            dispatch(applyDiscount(discount.code, subtotal)).then(result => {
                if (!result.success) {
                    dispatch(removeDiscount())
                    errMsg(`Discount ${discount.code} was removed: ${result.message}`)
                }
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, subtotal])

    useEffect(() => {
        if (error) {
            errMsg(error)
            dispatch(clearErrors())
        }
    }, [error, dispatch])

    useEffect(() => {
        if (submitted.current && order && order._id) {
            submitted.current = false
            successMsg(emailSent ? 'Order placed! A confirmation was sent to your email' : 'Order placed!')
            dispatch(removeDiscount())
            dispatch(getCart())
            navigate(`/order/${order._id}`, { replace: true })
        }
    }, [order, emailSent, dispatch, navigate])

    const handleApply = async (code) => {
        const value = (code || codeInput).trim().toUpperCase()
        if (!value) return errMsg('Enter a discount code')
        setApplying(true)
        const result = await dispatch(applyDiscount(value, subtotal))
        setApplying(false)
        if (result.success) {
            setCodeInput('')
            successMsg(`Discount ${value} applied`)
        } else {
            errMsg(result.message)
        }
    }

    const submit = (values) => {
        const info = {
            address: values.address.trim(),
            phoneNo: values.phoneNo.trim(),
            postalCode: values.postalCode.trim(),
        }
        dispatch(saveShippingInfo(info))
        submitted.current = true
        dispatch(createOrder({
            shippingInfo: info,
            paymentMethod: values.paymentMethod,
            discountCode: discount ? discount.code : undefined,
        }))
    }

    if (loading && cartItems.length === 0) return <Loader />

    if (cartItems.length === 0) {
        return (
            <div className="container-xl pop-page">
                <MetaData title="Checkout" />
                <div className="pop-empty">
                    <h4>Your cart is empty</h4>
                    <p className="text-muted">Add something to your cart before checking out.</p>
                    <Link to="/products" className="btn btn-primary">Start shopping</Link>
                </div>
            </div>
        )
    }

    const discountAmount = discount ? discount.discountAmount : 0
    const total = Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100)

    return (
        <div className="container-xl pop-page">
            <MetaData title="Checkout" />
            <div className="pop-page-header">
                <h2>Checkout</h2>
            </div>

            <div className="row g-4">
                <div className="col-lg-7">
                    <div className="card mb-3">
                        <div className="card-body">
                            <h5 className="mb-3">Order Summary</h5>
                            {cartItems.map(item => (
                                <div className="d-flex align-items-center gap-3 mb-2" key={item._id}>
                                    <img src={productImage(item.product)} alt="" className="pop-cart-img pop-cart-img-sm" />
                                    <div className="flex-grow-1">
                                        <div className="fw-semibold">{item.product.name}</div>
                                        <small className="text-muted">{item.quantity} &times; {formatPeso(item.product.price)}</small>
                                    </div>
                                    <strong>{formatPeso(item.product.price * item.quantity)}</strong>
                                </div>
                            ))}
                            <hr />

                            <div className="mb-3">
                                <label htmlFor="discountSelect" className="form-label">Discount code</label>
                                {discount ? (
                                    <div className="alert alert-success d-flex justify-content-between align-items-center py-2 mb-0">
                                        <span>
                                            <strong>{discount.code}</strong> applied &ndash; you save {formatPeso(discount.discountAmount)}
                                        </span>
                                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => dispatch(removeDiscount())}>Remove</button>
                                    </div>
                                ) : (
                                    <>
                                        {applicable.length > 0 && (
                                            <select
                                                id="discountSelect"
                                                className="form-select mb-2"
                                                value=""
                                                onChange={(e) => e.target.value && handleApply(e.target.value)}
                                                disabled={applying}
                                            >
                                                <option value="">Select an available discount</option>
                                                {applicable.map(d => <option key={d.code} value={d.code}>{d.label}</option>)}
                                            </select>
                                        )}
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Or type a code"
                                                value={codeInput}
                                                onChange={(e) => setCodeInput(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleApply() } }}
                                                aria-label="Discount code"
                                            />
                                            <button type="button" className="btn btn-outline-primary" onClick={() => handleApply()} disabled={applying}>
                                                {applying ? 'Checking...' : 'Apply'}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="d-flex justify-content-between mb-1"><span>Subtotal</span><span>{formatPeso(subtotal)}</span></div>
                            {discount && (
                                <div className="d-flex justify-content-between mb-1 text-success">
                                    <span>Discount ({discount.code})</span><span>&minus;{formatPeso(discountAmount)}</span>
                                </div>
                            )}
                            <hr />
                            <h5 className="d-flex justify-content-between mb-0"><span>Total</span><span>{formatPeso(total)}</span></h5>
                        </div>
                    </div>
                </div>

                <div className="col-lg-5">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="mb-3">Shipping &amp; Payment</h5>
                            <Formik
                                enableReinitialize
                                initialValues={{
                                    phoneNo: shippingInfo.phoneNo || (user && user.phone) || '',
                                    address: shippingInfo.address || (user && user.addressline) || '',
                                    postalCode: shippingInfo.postalCode || (user && user.zipcode) || '',
                                    paymentMethod: '',
                                }}
                                validationSchema={checkoutSchema}
                                onSubmit={submit}
                            >
                                <Form noValidate>
                                    <FormField label="Phone number" name="phoneNo" type="tel" placeholder="e.g. 09123456789" autoComplete="tel" />
                                    <FormField label="Shipping address" name="address" as="textarea" rows={3} placeholder="Street, city, province" autoComplete="street-address" />
                                    <FormField label="Postal code" name="postalCode" type="text" autoComplete="postal-code" />
                                    <FormField label="Payment method" name="paymentMethod" as="select">
                                        <option value="">Select payment method</option>
                                        {PAYMENT_METHODS.map(method => <option key={method} value={method}>{method}</option>)}
                                    </FormField>
                                    <button type="submit" className="btn btn-primary w-100" disabled={placing}>
                                        {placing ? 'Placing order...' : `Place order \u2022 ${formatPeso(total)}`}
                                    </button>
                                    <Link to="/cart" className="btn btn-link w-100 mt-2">Back to cart</Link>
                                </Form>
                            </Formik>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Checkout
