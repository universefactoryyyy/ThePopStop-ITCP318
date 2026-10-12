import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import { forgotPassword, clearErrors } from '../../actions/userActions'
import { errMsg, successMsg } from '../../Utils/helpers'
import MetaData from '../Layout/MetaData'
import FormField from '../Layout/FormField'

const schema = Yup.object({
    email: Yup.string().trim().email('Enter a valid email address').required('Email is required'),
})

const ForgotPassword = () => {
    const dispatch = useDispatch()
    const { loading, error, message } = useSelector(state => state.forgotPassword)
    const submitted = useRef(false) // ignore a message left over from an earlier visit

    useEffect(() => {
        if (error) {
            errMsg(error)
            dispatch(clearErrors())
        }
        if (message && submitted.current) successMsg(message)
    }, [error, message, dispatch])

    return (
        <div className="container-xl pop-page">
            <MetaData title="Forgot password" />
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">
                    <div className="card pop-auth-card">
                        <div className="card-body p-4">
                            <h2 className="text-center mb-1">Forgot password</h2>
                            <p className="text-center text-muted mb-4">We will email you a reset link</p>
                            <Formik
                                initialValues={{ email: '' }}
                                validationSchema={schema}
                                onSubmit={(values) => { submitted.current = true; dispatch(forgotPassword(values.email.trim())) }}
                            >
                                <Form noValidate>
                                    <FormField label="Email" name="email" type="email" autoComplete="email" />
                                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                                        {loading ? 'Sending...' : 'Send reset link'}
                                    </button>
                                </Form>
                            </Formik>
                            <p className="text-center mt-4 mb-0"><Link to="/login">Back to login</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword
