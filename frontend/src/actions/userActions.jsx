import axios from 'axios'
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    deleteUser as deleteFirebaseUser,
    sendPasswordResetEmail,
} from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import { getErrorMessage } from '../Utils/helpers'
import {
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    REGISTER_USER_REQUEST,
    REGISTER_USER_SUCCESS,
    REGISTER_USER_FAIL,
    LOAD_USER_REQUEST,
    LOAD_USER_SUCCESS,
    LOAD_USER_FAIL,
    LOGOUT_SUCCESS,
    LOGOUT_FAIL,
    UPDATE_PROFILE_REQUEST,
    UPDATE_PROFILE_SUCCESS,
    UPDATE_PROFILE_FAIL,
    FORGOT_PASSWORD_REQUEST,
    FORGOT_PASSWORD_SUCCESS,
    FORGOT_PASSWORD_FAIL,
    ALL_USERS_REQUEST,
    ALL_USERS_SUCCESS,
    ALL_USERS_FAIL,
    UPDATE_USER_REQUEST,
    UPDATE_USER_SUCCESS,
    UPDATE_USER_FAIL,
    USER_DETAILS_REQUEST,
    USER_DETAILS_SUCCESS,
    USER_DETAILS_FAIL,
    DELETE_USER_REQUEST,
    DELETE_USER_SUCCESS,
    DELETE_USER_FAIL,
    CLEAR_ERRORS
} from '../constants/userConstants'

const API = import.meta.env.VITE_API

// Firebase ID token -> our backend, which verifies it (firebase-admin) and sets the session cookie
const exchangeToken = async (firebaseUser, path = '/login') => {
    const idToken = await firebaseUser.getIdToken()
    const { data } = await axios.post(`${API}${path}`, { idToken })
    return data.user
}

// identifier = email OR username
export const login = (identifier, password) => async (dispatch) => {
    try {
        dispatch({ type: LOGIN_REQUEST })

        let email = identifier.trim()
        if (!email.includes('@')) {
            // username -> email
            const { data } = await axios.post(`${API}/login/lookup`, { identifier: email })
            email = data.email
        }

        const credential = await signInWithEmailAndPassword(auth, email, password)
        const user = await exchangeToken(credential.user)
        await signOut(auth)

        dispatch({
            type: LOGIN_SUCCESS,
            payload: user
        })
    } catch (error) {
        dispatch({
            type: LOGIN_FAIL,
            payload: getErrorMessage(error)
        })
    }
}

const loginWithFirebaseProvider = (provider) => async (dispatch) => {
    try {
        dispatch({ type: LOGIN_REQUEST })
        const credential = await signInWithPopup(auth, provider)
        const user = await exchangeToken(credential.user, '/login/social')
        await signOut(auth)

        dispatch({
            type: LOGIN_SUCCESS,
            payload: user
        })
    } catch (error) {
        dispatch({
            type: LOGIN_FAIL,
            payload: getErrorMessage(error)
        })
    }
}

export const loginWithGoogle = () => loginWithFirebaseProvider(googleProvider)

// userData = FormData with the profile fields (+ avatar). Creates the Firebase account first, then the profile.
export const register = (userData, email, password) => async (dispatch) => {
    let firebaseUser = null
    try {
        dispatch({ type: REGISTER_USER_REQUEST })

        const credential = await createUserWithEmailAndPassword(auth, email, password)
        firebaseUser = credential.user
        userData.append('idToken', await firebaseUser.getIdToken())

        const { data } = await axios.post(`${API}/register`, userData)
        await signOut(auth)

        dispatch({
            type: REGISTER_USER_SUCCESS,
            payload: data.user
        })
    } catch (error) {
        // the profile could not be saved: don't leave an orphan Firebase account behind
        if (firebaseUser) {
            try { await deleteFirebaseUser(firebaseUser) } catch (e) { /* ignore */ }
        }
        dispatch({
            type: REGISTER_USER_FAIL,
            payload: getErrorMessage(error)
        })
    }
}

