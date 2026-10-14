import { useDispatch } from 'react-redux'
import GoogleIcon from '@mui/icons-material/Google'
import { loginWithGoogle } from '../../actions/userActions'

const SocialLogin = ({ loading }) => {
    const dispatch = useDispatch()

    return (
        <>
            <div className="pop-divider"><span>or</span></div>
            <div className="d-grid">
                <button
                    type="button"
                    className="btn btn-outline-primary d-inline-flex align-items-center justify-content-center gap-2"
                    onClick={() => dispatch(loginWithGoogle())}
                    disabled={loading}
                >
                    <GoogleIcon fontSize="small" /> Continue with Google
                </button>
            </div>
        </>
    )
}

export default SocialLogin
