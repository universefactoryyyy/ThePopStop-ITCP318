import { useDispatch } from 'react-redux'
import GoogleIcon from '@mui/icons-material/Google'
import FacebookIcon from '@mui/icons-material/Facebook'
import { loginWithGoogle, loginWithFacebook } from '../../actions/userActions'

// Google + Facebook sign-in via Firebase (Quiz 4)
const SocialLogin = ({ loading }) => {
    const dispatch = useDispatch()

    return (
        <>
            <div className="pop-divider"><span>or</span></div>
            <div className="d-grid gap-2">
                <button
                    type="button"
                    className="btn btn-outline-primary d-inline-flex align-items-center justify-content-center gap-2"
                    onClick={() => dispatch(loginWithGoogle())}
                    disabled={loading}
                >
                    <GoogleIcon fontSize="small" /> Continue with Google
                </button>
                <button
                    type="button"
                    className="btn btn-outline-primary d-inline-flex align-items-center justify-content-center gap-2"
                    onClick={() => dispatch(loginWithFacebook())}
                    disabled={loading}
                >
                    <FacebookIcon fontSize="small" /> Continue with Facebook
                </button>
            </div>
        </>
    )
}

export default SocialLogin
