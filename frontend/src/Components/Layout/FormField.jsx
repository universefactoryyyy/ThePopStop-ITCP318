import { useField } from 'formik'

// A Bootstrap input / textarea / select wired to Formik with its Yup error message underneath
const FormField = ({ label, name, as = 'input', help, children, className = '', ...props }) => {
    const [field, meta] = useField(name)
    const invalid = meta.touched && meta.error
    const Control = as
    const controlClass = as === 'select' ? 'form-select' : 'form-control'

    return (
        <div className={`mb-3 ${className}`}>
            {label && <label htmlFor={name} className="form-label">{label}</label>}
            <Control
                id={name}
                className={`${controlClass} ${invalid ? 'is-invalid' : ''}`}
                aria-invalid={invalid ? 'true' : undefined}
                {...field}
                {...props}
            >
                {children}
            </Control>
            {invalid && <div className="invalid-feedback">{meta.error}</div>}
            {help && !invalid && <div className="form-text">{help}</div>}
        </div>
    )
}

export default FormField
