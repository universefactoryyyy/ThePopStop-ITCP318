import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import UserAvatar from '../Layout/UserAvatar'
import { formatDate } from '../../Utils/helpers'

const Profile = () => {
    const { user, loading } = useSelector(state => state.auth)

    if (loading || !user) return <Loader />

    return (
        <div className="container-xl pop-page">
            <MetaData title="My Profile" />
            <div className="pop-page-header text-center">
                <h2>My Profile</h2>
            </div>
            <div className="row justify-content-center">
                <div className="col-md-4 col-lg-3 text-center mb-4">
                    <UserAvatar user={user} className="pop-avatar pop-avatar-xl mb-3" alt={user.name} />
                    <div className="d-grid gap-2">
                        <Link to="/me/update" className="btn btn-primary">Edit profile</Link>
                        {user.role !== 'admin' && <Link to="/orders/me" className="btn btn-outline-primary">My orders</Link>}
                    </div>
                </div>
                <div className="col-md-7 col-lg-6">
                    <div className="card">
                        <div className="card-body">
                            <dl className="row mb-0 pop-dl">
                                <dt className="col-sm-4">Full name</dt>
                                <dd className="col-sm-8">{user.name}</dd>
                                <dt className="col-sm-4">Username</dt>
                                <dd className="col-sm-8">{user.username || '-'}</dd>
                                <dt className="col-sm-4">Email</dt>
                                <dd className="col-sm-8">{user.email}</dd>
                                <dt className="col-sm-4">Phone</dt>
                                <dd className="col-sm-8">{user.phone || '-'}</dd>
                                <dt className="col-sm-4">Address</dt>
                                <dd className="col-sm-8">{user.addressline || '-'}{user.zipcode ? `, ${user.zipcode}` : ''}</dd>
                                <dt className="col-sm-4">Role</dt>
                                <dd className="col-sm-8 text-capitalize">{user.role}</dd>
                                <dt className="col-sm-4">Joined</dt>
                                <dd className="col-sm-8">{formatDate(user.createdAt)}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile
