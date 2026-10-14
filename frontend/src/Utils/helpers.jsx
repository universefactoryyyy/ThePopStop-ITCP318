import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const errMsg = (message = '') => toast.error(message, {
    position: 'bottom-center'
});
export const successMsg = (message = '') => toast.success(message, {
    position: 'bottom-center'
});

export const PLACEHOLDER_IMAGE = '/images/placeholder.svg';

// ₱1,700.00
export const formatPeso = (amount) =>
    `\u20B1${Number(amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : '-';

export const formatDateTime = (date) =>
    date ? new Date(date).toLocaleString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '-';

// short order number: the last 8 characters of the Mongo id (same as the email / PDF receipt)
export const orderNumber = (order) => String(order._id).slice(-8).toUpperCase();

export const productImage = (product) =>
    product && product.images && product.images.length ? product.images[0].url : PLACEHOLDER_IMAGE;

export const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

// bootstrap badge colour per order status
export const orderStatusClass = (status) => ({
    Pending: 'bg-secondary',
    Processing: 'bg-info',
    Shipped: 'bg-primary',
    Delivered: 'bg-success',
    Cancelled: 'bg-danger',
}[status] || 'bg-secondary');

export const stockStatusClass = (status) => ({
    'In Stock': 'bg-success',
    'Low Stock': 'bg-warning',
    'Out of Stock': 'bg-danger',
}[status] || 'bg-secondary');

const FIREBASE_MESSAGES = {
    'auth/invalid-credential': 'Invalid email/username or password',
    'auth/wrong-password': 'Invalid email/username or password',
    'auth/user-not-found': 'Invalid email/username or password',
    'auth/invalid-email': 'Please enter a valid email address',
    'auth/email-already-in-use': 'An account with this email already exists',
    'auth/weak-password': 'Password must be at least 6 characters',
    'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again',
    'auth/user-disabled': 'This account has been disabled',
    'auth/network-request-failed': 'Network error. Please check your connection',
    'auth/popup-closed-by-user': 'Sign-in was cancelled',
    'auth/cancelled-popup-request': 'Sign-in was cancelled',
    'auth/popup-blocked': 'Your browser blocked the sign-in popup. Please allow popups and try again',
    'auth/unauthorized-domain': 'This domain is not authorized in Firebase (Authentication > Settings > Authorized domains)',
    'auth/operation-not-allowed': 'This sign-in method is not enabled in the Firebase console',
    'auth/account-exists-with-different-credential': 'An account already exists with this email using a different sign-in method',
    'auth/api-key-not-valid.-please-pass-a-valid-api-key.': 'Firebase is not configured. Check VITE_FIREBASE_* in frontend/.env',
    'auth/invalid-api-key': 'Firebase is not configured. Check VITE_FIREBASE_* in frontend/.env',
    'auth/configuration-not-found': 'Email/Password sign-in is not enabled in the Firebase console',
};

// One place that turns axios / firebase / plain errors into a readable message
export const getErrorMessage = (error) => {
    if (error && error.response) {
        const data = error.response.data;
        if (data && (data.message || data.error)) return data.message || data.error;
        if (error.response.status === 401) return 'Please login first';
    }
    if (error && typeof error.code === 'string' && error.code.startsWith('auth/')) {
        return FIREBASE_MESSAGES[error.code] || error.message;
    }
    if (error && error.message === 'Network Error') return 'Cannot reach the server. Is the backend running?';
    return (error && error.message) || 'Something went wrong';
};
