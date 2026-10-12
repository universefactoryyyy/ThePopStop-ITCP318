import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import GoogleIcon from '@mui/icons-material/Google'
import { login, loginWithGoogle, clearErrors } from '../../actions/userActions'
import { errMsg } from '../../Utils/helpers'
import { isFirebaseConfigured } from '../../firebase'
import MetaData from '../Layout/MetaData'
import FormField from '../Layout/FormField'

const loginSchema = Yup.object({
    identifier: Yup.string().trim().required('Enter your email or username'),
    password: Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
})

const Login = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const { isAuthenticated, loading, error, user } = useSelector(state => state.auth)

    const redirect = location.state && location.state.from ? location.state.from : null

    useEffect(() => {
        if (isAuthenticated) {
            navigate(redirect || (user && user.role === 'admin' ? '/dashboard' : '/'), { replace: true })
        }
    }, [isAuthenticated, navigate, redirect, user])

    useEffect(() => {
        if (error) {
            errMsg(error)
            dispatch(clearErrors())
        }
    }, [error, dispatch])

    return (
        <div className="container-xl pop-page">
            <MetaData title="Login" />
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">
                    <div className="card pop-auth-card">
                        <div className="card-body p-4">
                            <h2 className="text-center mb-1">Welcome back</h2>
                            <p className="text-center text-muted mb-4">Login to continue shopping</p>

                            {!isFirebaseConfigured && (
                                <div className="alert alert-warning small">
                                    Firebase is not configured yet. Fill in <code>VITE_FIREBASE_*</code> in <code>frontend/.env</code> (see SETUP.md).
                                </div>
                            )}

                            <Formik
                                initialValues={{ identifier: '', password: '' }}
                                validationSchema={loginSchema}
                                onSubmit={(values) => dispatch(login(values.identifier, values.password))}
                            >
                                <Form noValidate>
                                    <FormField label="Email or username" name="identifier" type="text" autoComplete="username" />
                                    <FormField label="Password" name="password" type="password" autoComplete="current-password" />

                                    <div className="text-end mb-3">
                                        <Link to="/password/forgot">Forgot password?</Link>
                                    </div>

                                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                                        {loading ? 'Please wait...' : 'Login'}
                                    </button>
                                </Form>
                            </Formik>

                            <div className="pop-divider"><span>or</span></div>

                            <button
                                type="button"
                                className="btn btn-outline-primary w-100 d-inline-flex align-items-center justify-content-center gap-2"
                                onClick={() => dispatch(loginWithGoogle())}
                                disabled={loading}
                            >
                                <GoogleIcon fontSize="small" /> Continue with Google
                            </button>

                            <p className="text-center mt-4 mb-0">
                                New to The Pop Stop? <Link to="/register">Create an account</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
