import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Loader from '../Layout/Loader'

// <ProtectedRoute>  needs a login        <ProtectedRoute isAdmin={true}>  needs the admin role
const ProtectedRoute = ({ children, isAdmin = false }) => {
    const { isAuthenticated, loading, user } = useSelector(state => state.auth);
    const location = useLocation()

    if (loading) {
        return <Loader />;
    }
    if (!isAuthenticated || !user) {
        return <Navigate to='/login' replace state={{ from: location.pathname }} />
    }
    if (isAdmin === true && user.role !== 'admin') {
        return <Navigate to='/' replace />
    }
    return children
};

export default ProtectedRoute;
