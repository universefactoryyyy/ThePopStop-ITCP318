import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import { updateProfile, clearErrors } from '../../actions/userActions'
import { UPDATE_PROFILE_RESET } from '../../constants/userConstants'
import { errMsg, successMsg } from '../../Utils/helpers'
import { profileShape, validateImageFile } from '../../Utils/validation'
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import FormField from '../Layout/FormField'

const updateSchema = Yup.object(profileShape)

const UpdateProfile = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user, loading: userLoading } = useSelector(state => state.auth)
    const { loading, error, isUpdated } = useSelector(state => state.user)

    const [avatar, setAvatar] = useState(null)
    const [avatarPreview, setAvatarPreview] = useState('')
    const [avatarError, setAvatarError] = useState('')

    useEffect(() => {
        if (error) {
            errMsg(error)
            dispatch(clearErrors())
        }
        if (isUpdated) {
            successMsg('Profile updated successfully')
            dispatch({ type: UPDATE_PROFILE_RESET })
            navigate('/me', { replace: true })
        }
    }, [error, isUpdated, dispatch, navigate])

    useEffect(() => () => { if (avatarPreview) URL.revokeObjectURL(avatarPreview) }, [avatarPreview])

    if (userLoading || !user) return <Loader />

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
        dispatch(updateProfile(formData))
    }

    const currentAvatar = avatarPreview || (user.avatar && user.avatar.url)

    return (
        <div className="container-xl pop-page">
            <MetaData title="Update Profile" />
            <div className="row justify-content-center">
                <div className="col-md-9 col-lg-7">
                    <div className="card pop-auth-card">
                        <div className="card-body p-4">
                            <h2 className="text-center mb-4">Update profile</h2>

                            <Formik
                                enableReinitialize
                                initialValues={{
                                    fname: user.fname || '',
                                    lname: user.lname || '',
                                    username: user.username || '',
                                    phone: user.phone || '',
                                    addressline: user.addressline || '',
                                    zipcode: user.zipcode || '',
                                }}
                                validationSchema={updateSchema}
                                onSubmit={submit}
                            >
                                <Form noValidate>
                                    <div className="d-flex align-items-center gap-3 mb-3">
                                        {currentAvatar
                                            ? <img src={currentAvatar} alt="Avatar" className="pop-avatar pop-avatar-lg" />
                                            : <span className="pop-avatar pop-avatar-lg pop-avatar-fallback">{user.name.charAt(0).toUpperCase()}</span>}
                                        <div className="flex-grow-1">
                                            <label htmlFor="avatar" className="form-label">Profile photo</label>
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

                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">Email</label>
                                        <input id="email" className="form-control" value={user.email} disabled readOnly />
                                    </div>
                                    <div className="row">
                                        <FormField className="col-md-6" label="First name" name="fname" type="text" />
                                        <FormField className="col-md-6" label="Last name" name="lname" type="text" />
                                    </div>
                                    <div className="row">
                                        <FormField className="col-md-6" label="Username" name="username" type="text" />
                                        <FormField className="col-md-6" label="Phone" name="phone" type="tel" />
                                    </div>
                                    <FormField label="Address" name="addressline" type="text" />
                                    <FormField label="Zip code" name="zipcode" type="text" />

                                    <div className="d-flex gap-2">
                                        <button type="submit" className="btn btn-primary flex-grow-1" disabled={loading}>
                                            {loading ? 'Saving...' : 'Save changes'}
                                        </button>
                                        <Link to="/me" className="btn btn-outline-primary">Cancel</Link>
                                    </div>
                                </Form>
                            </Formik>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UpdateProfile
