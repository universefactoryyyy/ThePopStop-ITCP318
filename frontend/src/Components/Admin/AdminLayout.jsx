import { NavLink, Outlet } from 'react-router-dom'
import DashboardIcon from '@mui/icons-material/SpaceDashboardOutlined'
import InventoryIcon from '@mui/icons-material/Inventory2Outlined'
import ReceiptIcon from '@mui/icons-material/ReceiptLongOutlined'
import PeopleIcon from '@mui/icons-material/PeopleAltOutlined'
import DiscountIcon from '@mui/icons-material/LocalOfferOutlined'
import ReviewsIcon from '@mui/icons-material/RateReviewOutlined'
import ChartIcon from '@mui/icons-material/InsightsOutlined'

const LINKS = [
    { to: '/dashboard', label: 'Dashboard', icon: <DashboardIcon fontSize="small" />, end: true },
    { to: '/admin/products', label: 'Products', icon: <InventoryIcon fontSize="small" /> },
    { to: '/admin/orders', label: 'Orders', icon: <ReceiptIcon fontSize="small" /> },
    { to: '/admin/users', label: 'Users', icon: <PeopleIcon fontSize="small" /> },
    { to: '/admin/discounts', label: 'Discounts', icon: <DiscountIcon fontSize="small" /> },
    { to: '/admin/reviews', label: 'Reviews', icon: <ReviewsIcon fontSize="small" /> },
    { to: '/admin/reports', label: 'Reports', icon: <ChartIcon fontSize="small" /> },
]

// Sidebar + content area shared by every admin page
const AdminLayout = () => (
    <div className="container-fluid pop-admin">
        <div className="row g-4">
            <aside className="col-lg-2 col-md-3">
                <nav className="pop-sidebar" aria-label="Admin">
                    <h6 className="pop-sidebar-title">Admin</h6>
                    <ul className="nav flex-md-column flex-row flex-wrap gap-1">
                        {LINKS.map(link => (
                            <li className="nav-item" key={link.to}>
                                <NavLink to={link.to} end={link.end} className="pop-sidebar-link">
                                    {link.icon} <span>{link.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
            <main className="col-lg-10 col-md-9">
                <Outlet />
            </main>
        </div>
    </div>
)

export default AdminLayout
