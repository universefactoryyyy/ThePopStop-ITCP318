import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import { getUserDetails, updateUser, clearErrors } from '../../actions/userActions'
import { UPDATE_USER_RESET } from '../../constants/userConstants'
import { errMsg, successMsg } from '../../Utils/helpers'
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import FormField from '../Layout/FormField'

const schema = Yup.object({
    name: Yup.string().trim().required('Name is required').max(60, 'Max 60 characters'),
    role: Yup.string().oneOf(['customer', 'employee', 'admin']).required(),
    isActive: Yup.string().oneOf(['true', 'false']).required(),
})

// Admin: change a user's role / active status
const UpdateUser = () => {
    const { id } = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user, error: detailsError } = useSelector(state => state.userDetails)
    const { user: me } = useSelector(state => state.auth)
    const { loading, error, isUpdated } = useSelector(state => state.user)

    useEffect(() => {
        dispatch(getUserDetails(id))
    }, [dispatch, id])

    useEffect(() => {
        if (detailsError) {
            errMsg(detailsError)
            dispatch(clearErrors())
            navigate('/admin/users')
        }
        if (error) {
            errMsg(error)
            dispatch(clearErrors())
        }
        if (isUpdated) {
            successMsg('User updated')
            dispatch({ type: UPDATE_USER_RESET })
            navigate('/admin/users')
        }
    }, [detailsError, error, isUpdated, dispatch, navigate])

    if (!user || user._id !== id) return <Loader />

    const isSelf = me && me._id === user._id

    return (
        <div>
            <MetaData title="Update User" />
            <h2 className="mb-4">Edit user</h2>
            <div className="card" style={{ maxWidth: 560 }}>
                <div className="card-body">
                    <p className="text-muted">{user.email}</p>
                    <Formik
                        enableReinitialize
                        initialValues={{ name: user.name, role: user.role, isActive: String(user.isActive) }}
                        validationSchema={schema}
                        onSubmit={(values) => dispatch(updateUser(id, {
                            name: values.name.trim(),
                            role: values.role,
                            isActive: values.isActive === 'true',
                        }))}
                    >
                        <Form noValidate>
                            <FormField label="Name" name="name" type="text" />
                            <FormField label="Role" name="role" as="select" disabled={isSelf} help={isSelf ? 'You cannot change your own role' : undefined}>
                                <option value="customer">Customer</option>
                                <option value="employee">Employee</option>
                                <option value="admin">Admin</option>
                            </FormField>
                            <FormField
                                label="Account status"
                                name="isActive"
                                as="select"
                                disabled={isSelf || user.role === 'admin'}
                                help={user.role === 'admin' ? 'Admin accounts stay active' : undefined}
                            >
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </FormField>
                            <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save changes'}</button>
                                <Link to="/admin/users" className="btn btn-outline-primary">Cancel</Link>
                            </div>
                        </Form>
                    </Formik>
                </div>
            </div>
        </div>
    )
}

export default UpdateUser
