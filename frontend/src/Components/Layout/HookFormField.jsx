import { useFormContext } from 'react-hook-form'

// Bootstrap input / textarea / select wired to React Hook Form (used on Update Profile)
const HookFormField = ({ label, name, as = 'input', help, children, className = '', ...props }) => {
    const { register, formState: { errors } } = useFormContext()
    const error = errors[name] && errors[name].message
    const Control = as
    const controlClass = as === 'select' ? 'form-select' : 'form-control'

    return (
        <div className={`mb-3 ${className}`}>
            {label && <label htmlFor={name} className="form-label">{label}</label>}
            <Control
                id={name}
                className={`${controlClass} ${error ? 'is-invalid' : ''}`}
                aria-invalid={error ? 'true' : undefined}
                {...register(name)}
                {...props}
            >
                {children}
            </Control>
            {error && <div className="invalid-feedback">{error}</div>}
            {help && !error && <div className="form-text">{help}</div>}
        </div>
    )
}

export default HookFormField