export const logout = () => async (dispatch) => {
    try {
        await axios.get(`${API}/logout`)
        dispatch({
            type: LOGOUT_SUCCESS,
        })
    } catch (error) {
        dispatch({
            type: LOGOUT_FAIL,
            payload: getErrorMessage(error)
        })
    } finally {
        try { await signOut(auth) } catch (e) { /* Firebase session is separate from the cookie */ }
    }
}

// Reads the session cookie. Not being logged in is normal, so the error is not shown to the user.
export const loadUser = () => async (dispatch) => {
    try {
        dispatch({ type: LOAD_USER_REQUEST })
        const { data } = await axios.get(`${API}/me`)
        dispatch({
            type: LOAD_USER_SUCCESS,
            payload: data.user
        })
    } catch (error) {
        dispatch({
            type: LOAD_USER_FAIL,
        })
    }
}

export const updateProfile = (userData) => async (dispatch) => {
    try {
        dispatch({ type: UPDATE_PROFILE_REQUEST })
        const { data } = await axios.put(`${API}/me/update`, userData)
        dispatch({
            type: UPDATE_PROFILE_SUCCESS,
            payload: data.success
        })
        dispatch({ type: LOAD_USER_SUCCESS, payload: data.user })
    } catch (error) {
        dispatch({
            type: UPDATE_PROFILE_FAIL,
            payload: getErrorMessage(error)
        })
    }
}

// Firebase sends the reset email itself
export const forgotPassword = (email) => async (dispatch) => {
    try {
        dispatch({ type: FORGOT_PASSWORD_REQUEST })
        await sendPasswordResetEmail(auth, email)
        dispatch({
            type: FORGOT_PASSWORD_SUCCESS,
            payload: `If an account exists for ${email}, a password reset link has been sent`
        })
    } catch (error) {
        dispatch({
            type: FORGOT_PASSWORD_FAIL,
            payload: getErrorMessage(error)
        })
    }
}

export const clearErrors = () => async (dispatch) => {
    dispatch({
        type: CLEAR_ERRORS
    })
}

// ------------------------- admin -------------------------

export const allUsers = () => async (dispatch) => {
    try {
        dispatch({ type: ALL_USERS_REQUEST })
        const { data } = await axios.get(`${API}/admin/users`)
        dispatch({
            type: ALL_USERS_SUCCESS,
            payload: data.users
        })
    } catch (error) {
        dispatch({
            type: ALL_USERS_FAIL,
            payload: getErrorMessage(error)
        })
    }
}

export const getUserDetails = (id) => async (dispatch) => {
    try {
        dispatch({ type: USER_DETAILS_REQUEST })
        const { data } = await axios.get(`${API}/admin/user/${id}`)
        dispatch({
            type: USER_DETAILS_SUCCESS,
            payload: data.user
        })
    } catch (error) {
        dispatch({
            type: USER_DETAILS_FAIL,
            payload: getErrorMessage(error)
        })
    }
}

// changes: { role?, isActive?, name? }
export const updateUser = (id, changes) => async (dispatch) => {
    try {
        dispatch({ type: UPDATE_USER_REQUEST })
        const { data } = await axios.put(`${API}/admin/user/${id}`, changes)
        dispatch({
            type: UPDATE_USER_SUCCESS,
            payload: data.success
        })
    } catch (error) {
        dispatch({
            type: UPDATE_USER_FAIL,
            payload: getErrorMessage(error)
        })
    }
}

export const deleteUser = (id) => async (dispatch) => {
    try {
        dispatch({ type: DELETE_USER_REQUEST })
        const { data } = await axios.delete(`${API}/admin/user/${id}`)
        dispatch({
            type: DELETE_USER_SUCCESS,
            payload: data.success
        })
    } catch (error) {
        dispatch({
            type: DELETE_USER_FAIL,
            payload: getErrorMessage(error)
        })
    }
}
