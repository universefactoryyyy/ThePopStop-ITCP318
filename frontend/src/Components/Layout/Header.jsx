import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap'
import Badge from '@mui/material/Badge'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCartOutlined'
import { toast } from 'react-toastify'
import Search from './Search'
import UserAvatar from './UserAvatar'
import { logout } from '../../actions/userActions'
import { clearCart } from '../../actions/cartActions'

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const location = useLocation()
    const [expanded, setExpanded] = useState(false)

    // the collapsed (mobile) menu closes after every navigation
    useEffect(() => {
        setExpanded(false)
    }, [location.pathname])
    const { user, loading, isAuthenticated } = useSelector(state => state.auth)
    const { cartItems } = useSelector(state => state.cart)

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

    const logoutHandler = async () => {
        await dispatch(logout());
        dispatch(clearCart());
        navigate('/')
        toast.success('Logged out', {
            position: 'bottom-right'
        });
    }

    return (
        <Navbar expand="lg" sticky="top" className="pop-navbar" expanded={expanded} onToggle={setExpanded}>
            <Container fluid="xl" className="pop-navbar-bar">
                <Navbar.Brand as={Link} to="/" className="pop-brand">
                    <img src="/logo.png" alt="" />
                    <span>The Pop Stop</span>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="main-nav" />
                <Navbar.Collapse id="main-nav" className="pop-navbar-collapse">
                    <Nav className="pop-nav-links">
                        <Nav.Link as={NavLink} to="/" end>Home</Nav.Link>
                        <Nav.Link as={NavLink} to="/products">Products</Nav.Link>
                        <Nav.Link as={NavLink} to="/about">About</Nav.Link>
                    </Nav>

                    <div className="pop-navbar-search">
                        <Search />
                    </div>

                    <Nav className="pop-nav-actions">
                        <Nav.Link as={Link} to="/cart" aria-label="Cart" className="pop-cart-link">
                            <Badge badgeContent={cartCount} color="primary" showZero={false}>
                                <ShoppingCartIcon />
                            </Badge>
                            <span className="d-lg-none ms-2">Cart</span>
                        </Nav.Link>

                        {loading ? null : isAuthenticated && user ? (
                            <NavDropdown
                                align="end"
                                className="pop-user-dropdown"
                                id="user-menu"
                                title={
                                    <span className="pop-user-toggle">
                                        <UserAvatar user={user} className="pop-avatar-sm" />
                                        <span>{user.fname || user.name}</span>
                                    </span>
                                }
                            >
                                {user.role === 'admin' && (
                                    <NavDropdown.Item as={Link} to="/dashboard">Dashboard</NavDropdown.Item>
                                )}
                                <NavDropdown.Item as={Link} to="/orders/me">My Orders</NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/me">Profile</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item className="text-danger" onClick={logoutHandler}>Logout</NavDropdown.Item>
                            </NavDropdown>
                        ) : (
                            <div className="d-flex gap-2 ms-lg-2 my-2 my-lg-0">
                                <Link to="/login" className="btn btn-outline-primary btn-sm">Login</Link>
                                <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
                            </div>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}

export default Header
