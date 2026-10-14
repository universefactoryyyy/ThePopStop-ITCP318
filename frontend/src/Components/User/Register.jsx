import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { Formik, Form, useFormikContext } from 'formik'
import * as Yup from 'yup'
import { register, clearErrors } from '../../actions/userActions'
import { errMsg, successMsg } from '../../Utils/helpers'
import { profileShape, validateImageFile } from '../../Utils/validation'
import { isFirebaseConfigured } from '../../firebase'
import MetaData from '../Layout/MetaData'
import FormField from '../Layout/FormField'
import UserAvatar from '../Layout/UserAvatar'
import SocialLogin from './SocialLogin'

const RegisterAvatar = ({ preview }) => {
    const { values } = useFormikContext()
    if (preview) return <img src={preview} alt="Avatar preview" className="pop-avatar pop-avatar-lg" />
    const name = `${values.fname || ''} ${values.lname || ''}`.trim()
    return <UserAvatar user={{ fname: values.fname, name }} className="pop-avatar pop-avatar-lg" alt="Profile photo" />
}

const registerSchema = Yup.object({
    ...profileShape,
    email: Yup.string().trim().email('Enter a valid email address').required('Email is required'),
    password: Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
    confirmPassword: Yup.string().required('Please confirm your password').oneOf([Yup.ref('password')], 'Passwords do not match'),
})

const initialValues = {
    fname: '', lname: '', username: '', email: '', phone: '', addressline: '', zipcode: '', password: '', confirmPassword: '',
}

const Register = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { isAuthenticated, loading, error } = useSelector(state => state.auth)

    const [avatar, setAvatar] = useState(null)
    const [avatarPreview, setAvatarPreview] = useState('')
    const [avatarError, setAvatarError] = useState('')

    useEffect(() => {
        if (isAuthenticated) {
            successMsg('Welcome to The Pop Stop!')
            navigate('/', { replace: true })
        }
    }, [isAuthenticated, navigate])

    useEffect(() => {
        if (error) {
            errMsg(error)
            dispatch(clearErrors())
        }
    }, [error, dispatch])

    // revoke the preview URL when it changes / on unmount
    useEffect(() => () => { if (avatarPreview) URL.revokeObjectURL(avatarPreview) }, [avatarPreview])

    const onAvatarChange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        const problem = validateImageFile(file)
        if (problem) {
            setAvatarError(problem)
            e.target.value = ''
            return
        }
        setAvatarError('')
        setAvatar(file)
        setAvatarPreview(URL.createObjectURL(file))
    }

    const submit = (values) => {
        const formData = new FormData()
        ;['fname', 'lname', 'username', 'phone', 'addressline', 'zipcode'].forEach(key => formData.set(key, values[key].trim()))
        if (avatar) formData.set('avatar', avatar)
        dispatch(register(formData, values.email.trim(), values.password))
    }

    return (
        <div className="container-xl pop-page">
            <MetaData title="Register" />
            <div className="row justify-content-center">
                <div className="col-md-9 col-lg-7">
                    <div className="card pop-auth-card">
                        <div className="card-body p-4">
                            <h2 className="text-center mb-1">Create your account</h2>
                            <p className="text-center text-muted mb-4">Join The Pop Stop collectors community</p>

                            {!isFirebaseConfigured && (
                                <div className="alert alert-warning small">
                                    Firebase is not configured yet. Fill in <code>VITE_FIREBASE_*</code> in <code>frontend/.env</code> (see SETUP.md).
                                </div>
                            )}

                            <Formik initialValues={initialValues} validationSchema={registerSchema} onSubmit={submit}>
                                <Form noValidate>
                                    <div className="d-flex align-items-center gap-3 mb-3">
                                        <RegisterAvatar preview={avatarPreview} />
                                        <div className="flex-grow-1">
                                            <label htmlFor="avatar" className="form-label">Profile photo (optional)</label>
                                            <input
                                                id="avatar"
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp"
                                                className={`form-control ${avatarError ? 'is-invalid' : ''}`}
                                                onChange={onAvatarChange}
                                            />
                                            {avatarError && <div className="invalid-feedback">{avatarError}</div>}
                                        </div>
                                    </div>

                                    <div className="row">
                                        <FormField className="col-md-6" label="First name" name="fname" type="text" autoComplete="given-name" />
                                        <FormField className="col-md-6" label="Last name" name="lname" type="text" autoComplete="family-name" />
                                    </div>
                                    <div className="row">
                                        <FormField className="col-md-6" label="Username (optional)" name="username" type="text" autoComplete="username" help="You can login with it instead of your email" />
                                        <FormField className="col-md-6" label="Email" name="email" type="email" autoComplete="email" />
                                    </div>
                                    <div className="row">
                                        <FormField className="col-md-6" label="Phone" name="phone" type="tel" autoComplete="tel" />
                                        <FormField className="col-md-6" label="Zip code" name="zipcode" type="text" autoComplete="postal-code" />
                                    </div>
                                    <FormField label="Address" name="addressline" type="text" autoComplete="street-address" />
                                    <div className="row">
                                        <FormField className="col-md-6" label="Password" name="password" type="password" autoComplete="new-password" />
                                        <FormField className="col-md-6" label="Confirm password" name="confirmPassword" type="password" autoComplete="new-password" />
                                    </div>

                                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                                        {loading ? 'Creating account...' : 'Register'}
                                    </button>
                                </Form>
                            </Formik>

                            <SocialLogin loading={loading} />

                            <p className="text-center mt-4 mb-0">
                                Already have an account? <Link to="/login">Login</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register
