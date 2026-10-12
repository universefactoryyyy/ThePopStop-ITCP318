import { lazy, Suspense, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BrowserRouter as Router, Link, Route, Routes, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import './App.css'

import Header from './Components/Layout/Header'
import Footer from './Components/Layout/Footer'
import MetaData from './Components/Layout/MetaData'
import Loader from './Components/Layout/Loader'
import ProtectedRoute from './Components/Route/ProtectedRoute'

import Home from './Components/Home'
import About from './Components/About'
import Products from './Components/Product/Products'
import ProductDetails from './Components/Product/ProductDetails'

import Login from './Components/User/Login'
import Register from './Components/User/Register'
import ForgotPassword from './Components/User/ForgotPassword'
import Profile from './Components/User/Profile'
import UpdateProfile from './Components/User/UpdateProfile'

import Cart from './Components/Cart/Cart'
import Checkout from './Components/Cart/Checkout'
const ListOrders = lazy(() => import('./Components/Order/ListOrders'))
import OrderDetails from './Components/Order/OrderDetails'

import AdminLayout from './Components/Admin/AdminLayout'
// the admin screens (and recharts / the data grid) are only downloaded when an admin opens them
const Dashboard = lazy(() => import('./Components/Admin/Dashboard'))
const Reports = lazy(() => import('./Components/Admin/Reports'))
const ProductsList = lazy(() => import('./Components/Admin/ProductsList'))
const NewProduct = lazy(() => import('./Components/Admin/NewProduct'))
const UpdateProduct = lazy(() => import('./Components/Admin/UpdateProduct'))
const OrdersList = lazy(() => import('./Components/Admin/OrdersList'))
const ProcessOrder = lazy(() => import('./Components/Admin/ProcessOrder'))
const UsersList = lazy(() => import('./Components/Admin/UsersList'))
const UpdateUser = lazy(() => import('./Components/Admin/UpdateUser'))
const DiscountsList = lazy(() => import('./Components/Admin/DiscountsList'))
const ReviewsList = lazy(() => import('./Components/Admin/ReviewsList'))

import { loadUser } from './actions/userActions'
import { getCart, clearCart } from './actions/cartActions'

// every new page starts at the top
const ScrollToTop = () => {
    const { pathname } = useLocation()
    useEffect(() => { window.scrollTo(0, 0) }, [pathname])
    return null
}

const NotFound = () => (
    <div className="container-xl pop-page">
        <MetaData title="Page not found" />
        <div className="pop-empty">
            <h2>404</h2>
            <p className="text-muted">This page wandered off. Let&apos;s get you back to the shop.</p>
            <Link to="/" className="btn btn-primary">Back to home</Link>
        </div>
    </div>
)

// Keeps the navbar cart badge in sync with the account that is logged in
const SessionSync = () => {
    const dispatch = useDispatch()
    const { isAuthenticated, user } = useSelector(state => state.auth)
    const userId = user ? user._id : null

    useEffect(() => {
        if (isAuthenticated && userId) dispatch(getCart())
        else dispatch(clearCart())
    }, [dispatch, isAuthenticated, userId])

    return null
}

function App() {
    const dispatch = useDispatch()

    // ask the server "who am I?" once (session cookie)
    useEffect(() => {
        dispatch(loadUser())
    }, [dispatch])

    return (
        <Router>
            <ScrollToTop />
            <SessionSync />
            <div className="pop-app">
                <Header />
                <div className="pop-main">
                    <Suspense fallback={<Loader />}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/search/:keyword" element={<Products />} />
                        <Route path="/product/:id" element={<ProductDetails />} />
                        <Route path="/about" element={<About />} />

                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/password/forgot" element={<ForgotPassword />} />

                        <Route path="/me" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                        <Route path="/me/update" element={<ProtectedRoute><UpdateProfile /></ProtectedRoute>} />
                        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                        <Route path="/orders/me" element={<ProtectedRoute><ListOrders /></ProtectedRoute>} />
                        <Route path="/order/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />

                        <Route element={<ProtectedRoute isAdmin={true}><AdminLayout /></ProtectedRoute>}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/admin/reports" element={<Reports />} />
                            <Route path="/admin/products" element={<ProductsList />} />
                            <Route path="/admin/product" element={<NewProduct />} />
                            <Route path="/admin/product/:id" element={<UpdateProduct />} />
                            <Route path="/admin/orders" element={<OrdersList />} />
                            <Route path="/admin/order/:id" element={<ProcessOrder />} />
                            <Route path="/admin/users" element={<UsersList />} />
                            <Route path="/admin/user/:id" element={<UpdateUser />} />
                            <Route path="/admin/discounts" element={<DiscountsList />} />
                            <Route path="/admin/reviews" element={<ReviewsList />} />
                        </Route>

                        <Route path="*" element={<NotFound />} />
                    </Routes>
                    </Suspense>
                </div>
                <Footer />
            </div>
            <ToastContainer position="bottom-center" autoClose={3000} hideProgressBar newestOnTop />
        </Router>
    )
}

export default App
