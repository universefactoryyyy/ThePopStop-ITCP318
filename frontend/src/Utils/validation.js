import * as Yup from 'yup'

// Same rules as the backend (controllers/auth.js)
export const PHONE_REGEX = /^[0-9+\-\s()]{7,20}$/
export const USERNAME_REGEX = /^[A-Za-z0-9_.]{3,20}$/

// profile fields shared by the register and update-profile forms
export const profileShape = {
    fname: Yup.string().trim().required('First name is required').max(40, 'Max 40 characters'),
    lname: Yup.string().trim().required('Last name is required').max(40, 'Max 40 characters'),
    username: Yup.string().trim().matches(USERNAME_REGEX, { message: '3-20 characters: letters, numbers, _ and .', excludeEmptyString: true }),
    phone: Yup.string().trim().required('Phone number is required').matches(PHONE_REGEX, 'Enter a valid phone number'),
    addressline: Yup.string().trim().required('Address is required').max(250, 'Max 250 characters'),
    zipcode: Yup.string().trim().max(10, 'Max 10 characters'),
}

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024

// returns an error message for an invalid image file, otherwise ''
export const validateImageFile = (file) => {
    if (!IMAGE_TYPES.includes(file.type)) return 'Only JPG, PNG or WEBP images are allowed'
    if (file.size > MAX_IMAGE_SIZE) return 'Each image must be 5MB or smaller'
    return ''
}
