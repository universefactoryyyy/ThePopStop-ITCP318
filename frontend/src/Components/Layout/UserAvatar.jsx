const initialOf = (user) => {
    const source = (user && (user.fname || user.name || user.email)) || '?'
    const letter = String(source).trim().charAt(0)
    return letter ? letter.toUpperCase() : '?'
}

// Uploaded or Google photo when there is one; otherwise the first letter of the name.
const UserAvatar = ({ user, className = 'pop-avatar', alt = '' }) => {
    const url = user && user.avatar && user.avatar.url
    if (url) return <img src={url} alt={alt} className={className} />
    return (
        <span className={`${className} pop-avatar-fallback`} aria-hidden={alt ? undefined : true}>
            {initialOf(user)}
        </span>
    )
}

export default UserAvatar
